"use client";

import { useState } from "react";
import { ChevronDown, Play, Send } from "@/components/icons";

type Script = {
  id: number;
  hook: string;
  body: string;
  intercut: string;
  platform: "reel" | "thread" | "x" | "linkedin";
};

const REEL_SCRIPTS: Script[] = [
  {
    id: 1, platform: "reel",
    hook: "The Origin",
    body: "If you're a production manager or a coordinator and you're still tracking your petty cash manually — what are you even doing bro. I built OPA to make your life way easier. You just dump your receipts in and they get scanned automatically. AICP line numbers, the whole thing. And then you just export a top sheet and the backups when you're done. Stop. Tracking. Petty. Cash. With. Excel. Link in bio.",
    intercut: "Receipt scan → auto-detected line items → envelope view → top sheet export",
  },
  {
    id: 2, platform: "reel",
    hook: "The Team Play",
    body: "If you're a PM or coordinator or a line producer doing wayyy too much then I have something for you. OPA tracks your petty cash so you don't have to. Share envelopes with your art team. Get real time updates. Collaborate with your team. Just export a top sheet at the end and you're done.",
    intercut: "Envelope sharing → team view → real-time updates → export",
  },
  {
    id: 3, platform: "reel",
    hook: "The Midnight Problem",
    body: "Stop tracking petty cash in Excel. I'm serious. I was a coordinator for 6 years and I finally built something that does it for you. Scan your receipts, auto-detects AICP line numbers, export a top sheet when you're done. It's called OPA. Link in bio.",
    intercut: "Quick scan demo → AICP numbers populating → clean top sheet",
  },
  {
    id: 4, platform: "reel",
    hook: "The Envelope Pain",
    body: "If you've ever sat in the production office at midnight matching receipts to envelopes — I built something for you. OPA lets your team upload receipts in real time. Share envelopes with art department. Export a clean top sheet when you wrap. You're done. Link in bio.",
    intercut: "Receipt upload → envelope filling up → top sheet one-click export",
  },
  {
    id: 5, platform: "reel",
    hook: "The Guest Link",
    body: "Here's a feature that would have saved me so many headaches. You can send a guest upload link to anyone on your crew. They snap a photo of their receipt, it goes straight into the right envelope. No signup. No app download. Just a link. That's it.",
    intercut: "Generate guest link → share via text → crew uploads → receipt lands in envelope",
  },
  {
    id: 6, platform: "reel",
    hook: "The Speed Run",
    body: "Watch me wrap an entire production's petty cash in under 60 seconds. Receipts are already scanned. Line items auto-detected. Envelopes organized by department. I just hit export and... done. Top sheet. Backups. Everything my accountant needs. This used to take me 3 hours.",
    intercut: "Full speed demo of the wrap process",
  },
  {
    id: 7, platform: "reel",
    hook: "The Horror Story",
    body: "Every coordinator has a petty cash horror story. Mine was losing a $4,000 fuel receipt between the production office and my car. Found it three weeks later in my laundry. That's why I built OPA. Your receipts live in the cloud now. Can't lose them in the wash.",
    intercut: "Sad empty envelope → receipt scan → cloud-synced envelope",
  },
  {
    id: 8, platform: "reel",
    hook: "The Comparison",
    body: "This is what tracking petty cash looked like for me in 2023. [hold up messy envelope] And this is what it looks like now. [show phone with OPA] Same receipts. Same envelopes. Just... digital. And I don't want to cry anymore.",
    intercut: "Physical envelope chaos → clean OPA interface",
  },
  {
    id: 9, platform: "reel",
    hook: "The Question",
    body: "Real question for production coordinators — how many hours do you spend on wrap paperwork at the end of a job? Because I was averaging 10-15 and I thought that was normal until I built something that cut it to under an hour.",
    intercut: "Clock graphic → speed demo of wrap process",
  },
  {
    id: 10, platform: "reel",
    hook: "The Art Department",
    body: "Art department PAs — your coordinator is going to love you. OPA lets you upload receipts from your phone while you're still at the store. No more saving crumpled receipts in your pocket for two weeks. Just snap it. Done.",
    intercut: "PA at store → snap receipt → coordinator sees it instantly",
  },
];

const THREAD_POSTS = [
  "I spent 6 years as a production manager. The job is 40% logistics, 40% problem-solving, and 20% looking for a receipt you definitely had five minutes ago.",
  "The production office hasn't changed in 20 years. We have drones, LED walls, and AI color grading — but we're still taping receipts to paper and scanning them at 11pm.",
  "Building a tool for production coordinators. Not because I think I'm a tech genius. Because I've been the person doing expense reports at midnight and I got tired of it.",
  "The worst part of being a production coordinator isn't the hours. It's knowing you saved the production $30K through careful expense management and nobody will ever know.",
  "If you've never had to explain to accounting why a gas station receipt from craft services says \"MISC MERCHANDISE\" — you haven't lived.",
  "Production coordinators are the most underpaid, overworked, critical people on any set. And most of them are tracking expenses in Google Sheets they built themselves.",
  "Every coordinator has their own spreadsheet system. Every one of them thinks theirs is the best. Every one of them is wrong. (Mine was also wrong. That's why I built something better.)",
  "The fact that \"petty cash envelope\" is still a physical thing in 2026 is wild. We shoot on cameras that cost more than houses but we're stuffing receipts in paper envelopes.",
  "I'm building a production app and I have $60K in debt and zero venture capital. The bar for \"viable startup\" is apparently lower than I thought.",
  "Something nobody tells you about building software: the hardest part isn't the code. It's explaining to your friends what you're building without their eyes glazing over.",
];

