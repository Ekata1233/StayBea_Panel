import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  // 🔓 Public routes (no auth needed)
  const publicRoutes = ["/login", "/admin/login", "/forgot-password"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ❌ No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Token exists → allow request
  return NextResponse.next();
}


export const config = {
  matcher: [
    // "/admin/:path*",
    // "/dashboard/:path*",
    // "/manager/:path*",
    // "/profile/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
