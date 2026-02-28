import { writeFile } from "@/lib/filesystem";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dir = (formData.get("path") as string) || "/";

    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(dir, file.name);
    await writeFile(filePath, buffer);

    return Response.json({ ok: true, path: filePath, size: buffer.length });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
