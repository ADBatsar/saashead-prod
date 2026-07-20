import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });
    
    // Destroy the secure cookie by setting its expiration to the past
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0), // Instantly expires the cookie
        path: "/",
    });

    return response;
}
