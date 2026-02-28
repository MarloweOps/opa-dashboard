import { NextRequest } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = execSync("/opt/homebrew/bin/openclaw gateway call system-presence --json", {
      timeout: 10000,
      encoding: "utf-8",
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
    }).trim();
    const data = JSON.parse(raw);
    return Response.json({ devices: data });
  } catch (e: any) {
    return Response.json({ error: e.message, devices: [] }, { status: 500 });
  }
}
