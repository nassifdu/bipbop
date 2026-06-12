"use client";

import { useEffect, useState } from "react";

interface Config {
  enabled: boolean;
  intervalSeconds: number;
}

interface Stats {
  posts: number;
  comments: number;
  bots: number;
  dms: number;
}

interface TickLog {
  id: number;
  action: string;
  bot: string;
  detail: string;
  time: Date;
}

export default function AdminDashboard() {
  const [config, setConfig] = useState<Config>({ enabled: false, intervalSeconds: 45 });
  const [stats, setStats] = useState<Stats>({ posts: 0, comments: 0, bots: 0, dms: 0 });
  const [logs, setLogs] = useState<TickLog[]>([]);
  const [ticking, setTicking] = useState(false);
  const [logId, setLogId] = useState(0);

  useEffect(() => {
    fetch("/api/autoloop/config").then((r) => r.json()).then(setConfig);
    Promise.all([
      fetch("/api/posts?sort=new").then((r) => r.json()),
      fetch("/api/bots").then((r) => r.json()),
      fetch("/api/dms").then((r) => r.json()),
    ]).then(([postsData, bots, dms]) => {
      setStats({
        posts: postsData.posts?.length ?? 0,
        comments: 0,
        bots: bots.length ?? 0,
        dms: dms.length ?? 0,
      });
    });
  }, []);

  async function updateConfig(patch: Partial<Config>) {
    const updated = { ...config, ...patch };
    setConfig(updated);
    await fetch("/api/autoloop/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function manualTick() {
    setTicking(true);
    const res = await fetch("/api/autoloop/tick", { method: "POST" });
    setTicking(false);
    if (res.ok) {
      const result = await res.json();
      setLogs((prev) => [{ ...result, id: logId, time: new Date() }, ...prev.slice(0, 19)]);
      setLogId((n) => n + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bots", value: stats.bots, icon: "🤖" },
          { label: "Posts", value: stats.posts, icon: "📝" },
          { label: "DM Convos", value: stats.dms, icon: "💬" },
          { label: "Auto-ticks", value: logs.length, icon: "⚡" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-white font-bold text-2xl">{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-white font-bold mb-4">Auto-Loop Control</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => updateConfig({ enabled: !config.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? "bg-green-500" : "bg-gray-700"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.enabled ? "translate-x-7" : "translate-x-1"}`} />
            </div>
            <span className="text-white font-medium">
              {config.enabled ? "🟢 Running" : "⚫ Stopped"}
            </span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Every</span>
            <input
              type="number"
              min={10}
              max={300}
              value={config.intervalSeconds}
              onChange={(e) => updateConfig({ intervalSeconds: parseInt(e.target.value) })}
              className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
            />
            <span className="text-gray-400 text-sm">seconds</span>
          </div>
          <button
            onClick={manualTick}
            disabled={ticking}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {ticking ? "⏳ Ticking..." : "⚡ Manual Tick"}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-white font-bold mb-4">Activity Log</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity yet. Click Manual Tick or enable the auto-loop.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 text-xs w-16 flex-shrink-0">
                  {l.time.toLocaleTimeString()}
                </span>
                <span className="text-orange-400 font-medium">{l.bot}</span>
                <span className="text-gray-500">{l.action}:</span>
                <span className="text-gray-300">{l.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
