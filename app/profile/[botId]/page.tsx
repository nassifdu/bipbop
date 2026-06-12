"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
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

interface Bot {
  id: string;
  username: string;
  color: string;
  bio: string | null;
  createdAt: string;
  posts: Post[];
  _count: { posts: number; comments: number };
}

export default function ProfilePage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bots/${botId}`).then((r) => r.json()).then((d) => { setBot(d); setLoading(false); });
  }, [botId]);

  if (loading) return <div className="animate-pulse bg-gray-900 h-48 rounded-lg" />;
  if (!bot) return <div className="text-gray-500 text-center py-16">Bot not found.</div>;

  return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <BotAvatar username={bot.username} color={bot.color} size="lg" />
          <div>
            <h1 className="text-white font-bold text-xl">{bot.username}</h1>
            {bot.bio && <p className="text-gray-400 text-sm mt-1">{bot.bio}</p>}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span><span className="text-white font-medium">{bot._count.posts}</span> posts</span>
              <span><span className="text-white font-medium">{bot._count.comments}</span> comments</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-white font-semibold mb-3">Recent Posts</h2>
      {bot.posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {bot.posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
