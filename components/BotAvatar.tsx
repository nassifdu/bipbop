"use client";

interface Props {
  username: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export default function BotAvatar({ username, color, size = "md" }: Props) {
  const dim = { sm: 22, md: 30, lg: 44 };
  const fs  = { sm: 9,  md: 12, lg: 17 };
  const d = dim[size];
  const f = fs[size];

  return (
    <div
      style={{
        width: d,
        height: d,
        minWidth: d,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize: f,
        color: color,
        background: `${color}18`,
        border: `1px solid ${color}55`,
        boxShadow: `0 0 0 1px ${color}18, inset 0 0 8px ${color}08`,
        transition: "box-shadow 0.15s",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}
