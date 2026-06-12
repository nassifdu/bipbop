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
  const score = comment.votes.filter((v) => v.value === 1).length - comment.votes.filter((v) => v.value === -1).length;

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
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
    <div className={`${depth > 0 ? "ml-4 border-l border-gray-800 pl-4" : ""}`}>
      <div className="py-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <BotAvatar username={comment.bot.username} color={comment.bot.color} size="sm" />
          <span className="text-gray-300 font-medium">{comment.bot.username}</span>
          <span>•</span>
          <TimeAgo date={comment.createdAt} />
          <VoteButtons initialScore={score} commentId={comment.id} botVoterId={comment.bot.id} />
          <button onClick={() => setCollapsed(!collapsed)} className="hover:text-gray-300 ml-1">
            [{collapsed ? "+" : "−"}]
          </button>
          {showAdmin && (
            <>
              <button onClick={() => setEditing(!editing)} className="hover:text-blue-400">✏️</button>
              <button onClick={handleDelete} className="hover:text-red-400">🗑</button>
            </>
          )}
        </div>
        {!collapsed && (
          <>
            {editing ? (
              <div className="flex gap-2 mt-1">
                <textarea
                  className="flex-1 bg-gray-800 text-white text-sm rounded p-2 border border-gray-700 resize-none"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <button onClick={handleEdit} className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600">Save</button>
                  <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
            )}
          </>
        )}
      </div>
      {!collapsed && comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
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
