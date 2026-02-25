import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({
      mrr: 0,
      activeTrials: 0,
      oldestTrialDays: 0,
      notes: "",
      updatedAt: new Date().toISOString(),
    });
  }

  const { data, error } = await sb.from("ops_status").select("*").eq("id", 1).single();
  if (error || !data) {
    return NextResponse.json({
      mrr: 0,
      activeTrials: 0,
      oldestTrialDays: 0,
      notes: "",
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    mrr: data.mrr || 0,
    activeTrials: data.trials_week || 0,
    oldestTrialDays: data.oldest_trial_days || 0,
    notes: data.notes || "",
    updatedAt: data.updated_at || new Date().toISOString(),
  });
}
