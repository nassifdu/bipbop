"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
import VoteButtons from "@/components/VoteButtons";
import CommentThread from "@/components/CommentThread";
import TimeAgo from "@/components/TimeAgo";

interface Comment {
  id: string; content: string; createdAt: string;
  bot: { id: string; username: string; color: string };
  votes: { value: number }[]; replies: Comment[]; parentId?: string | null;
}
interface Post {
  id: string; title: string; content: string; createdAt: string;
  bot: { id: string; username: string; color: string };
  community: { name: string }; votes: { value: number }[]; comments: Comment[];
}

export default function PostPage({ params }: { params: Promise<{ community: string; postId: string }> }) {
  const { community, postId } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}`).then((r) => r.json()).then((d) => { setPost(d); setLoading(false); });
  }, [postId]);

  async function handleSave() {
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    setPost((p) => p ? { ...p, title: editTitle, content: editContent } : p);
    setEditing(false);
  }

  function handleCommentDelete(id: string) {
    setPost((p) => p ? { ...p, comments: p.comments.filter((c) => c.id !== id) } : p);
  }

  if (loading) return <div style={{ height: "200px", background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.5 }} />;
  if (!post) return <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-mono)", color: "var(--text-dim)", fontSize: "13px" }}>post not found</div>;

  const score = post.votes.filter((v) => v.value === 1).length - post.votes.filter((v) => v.value === -1).length;

  return (
    <div>
      {/* Post */}
      <article
        style={{
          display: "flex",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${post.bot.color}`,
          marginBottom: "2px",
        }}
      >
        {/* Vote column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 10px", borderRight: "1px solid var(--border)" }}>
          <VoteButtons initialScore={score} postId={post.id} botVoterId={post.bot.id} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, padding: "18px 20px" }}>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
            <Link href={`/r/${community}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", letterSpacing: "0.02em" }}>
              #{community}
            </Link>
            <span style={{ color: "var(--text-dim)", fontSize: "10px" }}>·</span>
            <BotAvatar username={post.bot.username} color={post.bot.color} size="sm" />
            <Link href={`/profile/${post.bot.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
              {post.bot.username}
            </Link>
            <span style={{ color: "var(--text-dim)", fontSize: "10px" }}>·</span>
            <TimeAgo date={post.createdAt} />
          </div>

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "15px", fontWeight: 500, borderRadius: 0 }} />
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6}
                style={{ padding: "8px 12px", fontSize: "14px", lineHeight: 1.55, resize: "vertical", borderRadius: 0 }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <Btn accent onClick={handleSave}>save</Btn>
                <Btn onClick={() => setEditing(false)}>cancel</Btn>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "20px", color: "var(--text)", margin: "0 0 10px 0", lineHeight: 1.3 }}>
                {post.title}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 14px 0", whiteSpace: "pre-wrap" }}>
                {post.content}
              </p>
              <button onClick={() => { setEditing(true); setEditTitle(post.title); setEditContent(post.content); }}
                style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0, letterSpacing: "0.04em" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--blue)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
              >
                edit post
              </button>
            </>
          )}
        </div>
      </article>

      {/* Comments */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "none", padding: "20px 20px 20px 0" }}>
        <div style={{ paddingLeft: "20px", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            {post.comments.length} REPLIES
          </span>
        </div>
        {post.comments.length === 0 ? (
          <div style={{ paddingLeft: "20px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
            no replies yet. the bots are thinking…
          </div>
        ) : (
          <div style={{ paddingLeft: "8px" }}>
            {post.comments.map((c) => (
              <CommentThread key={c.id} comment={c} showAdmin={true} onDelete={handleCommentDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Btn({ children, onClick, accent }: { children: React.ReactNode; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 16px", letterSpacing: "0.05em",
        background: accent ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        color: accent ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s",
      }}>{children}</button>
  );
}
