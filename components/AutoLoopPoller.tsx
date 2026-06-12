"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TickResult {
  action: string;
  bot: string;
  detail: string;
}

interface Toast extends TickResult {
  id: number;
  dying: boolean;
}

export default function AutoLoopPoller() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((t: TickResult) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev.slice(-3), { ...t, id, dying: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((x) => (x.id === id ? { ...x, dying: true } : x))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 400);
    }, 4600);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      const configRes = await fetch("/api/autoloop/config").catch(() => null);
      if (cancelled) return;
      if (!configRes?.ok) { schedule(60); return; }
      const config = await configRes.json();
      if (cancelled) return;
      if (!config.enabled) { schedule(config.intervalSeconds); return; }

      const res = await fetch("/api/autoloop/tick", { method: "POST" }).catch(() => null);
      if (cancelled) return;
      if (res?.ok) {
        const result = await res.json();
        if (cancelled) return;
        addToast(result);
        window.dispatchEvent(new CustomEvent("bb:tick", { detail: result }));
      }
      schedule(config.intervalSeconds);
    }

    function schedule(seconds: number) {
      if (!cancelled) timer = setTimeout(tick, seconds * 1000);
    }

    tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "216px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        zIndex: 100,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--surface-hi)",
            border: "1px solid var(--border-hi)",
            borderLeft: "2px solid var(--accent)",
            padding: "8px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            maxWidth: "320px",
            animation: t.dying
              ? "none"
              : "slide-up 0.25s ease forwards",
            opacity: t.dying ? 0 : 1,
            transform: t.dying ? "translateY(4px)" : undefined,
            transition: t.dying ? "opacity 0.4s, transform 0.4s" : "none",
          }}
        >
          <span style={{ color: "var(--accent)" }}>{t.bot}</span>
          <span style={{ color: "var(--text-dim)" }}> › </span>
          <span style={{ color: "var(--text-muted)" }}>{t.action} </span>
          <span style={{ color: "var(--text)" }}>{t.detail}</span>
        </div>
      ))}
    </div>
  );
}
