import { getStatus, StatusData, RoadmapItem } from "@/lib/data";
import ApprovalKanban from "@/components/ApprovalKanban";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusPill(status: RoadmapItem["status"]) {
  if (status === "blocked") return "pill-red";
  if (status === "in_progress" || status === "shipped") return "pill-green";
  if (status === "building" || status === "specced") return "pill-amber";
  return "pill-gray";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card !p-0">
      <div className="px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="section-title">{label}</p>
      <p className={["data text-[22px] mt-1", accent ? "text-[var(--green)]" : "text-[var(--text-primary)]"].join(" ")}>{value}</p>
    </div>
  );
}

export default async function Dashboard() {
  const data: StatusData = await getStatus();
  const isStale = Date.now() - new Date(data.updatedAt).getTime() > 1000 * 60 * 60 * 25;

  return (
    <main className="p-6 space-y-5">
      <ApprovalKanban />
      <header className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="serif text-[32px] text-[var(--text-primary)]">The Varied<span style={{ color: "var(--terracotta)" }}>.</span></h1>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">Mission Control - Brendan + Marlowe</p>
          </div>
          <div className="text-right">
            <span className={isStale ? "pill-red" : "pill-green"}>{isStale ? "Stale" : "Live"}</span>
            <p className="data text-[11px] text-[var(--text-secondary)] mt-2">{fmtDate(data.updatedAt)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Revenue Pulse">
          <div className="grid grid-cols-2 gap-5">
            <Metric label="MRR" value={`$${fmt(data.mrr)}`} accent />
            <Metric label="MRR Delta (7d)" value={`${data.mrrDelta >= 0 ? "+" : "-"}$${fmt(Math.abs(data.mrrDelta))}`} />
            <Metric label="Paying Users" value={`${data.payingUsers}`} />
            <Metric label="Trials This Week" value={`${data.trialsThisWeek}`} />
            <Metric label="Conversion Rate" value={`${data.trialConversionRate}%`} />
            <Metric label="Outreach Sent" value={`${data.outreachSentThisWeek}/wk`} />
            <Metric label="Template Revenue" value={`$${fmt(data.lsRevenue)}`} />
            <Metric label="SEO Articles" value={`${data.seoArticles}`} />
          </div>
        </Section>

        <Section title="Last Heartbeat">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px]">Ran</span>
              <span className="data text-[12px] text-[var(--text-primary)]">{fmtDate(data.heartbeat.lastRun)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Score title="Risk" value={data.heartbeat.riskScore} bad />
              <Score title="Leverage" value={data.heartbeat.leverageScore} />
            </div>
            <div className="card !p-3.5 !bg-black/20">
              <p className="section-title mb-1">Urgent Threat</p>
              <p className="text-[14px] text-[var(--text-primary)]">{data.heartbeat.urgentThreat}</p>
            </div>
            <div className="card !p-3.5 !bg-black/20">
              <p className="section-title mb-1">Decisive Action</p>
              <p className="text-[14px] text-[var(--text-primary)]">{data.heartbeat.decisiveAction}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Roadmap title="iOS Roadmap" items={data.roadmap.ios} />
        <Roadmap title="Web Priorities" items={[...data.roadmap.web, ...data.roadmap.product]} />
        <Roadmap title="Revenue Streams" items={data.roadmap.revenue} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Marlowe Activity">
          <div className="space-y-3">
            {data.activeAgents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.activeAgents.map((agent) => (
                  <span key={agent} className="pill-green data text-[10px]">{agent}</span>
                ))}
              </div>
            )}

            {data.recentChanges.length === 0 && <p className="text-[14px] text-[var(--text-dim)]">No recent changes logged.</p>}

            {data.recentChanges.map((change, index) => (
              <div key={index} className="card !p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="data text-[11px] text-[var(--text-primary)]">{change.file}</p>
                  <span className={change.risk === "high" ? "pill-red" : change.risk === "med" ? "pill-amber" : "pill-gray"}>{change.risk}</span>
                </div>
                <p className="text-[13px] mt-2">{change.summary}</p>
                <p className="data text-[11px] text-[var(--text-dim)] mt-2">{fmtDateShort(change.timestamp)}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Current Focus">
          <div className="space-y-4">
            {data.notes && (
              <div>
                <p className="section-title mb-1">Marlowe Notes</p>
                <p className="text-[14px] text-[var(--text-primary)]">{data.notes}</p>
              </div>
            )}
            <div>
              <p className="section-title mb-1">Opportunity</p>
              <p className="text-[14px] text-[var(--text-primary)]">&ldquo;{data.heartbeat.valuableOpportunity}&rdquo;</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Target MRR" value="$15k" />
              <Metric label="Current" value={`$${fmt(data.mrr)}`} accent />
              <Metric label="To Go" value={`$${fmt(15000 - data.mrr)}`} />
            </div>
          </div>
        </Section>
      </div>

      <Section title="Downloads">
        <a
          href="/downloads/OPA-Production-Master-v1.4.xlsx"
          download
          className="card !p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)]"
        >
          <div>
            <p className="text-[15px] text-[var(--text-primary)]">OPA Production Master v1.4</p>
            <p className="data text-[11px] text-[var(--text-secondary)] mt-1">13-sheet operating system - .xlsx - 47 KB</p>
          </div>
          <span className="btn !py-1.5 !px-2 text-[12px]">Download</span>
        </a>
      </Section>
    </main>
  );
}

function Score({ title, value, bad }: { title: string; value: number; bad?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="section-title">{title}</p>
        <p className="data text-[15px] text-[var(--text-primary)]">{value}/10</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-black/30 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, value * 10)}%`,
            backgroundColor: bad ? "var(--red)" : "var(--green)",
          }}
        />
      </div>
    </div>
  );
}

function Roadmap({ title, items }: { title: string; items: RoadmapItem[] }) {
  return (
    <Section title={title}>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 card !p-3.5">
            <p className="text-[13px] text-[var(--text-primary)]">{item.label}</p>
            <span className={`${statusPill(item.status)} data text-[10px] uppercase`}>{item.status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
