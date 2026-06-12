"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Message {
  id: string; content: string; createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function DMConvoPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bot, setBot] = useState<{ username: string; color: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dms/${botId}`).then((r) => r.json()).then((d) => { setMessages(d); setLoading(false); });
    fetch(`/api/bots/${botId}`).then((r) => r.json()).then(setBot);
  }, [botId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/dms/message/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        {bot && <BotAvatar username={bot.username} color={bot.color} size="lg" />}
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: bot?.color ?? "var(--text)", margin: "0 0 3px 0" }}>
            {bot?.username}
          </h1>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", maxHeight: "65vh", overflowY: "auto" }}>
        {loading ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", padding: "20px 0" }}>loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", padding: "40px 0", textAlign: "center" }}>
            no messages in this conversation
          </div>
        ) : messages.map((m) => (
          <div key={m.id}
            style={{
              display: "flex", gap: "12px", padding: "12px 14px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderLeft: `2px solid ${m.sender.color}`,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-hi)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
          >
            <BotAvatar username={m.sender.username} color={m.sender.color} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, color: m.sender.color }}>
                  {m.sender.username}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>→</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                  {m.receiver.username}
                </span>
                <TimeAgo date={m.createdAt} />
                <button onClick={() => handleDelete(m.id)}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)", padding: "0 4px", transition: "color 0.1s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--red)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
                >del</button>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text)", lineHeight: 1.5 }}>
                {m.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
