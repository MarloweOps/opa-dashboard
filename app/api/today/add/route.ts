import { addTodayTask } from "@/lib/filesystem";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { text, section } = await req.json();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  try {
    await addTodayTask(text, section);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
