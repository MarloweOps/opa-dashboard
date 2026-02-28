"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { FolderOpen, FolderPlus, Upload, Download, ChevronRight, FileText } from "@/components/icons";

type FileEntry = {
  name: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  extension?: string;
};

function fmtSize(b: number): string {
  if (b === 0) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function FilesPage() {
  const [path, setPath] = useState("/");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ name: string; content: string } | null>(null);
  const [mkdirOpen, setMkdirOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    try {
      const r = await fetch(`/api/files?path=${encodeURIComponent(path)}`, { cache: "no-store" });
      const d = await r.json();
      setFiles(d.entries || d.files || []);
    } catch { setFiles([]); }
    finally { setLoading(false); }
  }, [path]);

  useEffect(() => { setLoading(true); setPreview(null); loadFiles(); }, [loadFiles]);

  const navigate = (name: string) => setPath(p => p === "/" ? `/${name}` : `${p}/${name}`);
  const goUp = () => setPath(p => { const parts = p.split("/").filter(Boolean); parts.pop(); return parts.length ? "/" + parts.join("/") : "/"; });

  const crumbs = path === "/" ? ["workspace"] : ["workspace", ...path.split("/").filter(Boolean)];

  const openPreview = async (file: FileEntry) => {
    const ok = ["md", "txt", "json", "ts", "tsx", "js", "py", "sh", "yml", "yaml", "csv", "html", "css"];
    if (!file.extension || !ok.includes(file.extension)) return;
    try {
      const fp = path === "/" ? `/${file.name}` : `${path}/${file.name}`;
      const r = await fetch(`/api/files/read?path=${encodeURIComponent(fp)}`);
      const d = await r.json();
      setPreview({ name: file.name, content: d.content || "" });
    } catch {}
  };

  const download = (file: FileEntry) => {
    const fp = path === "/" ? `/${file.name}` : `${path}/${file.name}`;
    window.open(`/api/files/download?path=${encodeURIComponent(fp)}`, "_blank");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("path", path === "/" ? `/${file.name}` : `${path}/${file.name}`);
      await fetch("/api/files/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    e.target.value = "";
    loadFiles();
  };

  const handleMkdir = async () => {
    if (!folderName.trim()) return;
    const dp = path === "/" ? `/${folderName}` : `${path}/${folderName}`;
    await fetch("/api/files/mkdir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: dp }) });
    setFolderName("");
    setMkdirOpen(false);
    loadFiles();
  };

  return (
    <div style={{ padding: "var(--space-8)" }}>
      {/* Toolbar */}
      <div className="files-toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {i > 0 && <ChevronRight size={10} />}
              <button
                type="button"
                onClick={() => i === 0 ? setPath("/") : setPath("/" + crumbs.slice(1, i + 1).join("/"))}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                {c}
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button type="button" onClick={() => setMkdirOpen(!mkdirOpen)} className="btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}>
            <FolderPlus size={12} /> New folder
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-accent" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}>
            <Upload size={12} /> {uploading ? "Uploading" : "Upload"}
          </button>
          <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </div>

      {mkdirOpen && (
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
          <input className="input" style={{ flex: 1 }} placeholder="Folder name" value={folderName} onChange={e => setFolderName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleMkdir()} autoFocus />
          <button type="button" onClick={handleMkdir} className="btn btn-accent" style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}>Create</button>
          <button type="button" onClick={() => setMkdirOpen(false)} className="btn" style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}>Cancel</button>
        </div>
      )}

      <div className={preview ? "grid-files-preview" : ""} style={preview ? { display: "grid", gridTemplateColumns: "1fr 420px", gap: "var(--space-6)" } : {}}>
        {/* File list */}
        <div style={{ background: "var(--border)", display: "flex", flexDirection: "column", gap: "1px" }}>
          {loading ? (
            <div style={{ padding: "var(--space-6)", background: "var(--bg-elevated)" }}><span className="t-label">Loading</span></div>
          ) : files.length === 0 && path === "/" ? (
            <div className="empty-state" style={{ background: "var(--bg-elevated)" }}>Empty workspace</div>
          ) : (
            <>
              {path !== "/" && (
                <button type="button" onClick={goUp} style={{
                  padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)",
                  border: "none", textAlign: "left", cursor: "pointer",
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-muted)",
                }}>
                  ..
                </button>
              )}
              {files.map((f) => (
                <div key={f.name} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--bg-elevated)",
                }}>
                  <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {f.type === "directory" ? <FolderOpen size={14} /> : <FileText size={14} />}
                  </span>
                  <button
                    type="button"
                    onClick={() => f.type === "directory" ? navigate(f.name) : openPreview(f)}
                    style={{
                      flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 300,
                      color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </button>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", flexShrink: 0, display: "none" }} className="hidden md:block">
                    {fmtDate(f.modified)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", width: 60, textAlign: "right", flexShrink: 0 }}>
                    {f.type === "directory" ? "—" : fmtSize(f.size)}
                  </span>
                  {f.type === "file" && (
                    <button type="button" onClick={() => download(f)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", opacity: 0.5, flexShrink: 0 }}>
                      <Download size={12} />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-primary)" }}>{preview.name}</span>
              <button type="button" onClick={() => setPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                Close
              </button>
            </div>
            <pre style={{
              padding: "var(--space-4)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
              color: "var(--text-secondary)", whiteSpace: "pre-wrap", overflow: "auto",
              maxHeight: "calc(100vh - 200px)", lineHeight: 1.7, fontWeight: 300,
            }}>
              {preview.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
