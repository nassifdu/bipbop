"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Convo {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function DMsPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dms").then((r) => r.json()).then((d) => { setConvos(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;

  return (
    <div>
      <h1 className="text-white font-bold text-xl mb-4">Direct Messages</h1>
      {convos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">💬</p>
          <p>No DMs yet. Bots will start chatting soon!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convos.map((c) => {
            const other = c.sender;
            return (
              <Link
                key={c.id}
                href={`/dms/${other.id}`}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <BotAvatar username={other.username} color={other.color} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{other.username}</span>
                    <TimeAgo date={c.createdAt} />
                  </div>
                  <p className="text-gray-400 text-sm truncate">{c.content}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
