import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();
        await connectDB();

        // 1. Verify OTP exists and matches
        const validOtp = await Otp.findOne({ phone, otp, purpose: "login" });
        if (!validOtp) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });

        // 2. Get the User
        const user = await User.findOne({ phone });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 3. Delete OTP so it cannot be reused
        await Otp.deleteOne({ _id: validOtp._id });

        // 4. Issue the JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ 
            userId: user._id.toString(),
            workspaceId: user.workspaceId ? user.workspaceId.toString() : null,
            role: user.role
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(secret);

        const response = NextResponse.json({ success: true, role: user.role }, { status: 200 });
        
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false, // Keep false for local IP testing
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
