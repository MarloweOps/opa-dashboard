import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pass = process.env.DASHBOARD_PASSWORD;
  // No password set → open (dev/preview)
  if (!pass) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow login page and login API
  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const auth = req.cookies.get("dash_auth")?.value;
  if (auth === pass) return NextResponse.next();

  // Redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/refresh|api/inbox).*)"],
};
