export interface RoadmapItem {
  label: string;
  status: "shipped" | "in_progress" | "specced" | "building" | "not_started" | "blocked";
}

export interface RecentChange {
  timestamp: string;
  file: string;
  summary: string;
  risk: "low" | "med" | "high";
}

export interface StatusData {
  updatedAt: string;
  mrr: number;
  mrrDelta: number;
  payingUsers: number;
  trialsThisWeek: number;
  trialConversionRate: number;
  gumroadRevenue: number;
  lsRevenue: number;
  seoArticles: number;
  outreachSentThisWeek: number;
  heartbeat: {
    lastRun: string;
    riskScore: number;
    leverageScore: number;
    tier1Status: "unlocked" | "frozen";
    urgentThreat: string;
    valuableOpportunity: string;
    decisiveAction: string;
  };
  roadmap: {
    ios: RoadmapItem[];
    web: RoadmapItem[];
    revenue: RoadmapItem[];
    product: RoadmapItem[];
  };
  recentChanges: RecentChange[];
  activeAgents: string[];
  notes: string;
}

const FALLBACK: StatusData = {
  updatedAt: new Date().toISOString(),
  mrr: 343,
  mrrDelta: 0,
  payingUsers: 7,
  trialsThisWeek: 0,
  trialConversionRate: 35,
  gumroadRevenue: 0,
  lsRevenue: 0,
  seoArticles: 2,
  outreachSentThisWeek: 0,
  heartbeat: {
    lastRun: "2026-02-24T02:30:00Z",
    riskScore: 2,
    leverageScore: 3,
    tier1Status: "unlocked",
    urgentThreat: "Revenue and Product Health domains are blind — no external data connections yet.",
    valuableOpportunity: "Populate memory.md, wire Stripe read-only, close guest upload funnel.",
    decisiveAction: "Send founding member email. Make Mexico call. Start iOS Block 2.",
  },
  roadmap: {
    ios: [
      { label: "Block 1 — Jobs + Envelopes (read)", status: "shipped" },
      { label: "Block 2 — Receipt Review + OCR", status: "not_started" },
      { label: "Block 3 — Empty states + share link", status: "not_started" },
      { label: "Block 5 — Scan FAB + batch mode", status: "not_started" },
      { label: "Block 7 — Team & Roles", status: "not_started" },
    ],
    web: [
      { label: "Guest upload conversion funnel", status: "specced" },
      { label: "Quick-scan button on envelope", status: "not_started" },
      { label: "Export top sheet as primary CTA", status: "not_started" },
    ],
    revenue: [
      { label: "Founding member offer", status: "specced" },
      { label: "Lemon Squeezy template pack", status: "building" },
      { label: "SEO content engine", status: "in_progress" },
      { label: "Mexico activation", status: "specced" },
      { label: "Direct outreach pipeline", status: "building" },
    ],
    product: [
      { label: "PO Book v2 architecture", status: "not_started" },
      { label: "Annual plan push", status: "not_started" },
      { label: "Stripe → Heartbeat wired", status: "not_started" },
    ],
  },
  recentChanges: [
    { timestamp: "2026-02-24T19:39:00Z", file: "SECURITY.md", summary: "Command authority framework — anti-impersonation", risk: "low" },
    { timestamp: "2026-02-24T17:40:00Z", file: "resources/brand/terminology.md", summary: "Chapman audit applied — wrap book → your wrap", risk: "low" },
    { timestamp: "2026-02-24T17:30:00Z", file: "projects/OPA-ROADMAP.md", summary: "Full revenue roadmap — 6 streams, KPI targets", risk: "low" },
  ],
  activeAgents: [],
  notes: "System bootstrap day. All infrastructure live. Awaiting: Lemon Squeezy credentials, Stripe wiring, iOS Block 2 start.",
};

export async function getStatus(): Promise<StatusData> {
  const token = process.env.GITHUB_API;
  if (!token) return FALLBACK;

  try {
    const res = await fetch(
      "https://api.github.com/repos/MarloweOps/opa-life/contents/status.json",
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return FALLBACK;

    const json = await res.json();
    const content = Buffer.from(json.content, "base64").toString("utf-8");
    return JSON.parse(content) as StatusData;
  } catch {
    return FALLBACK;
  }
}
