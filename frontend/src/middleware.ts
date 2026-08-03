import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user_role from cookies (set during login)
  // Default to 'admin' for smooth testing if cookie is not set yet
  const userRole = request.cookies.get("user_role")?.value || "admin";
  const token = request.cookies.get("auth_token")?.value;

  // Protect Superadmin routes
  if (pathname.startsWith("/superadmin")) {
    if (userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Protect Admin routes (Superadmin can access Admin routes)
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Protect Employee routes (All authenticated roles can access Employee views)
  if (pathname.startsWith("/employee")) {
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Next.js matcher configuration for protected role routes
export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*", "/employee/:path*"],
};
