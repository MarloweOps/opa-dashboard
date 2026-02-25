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
      <section className="card space-y-3">
        <h2 className="section-title">Automations</h2>

        {jobs.map((job) => (
          <article key={job.id} className="card !p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px]">{job.name}</h3>
                <p className="data text-[11px] text-[var(--text-secondary)] mt-1">{job.schedule}</p>
              </div>
              <span className={job.status === "healthy" ? "pill-green" : "pill-amber"}>{job.status}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 data text-[11px] text-[var(--text-secondary)]">
              <p>Last run: {job.lastRun}</p>
              <p>Next run: {job.nextRun}</p>
            </div>

            <p className="text-[13px] mt-2">{job.output}</p>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setJobs((prev) =>
                    prev.map((item) =>
                      item.id === job.id
                        ? {
                            ...item,
                            lastRun: "Just now",
                            output: `Manual run triggered at ${new Date().toLocaleTimeString("en-US")}.`,
                          }
                        : item
                    )
                  )
                }
                className="btn btn-green"
              >
                Run Now
              </button>

              <label className="data text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={job.enabled}
                  onChange={(e) =>
                    setJobs((prev) => prev.map((item) => (item.id === job.id ? { ...item, enabled: e.target.checked } : item)))
                  }
                  className="accent-[#4ade80]"
                />
                Enabled
              </label>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
