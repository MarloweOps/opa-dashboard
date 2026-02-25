"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "@/components/icons";

type Brief = {
  id: string;
  brief_date: string;
  weather_line: string | null;
  top_pick: string | null;
  content: string;
};

export default function BriefsPage() {
  const [query, setQuery] = useState("");
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selected, setSelected] = useState<Brief | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/briefs", { cache: "no-store" });
        const json = await res.json();
        if (active) setBriefs(json.briefs || []);
      } catch {
        if (active) setBriefs([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return briefs;
    return briefs.filter((brief) => `${brief.weather_line} ${brief.top_pick} ${brief.content}`.toLowerCase().includes(q));
  }, [briefs, query]);

  return (
    <div className="p-6 space-y-4">
      <section className="card">
        <p className="section-title mb-2">Search Briefs</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by keyword"
          className="input"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((brief) => (
          <button key={brief.id} type="button" onClick={() => setSelected(brief)} className="card text-left hover:bg-[var(--bg-elevated)]">
            <p className="data text-[11px] text-[var(--text-secondary)]">
              {new Date(brief.brief_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-[14px] text-[var(--text-primary)] mt-2">{brief.weather_line || "No weather note"}</p>
            <p className="data text-[11px] text-[var(--text-secondary)] mt-2">{brief.top_pick || "PYPL · AMD · SOUN"}</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[var(--text-secondary)]">5 news items</p>
                <p className="text-[12px] text-[var(--text-secondary)]">3 priority tasks</p>
              </div>
              <span className="btn !py-1.5 !px-2.5 text-[12px]">Read full brief</span>
            </div>
          </button>
        ))}
      </section>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <article className="card max-w-3xl w-full max-h-[84vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-[18px]">Morning Brief</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="btn !py-1 !px-2 text-[12px]">Close</button>
            </div>
            <p className="data text-[12px] text-[var(--text-secondary)] mt-2">
              {new Date(selected.brief_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-[14px] text-[var(--text-primary)] mt-3">{selected.weather_line || "No weather note"}</p>
            <pre className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--text-secondary)] font-sans">
              {selected.content}
            </pre>
          </article>
        </div>
      )}
    </div>
  );
}
