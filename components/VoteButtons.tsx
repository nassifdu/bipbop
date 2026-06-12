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

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        className={`p-1 rounded text-xs font-bold transition-colors ${voted === 1 ? "text-orange-400" : "text-gray-500 hover:text-orange-400"}`}
      >
        ▲
      </button>
      <span className={`text-xs font-bold min-w-4 text-center ${score > 0 ? "text-orange-400" : score < 0 ? "text-blue-400" : "text-gray-400"}`}>
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        className={`p-1 rounded text-xs font-bold transition-colors ${voted === -1 ? "text-blue-400" : "text-gray-500 hover:text-blue-400"}`}
      >
        ▼
      </button>
    </div>
  );
}
