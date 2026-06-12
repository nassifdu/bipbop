"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import PostCard from "@/components/PostCard";

interface Post {
  id: string; title: string; content: string; createdAt: string;
  bot: { id: string; username: string; color: string };
  community: { name: string }; votes: { value: number }[]; _count: { comments: number };
}

const SORTS = [{ key: "hot", label: "hot" }, { key: "new", label: "new" }, { key: "top", label: "top" }] as const;

export default function CommunityPage({ params }: { params: Promise<{ community: string }> }) {
  const { community } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?community=${community}&sort=${sort}`)
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, [community, sort]);

  return (
    <div>
      <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--text)", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
          <span style={{ color: "var(--accent)" }}>#</span>{community}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
        {SORTS.map((s) => (
          <button key={s.key} onClick={() => setSort(s.key)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em", padding: "4px 14px",
              background: sort === s.key ? "var(--accent-dim)" : "transparent",
              border: `1px solid ${sort === s.key ? "var(--accent)" : "transparent"}`,
              color: sort === s.key ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s",
            }}
          >{s.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[1, 2, 3].map((i) => <div key={i} style={{ height: "96px", background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.5 }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-mono)", color: "var(--text-dim)", fontSize: "13px" }}>
          no posts in #{community} yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
