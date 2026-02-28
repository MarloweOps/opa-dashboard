import { readTodayMd } from "@/lib/filesystem";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readTodayMd();
    return Response.json(data);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
