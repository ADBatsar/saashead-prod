import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
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

export async function GET(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);
        const vendors = await Vendor.find({ workspaceId }).sort({ name: 1 }).lean();
        return NextResponse.json({ success: true, data: vendors });
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
        
        // Upsert logic: If the vendor exists, return it. If not, create it.
        const vendor = await Vendor.findOneAndUpdate(
            { workspaceId, name: body.name },
            { $setOnInsert: { ...body, workspaceId } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: vendor });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
