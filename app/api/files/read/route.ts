import { readFile } from "@/lib/filesystem";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("path");
  if (!p) return Response.json({ error: "path required" }, { status: 400 });

  try {
    const file = await readFile(p);
    return Response.json(file);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 404 });
  }
}
