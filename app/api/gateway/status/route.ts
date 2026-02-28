import { getStatus } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getStatus();
    return Response.json(status);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}
