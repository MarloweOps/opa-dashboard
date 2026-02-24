import { getStatus, StatusData, RoadmapItem } from "@/lib/data";
export const dynamic = 'force-dynamic';

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function StatusIndicator({ status }: { status: RoadmapItem["status"] }) {
  const map: Record<RoadmapItem["status"], { dot: string; label: string }> = {
    shipped:     { dot: "live", label: "SHIPPED" },
    in_progress: { dot: "live pulse", label: "IN PROGRESS" },
    building:    { dot: "building pulse", label: "BUILDING" },
    specced:     { dot: "building", label: "SPECCED" },
    not_started: { dot: "pending", label: "PENDING" },
    blocked:     { dot: "alert pulse", label: "BLOCKED" },
  };
  const { dot, label } = map[status];
  return (
    <span className="flex items-center gap-2">
      <span className={`status-dot ${dot}`} />
      <span className="mono text-[10px] text-sage tracking-wider">{label}</span>
    </span>
  );
}

function RiskBar({ score, label }: { score: number; label: string }) {
  const isRisk = label === "RISK";
  const color = isRisk
    ? score >= 7 ? "bg-terracotta" : score >= 4 ? "bg-honey" : "bg-forest-light"
    : score >= 7 ? "bg-[#4ade80]" : score >= 4 ? "bg-honey" : "bg-sage";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="mono text-[10px] text-sage tracking-wider">{label}</span>
        <span className="mono text-xl font-bold text-porcelain">{score}<span className="text-sage text-sm">/10</span></span>
      </div>
      <div className="h-1 bg-forest-dark rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-header">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="mono text-[10px] text-sage tracking-wider uppercase">{label}</span>
      <span className={`mono text-2xl font-bold ${accent ? "text-[#4ade80]" : "text-porcelain"}`}>
        {value}
        {sub && <span className="text-sage text-sm ml-1">{sub}</span>}
      </span>
    </div>
  );
}

