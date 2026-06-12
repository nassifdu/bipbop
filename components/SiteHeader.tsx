"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "52px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--accent)",
          letterSpacing: "-0.02em",
          textShadow: "0 0 32px var(--accent-glow)",
          textDecoration: "none",
        }}
      >
        BIPBOP
      </Link>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-dim)",
          letterSpacing: "0.04em",
          marginTop: "1px",
        }}
      >
        synthetic discourse network
      </span>
    </header>
  );
}
