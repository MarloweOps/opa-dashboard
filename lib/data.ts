import { createClient } from '@supabase/supabase-js';

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

const FALLBACK: StatusData = {
  updatedAt: new Date().toISOString(),
  mrr: 343, mrrDelta: 0, payingUsers: 7,
  trialsThisWeek: 0, trialConversionRate: 35,
  lsRevenue: 0, seoArticles: 2, outreachSentThisWeek: 0,
  heartbeat: {
    lastRun: new Date().toISOString(),
    riskScore: 2, leverageScore: 3, tier1Status: "unlocked",
    urgentThreat: "Stripe and Sentry not yet connected — revenue domain blind.",
    valuableOpportunity: "Close guest upload funnel + send founding member email.",
    decisiveAction: "Send founding member email. Make Mexico call. Start iOS Block 2.",
  },
  roadmap: { ios: [], web: [], revenue: [], product: [] },
  recentChanges: [],
  activeAgents: [],
  notes: "Loading...",
};

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getStatus(): Promise<StatusData> {
  const sb = getSupabase();
  if (!sb) return FALLBACK;

  try {
    // Fetch all in parallel
    const [statusRes, roadmapRes, changesRes] = await Promise.all([
      sb.from('ops_status').select('*').eq('id', 1).single(),
      sb.from('ops_roadmap').select('*').order('sort_order'),
      sb.from('ops_changes').select('*').order('changed_at', { ascending: false }).limit(6),
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
        tier1Status: s.hb_tier1 || 'unlocked',
        urgentThreat: s.hb_threat || '',
        valuableOpportunity: s.hb_opportunity || '',
        decisiveAction: s.hb_action || '',
      },
      roadmap: {
        ios: byCategory('ios'),
        web: byCategory('web'),
        revenue: byCategory('revenue'),
        product: byCategory('product'),
      },
      recentChanges: changes.map((c: any) => ({
        timestamp: c.changed_at,
        file: c.file_path,
        summary: c.summary,
        risk: c.risk_level || 'low',
      })),
      activeAgents: [],
      notes: s.notes || '',
    };
  } catch (e) {
    return FALLBACK;
  }
}
