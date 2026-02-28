import { runCron } from "@/lib/openclaw";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { id } = await params;
  try {
    const result = runCron(id);
    return Response.json({ ok: true, result });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
