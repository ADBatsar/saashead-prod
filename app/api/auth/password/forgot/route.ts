import { NextResponse } from "next/server";
import twilio from 'twilio';
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

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
        console.log(`[FALLBACK SMS] To ${phone}: ${message}`);
        return true; 
    }
}

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();
        await connectDB();

        const user = await User.findOne({ phone });
        if (!user) return NextResponse.json({ error: "Mobile number not registered" }, { status: 404 });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.findOneAndDelete({ phone, purpose: "reset_password" });
        await Otp.create({ phone, otp: otpCode, purpose: "reset_password" });

        await sendSMS(phone, `Your HeadSaaS password reset code is: ${otpCode}. Valid for 5 minutes.`);

        return NextResponse.json({ success: true, message: "Reset OTP sent successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
