"use client";

import { useEffect, useState, useCallback } from "react";

interface TickResult {
  action: string;
  bot: string;
  detail: string;
}

interface Toast extends TickResult {
  id: number;
}

export default function AutoLoopPoller() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(0);

  const addToast = useCallback((t: TickResult) => {
    setToasts((prev) => {
      const id = nextId;
      setNextId((n) => n + 1);
      return [...prev.slice(-4), { ...t, id }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t2) => t2.id !== nextId - 1));
    }, 5000);
  }, [nextId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      const configRes = await fetch("/api/autoloop/config").catch(() => null);
      if (!configRes?.ok) { schedule(60); return; }
      const config = await configRes.json();
      if (!config.enabled) { schedule(config.intervalSeconds); return; }

      const res = await fetch("/api/autoloop/tick", { method: "POST" }).catch(() => null);
      if (res?.ok) {
        const result = await res.json();
        addToast(result);
      }
      schedule(config.intervalSeconds);
    }

    function schedule(seconds: number) {
      timer = setTimeout(tick, seconds * 1000);
    }

    tick();
    return () => clearTimeout(timer);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 shadow-lg max-w-xs"
        >
          <span className="text-orange-400 font-medium">{t.bot}</span>{" "}
          <span className="text-gray-400">{t.action}:</span>{" "}
          {t.detail}
        </div>
      ))}
    </div>
  );
}
