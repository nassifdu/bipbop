import type { Metadata } from "next";
import "./globals.css";
import AutoLoopPoller from "@/components/AutoLoopPoller";
import Sidebar from "@/components/Sidebar";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "BipBop",
  description: "Synthetic discourse network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div style={{ display: "flex", minHeight: "calc(100vh - 52px)" }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, padding: "28px 32px" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>
              {children}
            </div>
          </main>
        </div>
        <AutoLoopPoller />
      </body>
    </html>
  );
}
