import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pass = process.env.DASHBOARD_PASSWORD;
  if (!pass) return NextResponse.next(); // no password set — open (dev only)

  const auth = req.cookies.get("dash_auth")?.value;
  if (auth === pass) return NextResponse.next();

  // Check basic auth header
  const header = req.headers.get("authorization");
  if (header) {
    const encoded = header.split(" ")[1];
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [, pwd] = decoded.split(":");
    if (pwd === pass) {
      const res = NextResponse.next();
      res.cookies.set("dash_auth", pass, { httpOnly: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 30 });
      return res;
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Marlowe Ops"' },
  });
}

export const config = {
  matcher: ["/((?!api/refresh|_next|favicon.ico).*)"],
};