export default async function Dashboard() {
  const data: StatusData = await getStatus();
  const isStale = (Date.now() - new Date(data.updatedAt).getTime()) > 1000 * 60 * 60 * 25;

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">

      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="serif text-3xl font-semibold text-porcelain tracking-tight">
            The Varied<span className="text-terracotta">.</span>
          </h1>
          <p className="mono text-[11px] text-sage tracking-widest mt-1">MARLOWE OPS · BRENDAN + MARLOWE</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className={`status-dot ${isStale ? "alert" : "live pulse"}`} />
            <span className="mono text-[10px] text-sage">{isStale ? "STALE" : "LIVE"}</span>
          </div>
          <p className="mono text-[10px] text-sage mt-1">{fmtDate(data.updatedAt)}</p>
        </div>
      </header>

      {/* Top row: Revenue + Heartbeat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Revenue Pulse */}
        <Panel title="▸ Revenue Pulse">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Stat label="MRR"
              value={`$${fmt(data.mrr)}`}
              accent
            />
            <Stat label="MRR delta (7d)"
              value={data.mrrDelta >= 0 ? `+$${fmt(data.mrrDelta)}` : `-$${fmt(Math.abs(data.mrrDelta))}`}
            />
            <Stat label="Paying users" value={data.payingUsers} />
            <Stat label="Trials this week" value={data.trialsThisWeek} />
            <Stat label="Conversion rate" value={`${data.trialConversionRate}%`} />
            <Stat label="Outreach sent" value={`${data.outreachSentThisWeek}/wk`} />
            <Stat label="Template revenue" value={`$${fmt(data.lsRevenue)}`} />
            <Stat label="SEO articles" value={data.seoArticles} sub="live" />
          </div>
        </Panel>

        {/* Heartbeat */}
        <Panel title="▸ Last Heartbeat">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="mono text-[10px] text-sage">RAN</span>
              <span className="mono text-[11px] text-porcelain">{fmtDate(data.heartbeat.lastRun)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RiskBar score={data.heartbeat.riskScore} label="RISK" />
              <RiskBar score={data.heartbeat.leverageScore} label="LEVERAGE" />
            </div>
            <div
              className={`p-3 rounded-sm border-l-2 ${data.heartbeat.riskScore >= 7
                ? "border-terracotta bg-terracotta/10"
                : "border-sage bg-forest-dark/40"}`}
            >
              <p className="mono text-[10px] text-sage mb-1">URGENT THREAT</p>
              <p className="text-[12px] text-porcelain leading-relaxed">{data.heartbeat.urgentThreat}</p>
            </div>
            <div className="p-3 rounded-sm border-l-2 border-[#4ade80] bg-forest/20">
              <p className="mono text-[10px] text-sage mb-1">DECISIVE ACTION</p>
              <p className="text-[12px] text-porcelain leading-relaxed">{data.heartbeat.decisiveAction}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="mono text-[10px] text-sage">TIER 1 WRITES</span>
              <span className={`mono text-[11px] font-bold ${data.heartbeat.tier1Status === "unlocked" ? "text-[#4ade80]" : "text-terracotta"}`}>
                {data.heartbeat.tier1Status.toUpperCase()}
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Middle row: iOS + Web + Revenue Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <Panel title="▸ iOS Roadmap">
          <div className="flex flex-col gap-3">
            {data.roadmap.ios.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3">
                <span className="text-[12px] text-sage-light leading-snug flex-1">{item.label}</span>
                <StatusIndicator status={item.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="▸ Web Priorities">
          <div className="flex flex-col gap-3">
            {data.roadmap.web.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3">
                <span className="text-[12px] text-sage-light leading-snug flex-1">{item.label}</span>
                <StatusIndicator status={item.status} />
              </div>
            ))}
            <div className="pt-2 border-t border-sage/10">
              <p className="mono text-[10px] text-sage mb-2">PRODUCT</p>
              {data.roadmap.product.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[12px] text-sage-light leading-snug flex-1">{item.label}</span>
                  <StatusIndicator status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="▸ Revenue Streams">
          <div className="flex flex-col gap-3">
            {data.roadmap.revenue.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3">
                <span className="text-[12px] text-sage-light leading-snug flex-1">{item.label}</span>
                <StatusIndicator status={item.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom row: Activity + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Marlowe Activity */}
        <Panel title="▸ Marlowe Activity">
          <div className="flex flex-col gap-3">
            {data.activeAgents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {data.activeAgents.map((a) => (
                  <span key={a} className="mono text-[10px] bg-forest/40 border border-sage/20 px-2 py-0.5 rounded text-porcelain">
                    <span className="status-dot building pulse mr-1.5" style={{ display: "inline-block", verticalAlign: "middle" }} />
                    {a}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-0">
              {data.recentChanges.length === 0 && (
                <p className="text-[12px] text-sage italic">No recent changes logged.</p>
              )}
              {data.recentChanges.map((change, i) => (
                <div key={i} className={`py-2.5 ${i < data.recentChanges.length - 1 ? "border-b border-sage/10" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="mono text-[10px] text-forest-light">{change.file}</span>
                    <div className="flex items-center gap-2">
                      <span className={`mono text-[9px] px-1.5 py-0.5 rounded ${change.risk === "high" ? "bg-terracotta/20 text-terracotta" : change.risk === "med" ? "bg-honey/20 text-honey" : "bg-forest/30 text-sage"}`}>
                        {change.risk.toUpperCase()}
                      </span>
                      <span className="mono text-[10px] text-sage">{fmtDateShort(change.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-sage-light leading-snug">{change.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Notes + Ops */}
        <Panel title="▸ Current Focus">
          <div className="flex flex-col gap-5">
            {data.notes && (
              <div>
                <p className="mono text-[10px] text-sage mb-2">MARLOWE NOTES</p>
                <p className="text-[12px] text-sage-light leading-relaxed">{data.notes}</p>
              </div>
            )}
            <div>
              <p className="mono text-[10px] text-sage mb-3">OPPORTUNITY</p>
              <p className="text-[12px] text-porcelain leading-relaxed italic">&ldquo;{data.heartbeat.valuableOpportunity}&rdquo;</p>
            </div>
            <div className="mt-auto pt-4 border-t border-sage/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="mono text-[10px] text-sage">TARGET MRR</p>
                  <p className="mono text-sm font-bold text-honey">$15k</p>
                  <p className="mono text-[9px] text-sage">6 months</p>
                </div>
                <div>
                  <p className="mono text-[10px] text-sage">CURRENT</p>
                  <p className="mono text-sm font-bold text-[#4ade80]">${fmt(data.mrr)}</p>
                  <p className="mono text-[9px] text-sage">MRR</p>
                </div>
                <div>
                  <p className="mono text-[10px] text-sage">TO GO</p>
                  <p className="mono text-sm font-bold text-porcelain">${fmt(15000 - data.mrr)}</p>
                  <p className="mono text-[9px] text-sage">gap</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

      </div>

      {/* Downloads */}
      <div className="mt-4">
        <Panel title="▸ Downloads">
          <div className="flex flex-wrap gap-4">
            <a
              href="/downloads/OPA-Production-Master-v1.0.xlsx"
              download
              className="flex items-center gap-3 px-4 py-3 bg-forest/20 border border-sage/20 rounded-sm hover:border-sage/50 hover:bg-forest/30 transition-all group"
            >
              <div className="flex flex-col">
                <span className="mono text-[11px] font-bold text-porcelain group-hover:text-[#4ade80] transition-colors">
                  OPA Production Master v1.0
                </span>
                <span className="mono text-[10px] text-sage mt-0.5">
                  16-sheet commercial production operating system · .xlsx · 48 KB
                </span>
              </div>
              <span className="mono text-[10px] text-sage/60 group-hover:text-sage transition-colors ml-2">↓</span>
            </a>
          </div>
        </Panel>
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-between">
        <p className="mono text-[10px] text-sage/50">THE VARIED · Brendan Lynch + Marlowe · ops@useopa.com</p>
        <div className="flex gap-4">
          <a href="/docs" className="mono text-[10px] text-sage/50 hover:text-sage transition-colors">docs →</a>
          <a href="/inbox" className="mono text-[10px] text-sage/50 hover:text-sage transition-colors">inbox →</a>
          <a href="/api/refresh" className="mono text-[10px] text-sage/50 hover:text-sage transition-colors">refresh</a>
        </div>
      </footer>

    </main>
  );
}
