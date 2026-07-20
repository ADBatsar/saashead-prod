import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import License from "@/models/License";
import User from "@/models/User";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    return { workspaceId: user.workspaceId, role: user.role };
}

export async function GET(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);
        
        // 1. Fetch all Projects and Licenses for this workspace
        const projects = await Project.find({ workspaceId }).sort({ createdAt: -1 }).lean();
        const licenses = await License.find({ workspaceId }).lean();

        // 2. Map User -> Total Monthly License Cost
        const userMonthlyCosts: Record<string, number> = {};
        for (const lic of licenses as any[]) {
            const cost = Number(lic.costPerLicense) || 0;
            const monthlyCost = lic.billingCycle === 'yearly' ? cost / 12 : cost;
            
            for (const uid of (lic.assignedTo || [])) {
                const idStr = uid.toString();
                userMonthlyCosts[idStr] = (userMonthlyCosts[idStr] || 0) + monthlyCost;
            }
        }

        // 3. Map User -> Active Project Count
        const activeProjectCounts: Record<string, number> = {};
        const activeProjects = projects.filter(p => p.status === "Active");
        for (const proj of activeProjects) {
            for (const uid of (proj.assignedUsers || [])) {
                const idStr = uid.toString();
                activeProjectCounts[idStr] = (activeProjectCounts[idStr] || 0) + 1;
            }
        }

        // 4. Attach proportional cost to each project
        const enrichedProjects = projects.map(proj => {
            let allocatedCost = 0;
            
            // We only split costs across ACTIVE projects
            if (proj.status === "Active") {
                for (const uid of (proj.assignedUsers || [])) {
                    const idStr = uid.toString();
                    const totalUserCost = userMonthlyCosts[idStr] || 0;
                    const divisor = activeProjectCounts[idStr] || 1;
                    allocatedCost += (totalUserCost / divisor);
                }
            }

            return { ...proj, allocatedCost };
        });

        return NextResponse.json({ success: true, data: enrichedProjects });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const newProject = await Project.create({
            ...body,
            workspaceId // Strict Tenant Isolation
        });

        return NextResponse.json({ success: true, data: newProject });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
