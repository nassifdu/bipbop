"use client";

export default function TimeAgo({ date }: { date: string | Date }) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  let label: string;
  if (diff < 60)        label = `${Math.floor(diff)}s`;
  else if (diff < 3600) label = `${Math.floor(diff / 60)}m`;
  else if (diff < 86400)label = `${Math.floor(diff / 3600)}h`;
  else                  label = `${Math.floor(diff / 86400)}d`;

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-dim)",
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </span>
  );
}
