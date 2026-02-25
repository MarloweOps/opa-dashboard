import { getSupabaseAdmin } from "@/lib/supabase";

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

export interface ApprovalItem {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  risk_level: "low" | "med" | "high";
  context: string | null;
  status: "pending" | "approved" | "denied";
  resolved_at: string | null;
  category: string | null;
}

export interface MarloweTask {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  category: string | null;
  status: "queued" | "active" | "blocked" | "done";
  priority: "high" | "med" | "low";
  blocker: string | null;
  session_id: string | null;
}

export interface ActiveAgent {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  role: string | null;
  task: string | null;
  status: "active" | "queued" | "done";
  session_id: string | null;
  started_at: string;
}

export interface BriefItem {
  id: string;
  created_at: string;
  brief_date: string;
  content: string;
  weather_line: string | null;
  top_pick: string | null;
}

export interface TodayTask {
  id: string;
  created_at: string;
  updated_at: string;
  task: string;
  priority: "priority" | "backlog" | "done";
  category: string | null;
  done: boolean;
  sort_order: number;
}

export interface OutreachContact {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  platform: string | null;
  status: "not_started" | "messaged" | "responded" | "call_booked" | "converted" | "passed";
  last_contact: string | null;
  notes: string | null;
}

const FALLBACK: StatusData = {
  updatedAt: new Date().toISOString(),
  mrr: 343,
  mrrDelta: 0,
  payingUsers: 7,
  trialsThisWeek: 0,
  trialConversionRate: 35,
  lsRevenue: 0,
  seoArticles: 2,
  outreachSentThisWeek: 0,
  heartbeat: {
    lastRun: new Date().toISOString(),
    riskScore: 2,
    leverageScore: 3,
    tier1Status: "unlocked",
    urgentThreat: "Stripe and Sentry not yet connected — revenue domain blind.",
    valuableOpportunity: "Close guest upload funnel + send founding member email.",
    decisiveAction: "Send founding member email. Make Mexico call. Start iOS Block 2.",
  },
  roadmap: { ios: [], web: [], revenue: [], product: [] },
  recentChanges: [],
  activeAgents: [],
  notes: "Loading...",
};

export async function getStatus(): Promise<StatusData> {
  const sb = getSupabaseAdmin();
  if (!sb) return FALLBACK;

  try {
    const [statusRes, roadmapRes, changesRes] = await Promise.all([
      sb.from("ops_status").select("*").eq("id", 1).single(),
      sb.from("ops_roadmap").select("*").order("sort_order"),
      sb.from("ops_changes").select("*").order("changed_at", { ascending: false }).limit(6),
    ]);

    const s = statusRes.data;
    const roadmap = roadmapRes.data || [];
    const changes = changesRes.data || [];

    if (!s) return FALLBACK;

    const byCategory = (cat: string): RoadmapItem[] =>
      roadmap
        .filter((r: any) => r.category === cat)
        .map((r: any) => ({ label: r.label, status: r.status }));

    return {
      updatedAt: s.updated_at,
      mrr: s.mrr || 0,
      mrrDelta: s.mrr_delta || 0,
      payingUsers: s.paying_users || 0,
      trialsThisWeek: s.trials_week || 0,
      trialConversionRate: s.conversion_rate || 0,
      lsRevenue: s.ls_revenue || 0,
      seoArticles: s.seo_articles || 0,
      outreachSentThisWeek: s.outreach_week || 0,
      heartbeat: {
        lastRun: s.hb_last_run || new Date().toISOString(),
        riskScore: s.hb_risk || 0,
        leverageScore: s.hb_leverage || 0,
        tier1Status: s.hb_tier1 || "unlocked",
        urgentThreat: s.hb_threat || "",
        valuableOpportunity: s.hb_opportunity || "",
        decisiveAction: s.hb_action || "",
      },
      roadmap: {
        ios: byCategory("ios"),
        web: byCategory("web"),
        revenue: byCategory("revenue"),
        product: byCategory("product"),
      },
      recentChanges: changes.map((c: any) => ({
        timestamp: c.changed_at,
        file: c.file_path,
        summary: c.summary,
        risk: c.risk_level || "low",
      })),
      activeAgents: [],
      notes: s.notes || "",
    };
  } catch {
    return FALLBACK;
  }
}

export async function getApprovals(): Promise<ApprovalItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("approval_queue").select("*").order("created_at", { ascending: false });
  return (data as ApprovalItem[]) || [];
}

export async function getTasks(): Promise<MarloweTask[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("marlowe_tasks").select("*").order("created_at", { ascending: false });
  return (data as MarloweTask[]) || [];
}

export async function getAgents(): Promise<ActiveAgent[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("active_agents").select("*").in("status", ["active", "queued"]).order("started_at", { ascending: true });
  return (data as ActiveAgent[]) || [];
}

export async function getBriefs(): Promise<BriefItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("brief_archive").select("*").order("brief_date", { ascending: false });
  return (data as BriefItem[]) || [];
}

export async function getTodayTasks(): Promise<TodayTask[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("ops_today").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  return (data as TodayTask[]) || [];
}

export async function getOutreachContacts(): Promise<OutreachContact[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("outreach_contacts").select("*").order("created_at", { ascending: false });
  return (data as OutreachContact[]) || [];
}
