import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Secure helper to get the exact workspace of the logged-in user
async function getSecureWorkspace(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    
    // Check if the current user is a License Holder. If they are, they shouldn't be here.
    if (payload.role === "Workspace License Holder") {
        throw new Error("Forbidden: License Holders cannot manage users.");
    }

    return payload.workspaceId;
}

export async function GET(req: Request) {
    try {
        const workspaceId = await getSecureWorkspace(req);
        await connectDB();
        
        // Fetch all users locked to this specific workspace
        const users = await User.find({ workspaceId }).select("_id name email role createdAt").sort({ createdAt: -1 }).lean();
        
        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid session" }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const workspaceId = await getSecureWorkspace(req);
        const body = await req.json();
        const { name, email, password, role } = body;

        await connectDB();

        // 1. Prevent duplicate emails globally
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email is already in use." }, { status: 400 });
        }

        // 2. Hash the password for the new team member
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the user, forcefully locking them into the current workspace
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            workspaceId: workspaceId // STRICT TENANT ISOLATION
        });

        // Strip password before returning
        const safeUser = { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role };

        return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    } catch (error: any) {
        console.error("Create User Error:", error);
        return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
    }
}
