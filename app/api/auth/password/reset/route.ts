import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
    try {
        const { phone, otp, newPassword } = await req.json();
        await connectDB();

        // 1. Verify the Reset OTP
        const validOtp = await Otp.findOne({ phone, otp, purpose: "reset_password" });
        if (!validOtp) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });

        // 2. Hash the new password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update the user's password in the database
        const user = await User.findOneAndUpdate(
            { phone },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 4. Burn the OTP so it cannot be reused
        await Otp.deleteOne({ _id: validOtp._id });

        return NextResponse.json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
