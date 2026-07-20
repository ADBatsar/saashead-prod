import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
  const token = req.cookies.get("token")?.value;
  
  // 1. Verify Token
  const { payload } = await jwtVerify(token!, new TextEncoder().encode(process.env.JWT_SECRET));
  
  // 2. Enforce Action RBAC
  if (payload.role !== "PLATFORM_OWNER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // 3. Return sensitive data only if check passes
  return NextResponse.json({ sensitiveData: "..." });
}
