import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
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
    
    if (!user || !user.workspaceId) throw new Error("Unauthorized or missing workspace");

    return { userId: user._id, workspaceId: user.workspaceId };
}

export async function POST(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);
        
        // Use short month format ("Jul", "Aug") to match your historical data format
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'short' }); 
        const year = now.getFullYear().toString();

        const licenses = await License.find({ workspaceId }).lean();

        let totalMonthlySpend = 0;
        let totalActiveLicenses = 0;
        let totalPurchasedLicenses = 0;
        const applications = [];

        for (const l of licenses as any[]) {
            const cost = Number(l.costPerLicense) || 0;
            // Handle yearly billing correctly
            const monthlyUnitCost = l.billingCycle === 'yearly' ? (cost / 12) : cost;
            
            // ALWAYS calculate based on TOTAL PURCHASED licenses
            const seats = Number(l.licenseCount) || 1; 
            const assignedArray = l.assignedTo || [];
            const assignedUsers = assignedArray.length > 0 ? assignedArray.length : (Number(l.assignedUsers) || 0);
            
            const monthlyCost = monthlyUnitCost * seats;
            
            totalMonthlySpend += monthlyCost;
            totalActiveLicenses += assignedUsers;
            totalPurchasedLicenses += seats;

            applications.push({
                licenseId: l._id,
                applicationName: l.applicationName,
                department: l.department, // Helpful for custom reports
                costPerLicense: cost,
                assignedUsers,
                licenseCount: seats,
                monthlyCost
            });
        }

        const snapshot = await Snapshot.findOneAndUpdate(
            { workspaceId, month, year },
            {
                $set: {
                    totalApplications: licenses.length,
                    totalPurchasedLicenses,
                    totalActiveLicenses,
                    totalMonthlySpend,
                    applications,
                    updatedAt: new Date()
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: snapshot });
    } catch (error: any) {
        console.error("Snapshot Generation Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
