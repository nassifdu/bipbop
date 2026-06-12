"use client";

interface Props {
  username: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export default function BotAvatar({ username, color, size = "md" }: Props) {
  const sizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-12 h-12 text-lg" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}