const CORE_HOOKS = [
  "Stop tracking petty cash in Excel.",
  "Nobody tells you the worst part of coordinating is the paperwork.",
  "I spent 6 years doing this manually. Then I built the fix.",
  "Your art department just lost another receipt. Again.",
  "The production office is broken. I'm trying to fix it.",
  "Every coordinator has a petty cash horror story.",
  "If you're still taping receipts to paper in 2026...",
  "The production office hasn't changed in 20 years.",
];

const FILMING_TIPS = [
  "Film in portrait (9:16). Screen recordings fit portrait too.",
  "Screen record on iPhone: swipe down → screen record.",
  "Zoom in on the key moment — scanning, line items, export.",
  "Speed up boring parts (2x). Keep satisfying parts real-time.",
  "Film in different spots: car, office, walking, on set.",
  "Same script + different location = different reel.",
  "Post 1-3/day. Nobody watches the first 50.",
  "App footage carries the reel even if on-camera is rough.",
];

type Tab = "reels" | "threads" | "hooks" | "tips";

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>("reels");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding: "24px 20px 120px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 600, color: "#EDEDEF", marginBottom: 4 }}>
        Content Hub
      </h1>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#71717A", marginBottom: 24 }}>
        Scripts, hooks, and posts ready to copy-paste
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {([
          ["reels", "Reel Scripts"],
          ["threads", "Threads / X"],
          ["hooks", "Core Hooks"],
          ["tips", "Filming Tips"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="glass-card"
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: tab === key ? "#EDEDEF" : "#71717A",
              border: tab === key ? "1px solid rgba(212,85,30,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: tab === key ? "rgba(212,85,30,0.15)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reel Scripts */}
      {tab === "reels" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {REEL_SCRIPTS.map((s) => (
            <div
              key={s.id}
              className="glass-card"
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Play size={14} style={{ color: "#D4551E" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: "#EDEDEF" }}>
                    #{s.id} — {s.hook}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    color: "#71717A",
                    transform: expanded === s.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>

              {expanded === s.id && (
                <div style={{ marginTop: 12 }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6,
                    color: "#A1A1AA", marginBottom: 12,
                  }}>
                    {s.body}
                  </p>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 11,
                    color: "#D4551E", padding: "8px 12px",
                    background: "rgba(212,85,30,0.08)", borderRadius: 8,
                    marginBottom: 12,
                  }}>
                    Intercut: {s.intercut}
                  </div>
                  <button
                    onClick={() => copy(s.body, s.id)}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      fontFamily: "'DM Mono', monospace", fontSize: 11,
                      color: copied === s.id ? "#22c55e" : "#EDEDEF",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                    }}
                  >
                    {copied === s.id ? "Copied" : "Copy Script"}
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{
            padding: 16, borderRadius: 12,
            border: "1px solid rgba(212,85,30,0.2)",
            background: "rgba(212,85,30,0.05)",
          }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#D4551E", marginBottom: 4 }}>
              FORMULA
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#A1A1AA", lineHeight: 1.5 }}>
              You talking (hook, 2-3s) → App screen recording (demo, 3-5s) → You talking (CTA, 2-3s)
            </p>
          </div>
        </div>
      )}

      {/* Threads / X */}
      {tab === "threads" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {THREAD_POSTS.map((post, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 16, borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
              }}
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6,
                color: "#A1A1AA", flex: 1,
              }}>
                {post}
              </p>
              <button
                onClick={() => copy(post, 100 + i)}
                style={{
                  padding: "4px 10px", borderRadius: 6, flexShrink: 0,
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  color: copied === 100 + i ? "#22c55e" : "#71717A",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                {copied === 100 + i ? "Done" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Core Hooks */}
      {tab === "hooks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#71717A", marginBottom: 8 }}>
            Rotate these as opening lines across all content
          </p>
          {CORE_HOOKS.map((hook, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: "12px 16px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#EDEDEF", fontWeight: 500 }}>
                {hook}
              </span>
              <button
                onClick={() => copy(hook, 200 + i)}
                style={{
                  padding: "4px 10px", borderRadius: 6,
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  color: copied === 200 + i ? "#22c55e" : "#71717A",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                {copied === 200 + i ? "Done" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filming Tips */}
      {tab === "tips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FILMING_TIPS.map((tip, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 11,
                color: "#D4551E", fontWeight: 600, minWidth: 20,
              }}>
                {i + 1}.
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#A1A1AA" }}>
                {tip}
              </span>
            </div>
          ))}

          <div style={{
            padding: 16, borderRadius: 12, marginTop: 8,
            border: "1px solid rgba(212,85,30,0.2)",
            background: "rgba(212,85,30,0.05)",
          }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#D4551E", marginBottom: 8 }}>
              MANYCHAT DM AUTOMATION
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#A1A1AA", lineHeight: 1.6 }}>
              Comment "OPA" → auto-DM useopa.com<br />
              Comment "RECEIPTS" → auto-DM chit.useopa.com<br />
              Comment "TRACKER" → auto-DM useopa.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
