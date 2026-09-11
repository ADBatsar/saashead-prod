import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import License from "@/models/License";
import User from "@/models/User";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";
import { sendAppAssignmentNotification } from "@/lib/notifications";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    return { userId: user._id, workspaceId: user.workspaceId, role: user.role };
}

export async function GET(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);
        const licenses = await License.find({ workspaceId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: licenses });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, workspaceId, role } = await getSecureContext(req);
        
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
             return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        const assignedArray = body.assignedTo || [];
        
        const newLicense = await License.create({
            applicationName: body.applicationName,
            vendor: body.vendor,
            vendorName: body.vendorName || body.vendor,
            vendorId: body.vendorId,                    
            category: body.category,
            department: body.department,
            billingCycle: body.billingCycle,
            licenseCount: body.licenseCount,
            costPerLicense: body.costPerLicense,
            renewalDate: body.renewalDate,
            assignedTo: assignedArray,
            assignedUsers: assignedArray.length,
            userId: userId,
            workspaceId: workspaceId
        });

        await syncCurrentMonthSnapshot(workspaceId);

        // --- NOTIFICATION LOGIC ---
        // If users were assigned during creation, notify them!
        if (assignedArray.length > 0) {
            const newlyAssignedUsers = await User.find({ _id: { $in: assignedArray } }).lean();
            for (const u of newlyAssignedUsers) {
                // Fire and forget using the centralized utility
                sendAppAssignmentNotification(
                    u.name || 'User',
                    u.email,
                    u.phone,
                    newLicense.applicationName
                );
            }
        }

        return NextResponse.json({ success: true, data: newLicense });
    } catch (error: any) {
        console.error("POST License Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
