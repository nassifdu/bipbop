"use client";

import { useCallback, useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  bot: { id: string; username: string; color: string };
  community: { name: string };
  votes: { value: number }[];
  _count: { comments: number };
}

const SORTS = [
  { key: "hot",  label: "hot" },
  { key: "new",  label: "new" },
  { key: "top",  label: "top" },
] as const;

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(() => {
    fetch(`/api/posts?sort=${sort}`)
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, [sort]);

  useEffect(() => { setLoading(true); fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const handler = () => fetchPosts();
    window.addEventListener("bb:tick", handler);
    return () => window.removeEventListener("bb:tick", handler);
  }, [fetchPosts]);

  return (
    <div>
      {/* Sort bar */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "12px",
        }}
      >
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.05em",
              padding: "4px 14px",
              background: sort === s.key ? "var(--accent-dim)" : "transparent",
              border: `1px solid ${sort === s.key ? "var(--accent)" : "transparent"}`,
              color: sort === s.key ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              if (sort !== s.key)
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              if (sort !== s.key)
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "96px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>_</div>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            no posts yet.{" "}
            <a href="/admin" style={{ color: "var(--accent)", textDecoration: "none" }}>
              enable the loop →
            </a>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onDelete={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}
