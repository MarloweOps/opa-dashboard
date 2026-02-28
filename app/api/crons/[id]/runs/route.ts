import { NextRequest } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limit = req.nextUrl.searchParams.get("limit") || "10";

  try {
    const raw = execSync(`/opt/homebrew/bin/openclaw cron runs --id ${id} --limit ${limit}`, {
      timeout: 15000,
      encoding: "utf-8",
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
    }).trim();
    const data = JSON.parse(raw);
    return Response.json(data);
  } catch (e: any) {
    return Response.json({ error: e.message, entries: [] }, { status: 500 });
  }
}
