import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ tasks: [] });

  const { data, error } = await sb
    .from("ops_today")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data || [] });
}

export async function POST(req: NextRequest) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  const body = await req.json();
  if (!body.task) return NextResponse.json({ error: "task is required" }, { status: 400 });

  const payload = {
    task: body.task,
    category: body.category || null,
    priority: body.priority || "backlog",
    done: body.done || false,
    sort_order: body.sort_order || 0,
  };

  const { data, error } = await sb.from("ops_today").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}
