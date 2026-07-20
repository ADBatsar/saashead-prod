import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Extract mobileNumber from the frontend request alongside the rest of the fields
        const { name, email, password, mobileNumber, companyName, companySize, role: department } = body;

        await connectDB();

        // 1. Check for duplicate emails
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        // 2. Check for duplicate phone numbers (if provided)
        if (mobileNumber) {
            const existingPhone = await User.findOne({ phone: mobileNumber });
            if (existingPhone) {
                return NextResponse.json({ error: "Mobile number already registered" }, { status: 400 });
            }
        }

        // 3. Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate the new Workspace ID for this tenant
        const newWorkspaceId = new mongoose.Types.ObjectId();

        // 5. STRICT RULE: The user creating the workspace is always the Chief
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: mobileNumber || undefined, // CRITICAL FIX: Saves the mobile number to DB!
            companyName,
            companySize,
            department, // Saved for analytics, but not used for permissions
            role: "Workspace Chief", // HARDCODED RBAC ENFORCEMENT
            workspaceId: newWorkspaceId
        });

        return NextResponse.json({ success: true, message: "Workspace created successfully" }, { status: 201 });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}
