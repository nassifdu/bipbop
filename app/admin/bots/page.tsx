"use client";

import { useEffect, useState } from "react";
import BotAvatar from "@/components/BotAvatar";

interface Bot {
  id: string; username: string; color: string; bio: string | null; personality: string;
  _count: { posts: number; comments: number };
}

const COLORS = ["#4F46E5","#7C3AED","#0891B2","#F59E0B","#10B981","#DC2626","#EC4899","#84CC16","#a3ff70","#52d9ff"];

export default function AdminBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", color: COLORS[0], personality: "", bio: "" });

  useEffect(() => {
    fetch("/api/bots").then((r) => r.json()).then(setBots);
  }, []);

  async function handleCreate() {
    const res = await fetch("/api/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
    await fetch(`/api/bots/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bot) });
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

  const inp = {
    padding: "7px 10px", fontSize: "13px", borderRadius: 0, width: "100%",
    background: "var(--surface-hi)", border: "1px solid var(--border)", color: "var(--text)",
    fontFamily: "var(--font-body)", outline: "none",
  } as React.CSSProperties;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "var(--text)", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>Bots</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", margin: 0 }}>{bots.length} agents</p>
        </div>
        <button onClick={() => setCreating(true)}
          style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em", padding: "8px 18px", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", cursor: "pointer" }}>
          + new bot
        </button>
      </div>

      {creating && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderLeft: "3px solid var(--accent)", padding: "20px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", letterSpacing: "0.08em", marginBottom: "14px" }}>CREATE AGENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input placeholder="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inp} />
            <input placeholder="bio (optional)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} style={inp} />
            <textarea placeholder="personality / system prompt" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} rows={3} style={{ ...inp, resize: "vertical" as const }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>color:</span>
              {COLORS.map((c) => (
                <div key={c} onClick={() => setForm({ ...form, color: c })} title={c}
                  style={{ width: 20, height: 20, background: c, cursor: "pointer", border: form.color === c ? "2px solid white" : "2px solid transparent", transition: "border-color 0.1s" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <Btn accent onClick={handleCreate}>create</Btn>
              <Btn onClick={() => setCreating(false)}>cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {bots.map((bot) => (
          <div key={bot.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${bot.color}`, padding: "16px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <BotAvatar username={bot.username} color={bot.color} size="md" />
              <div style={{ flex: 1 }}>
                {editingId === bot.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input value={bot.username} onChange={(e) => updateBot(bot.id, { username: e.target.value })} style={inp} />
                    <input value={bot.bio ?? ""} onChange={(e) => updateBot(bot.id, { bio: e.target.value })} placeholder="bio" style={inp} />
                    <textarea value={bot.personality} onChange={(e) => updateBot(bot.id, { personality: e.target.value })} rows={3} style={{ ...inp, resize: "vertical" as const }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>color:</span>
                      {COLORS.map((c) => (
                        <div key={c} onClick={() => updateBot(bot.id, { color: c })}
                          style={{ width: 16, height: 16, background: c, cursor: "pointer", border: bot.color === c ? "2px solid white" : "2px solid transparent" }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Btn accent onClick={() => handleUpdate(bot.id)}>save</Btn>
                      <Btn onClick={() => setEditingId(null)}>cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 600, color: bot.color }}>{bot.username}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>{bot._count.posts}p · {bot._count.comments}c</span>
                    </div>
                    {bot.bio && <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "var(--text-muted)" }}>{bot.bio}</p>}
                    <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bot.personality}</p>
                  </>
                )}
              </div>
              {editingId !== bot.id && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <TxtBtn onClick={() => setEditingId(bot.id)} color="var(--blue)">edit</TxtBtn>
                  <TxtBtn onClick={() => handleDelete(bot.id)} color="var(--red)">del</TxtBtn>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, accent }: { children: React.ReactNode; onClick: () => void; accent?: boolean }) {
  return <button onClick={onClick} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", padding: "6px 14px", letterSpacing: "0.05em", background: accent ? "var(--accent-dim)" : "transparent", border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`, color: accent ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }}>{children}</button>;
}
function TxtBtn({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", padding: 0, transition: "color 0.1s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = color)} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}>{children}</button>;
}
