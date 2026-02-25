"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "▸ Overview" },
  { href: "/command", label: "⬡ Marlowe" },
  { href: "/today", label: "◈ Today" },
  { href: "/briefs", label: "◷ Briefs" },
  { href: "/outreach", label: "◎ Outreach" },
  { href: "/products", label: "↓ Products" },
  { href: "/crons", label: "⟳ Automations" },
  { href: "/docs", label: "≡ Docs" },
  { href: "/inbox", label: "↑ Inbox" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ pathname }: { pathname: string }) {
  const [now, setNow] = useState(() => new Date());
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/approvals", { cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        const count = (json.approvals || []).filter((item: any) => item.status === "pending").length;
        setPendingApprovals(count);
      } catch {
        if (active) setPendingApprovals(0);
      }
    };

    load();
    const poll = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  const clock = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [now]
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] border-r border-sage/15 bg-[#060d05] z-40 flex flex-col">
      <div className="px-5 pt-6 pb-4 border-b border-sage/15">
        <div className="serif text-xl text-porcelain tracking-tight leading-none">
          THE VARIED<span className="text-terracotta">.</span>
        </div>
        <div className="mono text-[9px] text-sage tracking-[0.2em] mt-2">MISSION CONTROL</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const isCommand = item.href === "/command";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "mono text-[11px] tracking-wider px-3 py-2 flex items-center justify-between transition-all border-l-2",
                active
                  ? "text-porcelain bg-forest/20 border-l-forest-light"
                  : "text-sage border-l-transparent hover:bg-forest/10 hover:text-porcelain",
              ].join(" ")}
            >
              <span>{item.label}</span>
              {isCommand && pendingApprovals > 0 && (
                <span className="mono text-[9px] px-1.5 py-0.5 rounded-sm bg-terracotta/20 text-terracotta border border-terracotta/25">
                  {pendingApprovals}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sage/15">
        <div className="flex items-center gap-2">
          <span className="status-dot live pulse" />
          <span className="mono text-[10px] text-sage tracking-wider">SYSTEM ONLINE</span>
        </div>
        <div className="mono text-[10px] text-porcelain mt-2">{clock}</div>
      </div>
    </aside>
  );
}
