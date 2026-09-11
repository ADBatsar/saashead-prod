import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import License from "@/models/License";
import User from "@/models/User";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";
import mongoose from "mongoose";
import { sendAppAssignmentNotification } from "@/lib/notifications";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    return { workspaceId: user.workspaceId, role: user.role };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const { workspaceId, role } = await getSecureContext(req);
        
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const newAssignedArray = body.assignedTo || [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid application ID format" }, { status: 400 });
        }

        // --- SMART DIFFING LOGIC ---
        // 1. Fetch the existing app BEFORE we update it to see who currently has access
        const existingApp = await License.findOne({ _id: id, workspaceId }).lean();
        if (!existingApp) {
             return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 });
        }

        const oldAssignedIds = (existingApp.assignedTo || []).map(String);
        const newAssignedIds = newAssignedArray.map(String);

        // 2. Find the IDs of users who are in the NEW array but were NOT in the OLD array
        const newlyAddedIds = newAssignedIds.filter((uid: string) => !oldAssignedIds.includes(uid));

        // 3. Perform the actual database update
        const updated = await License.findOneAndUpdate(
            { _id: id, workspaceId }, 
            {
                $set: {
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
                    assignedTo: newAssignedArray,
                    assignedUsers: newAssignedArray.length,
                }
            },
            { returnDocument: 'after' } 
        );

        await syncCurrentMonthSnapshot(workspaceId);

        // 4. Trigger Notifications ONLY for newly added users
        if (newlyAddedIds.length > 0) {
            const newlyAssignedUsers = await User.find({ _id: { $in: newlyAddedIds } }).lean();
            for (const u of newlyAssignedUsers) {
                // Fire and forget using the centralized utility
                sendAppAssignmentNotification(
                    u.name || 'User',
                    u.email,
                    u.phone,
                    updated.applicationName
                );
            }
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const { workspaceId, role } = await getSecureContext(req);
        
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid application ID format" }, { status: 400 });
        }

        const deleted = await License.findOneAndDelete({ _id: id, workspaceId });

        if (!deleted) return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 });

        await syncCurrentMonthSnapshot(workspaceId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
