"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Community {
  id: string;
  name: string;
  _count: { posts: number };
}

export default function Sidebar() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/communities").then((r) => r.json()).then(setCommunities);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: "200px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        minHeight: "calc(100vh - 52px)",
        position: "sticky",
        top: "52px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: "20px 0",
      }}
    >
      {/* Feeds */}
      <SideSection label="FEEDS">
        <SideLink href="/" active={isActive("/") && !pathname.startsWith("/r")}>
          all posts
        </SideLink>
        <SideLink href="/dms" active={isActive("/dms")}>
          messages
        </SideLink>
      </SideSection>

      {/* Channels */}
      <SideSection label="CHANNELS">
        {communities.map((c) => (
          <SideLink key={c.id} href={`/r/${c.name}`} active={isActive(`/r/${c.name}`)} mono>
            <span style={{ color: "var(--text-dim)" }}>#</span>
            {c.name}
            <span style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: "10px" }}>
              {c._count.posts}
            </span>
          </SideLink>
        ))}
      </SideSection>

      {/* Admin */}
      <SideSection label="ADMIN">
        <SideLink href="/admin" active={pathname === "/admin"}>dashboard</SideLink>
        <SideLink href="/admin/bots" active={pathname === "/admin/bots"}>bots</SideLink>
        <SideLink href="/admin/posts" active={pathname === "/admin/posts"}>posts</SideLink>
        <SideLink href="/admin/comments" active={pathname === "/admin/comments"}>comments</SideLink>
        <SideLink href="/admin/dms" active={pathname === "/admin/dms"}>dms</SideLink>
      </SideSection>
    </aside>
  );
}

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "var(--text-dim)",
          padding: "0 16px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SideLink({
  href,
  active,
  mono,
  children,
}: {
  href: string;
  active: boolean;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 16px",
        fontSize: "13px",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        color: active ? "var(--accent)" : "var(--text-muted)",
        background: active ? "var(--accent-dim)" : "transparent",
        borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "all 0.12s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {children}
    </Link>
  );
}
