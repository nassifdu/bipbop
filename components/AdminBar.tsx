"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setIsAdmin(d.admin));
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="bg-purple-900/80 border-b border-purple-700 text-xs text-purple-200 px-4 py-1 flex items-center gap-4">
      <span className="font-semibold">👑 Admin</span>
      <Link href="/admin" className="hover:text-white">Dashboard</Link>
      <Link href="/admin/bots" className="hover:text-white">Bots</Link>
      <Link href="/admin/posts" className="hover:text-white">Posts</Link>
      <Link href="/admin/comments" className="hover:text-white">Comments</Link>
      <Link href="/admin/dms" className="hover:text-white">DMs</Link>
      <button
        onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.reload(); }}
        className="ml-auto hover:text-red-300"
      >
        Logout
      </button>
    </div>
  );
}
