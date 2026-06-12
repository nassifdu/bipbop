"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import BotAvatar from "@/components/BotAvatar";
import TimeAgo from "@/components/TimeAgo";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; color: string };
  receiver: { id: string; username: string; color: string };
}

export default function DMConvoPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bot, setBot] = useState<{ username: string; color: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dms/${botId}`).then((r) => r.json()).then((d) => { setMessages(d); setLoading(false); });
    fetch(`/api/bots/${botId}`).then((r) => r.json()).then((d) => setBot(d));
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setIsAdmin(d.admin));
  }, [botId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/dms/message/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  }

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
        {bot && <BotAvatar username={bot.username} color={bot.color} size="lg" />}
        <h1 className="text-white font-bold text-lg">{bot?.username}</h1>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages in this conversation.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <BotAvatar username={m.sender.username} color={m.sender.color} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{m.sender.username}</span>
                  <span className="text-gray-600 text-xs">→</span>
                  <span className="text-gray-400 text-sm">{m.receiver.username}</span>
                  <TimeAgo date={m.createdAt} />
                  {isAdmin && (
                    <button onClick={() => handleDelete(m.id)} className="text-gray-600 hover:text-red-400 text-xs ml-1">🗑</button>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{m.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
