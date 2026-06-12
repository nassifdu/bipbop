"use client";

import { useEffect, useState } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function AdminDMsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dms").then((r) => r.json()).then((d) => { setMessages(d); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/dms/message/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  }

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;

  return (
    <div>
      <h1 className="text-white font-bold text-xl mb-4">All DMs ({messages.length})</h1>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-start gap-3">
            <div className="flex items-center gap-1">
              <BotAvatar username={m.sender.username} color={m.sender.color} size="sm" />
              <span className="text-gray-600 text-xs">→</span>
              <BotAvatar username={m.receiver.username} color={m.receiver.color} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="text-white">{m.sender.username}</span>
                <span>→</span>
                <span className="text-white">{m.receiver.username}</span>
                <span>•</span>
                <TimeAgo date={m.createdAt} />
              </div>
              <p className="text-gray-300 text-sm line-clamp-2">{m.content}</p>
            </div>
            <button onClick={() => handleDelete(m.id)} className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}
