"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { AGENT_ROSTER } from "@/lib/agents";

type HealthData = {
  ok: boolean;
  channels?: Record<string, { configured: boolean; running: boolean; probe?: { ok: boolean; bot?: { username: string } } }>;
};

type CronJob = {
  id: string;
  name: string;
  enabled: boolean;
  state: { nextRunAtMs?: number; lastRunStatus?: string; consecutiveErrors?: number };
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
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [sections, setSections] = useState<TodaySection[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const load = async () => {
      const [h, c, t, p] = await Promise.all([
        fetch("/api/gateway/health", { cache: "no-store" }).then(r => r.json()).catch(() => null),
        fetch("/api/crons", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch("/api/today", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch("/api/gateway/presence", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      ]);
      if (h) setHealth(h);
      if (c.jobs) setCrons(c.jobs);
      if (t.sections) setSections(t.sections);
      if (p.devices) setDevices(p.devices);
    };
    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, []);

  const channels = health?.channels ? Object.entries(health.channels) : [];
  const priorities = sections.find(s => s.title.toUpperCase().includes("PRIORITY"))?.tasks.filter(t => !t.done).slice(0, 3) || [];
  const nextCrons = crons.filter(j => j.enabled && j.state.nextRunAtMs).sort((a, b) => (a.state.nextRunAtMs || 0) - (b.state.nextRunAtMs || 0)).slice(0, 4);
  const activeDevices = devices.filter(d => d.reason !== "disconnect");

  return (
    <div className="mobile-pad" style={{ padding: "var(--space-8)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-10)" }}>
        <div className="dash-header" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-2xl)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            Mission Control
          </h1>
          <span className={`pill ${health?.ok ? "pill-green" : "pill-red"}`}>
            {health === null ? "Checking" : health.ok ? "Online" : "Offline"}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 300 }}>
          Brendan + Marlowe
        </p>

        {channels.length > 0 && (
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            {channels.map(([name, ch]) => (
              <span key={name} className={`pill ${ch.running && ch.probe?.ok !== false ? "pill-green" : ch.configured ? "pill-orange" : "pill-muted"}`}>
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr className="rule" style={{ marginBottom: "var(--space-8)" }} />

      {/* 3-column grid */}
      <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-8)" }}>
        {/* Priorities */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <span className="t-label">Priorities</span>
            <Link href="/today" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              All <ChevronRight size={10} />
            </Link>
          </div>
          {priorities.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No priorities set.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {priorities.map((task, i) => (
                <div key={i} style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderLeft: "2px solid var(--accent)",
                  background: "var(--bg-elevated)",
                }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300, lineHeight: 1.5 }}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Runs */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <span className="t-label">Next Runs</span>
            <Link href="/crons" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              All <ChevronRight size={10} />
            </Link>
          </div>
          {nextCrons.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No scheduled jobs.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)" }}>
              {nextCrons.map((job) => (
                <div key={job.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)",
                }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    {job.name}
                  </span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                    {job.state.nextRunAtMs ? relTime(job.state.nextRunAtMs) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Devices */}
        <div>
          <span className="t-label" style={{ display: "block", marginBottom: "var(--space-4)" }}>Devices</span>
          {activeDevices.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No active connections.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {activeDevices.map((d, i) => (
                <div key={i} style={{ padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)", borderLeft: "2px solid var(--border)" }}>
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

      <hr className="rule" style={{ margin: "var(--space-8) 0" }} />

      {/* Agent avatars row */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <span className="t-label">The Playwrights</span>
          <Link href="/agents" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            View All <ChevronRight size={10} />
          </Link>
        </div>
        <div className="agents-avatar-row" style={{
          display: "flex",
          gap: "var(--space-2)",
          overflowX: "auto",
          paddingBottom: "var(--space-2)",
        }}>
          {AGENT_ROSTER.map((agent) => (
            <Link
              key={agent.name}
              href="/agents"
              title={`${agent.name} — ${agent.role}`}
              className="agent-avatar-circle"
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: agent.color,
                color: "#09090B",
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                fontWeight: 400,
                position: "relative",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                textDecoration: "none",
              }}
            >
              {agent.name[0]}
              <span style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#52525B",
                border: "2px solid var(--bg)",
              }} />
            </Link>
          ))}
        </div>
      </div>

      <hr className="rule" style={{ margin: "var(--space-8) 0" }} />

      {/* Quick nav */}
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
            style={{
              padding: "var(--space-4) var(--space-6)",
              border: "1px solid var(--border)", background: "var(--bg-elevated)",
              fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)",
              color: "var(--text-primary)", fontWeight: 300,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            {item.label}
            <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
