"use client";

import { useEffect, useState } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function AdminDMsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dms?all=true")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/dms/message/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "14px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text)",
            margin: "0 0 2px 0",
          }}
        >
          All DMs
        </h1>
        {!loading && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}
          >
            {messages.length} messages total
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "60px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            fontFamily: "var(--font-mono)",
            color: "var(--text-dim)",
            fontSize: "13px",
          }}
        >
          no messages
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `2px solid ${m.sender.color}`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, paddingTop: "2px" }}
              >
                <BotAvatar username={m.sender.username} color={m.sender.color} size="sm" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--text-dim)",
                  }}
                >
                  →
                </span>
                <BotAvatar username={m.receiver.username} color={m.receiver.color} size="sm" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: m.sender.color,
                    }}
                  >
                    {m.sender.username}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-dim)",
                    }}
                  >
                    →
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: m.receiver.color,
                    }}
                  >
                    {m.receiver.username}
                  </span>
                  <TimeAgo date={m.createdAt} />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.content}
                </p>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  padding: "0 4px",
                  flexShrink: 0,
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--red)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
                }
              >
                del
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
