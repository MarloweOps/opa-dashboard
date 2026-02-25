"use client";

import { useRef, useState, DragEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Inbox as InboxIcon } from "@/components/icons";

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
    <main className="p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Link href="/docs" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Docs</Link>
              <h1 className="text-[22px] mt-1">Marlowe Inbox</h1>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1">Drop a file. Marlowe reads it.</p>
            </div>
            <InboxIcon size={24} className="text-[var(--text-dim)]" />
          </div>
        </header>

        {status === "done" && result?.slug ? (
          <section className="card">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[var(--green)]" />
              <h2 className="text-[16px]">Delivered to Marlowe</h2>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)] mt-2">{result.title} is live in docs.</p>
            <div className="mt-3 flex items-center gap-2">
              <Link href={`/docs/${result.slug}`} className="btn btn-green">View Doc</Link>
              <button onClick={reset} className="btn">Send Another</button>
            </div>
          </section>
        ) : (
          <section className="card space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
                dragging ? "border-[var(--green)] bg-[rgba(74,222,128,0.08)]" : "border-[var(--border)] hover:border-[var(--border-hover)]",
              ].join(" ")}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {file ? (
                <>
                  <p className="text-[15px] text-[var(--text-primary)]">{file.name}</p>
                  <p className="data text-[11px] text-[var(--text-secondary)] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <p className="text-[15px] text-[var(--text-primary)]">Drop file here</p>
                  <p className="data text-[11px] text-[var(--text-secondary)] mt-1">or click to browse</p>
                </>
              )}
            </div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Note for Marlowe" className="textarea" />

            {status === "error" && result?.error && <p className="pill-red w-fit">{result.error}</p>}

            <button onClick={submit} disabled={!file || status === "uploading"} className="btn btn-green w-full disabled:opacity-40">
              {status === "uploading" ? "Uploading..." : "Send to Marlowe"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
