import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import License from "@/models/License";
import { cookies } from "next/headers";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    return { workspaceId: user.workspaceId, currentUserId: user._id };
}

// DEACTIVATE ACCOUNT (Soft Lock)
export async function PUT(req: Request) {
    try {
        const { currentUserId } = await getSecureContext(req);
        
        // Mark user as Inactive
        await User.findByIdAndUpdate(currentUserId, { status: "Inactive" });
        
        // Wipe their session cookie to forcefully log them out
        cookies().delete("token");

        return NextResponse.json({ success: true, message: "Account deactivated successfully." });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PERMANENTLY DELETE ACCOUNT
export async function DELETE(req: Request) {
    try {
        const { workspaceId, currentUserId } = await getSecureContext(req);

        // 1. Delete the user entirely
        await User.findByIdAndDelete(currentUserId);

        // 2. Automated Offboarding: Free up any licenses they held
        const affectedLicenses = await License.find({ workspaceId, assignedTo: currentUserId });
        for (const license of affectedLicenses) {
            license.assignedTo = license.assignedTo.filter((id: any) => id.toString() !== currentUserId.toString());
            license.assignedUsers = license.assignedTo.length;
            await license.save();
        }

        if (affectedLicenses.length > 0) {
            await syncCurrentMonthSnapshot(workspaceId);
        }

        // 3. Wipe their session cookie
        cookies().delete("token");

        return NextResponse.json({ success: true, message: "Account permanently deleted." });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
