import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Decode the token to get the userId
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

        await connectDB();
        
        // Find the user and only return safe fields (name, email, role)
        const user = await User.findById(payload.userId).select("name email role").lean();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
            success: true,
            user: { 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
}
