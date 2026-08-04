import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user_role from cookies (set during login)
  const userRole = request.cookies.get("user_role")?.value;
  const token = request.cookies.get("auth_token")?.value;

  // If no token at all, redirect to login for any protected route
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // OWNER routes: Only accessible by owner role
  if (pathname.startsWith("/owner")) {
    if (userRole !== "owner") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // SUPERADMIN routes: Only accessible by superadmin
  if (pathname.startsWith("/superadmin")) {
    if (userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ADMIN routes: Accessible by admin and superadmin
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // EMPLOYEE routes: Accessible by all authenticated roles (except owner)
  if (pathname.startsWith("/employee")) {
    if (userRole !== "employee" && userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

// Matcher: all protected role route groups
export const config = {
  matcher: ["/owner/:path*", "/superadmin/:path*", "/admin/:path*", "/employee/:path*"],
};
