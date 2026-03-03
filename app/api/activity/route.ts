import { NextRequest } from "next/server";
import { getCrons } from "@/lib/openclaw";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);

  try {
    // Single CLI call — derive activity from cron list state (already has last run info)
    const jobs = await getCrons();

    const activity = jobs
      .filter(j => j.state.lastRunAtMs)
      .map(j => ({
        jobId: j.id,
        jobName: j.name,
        status: j.state.lastRunStatus || "unknown",
        completedAtMs: j.state.lastRunAtMs,
        startedAtMs: j.state.lastRunAtMs,
      }))
      .sort((a, b) => (b.completedAtMs || 0) - (a.completedAtMs || 0))
      .slice(0, limit);

    return Response.json({ activity });
  } catch (e: any) {
    return Response.json({ error: e.message, activity: [] }, { status: 500 });
  }
}
