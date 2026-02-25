"use client";

import { useMemo, useState, useEffect } from "react";

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
    <div className="p-6">
      <div className="panel p-4 mb-4">
        <label className="mono text-[10px] text-sage tracking-wider block mb-2">SEARCH BRIEFS</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by keyword"
          className="w-full bg-black/20 border border-sage/20 px-3 py-2 mono text-[12px] text-porcelain focus:outline-none focus:border-sage/40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((brief) => (
          <button
            key={brief.id}
            type="button"
            onClick={() => setSelected(brief)}
            className="panel p-4 text-left hover:border-sage/40 transition"
          >
            <p className="mono text-[10px] text-sage tracking-wider">{new Date(brief.brief_date).toLocaleDateString("en-US")}</p>
            <p className="text-[12px] text-porcelain mt-2">{brief.weather_line || "No weather note"}</p>
            <p className="mono text-[10px] text-honey mt-1">TOP PICK: {brief.top_pick || "n/a"}</p>
            <p className="text-[12px] text-sage-light mt-3 line-clamp-3 leading-relaxed">{brief.content}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="panel max-w-2xl w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono text-[10px] text-sage tracking-wider">{new Date(selected.brief_date).toLocaleDateString("en-US")}</p>
                <p className="text-[12px] text-porcelain mt-1">{selected.weather_line || "No weather note"}</p>
                <p className="mono text-[10px] text-honey mt-1">TOP PICK: {selected.top_pick || "n/a"}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="mono text-[10px] text-sage hover:text-porcelain">
                CLOSE
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-[12px] leading-relaxed text-sage-light font-sans">{selected.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
