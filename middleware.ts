import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // 1. Protect routes
  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      
      // 2. Platform Access Guard (Updated Casing & Added Admin)
      if (
        path.startsWith("/admin") && 
        payload.role !== "Platform Owner" && 
        payload.role !== "Platform Admin"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
