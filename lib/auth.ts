import { NextRequest, NextResponse } from "next/server";

export function requireDashboardAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return null;
  const auth = req.cookies.get("dash_auth")?.value;
  if (auth === expected) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
