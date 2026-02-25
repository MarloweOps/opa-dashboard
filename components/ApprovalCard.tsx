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
  low: "text-[#4ade80] border-[#4ade80]/35 bg-[#4ade80]/10",
  med: "text-honey border-honey/35 bg-honey/10",
  high: "text-terracotta border-terracotta/35 bg-terracotta/10",
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
      setTimeout(() => onResolved(approval.id), 220);
    } catch {
      setResolving(false);
    }
  };

  return (
    <article className={`panel p-3 approval-card ${resolving ? "resolved" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] text-porcelain font-semibold leading-snug">{approval.title}</h4>
        <span className={`mono text-[9px] px-1.5 py-0.5 border rounded ${RISK_STYLES[approval.risk_level]}`}>
          {approval.risk_level.toUpperCase()}
        </span>
      </div>

      <p className="text-[12px] text-sage-light mt-2 leading-relaxed line-clamp-3">{approval.description || "No description."}</p>
      <div className="mt-2 p-2 rounded-sm border border-sage/20 bg-black/20 mono text-[10px] text-sage-light leading-relaxed">
        {approval.context || "No context."}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => resolve("approved")}
          className="mono text-[10px] px-3 py-1.5 border border-forest text-[#4ade80] bg-forest/10 hover:scale-[1.02] active:scale-[0.98] transition"
        >
          APPROVE
        </button>
        <button
          type="button"
          onClick={() => resolve("denied")}
          className="mono text-[10px] px-3 py-1.5 border border-terracotta/35 text-terracotta bg-terracotta/20 hover:scale-[1.02] active:scale-[0.98] transition"
        >
          DENY
        </button>
      </div>

      <p className="mono text-[9px] text-sage mt-2">
        {new Date(approval.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <style jsx>{`
        .approval-card {
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .approval-card.resolved {
          opacity: 0;
          transform: translateY(-6px);
        }
      `}</style>
    </article>
  );
}
