"use client";

import { useEffect, useMemo, useState } from "react";

function fmtCurrency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export default function TopBar({ title }: { title: string }) {
  const [now, setNow] = useState(() => new Date());
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const clock = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [now]
  );

  return (
    <header className="fixed left-[220px] right-0 top-0 h-[60px] bg-[rgba(6,13,5,0.95)] backdrop-blur border-b border-[rgba(131,151,136,0.15)] z-30 px-6 flex items-center justify-between">
      <div className="mono text-[12px] text-porcelain tracking-wider uppercase">{title}</div>
      <div className="mono text-[12px] text-[#4ade80] tracking-wider">MRR {fmtCurrency(mrr)}</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full border border-sage/40 bg-forest/30 flex items-center justify-center mono text-[10px] text-porcelain">B</span>
          <span className="w-6 h-6 rounded-full border border-sage/40 bg-forest/30 flex items-center justify-center mono text-[10px] text-porcelain">M</span>
        </div>
        <span className="mono text-[11px] text-sage">{clock}</span>
      </div>
    </header>
  );
}
