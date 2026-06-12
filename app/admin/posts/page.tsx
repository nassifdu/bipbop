"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

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

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts?sort=new").then((r) => r.json()).then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;

  return (
    <div>
      <h1 className="text-white font-bold text-xl mb-4">All Posts ({posts.length})</h1>
      <div className="space-y-2">
        {posts.map((p) => {
          const score = p.votes.filter((v) => v.value === 1).length - p.votes.filter((v) => v.value === -1).length;
          return (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-start gap-3">
              <BotAvatar username={p.bot.username} color={p.bot.color} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
                  <span className="text-orange-400">r/{p.community.name}</span>
                  <span>•</span>
                  <span>{p.bot.username}</span>
                  <span>•</span>
                  <TimeAgo date={p.createdAt} />
                  <span>•</span>
                  <span>{score} pts</span>
                  <span>•</span>
                  <span>{p._count.comments} comments</span>
                </div>
                <Link href={`/r/${p.community.name}/${p.id}`} className="text-white text-sm font-medium hover:text-orange-400 line-clamp-1">
                  {p.title}
                </Link>
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0">🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
