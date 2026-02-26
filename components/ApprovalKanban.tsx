"use client";

import { useEffect, useState } from "react";

type Approval = {
  id: string;
  title: string;
  description: string | null;
  context: string | null;
  risk_level: "low" | "med" | "high";
  category: string | null;
  status: "pending" | "approved" | "denied";
  created_at: string;
  resolved_at: string | null;
};

const RISK = {
  high: { label: "HIGH", bg: "rgba(239,68,68,0.12)", border: "#7f1d1d", text: "#f87171", leftBorder: "2px solid #ef4444" },
  med:  { label: "MED",  bg: "rgba(251,191,36,0.10)", border: "#78350f", text: "#fbbf24", leftBorder: "none" },
  low:  { label: "LOW",  bg: "rgba(74,222,128,0.10)", border: "#14532d", text: "#4ade80", leftBorder: "none" },
};

function timeAgo(ts: string) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function PendingCard({ item, onAction }: { item: Approval; onAction: (id: string, status: "approved" | "denied") => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"approved" | "denied" | null>(null);
  const r = RISK[item.risk_level];

  const act = async (status: "approved" | "denied") => {
    setLoading(status);
    try {
      await fetch(`/api/approvals/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onAction(item.id, status);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="card !p-4 flex flex-col gap-3" style={{ borderLeft: r.leftBorder }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded" style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.text }}>
          {r.label}
        </span>
        {item.category && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border)]">
            {item.category}
          </span>
        )}
        <span className="font-mono text-[10px] text-[var(--text-dim)] ml-auto">{timeAgo(item.created_at)}</span>
      </div>

      <div>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{item.title}</p>
        {item.description && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-1 line-clamp-3">{item.description}</p>
        )}
      </div>

      {item.context && (
        <div>
          <button onClick={() => setExpanded(!expanded)} className="font-mono text-[10px] text-[var(--text-dim)] hover:text-[var(--text-secondary)]">
            {expanded ? "hide context ▴" : "show context ▾"}
          </button>
          {expanded && (
            <p className="text-[11px] text-[var(--text-dim)] bg-[var(--bg-surface)] rounded p-2 mt-1 border border-[var(--border)]">
              {item.context}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => act("approved")}
          disabled={!!loading}
          className="btn flex-1 font-mono text-[11px] uppercase !bg-[rgba(74,222,128,0.15)] !text-[#4ade80] border border-[#14532d] hover:!bg-[rgba(74,222,128,0.25)] disabled:opacity-40"
        >
          {loading === "approved" ? "..." : "Approve"}
        </button>
        <button
          onClick={() => act("denied")}
          disabled={!!loading}
          className="btn flex-1 font-mono text-[11px] uppercase !bg-transparent !text-[var(--text-dim)] border border-[var(--border)] hover:!text-[var(--text-primary)] disabled:opacity-40"
        >
          {loading === "denied" ? "..." : "Deny"}
        </button>
      </div>
    </div>
  );
}

export default function ApprovalKanban() {
  const [pending, setPending] = useState<Approval[]>([]);
  const [resolved, setResolved] = useState<Approval[]>([]);

  const load = async () => {
    try {
      const res = await fetch("/api/approvals", { cache: "no-store" });
      const json = await res.json();
      const all: Approval[] = json.approvals || [];
      setPending(all.filter(a => a.status === "pending").sort((a, b) => {
        const order = { high: 0, med: 1, low: 2 };
        return order[a.risk_level] - order[b.risk_level];
      }));
      setResolved(all.filter(a => a.status !== "pending").slice(0, 5));
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const onAction = (id: string, status: "approved" | "denied") => {
    const item = pending.find(p => p.id === id);
    if (item) {
      setPending(prev => prev.filter(p => p.id !== id));
      setResolved(prev => [{ ...item, status, resolved_at: new Date().toISOString() }, ...prev].slice(0, 5));
    }
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Action Queue</h2>
        {pending.length > 0 ? (
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-[#f87171]">
            <span className="pulse-dot bg-[#ef4444]" />
            {pending.length} needs review
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--text-dim)]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]" />
            all clear
          </span>
        )}
      </div>

      <div className="flex gap-4 items-start">
        {/* Left — Pending */}
        <div className="flex-[3] flex flex-col gap-3 min-w-0">
          {pending.length === 0 ? (
            <div className="card !p-3 flex items-center justify-center gap-2 text-[var(--text-dim)] font-mono text-[12px]">
              <span>✓</span>
              <span>— all clear —</span>
            </div>
          ) : (
            pending.map(item => <PendingCard key={item.id} item={item} onAction={onAction} />)
          )}
        </div>

        {/* Right — Resolved */}
        <div className="flex-[2] min-w-0">
          <p className="font-mono text-[10px] text-[var(--text-dim)] mb-2 uppercase tracking-wider">Recently resolved</p>
          <div className="flex flex-col gap-2">
            {resolved.length === 0 ? (
              <p className="font-mono text-[11px] text-[var(--text-dim)]">— nothing yet —</p>
            ) : (
              resolved.map(item => (
                <div key={item.id} className="card !p-3 flex items-start gap-2">
                  <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${item.status === "approved" ? "bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[#14532d]" : "bg-[rgba(239,68,68,0.12)] text-[#f87171] border border-[#7f1d1d]"}`}>
                    {item.status === "approved" ? "✓" : "✕"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-[var(--text-secondary)] truncate">{item.title}</p>
                    <p className="font-mono text-[10px] text-[var(--text-dim)]">{item.resolved_at ? timeAgo(item.resolved_at) : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
