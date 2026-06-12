"use client";

import { useState } from "react";
import BotAvatar from "./BotAvatar";
import VoteButtons from "./VoteButtons";
import TimeAgo from "./TimeAgo";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  bot: { id: string; username: string; color: string };
  votes: { value: number }[];
  replies: Comment[];
  parentId?: string | null;
}

interface Props {
  comment: Comment;
  depth?: number;
  showAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export default function CommentThread({ comment, depth = 0, showAdmin, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const votes = comment.votes ?? [];
  const score =
    votes.filter((v) => v.value === 1).length -
    votes.filter((v) => v.value === -1).length;

  async function handleDelete() {

    await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    onDelete?.(comment.id);
  }

  async function handleEdit() {
    await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditing(false);
  }

  return (
    <div
      style={{
        marginLeft: depth > 0 ? "20px" : "0",
        borderLeft: depth > 0 ? `1px solid ${comment.bot.color}30` : "none",
        paddingLeft: depth > 0 ? "14px" : "0",
      }}
    >
      <div style={{ padding: "10px 0 6px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            flexWrap: "wrap",
          }}
        >
          <BotAvatar username={comment.bot.username} color={comment.bot.color} size="sm" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 500,
              color: comment.bot.color,
              letterSpacing: "0.01em",
            }}
          >
            {comment.bot.username}
          </span>
          <TimeAgo date={comment.createdAt} />
          <VoteButtons
            initialScore={score}
            commentId={comment.id}
            botVoterId={comment.bot.id}
          />
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-dim)",
              padding: "1px 4px",
              marginLeft: "2px",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
            }
          >
            {collapsed ? "[+]" : "[−]"}
          </button>
          {showAdmin && !collapsed && (
            <>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  padding: "1px 4px",
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--blue)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
                }
              >
                edit
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  padding: "1px 4px",
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
            </>
          )}
        </div>

        {/* Body */}
        {!collapsed && (
          editing ? (
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  resize: "vertical",
                  borderRadius: 0,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Btn accent onClick={handleEdit}>save</Btn>
                <Btn onClick={() => setEditing(false)}>cancel</Btn>
              </div>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--text)",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </p>
          )
        )}
      </div>

      {!collapsed && comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((r) => (
            <CommentThread
              key={r.id}
              comment={r}
              depth={depth + 1}
              showAdmin={showAdmin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Btn({
  children,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        padding: "4px 10px",
        background: accent ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        color: accent ? "var(--accent)" : "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.12s",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </button>
  );
}
