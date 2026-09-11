import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone, role } = await req.json();

    if (!phone || !role) {
      return NextResponse.json({ error: "Phone and role are required." }, { status: 400 });
    }

    // Find the user by phone and update their role
    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { $set: { role: role } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User with this phone number not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
