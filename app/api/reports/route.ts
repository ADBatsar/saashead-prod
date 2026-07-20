import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import License from "@/models/License";
import User from "@/models/User";
import Snapshot from "@/models/Snapshot";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("No token found in cookies");
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const userId = payload.userId || payload.id;

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user || !user.workspaceId) throw new Error("Unauthorized");

    return { workspaceId: user.workspaceId };
}

export async function GET(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);

        // Fetch Data from ALL relevant collections
        const rawLicenses = await License.find({ workspaceId }).sort({ createdAt: -1 }).lean();
        const rawProjects = await Project.find({ workspaceId }).sort({ createdAt: -1 }).lean().catch(() => []);
        const snapshots = await Snapshot.find({ workspaceId }).sort({ createdAt: -1 }).lean(); // Added Snapshots

        // --- 1. CALCULATE LIVE USER SOFTWARE BURDEN (ALL LICENSES) ---
        const userMonthlyCosts: Record<string, number> = {};
        let currentSaasSpend = 0;
        let currentTotalLicenses = 0;

        rawLicenses.forEach((lic: any) => {
            const seats = Number(lic.licenseCount) || 1; // TOTAL PURCHASED
            const cost = Number(lic.costPerLicense) || 0;
            const monthlyCost = lic.billingCycle === 'yearly' ? (cost / 12) : cost; 
            
            // Removed the `isExpired` check to accurately reflect total purchased seats as requested
            currentSaasSpend += (seats * monthlyCost); 
            currentTotalLicenses += seats;

            // Map license costs directly to assigned users for Project allocation
            (lic.assignedTo || []).forEach((userId: any) => {
                const uid = userId.toString();
                userMonthlyCosts[uid] = (userMonthlyCosts[uid] || 0) + monthlyCost;
            });
        });

        // --- 2. CALCULATE DISTRIBUTED PROJECT COSTS ---
        const userProjectCounts: Record<string, number> = {};
        rawProjects.forEach((proj: any) => {
            // FIX: Added 'assignedUsers' to match your database schema
            const members = proj.assignedUsers || proj.members || proj.assignedTo || proj.users || [];
            members.forEach((m: any) => {
                const uid = m.toString();
                userProjectCounts[uid] = (userProjectCounts[uid] || 0) + 1;
            });
        });

        let totalDistributedProjectSpend = 0;
        const processedProjects = rawProjects.map((proj: any) => {
            let allocatedCost = 0;
            const members = proj.assignedUsers || proj.members || proj.assignedTo || proj.users || [];
            
            members.forEach((m: any) => {
                const uid = m.toString();
                if (userMonthlyCosts[uid] && userProjectCounts[uid]) {
                    // Split the user's software cost by their number of active projects
                    allocatedCost += (userMonthlyCosts[uid] / userProjectCounts[uid]);
                }
            });

            totalDistributedProjectSpend += allocatedCost;
            return { ...proj, allocatedCost, memberCount: members.length };
        });

        // --- 3. BUILD FLAWLESS TIMELINE (DEDUPLICATING JULY BUG) ---
        const monthlyMap = new Map();
        
        // Force inject the mathematically perfect real-time data for the current month
        const now = new Date();
        const curM = now.toLocaleString('default', { month: 'short' });
        const curY = now.getFullYear().toString();
        
        monthlyMap.set(`${curM}-${curY}`, {
            sortKey: now.getTime(), 
            period: `${curM} ${curY}`, 
            month: curM, 
            year: curY,
            apps: rawLicenses.length, 
            licenses: currentTotalLicenses, 
            saasSpend: currentSaasSpend
        });

        // Map historical snapshots, ensuring 'July' and 'Jul' overwrite cleanly
        snapshots.forEach((s: any) => {
            const standardMonth = new Date(`${s.month} 1, 2000`).toLocaleString('default', { month: 'short' });
            const key = `${standardMonth}-${s.year}`;
            
            if (!monthlyMap.has(key)) {
                monthlyMap.set(key, {
                    sortKey: new Date(s.createdAt).getTime(),
                    period: `${standardMonth} ${s.year}`,
                    month: standardMonth,
                    year: s.year.toString(),
                    apps: s.totalApplications || s.applications?.length || 0,
                    licenses: s.totalPurchasedLicenses || s.totalActiveLicenses || 0,
                    saasSpend: s.totalMonthlySpend || 0,
                });
            }
        });

        const monthlyReports = Array.from(monthlyMap.values()).sort((a, b) => b.sortKey - a.sortKey);

        const yearlyMap = new Map();
        monthlyReports.forEach((m: any) => {
            if (!yearlyMap.has(m.year)) {
                yearlyMap.set(m.year, { period: m.year, year: m.year, apps: 0, licenses: 0, saasSpend: 0 });
            }
            const y = yearlyMap.get(m.year);
            y.apps = Math.max(y.apps, m.apps);
            y.licenses = Math.max(y.licenses, m.licenses);
            y.saasSpend += m.saasSpend;
        });
        
        const yearlyReports = Array.from(yearlyMap.values()).sort((a, b) => Number(b.period) - Number(a.period));

        return NextResponse.json({
            success: true,
            data: {
                monthly: monthlyReports,
                yearly: yearlyReports,
                rawLicenses,
                rawProjects: processedProjects,
                metrics: {
                    currentSaasSpend,
                    currentTotalLicenses,
                    totalProjectSpend: totalDistributedProjectSpend,
                    activeApps: rawLicenses.length
                }
            }
        });

    } catch (error: any) {
        console.error("Reports API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
