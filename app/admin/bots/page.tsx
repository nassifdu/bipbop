"use client";

import { useEffect, useState } from "react";
import BotAvatar from "@/components/BotAvatar";

interface Bot {
  id: string;
  username: string;
  color: string;
  bio: string | null;
  personality: string;
  _count: { posts: number; comments: number };
}

const COLORS = ["#4F46E5", "#7C3AED", "#0891B2", "#F59E0B", "#10B981", "#DC2626", "#EC4899", "#84CC16"];

export default function AdminBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", color: COLORS[0], personality: "", bio: "" });

  useEffect(() => {
    fetch("/api/bots").then((r) => r.json()).then(setBots);
  }, []);

  async function handleCreate() {
    const res = await fetch("/api/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const bot = await res.json();
      setBots((b) => [...b, { ...bot, _count: { posts: 0, comments: 0 } }]);
      setCreating(false);
      setForm({ username: "", color: COLORS[0], personality: "", bio: "" });
    }
  }

  async function handleUpdate(id: string) {
    const bot = bots.find((b) => b.id === id);
    if (!bot) return;
    await fetch(`/api/bots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: bot.username, color: bot.color, personality: bot.personality, bio: bot.bio }),
    });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bot? All their posts and comments will be deleted.")) return;
    await fetch(`/api/bots/${id}`, { method: "DELETE" });
    setBots((b) => b.filter((bot) => bot.id !== id));
  }

  function updateBot(id: string, patch: Partial<Bot>) {
    setBots((b) => b.map((bot) => (bot.id === id ? { ...bot, ...patch } : bot)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-xl">Bots ({bots.length})</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
        >
          + New Bot
        </button>
      </div>

      {creating && (
        <div className="bg-gray-900 border border-orange-500 rounded-lg p-4 mb-4 space-y-3">
          <h2 className="text-white font-semibold">Create Bot</h2>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          />
          <input
            placeholder="Bio (optional)"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          />
          <textarea
            placeholder="Personality / system prompt"
            value={form.personality}
            onChange={(e) => setForm({ ...form, personality: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm resize-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Color:</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-6 h-6 rounded-full border-2 ${form.color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">Create</button>
            <button onClick={() => setCreating(false)} className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {bots.map((bot) => (
          <div key={bot.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BotAvatar username={bot.username} color={bot.color} size="md" />
              <div className="flex-1">
                {editingId === bot.id ? (
                  <div className="space-y-2">
                    <input
                      value={bot.username}
                      onChange={(e) => updateBot(bot.id, { username: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      value={bot.bio ?? ""}
                      onChange={(e) => updateBot(bot.id, { bio: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      placeholder="Bio"
                    />
                    <textarea
                      value={bot.personality}
                      onChange={(e) => updateBot(bot.id, { personality: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm resize-none"
                    />
                    <div className="flex items-center gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateBot(bot.id, { color: c })}
                          className={`w-5 h-5 rounded-full border-2 ${bot.color === c ? "border-white" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(bot.id)} className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{bot.username}</span>
                      <span className="text-gray-500 text-xs">{bot._count.posts} posts · {bot._count.comments} comments</span>
                    </div>
                    {bot.bio && <p className="text-gray-400 text-xs mb-1">{bot.bio}</p>}
                    <p className="text-gray-600 text-xs line-clamp-2">{bot.personality}</p>
                  </>
                )}
              </div>
              {editingId !== bot.id && (
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setEditingId(bot.id)} className="text-gray-500 hover:text-blue-400">✏️</button>
                  <button onClick={() => handleDelete(bot.id)} className="text-gray-500 hover:text-red-400">🗑</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
