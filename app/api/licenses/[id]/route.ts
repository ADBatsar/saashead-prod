import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import License from "@/models/License";
import User from "@/models/User";
import { syncCurrentMonthSnapshot } from "@/lib/snapshot";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    return { workspaceId: user.workspaceId, role: user.role };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const assignedArray = body.assignedTo || [];

        const updated = await License.findOneAndUpdate(
            { _id: params.id, workspaceId },
            {
                $set: {
                    applicationName: body.applicationName,
                    vendor: body.vendor,
                    vendorName: body.vendorName || body.vendor, // CRITICAL FIX
                    vendorId: body.vendorId,                    // CRITICAL FIX
                    category: body.category,
                    department: body.department,
                    billingCycle: body.billingCycle,
                    licenseCount: body.licenseCount,
                    costPerLicense: body.costPerLicense,
                    renewalDate: body.renewalDate,
                    assignedTo: assignedArray,
                    assignedUsers: assignedArray.length,
                }
            },
            { new: true }
        );

        if (!updated) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

        await syncCurrentMonthSnapshot(workspaceId);

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        await License.findOneAndDelete({ _id: params.id, workspaceId });
        await syncCurrentMonthSnapshot(workspaceId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
