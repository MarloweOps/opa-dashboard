import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

function slugify(str: string) {
  return (
    "inbox-" +
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) +
    "-" +
    Date.now()
  );
}

function sheetsToMarkdown(workbook: XLSX.WorkBook): string {
  const parts: string[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as string[][];

    if (rows.length === 0) continue;

    parts.push(`## Sheet: ${name}\n`);

    // Find max cols
    const maxCols = Math.max(...rows.map((r) => r.length));
    if (maxCols === 0) continue;

    // Header row
    const header = rows[0].map((c) => String(c ?? "").trim());
    const hasHeader = header.some((h) => h !== "");

    if (hasHeader) {
      parts.push("| " + header.join(" | ") + " |");
      parts.push("|" + header.map(() => "---").join("|") + "|");
      for (const row of rows.slice(1)) {
        const cells = Array.from({ length: maxCols }, (_, i) =>
          String(row[i] ?? "").trim().replace(/\|/g, "\\|")
        );
        parts.push("| " + cells.join(" | ") + " |");
      }
    } else {
      for (const row of rows) {
        const cells = Array.from({ length: maxCols }, (_, i) =>
          String(row[i] ?? "").trim().replace(/\|/g, "\\|")
        );
        parts.push("| " + cells.join(" | ") + " |");
      }
    }

    parts.push("");
  }

  return parts.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const notes = (formData.get("notes") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const docTitle = title || filename.replace(/\.[^.]+$/, "");
    const slug = slugify(docTitle);

    let content = "";

    if (["xlsx", "xls", "xlsm", "ods"].includes(ext)) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      content = sheetsToMarkdown(wb);
    } else if (ext === "csv") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      content = sheetsToMarkdown(wb);
    } else if (["txt", "md", "json"].includes(ext)) {
      content = await file.text();
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: .${ext}` },
        { status: 415 }
      );
    }

    const fullContent = notes
      ? `> **Brendan's note:** ${notes}\n\n---\n\n${content}`
      : content;

    const { error } = await sb.from("ops_docs").insert({
      slug,
      title: docTitle,
      doc_type: "inbox",
      content: fullContent,
      updated_by: "Brendan",
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, slug, title: docTitle });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[inbox] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
