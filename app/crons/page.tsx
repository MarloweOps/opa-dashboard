"use client";

import { useState } from "react";

type CronJob = {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: "healthy" | "warning";
  output: string;
  enabled: boolean;
};

const INITIAL_JOBS: CronJob[] = [
  {
    id: "morning-brief",
    name: "morning-brief",
    schedule: "0 7 * * *",
    lastRun: "Today 07:00",
    nextRun: "Tomorrow 07:00",
    status: "healthy",
    output: "Brief archived and posted to dashboard.",
    enabled: true,
  },
  {
    id: "drip-emails",
    name: "trial-drip-emails",
    schedule: "0 9 * * 1-5",
    lastRun: "Today 09:00",
    nextRun: "Tomorrow 09:00",
    status: "warning",
    output: "Paused pending valid Resend API key.",
    enabled: true,
  },
];

export default function CronsPage() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  return (
    <div className="p-6">
      <div className="panel">
        <div className="panel-header">⟳ Automations</div>
        <div className="p-4 space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="border border-sage/20 bg-forest/10 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mono text-[11px] text-porcelain">{job.name}</p>
                  <p className="mono text-[10px] text-sage mt-1">{job.schedule}</p>
                </div>
                <span className={`mono text-[10px] px-2 py-0.5 border rounded ${job.status === "healthy" ? "text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10" : "text-honey border-honey/30 bg-honey/10"}`}>
                  {job.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 mono text-[10px] text-sage">
                <p>Last run: {job.lastRun}</p>
                <p>Next run: {job.nextRun}</p>
              </div>

              <p className="text-[12px] text-sage-light mt-2">{job.output}</p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setJobs((prev) =>
                      prev.map((item) =>
                        item.id === job.id
                          ? { ...item, lastRun: "Just now", output: `Manual run triggered at ${new Date().toLocaleTimeString("en-US")}.` }
                          : item
                      )
                    )
                  }
                  className="mono text-[10px] px-3 py-1.5 border border-forest text-[#4ade80] bg-forest/10"
                >
                  RUN NOW
                </button>

                <label className="mono text-[10px] text-sage flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={job.enabled}
                    onChange={(e) =>
                      setJobs((prev) =>
                        prev.map((item) => (item.id === job.id ? { ...item, enabled: e.target.checked } : item))
                      )
                    }
                    className="accent-[#4ade80]"
                  />
                  ENABLED
                </label>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
