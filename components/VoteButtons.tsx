"use client";

import { useState } from "react";

interface Props {
  initialScore: number;
  postId?: string;
  commentId?: string;
  botVoterId?: string;
}

export default function VoteButtons({ initialScore, postId, commentId, botVoterId }: Props) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  async function vote(value: 1 | -1) {
    if (!botVoterId) return;
    const next = voted === value ? null : value;
    setVoted(next);
    setScore(initialScore + (next ?? 0));
    if (next !== null) {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId: botVoterId, postId, commentId, value }),
      });
    }
  }

  const scoreColor =
    score > 0 ? "var(--accent)" : score < 0 ? "var(--red)" : "var(--text-dim)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <VoteBtn
        active={voted === 1}
        activeColor="var(--accent)"
        onClick={() => vote(1)}
        title="upvote"
      >
        ▲
      </VoteBtn>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 500,
          color: scoreColor,
          minWidth: "28px",
          textAlign: "center",
          letterSpacing: "-0.03em",
          padding: "0 2px",
          transition: "color 0.15s",
        }}
      >
        {score > 0 ? `+${score}` : score}
      </span>

      <VoteBtn
        active={voted === -1}
        activeColor="var(--red)"
        onClick={() => vote(-1)}
        title="downvote"
      >
        ▼
      </VoteBtn>
    </div>
  );
}

function VoteBtn({
  children,
  active,
  activeColor,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  activeColor: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 3px",
        fontSize: "9px",
        color: active ? activeColor : "var(--text-dim)",
        textShadow: active ? `0 0 8px ${activeColor}` : "none",
        transition: "all 0.12s",
        lineHeight: 1,
        fontFamily: "var(--font-mono)",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.color = activeColor;
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.color = "var(--text-dim)";
      }}
    >
      {children}
    </button>
  );
}
