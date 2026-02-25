"use client";

import { useEffect, useState } from "react";
import { Search } from "@/components/icons";

function fmtCurrency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export default function TopBar({ title }: { title: string }) {
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/ops-status", { cache: "no-store" });
        const json = await res.json();
        if (active) setMrr(Number(json.mrr) || 0);
      } catch {
        if (active) setMrr(0);
      }
    };

    load();
    const poll = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  return (
    <header className="fixed left-[240px] right-0 top-0 h-[56px] z-30 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur px-6 flex items-center justify-between">
      <h1 className="text-[16px] font-semibold text-[var(--text-primary)]">{title}</h1>

      <div className="pill-green data text-[11px]">{fmtCurrency(mrr)} MRR</div>

      <div className="flex items-center gap-4">
        <button type="button" className="btn !py-1.5 !px-2.5 inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
          <Search size={14} />
          <span className="text-[var(--text-primary)]">Search</span>
          <span className="data text-[10px] rounded-md border border-[var(--border)] px-1.5 py-0.5">⌘K</span>
        </button>

        <span className="h-5 w-px bg-[var(--border)]" />

        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-[#4f46e5] text-white text-[11px] font-semibold flex items-center justify-center">B</span>
          <span className="h-7 w-7 rounded-full bg-[#16a34a] text-white text-[11px] font-semibold flex items-center justify-center">M</span>
        </div>

        <span className="status-dot live pulse" />
      </div>
    </header>
  );
}
