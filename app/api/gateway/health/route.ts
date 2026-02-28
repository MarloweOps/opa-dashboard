import { getHealth } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getHealth();
    return Response.json(health);
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 502 });
  }
}
