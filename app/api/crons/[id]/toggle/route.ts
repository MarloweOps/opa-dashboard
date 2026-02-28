import { toggleCron } from "@/lib/openclaw";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  const enable = body.enable !== false;

  try {
    const result = toggleCron(id, enable);
    return Response.json({ ok: true, enabled: enable, result });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
