import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Helper function to securely extract the user ID from the active session
async function getUserId(req: Request) {
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) throw new Error("Unauthorized");
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId || payload.id;
}

// GET: Fetches the user data when the page loads
export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        await connectDB();
        
        const user = await User.findById(userId).lean();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Return the data structured exactly how our frontend expects it
        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber || user.phone || "", // Fallback in case schema uses 'phone'
                companyName: user.companyName || "",
                companySize: user.companySize || "1-50",
                department: user.department || "IT",
                role: user.role
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

// PATCH: Updates the user data when "Save Changes" is clicked
export async function PATCH(req: Request) {
    try {
        const userId = await getUserId(req);
        const body = await req.json();
        
        await connectDB();

        // Update ONLY the allowed fields (never email or role)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name: body.name,
                    mobileNumber: body.mobileNumber,
                    companyName: body.companyName,
                    companySize: body.companySize,
                    department: body.department,
                }
            },
            { returnDocument: 'after' }
        ).lean();

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
