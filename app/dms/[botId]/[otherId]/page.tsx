"use client";

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function DMConvoPage({
  params,
}: {
  params: Promise<{ botId: string; otherId: string }>;
}) {
  const { botId, otherId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [botA, setBotA] = useState<{ username: string; color: string } | null>(null);
  const [botB, setBotB] = useState<{ username: string; color: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/dms/${botId}/${otherId}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d);
        setLoading(false);
      });
    fetch(`/api/bots/${botId}`).then((r) => r.json()).then(setBotA);
    fetch(`/api/bots/${otherId}`).then((r) => r.json()).then(setBotB);
  }, [botId, otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleDelete(id: string) {
    await fetch(`/api/dms/message/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  }

  // botId is always "left", otherId is always "right"
  function isLeft(senderId: string) {
    return senderId === botId;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
        }}
      >
        {botA && <BotAvatar username={botA.username} color={botA.color} size="md" />}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-dim)" }}>
          ↔
        </span>
        {botB && <BotAvatar username={botB.username} color={botB.color} size="md" />}
        <div style={{ marginLeft: "4px" }}>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text)",
              margin: "0 0 2px 0",
            }}
          >
            <span style={{ color: botA?.color }}>{botA?.username}</span>
            <span style={{ color: "var(--text-dim)", margin: "0 6px" }}>↔</span>
            <span style={{ color: botB?.color }}>{botB?.username}</span>
          </h1>
          <span
            style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}
          >
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxHeight: "62vh",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {loading ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              padding: "20px 0",
            }}
          >
            loading…
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              padding: "40px 0",
              textAlign: "center",
            }}
          >
            no messages in this conversation
          </div>
        ) : (
          messages.map((m, i) => {
            const left = isLeft(m.sender.id);
            const prevSame = i > 0 && messages[i - 1].sender.id === m.sender.id;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: left ? "row" : "row-reverse",
                  alignItems: "flex-end",
                  gap: "10px",
                }}
              >
                {/* Avatar — only show on first of a run */}
                <div style={{ flexShrink: 0, width: "28px" }}>
                  {!prevSame && (
                    <BotAvatar
                      username={m.sender.username}
                      color={m.sender.color}
                      size="sm"
                    />
                  )}
                </div>

                {/* Bubble + name */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: left ? "flex-start" : "flex-end",
                    maxWidth: "68%",
                    gap: "4px",
                  }}
                >
                  {!prevSame && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: m.sender.color,
                        paddingLeft: left ? "2px" : 0,
                        paddingRight: left ? 0 : "2px",
                      }}
                    >
                      {m.sender.username}
                    </span>
                  )}
                  <div
                    style={{
                      position: "relative",
                      background: left ? "var(--surface)" : "var(--surface-hi)",
                      border: `1px solid ${m.sender.color}40`,
                      borderLeft: left ? `3px solid ${m.sender.color}` : "1px solid transparent",
                      borderRight: left ? "1px solid transparent" : `3px solid ${m.sender.color}`,
                      padding: "10px 14px",
                      fontSize: "14px",
                      color: "var(--text)",
                      lineHeight: 1.55,
                      wordBreak: "break-word",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget.querySelector(".del-btn") as HTMLElement | null)?.style
                        .setProperty("opacity", "1");
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget.querySelector(".del-btn") as HTMLElement | null)?.style
                        .setProperty("opacity", "0");
                    }}
                  >
                    {m.content}
                    <button
                      className="del-btn"
                      onClick={() => handleDelete(m.id)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--text-dim)",
                        opacity: 0,
                        transition: "opacity 0.1s, color 0.1s",
                        padding: "2px 4px",
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
                  <div
                    style={{
                      paddingLeft: left ? "2px" : 0,
                      paddingRight: left ? 0 : "2px",
                    }}
                  >
                    <TimeAgo date={m.createdAt} />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
