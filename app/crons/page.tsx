"use client";

import { useEffect, useState } from "react";
import { Play, ChevronDown } from "@/components/icons";

type CronJob = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; tz?: string; at?: string };
  sessionTarget: string;
  payload: { kind: string; model?: string; timeoutSeconds?: number };
  delivery?: { mode: string; channel: string; to?: string; bestEffort?: boolean };
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
    lastError?: string;
    consecutiveErrors?: number;
  };
};

type RunEntry = {
  ts: number;
  action: string;
  status: string;
  error?: string;
  summary?: string;
  durationMs?: number;
  model?: string;
  provider?: string;
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number };
  delivered?: boolean;
};

function relTime(ms: number): string {
  const diff = ms - Date.now();
  if (diff < 0) return "overdue";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
}

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function humanSchedule(s: CronJob["schedule"]): string {
  if (s.kind === "cron" && s.expr) return s.expr;
  if (s.kind === "daily" && s.at) return `Daily at ${s.at}`;
  if (s.kind === "weekly" && s.at) return `Weekly at ${s.at}`;
  return s.kind;
}

export default function CronsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runs, setRuns] = useState<Record<string, RunEntry[]>>({});

  useEffect(() => {
    loadJobs();
    const poll = setInterval(loadJobs, 15000);
    return () => clearInterval(poll);
  }, []);

  async function loadJobs() {
    try {
      const res = await fetch("/api/crons", { cache: "no-store" });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {} finally { setLoading(false); }
  }

  async function loadRuns(id: string) {
    try {
      const res = await fetch(`/api/crons/${id}/runs?limit=5`, { cache: "no-store" });
      const data = await res.json();
      setRuns(prev => ({ ...prev, [id]: data.entries || [] }));
    } catch {}
  }

  async function handleRun(id: string) {
    setRunning(prev => new Set(prev).add(id));
    try {
      await fetch(`/api/crons/${id}/run`, { method: "POST" });
      setTimeout(loadJobs, 2000);
    } finally {
      setRunning(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  async function handleToggle(id: string, enable: boolean) {
    await fetch(`/api/crons/${id}/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enable }) });
    loadJobs();
  }

  function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      if (!runs[id]) loadRuns(id);
    }
  }

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <span className="t-label">
          {loading ? "Loading" : `${jobs.filter(j => j.enabled).length} active / ${jobs.length} total`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {jobs.map((job) => (
          <div key={job.id} style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
            {/* Main row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-6)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ fontFamily: "var(--font-tech)", fontSize: "var(--text-base)", fontWeight: 600, color: "var(--text-primary)" }}>
                    {job.name}
                  </span>
                  {!job.enabled && <span className="pill pill-muted">Disabled</span>}
                  {(job.state.consecutiveErrors || 0) > 0 && <span className="pill pill-red">{job.state.consecutiveErrors} errors</span>}
                </div>
                <div style={{ display: "flex", gap: "var(--space-4)", marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span>{humanSchedule(job.schedule)}</span>
                  {job.payload.model && <span>{job.payload.model}</span>}
                  {job.delivery?.channel && <span>{job.delivery.channel}</span>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
                <button type="button" onClick={() => handleRun(job.id)} disabled={running.has(job.id)} className="btn btn-accent" style={{ padding: "6px 12px", fontSize: "var(--text-xs)" }}>
                  <Play size={11} />
                  {running.has(job.id) ? "Running" : "Run"}
                </button>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={job.enabled} onChange={(e) => handleToggle(job.id, e.target.checked)} />
                </label>
              </div>
            </div>

            {/* Status row */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)",
              padding: "var(--space-3) var(--space-6)",
              borderTop: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Last run</span>
                <p style={{ color: "var(--text-secondary)", marginTop: 2 }}>{job.state.lastRunAtMs ? fmtTime(job.state.lastRunAtMs) : "Never"}</p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <p style={{ color: job.state.lastRunStatus === "ok" ? "var(--accent)" : job.state.lastRunStatus ? "var(--red)" : "var(--text-secondary)", marginTop: 2 }}>
                  {job.state.lastRunStatus || "—"}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Next run</span>
                <p style={{ color: "var(--text-secondary)", marginTop: 2 }}>{job.state.nextRunAtMs ? fmtTime(job.state.nextRunAtMs) : "—"}</p>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>In</span>
                <p style={{ color: "var(--accent)", marginTop: 2 }}>{job.state.nextRunAtMs ? relTime(job.state.nextRunAtMs) : "—"}</p>
              </div>
            </div>

            {/* Expand toggle */}
            <button
              type="button"
              onClick={() => toggleExpand(job.id)}
              style={{
                width: "100%", padding: "var(--space-2) var(--space-6)",
                borderTop: "1px solid var(--border-subtle)",
                background: "none", border: "none", borderTopStyle: "solid", borderTopWidth: 1, borderTopColor: "var(--border-subtle)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)",
              }}
            >
              <ChevronDown size={10} style={{ transform: expanded === job.id ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
              Run history
            </button>

            {/* Run history */}
            {expanded === job.id && (
              <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                {!runs[job.id] ? (
                  <div style={{ padding: "var(--space-3) var(--space-6)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Loading...</div>
                ) : runs[job.id].length === 0 ? (
                  <div style={{ padding: "var(--space-3) var(--space-6)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>No runs yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border-subtle)" }}>
                    {runs[job.id].map((run, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "140px 60px 80px 80px 1fr",
                        gap: "var(--space-3)", alignItems: "center",
                        padding: "var(--space-2) var(--space-6)",
                        background: "var(--bg)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                      }}>
                        <span style={{ color: "var(--text-secondary)" }}>{fmtTime(run.ts)}</span>
                        <span style={{ color: run.status === "ok" || run.status === "success" ? "var(--accent)" : "var(--red)" }}>
                          {run.status}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {run.model || "—"}
                        </span>
                        <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {run.error || (run.delivered ? "delivered" : run.summary || "")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {job.state.lastError && expanded !== job.id && (
              <div style={{ padding: "var(--space-2) var(--space-6)", borderTop: "1px solid var(--border-subtle)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--red)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.state.lastError}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
