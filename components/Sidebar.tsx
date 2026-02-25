"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  Newspaper,
  Users,
  Package,
  Timer,
  FileText,
  Inbox,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "Overview", Icon: LayoutDashboard },
  { href: "/command", label: "Command", Icon: Bot },
  { href: "/today", label: "Today", Icon: CheckSquare },
  { href: "/briefs", label: "Briefs", Icon: Newspaper },
  { href: "/outreach", label: "Outreach", Icon: Users },
  { href: "/products", label: "Products", Icon: Package },
  { href: "/crons", label: "Automations", Icon: Timer },
  { href: "/docs", label: "Docs", Icon: FileText },
  { href: "/inbox", label: "Inbox", Icon: Inbox },
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
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] z-40 flex flex-col bg-[var(--bg-base)] border-r border-[var(--border)]">
      <div className="px-6 pt-6 pb-5 border-b border-[var(--border)]">
        <div className="serif text-[26px] leading-none tracking-tight text-[var(--text-primary)]">
          THE VARIED<span className="text-[var(--terracotta)]">.</span>
        </div>
        <div className="data text-[9px] uppercase tracking-[0.18em] mt-2 text-[var(--text-dim)]">Mission Control</div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {NAV_ITEMS.slice(0, 7).map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.Icon size={16} />}
              active={active}
              badge={item.href === "/command" ? pendingApprovals : 0}
            />
          );
        })}
      </nav>

      <div className="mx-6 my-2 border-t border-[var(--border)]" />

      <nav className="px-3 py-2 space-y-1">
        {NAV_ITEMS.slice(7).map((item) => {
          const active = isActivePath(pathname, item.href);
          return <NavItem key={item.href} href={item.href} label={item.label} icon={<item.Icon size={16} />} active={active} />;
        })}
      </nav>

      <div className="mt-auto px-6 py-5 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="status-dot live pulse" />
          <span className="data text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">Online</span>
          <span className="data text-[11px] text-[var(--text-primary)] ml-auto">{clock}</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-r-xl rounded-l-md px-3 py-2.5 text-[14px] transition-colors border-l-2",
        active
          ? "bg-[var(--bg-elevated)] border-l-[var(--green)] text-[var(--text-primary)]"
          : "border-l-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
      {!!badge && <span className="pill-amber data !py-0.5 !px-2 ml-auto text-[10px]">{badge}</span>}
    </Link>
  );
}
