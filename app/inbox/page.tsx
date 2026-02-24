"use client";

import { useState, useRef, DragEvent } from "react";
import Link from "next/link";

const ACCEPTED = ".xlsx,.xls,.xlsm,.ods,.csv,.txt,.md,.json";

export default function InboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ slug?: string; title?: string; error?: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    setStatus("idle");
    setResult(null);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function submit() {
    if (!file) return;
    setStatus("uploading");
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("notes", notes);

    try {
      const res = await fetch("/api/inbox", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
      setStatus("done");
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
      setStatus("error");
    }
  }

  function reset() {
    setFile(null);
    setTitle("");
    setNotes("");
    setStatus("idle");
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-ink text-porcelain p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="mono text-xs text-sage hover:text-porcelain transition-colors">
              ← DASHBOARD
            </Link>
            <h1 className="mono text-xl text-porcelain mt-2 tracking-wide">MARLOWE INBOX</h1>
            <p className="text-sage text-sm mt-1">Drop a file. Marlowe reads it.</p>
          </div>
          <Link
            href="/docs"
            className="mono text-xs border border-forest/40 text-sage px-3 py-2 hover:border-forest hover:text-porcelain transition-colors"
          >
            VIEW DOCS →
          </Link>
        </div>

        {/* Accepted formats */}
        <div className="mono text-[10px] text-sage/60 mb-6 tracking-wider">
          ACCEPTS: XLSX · XLS · CSV · ODS · TXT · MD · JSON
        </div>

        {status === "done" && result?.slug ? (
          /* Success state */
          <div className="border border-forest/60 bg-forest/10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="status-dot live" />
              <span className="mono text-sm text-porcelain tracking-wide">DELIVERED TO MARLOWE</span>
            </div>
            <p className="text-sage text-sm">
              <span className="text-porcelain">{result.title}</span> is live in the docs index.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href={`/docs/${result.slug}`}
                className="mono text-xs bg-forest text-porcelain px-4 py-2 hover:bg-forest/80 transition-colors"
              >
                VIEW DOC →
              </Link>
              <button
                onClick={reset}
                className="mono text-xs border border-forest/40 text-sage px-4 py-2 hover:border-forest hover:text-porcelain transition-colors"
              >
                SEND ANOTHER
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                border-2 border-dashed cursor-pointer p-10 text-center transition-colors
                ${dragging
                  ? "border-forest bg-forest/20"
                  : file
                  ? "border-forest/60 bg-forest/10"
                  : "border-forest/30 hover:border-forest/60"}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {file ? (
                <div className="space-y-1">
                  <p className="mono text-sm text-porcelain">{file.name}</p>
                  <p className="mono text-[10px] text-sage">
                    {(file.size / 1024).toFixed(1)} KB · click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="mono text-sm text-sage tracking-wide">DROP FILE HERE</p>
                  <p className="mono text-[10px] text-sage/50">or click to browse</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="mono text-[10px] text-sage tracking-wider block mb-2">
                TITLE <span className="opacity-50">(optional — defaults to filename)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. F45 Production Master — Feb 2026"
                className="w-full bg-ink/60 border border-forest/30 text-porcelain px-3 py-2 text-sm focus:outline-none focus:border-forest placeholder:text-sage/30 mono"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mono text-[10px] text-sage tracking-wider block mb-2">
                NOTE FOR MARLOWE <span className="opacity-50">(optional context)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. This is my actual production master. Review the tabs and tell me what to build out."
                className="w-full bg-ink/60 border border-forest/30 text-porcelain px-3 py-2 text-sm focus:outline-none focus:border-forest placeholder:text-sage/30 mono resize-none"
              />
            </div>

            {/* Error */}
            {status === "error" && result?.error && (
              <div className="border border-terracotta/40 bg-terracotta/10 px-4 py-3">
                <p className="mono text-xs text-terracotta">{result.error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!file || status === "uploading"}
              className={`
                w-full mono text-sm py-3 tracking-wider transition-colors
                ${!file || status === "uploading"
                  ? "bg-forest/20 text-sage/40 cursor-not-allowed"
                  : "bg-forest text-porcelain hover:bg-forest/80 cursor-pointer"}
              `}
            >
              {status === "uploading" ? "UPLOADING..." : "SEND TO MARLOWE"}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
