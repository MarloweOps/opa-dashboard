import { NextRequest } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);

  try {
    // Get all cron jobs first
    const cronRaw = execSync(`/opt/homebrew/bin/openclaw cron list --json`, {
      timeout: 15000,
      encoding: "utf-8",
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
    }).trim();
    const cronData = JSON.parse(cronRaw);
    const jobs = cronData.jobs || [];

    // Get recent runs for each job (up to 3 per job for efficiency)
    const allRuns: any[] = [];
    for (const job of jobs) {
      try {
        const runsRaw = execSync(
          `/opt/homebrew/bin/openclaw cron runs --id ${job.id} --limit 3`,
          {
            timeout: 5000,
            encoding: "utf-8",
            env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
          }
        ).trim();
        const runsData = JSON.parse(runsRaw);
        const entries = runsData.entries || runsData.runs || [];
        for (const run of entries) {
          allRuns.push({
            jobId: job.id,
            jobName: job.name,
            ...run,
          });
        }
      } catch {
        // skip jobs with no run history
      }
    }

    // Sort by timestamp descending, take top N
    allRuns.sort((a, b) => {
      const tsA = a.completedAtMs || a.startedAtMs || 0;
      const tsB = b.completedAtMs || b.startedAtMs || 0;
      return tsB - tsA;
    });

    return Response.json({ activity: allRuns.slice(0, limit) });
  } catch (e: any) {
    return Response.json({ error: e.message, activity: [] }, { status: 500 });
  }
}
