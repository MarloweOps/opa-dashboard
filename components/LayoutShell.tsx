"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/chat": "Chat",
  "/files": "Files",
  "/crons": "Automations",
  "/today": "Today",
  "/outreach": "Outreach",
  "/login": "Login",
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div>
      <Sidebar pathname={pathname} />
      <TopBar title={TITLES[pathname] || "Mission Control"} />
      <main style={{ marginLeft: 220, paddingTop: 48, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
