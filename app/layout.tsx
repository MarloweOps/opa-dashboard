import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "Marlowe Ops",
  description: "Founder operations dashboard",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080f07] text-porcelain antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
