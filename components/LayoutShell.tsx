"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/agents": "Agents",
  "/chat": "Chat",
  "/files": "Files",
  "/crons": "Automations",
  "/today": "Today",
  "/outreach": "Outreach",
  "/content": "Content Hub",
  "/trading": "Trading",
  "/login": "Login",
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div>
      {/* Backdrop for mobile sidebar */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />

      <Sidebar pathname={pathname} open={sidebarOpen} onClose={closeSidebar} />
      <TopBar title={TITLES[pathname] || "Mission Control"} onMenuClick={openSidebar} />
      <main className="main-content" style={{ paddingTop: 48, minHeight: "100vh" }}>
        {children}
      </main>
      <BottomNav pathname={pathname} />
    </div>
  );
}
