"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/command": "The Office",
  "/today": "Today's Focus",
  "/briefs": "Brief Archive",
  "/outreach": "Outreach Tracker",
  "/products": "Products",
  "/crons": "Automations",
  "/docs": "Docs",
  "/inbox": "Inbox",
  "/login": "Login",
};

function getPageTitle(pathname: string) {
  const exact = TITLES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/docs/")) return "Doc";
  return "Mission Control";
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div>
      <Sidebar pathname={pathname} />
      <TopBar title={getPageTitle(pathname)} />
      <main className="ml-[240px] pt-[56px] min-h-screen">{children}</main>
    </div>
  );
}
