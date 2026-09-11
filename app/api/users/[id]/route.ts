import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import License from "@/models/License";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";
import mongoose from "mongoose";

// Secure helper to get the exact workspace and role of the logged-in user
async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    
    return { 
        workspaceId: user.workspaceId, 
        role: user.role, 
        currentUserId: user._id 
    };
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const targetUserId = resolvedParams.id;

        const { workspaceId, role, currentUserId } = await getSecureContext(req);
        
        // 1. STRICT RBAC CHECK
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden: You do not have permission to delete users." }, { status: 403 });
        }

        // 2. ID Validation
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return NextResponse.json({ success: false, message: "Invalid user ID format" }, { status: 400 });
        }

        // 3. Prevent self-deletion
        if (currentUserId.toString() === targetUserId) {
            return NextResponse.json({ success: false, message: "You cannot delete your own account." }, { status: 400 });
        }

        // 4. Execute Deletion (Ensuring they belong to the same workspace)
        const deletedUser = await User.findOneAndDelete({ _id: targetUserId, workspaceId });

        if (!deletedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // 5. AUTOMATED OFFBOARDING: Find all licenses this user was assigned to
        const affectedLicenses = await License.find({ workspaceId, assignedTo: targetUserId });

        // 6. Free up the seats and fix the counts
        for (const license of affectedLicenses) {
            // Remove the deleted user's ID from the array
            license.assignedTo = license.assignedTo.filter(
                (id: any) => id.toString() !== targetUserId.toString()
            );
            // Recalculate the used seats
            license.assignedUsers = license.assignedTo.length;
            await license.save();
        }

        // 7. Resync the financial snapshot so the dashboard updates instantly
        if (affectedLicenses.length > 0) {
            await syncCurrentMonthSnapshot(workspaceId);
            console.log(`✅ Automated Offboarding: Freed seats across ${affectedLicenses.length} applications for deleted user.`);
        }

        return NextResponse.json({ 
            success: true, 
            message: "User successfully deleted and licenses reclaimed." 
        });
    } catch (error: any) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
