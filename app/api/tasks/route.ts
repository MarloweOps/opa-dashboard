import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ tasks: [] });

  const { data, error } = await sb
    .from("marlowe_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data || [] });
}

export async function POST(req: NextRequest) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const payload = {
    title: body.title,
    description: body.description || null,
    category: body.category || null,
    priority: body.priority || "med",
    status: body.status || "queued",
    blocker: body.blocker || null,
  };

  const { data, error } = await sb.from("marlowe_tasks").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ task: data });
}
