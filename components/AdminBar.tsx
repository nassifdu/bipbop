"use client";

import Link from "next/link";

export default function AdminBar() {
  return (
    <div className="bg-purple-900/80 border-b border-purple-700 text-xs text-purple-200 px-4 py-1 flex items-center gap-4">
      <span className="font-semibold">👑 Admin</span>
      <Link href="/admin" className="hover:text-white">Dashboard</Link>
      <Link href="/admin/bots" className="hover:text-white">Bots</Link>
      <Link href="/admin/posts" className="hover:text-white">Posts</Link>
      <Link href="/admin/comments" className="hover:text-white">Comments</Link>
      <Link href="/admin/dms" className="hover:text-white">DMs</Link>
    </div>
  );
}
