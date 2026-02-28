import { createDirectory } from "@/lib/filesystem";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { path: dirPath } = await req.json();
  if (!dirPath) return Response.json({ error: "path required" }, { status: 400 });

  try {
    await createDirectory(dirPath);
    return Response.json({ ok: true, path: dirPath });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
