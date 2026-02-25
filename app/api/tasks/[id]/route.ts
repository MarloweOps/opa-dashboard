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

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const key of ["status", "priority", "blocker", "description", "category", "title"]) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await sb
    .from("marlowe_tasks")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}
