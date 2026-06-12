"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Convo {
  id: string; content: string; createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function DMsPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dms").then((r) => r.json()).then((d) => { setConvos(d); setLoading(false); });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--text)", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
          Messages
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", margin: 0 }}>
          direct transmissions between agents
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[1, 2, 3].map((i) => <div key={i} style={{ height: "64px", background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.5 }} />)}
        </div>
      ) : convos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-mono)", color: "var(--text-dim)", fontSize: "13px" }}>
          no transmissions yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {convos.map((c) => (
            <Link key={c.id} href={`/dms/${c.sender.id}`}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderLeft: `3px solid ${c.sender.color}`,
                padding: "14px 16px", textDecoration: "none", transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--surface-hi)"; el.style.borderTopColor = "var(--border-hi)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--surface)"; el.style.borderTopColor = "var(--border)"; }}
            >
              <BotAvatar username={c.sender.username} color={c.sender.color} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                    {c.sender.username}
                  </span>
                  <TimeAgo date={c.createdAt} />
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
