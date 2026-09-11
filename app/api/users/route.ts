import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeNotification } from "@/lib/notifications";

async function getSecureContext(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    
    // Validate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing");
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    await connectDB();
    const user = await User.findById(payload.userId || payload.id).lean();
    if (!user || !user.workspaceId) throw new Error("Missing workspace");
    
    return { workspaceId: user.workspaceId, role: user.role };
}

export async function GET(req: Request) {
    try {
        const { workspaceId } = await getSecureContext(req);
        const users = await User.find({ workspaceId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const { workspaceId, role } = await getSecureContext(req);
        
        // Only Chiefs and Operators can add users
        if (role === "Workspace License Holder" || role === "Workspace Viewer") {
             return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 });
        }

        // Create the new user
        const newUser = await User.create({
            name: body.name,
            email: body.email,
            phone: body.phone,
            role: body.role,
            workspaceId: workspaceId
        });

        // Trigger the Central Notification (Email + SMS/WhatsApp)!
        // Fire and forget (no await so it doesn't slow down the response to the user)
        sendWelcomeNotification(newUser.name, newUser.email, newUser.phone);

        return NextResponse.json({ success: true, user: newUser });
    } catch (error: any) {
        console.error("POST User Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
