import { toggleTodayTask } from "@/lib/filesystem";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { lineIndex, done } = await req.json();
  if (typeof lineIndex !== "number") return Response.json({ error: "lineIndex required" }, { status: 400 });

  try {
    await toggleTodayTask(lineIndex, done);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
