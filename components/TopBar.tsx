"use client";

import { useEffect, useState } from "react";
import { Menu } from "@/components/icons";

type TopBarProps = {
  title: string;
  onMenuClick: () => void;
};

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const r = await fetch("/api/gateway/health", { cache: "no-store" });
        const d = await r.json();
        if (active) setOnline(d.ok === true || !!d.uptime);
      } catch {
        if (active) setOnline(false);
      }
    };
    check();
    const poll = setInterval(check, 15000);
    return () => { active = false; clearInterval(poll); };
  }, []);

  return (
    <header className="topbar" style={{
      position: "fixed", right: 0, top: 0, height: 48, zIndex: 30,
      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      background: "rgba(9, 9, 11, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 13,
          fontWeight: 600, letterSpacing: "-0.01em", color: "#EDEDEF",
        }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 10px", fontSize: 11, borderRadius: 20,
          fontFamily: "'DM Mono', monospace", fontWeight: 400,
          letterSpacing: "0.04em",
          color: online ? "#D4551E" : "#C43030",
          border: `1px solid ${online ? "rgba(212,85,30,0.25)" : "rgba(196,48,48,0.25)"}`,
          background: online ? "rgba(212,85,30,0.08)" : "rgba(196,48,48,0.08)",
        }}>
          {online ? "Gateway" : "Offline"}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "#D4551E", color: "#09090B", fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
          }}>B</span>
          <span style={{
            width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "#A1A1AA", color: "#09090B", fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
          }}>M</span>
        </div>
      </div>
    </header>
  );
}
