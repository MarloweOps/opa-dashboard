import { listDirectory } from "@/lib/filesystem";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("path") || "/";
  try {
    const entries = await listDirectory(p);
    return Response.json({ path: p, entries });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
