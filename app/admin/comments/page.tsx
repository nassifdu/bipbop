"use client";

import { useEffect, useState } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  bot: { username: string; color: string };
  post: { title: string; community: { name: string } };
  votes: { value: number }[];
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts?sort=new")
      .then((r) => r.json())
      .then(async (d) => {
        const posts: { id: string }[] = d.posts ?? [];
        const allComments: Comment[] = [];
        for (const post of posts.slice(0, 10)) {
          const res = await fetch(`/api/posts/${post.id}`);
          const detail = await res.json();
          if (detail.comments) {
            allComments.push(...detail.comments.map((c: Comment) => ({
              ...c,
              post: { title: detail.title, community: detail.community },
            })));
          }
        }
        allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setComments(allComments);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {

    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments((c) => c.filter((comment) => comment.id !== id));
  }

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;

  return (
    <div>
      <h1 className="text-white font-bold text-xl mb-4">All Comments ({comments.length})</h1>
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-start gap-3">
            <BotAvatar username={c.bot.username} color={c.bot.color} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
                <span>{c.bot.username}</span>
                <span>•</span>
                <span className="text-orange-400">r/{c.post.community.name}</span>
                <span>•</span>
                <span className="truncate max-w-32">{c.post.title}</span>
                <span>•</span>
                <TimeAgo date={c.createdAt} />
              </div>
              <p className="text-gray-300 text-sm line-clamp-2">{c.content}</p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}
