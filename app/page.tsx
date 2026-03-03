"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import VariedHQ from "@/components/VariedHQ";

/* ──── Types ──── */

type HealthData = {
  ok: boolean;
  channels?: Record<string, { configured: boolean; running: boolean; probe?: { ok: boolean; bot?: { username: string } } }>;
};

type CronJob = {
  id: string;
  name: string;
  enabled: boolean;
  state: { nextRunAtMs?: number; lastRunStatus?: string; consecutiveErrors?: number; lastRunAtMs?: number };
};

type TodayTask = { text: string; done: boolean; inProgress: boolean; lineIndex: number };
type TodaySection = { title: string; emoji?: string; tasks: TodayTask[] };

type Device = {
  host: string;
  ip?: string;
  platform?: string;
  deviceFamily?: string;
  mode?: string;
  reason?: string;
  ts: number;
};

type ActivityEntry = {
  jobId: string;
  jobName: string;
  status?: string;
  completedAtMs?: number;
  startedAtMs?: number;
  durationMs?: number;
  result?: string;
};

/* ──── Helpers ──── */

function relTime(ms: number): string {
  const diff = ms - Date.now();
  if (diff < 0) return "overdue";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d`;
}

function ago(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function statusDotColor(status?: string): string {
  if (!status) return "var(--text-muted)";
  if (status === "ok" || status === "success") return "#22C55E";
  if (status === "error" || status === "failed") return "var(--red)";
  return "var(--text-secondary)";
}

/* ──── Component ──── */

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [sections, setSections] = useState<TodaySection[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [quickAddText, setQuickAddText] = useState("");
  const [quickAddSaving, setQuickAddSaving] = useState(false);
  const quickAddRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const [h, c, t, p, a] = await Promise.all([
        fetch("/api/gateway/health", { cache: "no-store" }).then(r => r.json()).catch(() => null),
        fetch("/api/crons", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch("/api/today", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch("/api/gateway/presence", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch("/api/activity?limit=15", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      ]);
      if (h) setHealth(h);
      if (c.jobs) setCrons(c.jobs);
      if (t.sections) setSections(t.sections);
      if (p.devices) setDevices(p.devices);
      if (a.activity) setActivity(a.activity);
    };
    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, []);

  /* ── Derived data ── */
  const channels = health?.channels ? Object.entries(health.channels) : [];
  const priorities = sections.find(s => s.title.toUpperCase().includes("PRIORITY"))?.tasks.filter(t => !t.done).slice(0, 3) || [];
  const nextCrons = crons.filter(j => j.enabled && j.state.nextRunAtMs).sort((a, b) => (a.state.nextRunAtMs || 0) - (b.state.nextRunAtMs || 0)).slice(0, 4);
  const activeDevices = devices.filter(d => d.reason !== "disconnect");

  // Traffic light — count cron health
  const enabledCrons = crons.filter(j => j.enabled);
  const greenCount = enabledCrons.filter(j => !j.state.consecutiveErrors || j.state.consecutiveErrors === 0).length;
  const redCount = enabledCrons.filter(j => (j.state.consecutiveErrors || 0) >= 3).length;
  const amberCount = enabledCrons.filter(j => {
    const errs = j.state.consecutiveErrors || 0;
    return errs > 0 && errs < 3;
  }).length;

  // Needs Your Input — tasks marked in-progress or blocked items from today.md
  const needsInput = sections.flatMap(s =>
    s.tasks.filter(t => !t.done && t.inProgress)
  ).slice(0, 4);

  // Also surface overdue/stale tasks as "needs input" if nothing in-progress
  const staleTasks = needsInput.length === 0
    ? sections.find(s => s.title.toUpperCase().includes("PRIORITY"))?.tasks.filter(t => !t.done).slice(0, 3) || []
    : [];

  const inputItems = needsInput.length > 0 ? needsInput : staleTasks;

  /* ── Quick add handler ── */
  const handleQuickAdd = async () => {
    const text = quickAddRef.current?.value || quickAddText;
    if (!text.trim()) return;
    setQuickAddSaving(true);
    try {
      await fetch("/api/today/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), section: "NORMAL" }),
      });
      setQuickAddText("");
      if (quickAddRef.current) quickAddRef.current.value = "";
      // Refresh today data
      const t = await fetch("/api/today", { cache: "no-store" }).then(r => r.json()).catch(() => ({}));
      if (t.sections) setSections(t.sections);
    } catch {
      // silently fail
    }
    setQuickAddSaving(false);
  };

  /* ── Nav icons ── */
  const navIcons: Record<string, string> = {
    "/chat": "MSG",
    "/files": "DIR",
    "/crons": "RUN",
    "/today": "DAY",
  };

  return (
    <div className="mobile-pad page-content" style={{ padding: "var(--space-8)", position: "relative" }}>

      {/* Ambient background glow for glassmorphism */}
      <div className="glass-bg" />

      {/* ══════════ TRAFFIC LIGHT HEADER ══════════ */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div className="dash-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)", gap: "var(--space-3)" }}>
          <h1 className="gradient-text" style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}>
            Mission Control
          </h1>
          <span className={`pill ${health?.ok ? "pill-green" : "pill-red"}`}>
            {health === null ? "Checking" : health.ok ? "Online" : "Offline"}
          </span>
        </div>

        {/* Traffic light row */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginTop: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: greenCount > 0 ? "0 0 8px rgba(34,197,94,0.6)" : "none", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{greenCount}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: amberCount > 0 ? "#F59E0B" : "#3F3F46", boxShadow: amberCount > 0 ? "0 0 8px rgba(245,158,11,0.6)" : "none", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{amberCount}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: redCount > 0 ? "#EF4444" : "#3F3F46", boxShadow: redCount > 0 ? "0 0 8px rgba(239,68,68,0.6)" : "none", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{redCount}</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "auto" }}>
            {enabledCrons.length} crons
          </span>
        </div>

        {channels.length > 0 && (
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
            {channels.map(([name, ch]) => (
              <span key={name} className={`pill ${ch.running && ch.probe?.ok !== false ? "pill-green" : ch.configured ? "pill-orange" : "pill-muted"}`}>
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

      {/* ══════════ TOP ROW: Priorities + Needs Your Input ══════════ */}
      <div className="grid-2col-top" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>

        {/* Priorities */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <span className="section-title" style={{ marginBottom: 0 }}>Priorities</span>
            <Link href="/today" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              All <ChevronRight size={10} />
            </Link>
          </div>
          {priorities.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No priorities set.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {priorities.map((task, i) => (
                <div key={i} style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderLeft: "2px solid var(--accent)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Needs Your Input */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <span className="section-title" style={{ marginBottom: 0, color: inputItems.length > 0 ? "#F59E0B" : undefined }}>
              Needs Your Input
            </span>
          </div>
          {inputItems.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Nothing blocked. All clear.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {inputItems.map((task, i) => (
                <div key={i} style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderLeft: `2px solid ${task.inProgress ? "#F59E0B" : "var(--accent)"}`,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MID ROW: Revenue + Next Runs + Devices ══════════ */}
      <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>

        {/* Revenue Card */}
        <div className="card" style={{ padding: 24 }}>
          <span className="section-title" style={{ display: "block" }}>Revenue</span>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <span className="number-big number-muted">
              $0
            </span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: "var(--space-2)" }}>MRR</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Trial users</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>7</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Paid</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>0</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Solo Dolo</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>---</span>
            </div>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "var(--space-3)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-2)" }}>
            Connect Stripe to auto-update
          </div>
        </div>

        {/* Next Runs */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
            <span className="section-title" style={{ marginBottom: 0 }}>Next Runs</span>
            <Link href="/crons" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              All <ChevronRight size={10} />
            </Link>
          </div>
          {nextCrons.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No scheduled jobs.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {nextCrons.map((job) => (
                <div key={job.id} className="feed-item" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300, flex: 1 }}>
                    {job.name}
                  </span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {job.state.nextRunAtMs ? relTime(job.state.nextRunAtMs) : "---"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Devices */}
        <div className="card" style={{ padding: 24 }}>
          <span className="section-title" style={{ display: "block" }}>Devices</span>
          {activeDevices.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No active connections.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {activeDevices.map((d, i) => (
                <div key={i} style={{ padding: "var(--space-3) var(--space-4)", background: "rgba(255,255,255,0.02)", borderLeft: "2px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      {d.host}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {ago(d.ts)}
                    </span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {[d.platform, d.ip, d.mode].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

      {/* ══════════ ACTIVITY FEED ══════════ */}
      <div className="card" style={{ padding: 24, marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Recent Activity</span>
          <Link href="/crons" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            All runs <ChevronRight size={10} />
          </Link>
        </div>
        {activity.length === 0 ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No recent activity.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.slice(0, 8).map((entry, i) => {
              const ts = entry.completedAtMs || entry.startedAtMs || 0;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className="feed-item" style={{
                  paddingLeft: "var(--space-4)", paddingRight: "var(--space-4)",
                  background: isEven ? "rgba(255,255,255,0.01)" : "transparent",
                  borderRadius: 2,
                }}>
                  {/* Status dot instead of emoji */}
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: statusDotColor(entry.status),
                    boxShadow: (entry.status === "ok" || entry.status === "success")
                      ? "0 0 6px rgba(34,197,94,0.4)"
                      : (entry.status === "error" || entry.status === "failed")
                        ? "0 0 6px rgba(196,48,48,0.4)"
                        : "none",
                    flexShrink: 0,
                    display: "inline-block",
                  }} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.jobName}
                  </span>
                  {entry.durationMs != null && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                      {entry.durationMs < 1000 ? `${entry.durationMs}ms` : `${Math.round(entry.durationMs / 1000)}s`}
                    </span>
                  )}
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: 50, textAlign: "right" }}>
                    {ts ? ago(ts) : "---"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

      {/* ══════════ THE VARIED HQ ══════════ */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <VariedHQ />
      </div>

      <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

      {/* ══════════ QUICK ADD — floating bar ══════════ */}
      <div className="quick-add-wrap" style={{ marginBottom: "var(--space-6)" }}>
        <span className="section-title" style={{ display: "block" }}>Quick Add</span>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <input
            ref={quickAddRef}
            className="input"
            type="text"
            placeholder="Add a task to today.md..."
            value={quickAddText}
            onChange={e => setQuickAddText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleQuickAdd(); }}
            style={{
              flex: 1,
            }}
          />
          <button
            className="btn btn-accent"
            onClick={handleQuickAdd}
            disabled={quickAddSaving}
            style={{
              flexShrink: 0,
              touchAction: "manipulation",
              fontWeight: 500,
              padding: "10px 20px",
            }}
          >
            {quickAddSaving ? "..." : "Add"}
          </button>
        </div>
      </div>

      {/* ══════════ QUICK NAV ══════════ */}
      <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        {[
          { href: "/chat", label: "Chat" },
          { href: "/files", label: "Files" },
          { href: "/crons", label: "Automations" },
          { href: "/today", label: "Today" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-card"
            style={{
              padding: "var(--space-4) var(--space-4)",
              fontFamily: "var(--font-mono)",
              color: "var(--text-primary)",
              fontWeight: 300,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "var(--space-2)",
              textAlign: "center",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--accent)", letterSpacing: "0.1em", fontWeight: 500 }}>
              {navIcons[item.href] || ""}
            </span>
            <span style={{ fontSize: "var(--text-sm)" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
