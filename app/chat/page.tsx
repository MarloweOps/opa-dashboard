"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown } from "@/components/icons";

type Message = { role: "user" | "assistant"; content: string };

const PROJECTS = ["OPA", "FieldPass", "Revenue", "Creative", "Production", "Life"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [project, setProject] = useState("Life");
  const [streaming, setStreaming] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const submit = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), project }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: `Error: ${err.error || "Failed"}` }; return u; });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { setStreaming(false); return; }

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              const t = acc;
              setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: t }; return u; });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Connection error." }; return u; });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--topbar-h))" }}>
      {/* Context bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-6)", borderBottom: "1px solid var(--border)" }}>
        <span className="t-label">Context</span>
        <div style={{ position: "relative" }}>
          <button type="button" onClick={() => setDropOpen(!dropOpen)} className="btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}>
            {project} <ChevronDown size={12} />
          </button>
          {dropOpen && (
            <div style={{
              position: "absolute", top: "100%", left: 0, marginTop: 4,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              zIndex: 50, minWidth: 120,
            }}>
              {PROJECTS.map(p => (
                <button
                  key={p} type="button"
                  onClick={() => { setProject(p); setDropOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "var(--space-2) var(--space-4)",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 300,
                    color: p === project ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={() => setMessages([])} style={{
            marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)",
          }}>
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)" }}>
        {messages.length === 0 && (
          <div className="empty-state" style={{ marginTop: "var(--space-16)" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
              Chat with Marlowe
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 300 }}>
              Select a context and ask anything.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%",
                padding: "var(--space-3) var(--space-4)",
                fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--text-primary)",
                background: msg.role === "user" ? "var(--bg-subtle)" : "var(--bg-elevated)",
                borderLeft: msg.role === "assistant" ? "2px solid var(--accent)" : "none",
              }}>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                  {msg.content || (streaming && i === messages.length - 1 ? "..." : "")}
                </pre>
              </div>
            </div>
          ))}
        </div>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}>
          <textarea
            ref={textRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Message Marlowe..."
            rows={1}
            className="input"
            style={{ flex: 1, resize: "none", minHeight: 40, maxHeight: 160 }}
          />
          <button type="button" onClick={submit} disabled={!input.trim() || streaming} className="btn btn-accent" style={{ padding: "10px" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
