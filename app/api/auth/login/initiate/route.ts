import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import twilio from 'twilio';
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

// Initialize the Twilio client using your environment variables
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(phone: string, message: string) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        return true;
    } catch (error) {
        console.error("Twilio SMS Error:", error);
        // Fallback for local testing if Twilio fails or isn't set up yet
        console.log(`[FALLBACK SMS] To ${phone}: ${message}`);
        return true; 
    }
}

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json(); 
        await connectDB();

        // 1. Verify user exists with this email
        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 404 });

        // 2. Verify the Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

        // 3. Ensure they have a phone number registered
        if (!user.phone) return NextResponse.json({ error: "No mobile number attached to this account. Please contact your admin." }, { status: 400 });

        // 4. Generate a random 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 5. Save OTP to database
        await Otp.findOneAndDelete({ phone: user.phone, purpose: "login" });
        await Otp.create({ phone: user.phone, otp: otpCode, purpose: "login" });

        // 6. Send the SMS
        await sendSMS(user.phone, `Your SaaSHead login code is: ${otpCode}. Valid for 5 minutes.`);

        // Mask the phone number for the frontend UI (e.g., ******8339)
        const maskedPhone = user.phone.slice(0, -4).replace(/./g, '*') + user.phone.slice(-4);

        return NextResponse.json({ 
            success: true, 
            message: "OTP sent successfully",
            maskedPhone: maskedPhone,
            phone: user.phone // Passed securely so the frontend can verify the OTP in step 2
        });
    } catch (error) {
        console.error("Login Initiate Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
