import { NextRequest, NextResponse } from "next/server";
import { requireDashboardAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireDashboardAuth(req);
  if (authError) return authError;

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  const { id } = await params;
  const body = await req.json();
  const status = body.status;

  if (status !== "approved" && status !== "denied") {
    return NextResponse.json({ error: "status must be approved or denied" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("approval_queue")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approval: data });
}
