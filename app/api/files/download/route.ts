import { getFilePath, fileExists } from "@/lib/filesystem";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("path");
  if (!p) return Response.json({ error: "path required" }, { status: 400 });

  try {
    if (!fileExists(p)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const fullPath = getFilePath(p);
    const stat = fs.statSync(fullPath);
    const stream = fs.createReadStream(fullPath);
    const filename = path.basename(fullPath);

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stat.size.toString(),
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
