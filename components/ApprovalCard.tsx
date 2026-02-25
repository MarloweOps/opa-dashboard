"use client";

import { useState } from "react";

type Approval = {
  id: string;
  title: string;
  description: string | null;
  risk_level: "low" | "med" | "high";
  context: string | null;
  created_at: string;
};

const RISK_STYLES = {
  low: "pill-green",
  med: "pill-amber",
  high: "pill-red",
};

export default function ApprovalCard({
  approval,
  onResolved,
}: {
  approval: Approval;
  onResolved: (id: string) => void;
}) {
  const [resolving, setResolving] = useState(false);

  const resolve = async (status: "approved" | "denied") => {
    setResolving(true);
    try {
      await fetch(`/api/approvals/${approval.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTimeout(() => onResolved(approval.id), 300);
    } catch {
      setResolving(false);
    }
  };

  return (
    <article
      className={[
        "card !p-4 approval-card",
        resolving ? "resolved" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`${RISK_STYLES[approval.risk_level]} data text-[10px] uppercase`}>{approval.risk_level}</span>
        <span className="data text-[11px] text-[var(--text-dim)]">
          {new Date(approval.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <h4 className="text-[15px] mt-3">{approval.title}</h4>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 line-clamp-2">{approval.description || "No description."}</p>

      <div className="mt-3 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2.5">
        <p className="data text-[11px] text-[var(--text-secondary)] whitespace-pre-wrap">{approval.context || "No context provided."}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={() => resolve("approved")} className="btn btn-green text-[12px] flex-1">
          Approve
        </button>
        <button type="button" onClick={() => resolve("denied")} className="btn btn-red text-[12px] flex-1">
          Deny
        </button>
      </div>

      <style jsx>{`
        .approval-card {
          transition: all 300ms ease;
        }
        .approval-card.resolved {
          opacity: 0;
          transform: translateX(20px);
        }
      `}</style>
    </article>
  );
}
