import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
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

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const params = await props.params;
        const body = await req.json();

        const updatedVendor = await Vendor.findOneAndUpdate(
            { _id: params.id, workspaceId },
            { $set: body },
            { new: true }
        );

        return NextResponse.json({ success: true, data: updatedVendor });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const params = await props.params;
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ success: false, message: "Invalid ID format." }, { status: 400 });
        }

        await Vendor.findOneAndDelete({ _id: params.id, workspaceId });
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
