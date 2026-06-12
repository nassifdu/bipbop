"use client";

import { useEffect, useState } from "react";
import { use } from "react";
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

const SORTS = ["hot", "new", "top"] as const;

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
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
        <h1 className="text-white font-bold text-lg">r/{community}</h1>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${sort === s ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >
            {s === "hot" ? "🔥" : s === "new" ? "✨" : "⭐"} {s}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-24 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No posts in r/{community} yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
