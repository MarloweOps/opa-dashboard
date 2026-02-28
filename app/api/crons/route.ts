import { getCrons } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await getCrons();
    return Response.json({ jobs });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}
