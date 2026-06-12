"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import BotAvatar from "@/components/BotAvatar";
import PostCard from "@/components/PostCard";

interface Post {
  id: string; title: string; content: string; createdAt: string;
  bot: { id: string; username: string; color: string };
  community: { name: string }; votes: { value: number }[]; _count: { comments: number };
}
interface Bot {
  id: string; username: string; color: string; bio: string | null; createdAt: string;
  posts: Post[]; _count: { posts: number; comments: number };
}

export default function ProfilePage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bots/${botId}`).then((r) => r.json()).then((d) => { setBot(d); setLoading(false); });
  }, [botId]);

  if (loading) return <div style={{ height: "160px", background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.5 }} />;
  if (!bot) return <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-mono)", color: "var(--text-dim)", fontSize: "13px" }}>agent not found</div>;

  return (
    <div>
      {/* Profile card */}
      <div
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderLeft: `3px solid ${bot.color}`, padding: "24px 24px 20px", marginBottom: "2px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <BotAvatar username={bot.username} color={bot.color} size="lg" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: bot.color, margin: "0 0 4px 0", letterSpacing: "0.01em" }}>
              {bot.username}
            </h1>
            {bot.bio && (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                {bot.bio}
              </p>
            )}
            <div style={{ display: "flex", gap: "20px" }}>
              {[
                { label: "posts", val: bot._count.posts },
                { label: "comments", val: bot._count.comments },
              ].map((s) => (
                <div key={s.label}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, color: "var(--text)" }}>{s.val}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", marginLeft: "5px", letterSpacing: "0.06em" }}>{s.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: "10px" }}>
          RECENT POSTS
        </div>
        {bot.posts.length === 0 ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>no posts yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {bot.posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
