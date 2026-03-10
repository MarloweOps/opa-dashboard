"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Timer,
  CheckSquare,
  TrendingUp,
} from "@/components/icons";

const TABS = [
  { href: "/", label: "Home", Icon: LayoutDashboard },
  { href: "/agents", label: "Agents", Icon: Bot },
  { href: "/chat", label: "Chat", Icon: MessageSquare },
  { href: "/crons", label: "Auto", Icon: Timer },
  { href: "/today", label: "Today", Icon: CheckSquare },
  { href: "/trading", label: "Trade", Icon: TrendingUp },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item${active ? " active" : ""}`}
          >
            <tab.Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
