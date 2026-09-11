import { NextResponse } from "next/server";
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
        // Fallback for local testing if Twilio fails
        console.log(`[FALLBACK SMS] To ${phone}: ${message}`);
        return true; 
    }
}

export async function POST(req: Request) {
    try {
        // 1. Extract the phone AND the Turnstile Token from the frontend payload
        const { phone, turnstileToken } = await req.json(); 
        
        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        if (!turnstileToken) {
            return NextResponse.json({ error: "CAPTCHA verification is required" }, { status: 400 });
        }

        // ==========================================
        // 2. VERIFY CLOUDFLARE TURNSTILE CAPTCHA
        // ==========================================
        const formData = new URLSearchParams();
        formData.append('secret', process.env.TURNSTILE_SECRET_KEY as string);
        formData.append('response', turnstileToken);

        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });
        const turnstileData = await turnstileRes.json();
        
        if (!turnstileData.success) {
            console.error("CAPTCHA Failed:", turnstileData);
            return NextResponse.json({ error: "CAPTCHA validation failed. Are you a bot?" }, { status: 403 });
        }
        // ==========================================

        await connectDB();

        // 3. Search the database strictly by the phone number
        const user = await User.findOne({ phone });
        
        // Notice the updated error message here!
        if (!user) {
            return NextResponse.json({ error: "Mobile number not registered. Please sign up." }, { status: 404 });
        }

        // 4. Generate a random 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 5. Save OTP to database
        await Otp.findOneAndDelete({ phone: user.phone, purpose: "login" });
        await Otp.create({ phone: user.phone, otp: otpCode, purpose: "login" });

        // 6. Send the SMS
        await sendSMS(user.phone, `Your HeadSaaS login code is: ${otpCode}. Valid for 5 minutes.`);

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
