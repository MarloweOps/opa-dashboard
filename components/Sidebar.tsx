"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  CheckSquare,
  Users,
  Timer,
  Bot,
  X,
} from "@/components/icons";

const NAV = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/agents", label: "Agents", Icon: Bot },
  { href: "/chat", label: "Chat", Icon: MessageSquare },
  { href: "/files", label: "Files", Icon: FolderOpen },
  { href: "/crons", label: "Automations", Icon: Timer },
  { href: "/today", label: "Today", Icon: CheckSquare },
  { href: "/outreach", label: "Outreach", Icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  pathname: string;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ pathname, open, onClose }: SidebarProps) {
  const [now, setNow] = useState(() => new Date());
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const clock = useMemo(() =>
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now]
  );

  return (
    <aside
      className={`sidebar${open ? " open" : ""}`}
      style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 220, zIndex: 40,
        display: "flex", flexDirection: "column",
        background: "rgba(9, 9, 11, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Wordmark + close button on mobile */}
      <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 22, letterSpacing: "-0.03em",
            color: "#EDEDEF", lineHeight: 1,
          }}>
            The Varied
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase" as const,
            color: "#71717A", marginTop: 8,
          }}>
            Mission Control
          </div>
        </div>
        <button
          className="hamburger-btn"
          onClick={onClose}
          aria-label="Close sidebar"
          style={{ marginRight: 0 }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ height: 1, background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Nav */}
      <nav style={{ padding: "12px 0", flex: 1 }}>
        {NAV.map((item) => {
          const act = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 24px",
                fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 300,
                color: act ? "#EDEDEF" : "#71717A",
                borderLeft: act ? "2px solid #D4551E" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              <item.Icon size={15} strokeWidth={act ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Status */}
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: online ? "#D4551E" : "#52525B",
          boxShadow: online ? "0 0 6px rgba(212,85,30,0.5)" : "none",
        }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#52525B", letterSpacing: "0.04em" }}>
          {online ? "Online" : "Offline"}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#71717A", marginLeft: "auto" }}>
          {clock}
        </span>
      </div>
    </aside>
  );
}
