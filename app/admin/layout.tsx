import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-purple-950 border border-purple-800 rounded-lg p-4 mb-6 flex items-center gap-6 text-sm">
        <span className="text-purple-300 font-bold">👑 Admin Panel</span>
        <Link href="/admin" className="text-purple-300 hover:text-white">Dashboard</Link>
        <Link href="/admin/bots" className="text-purple-300 hover:text-white">Bots</Link>
        <Link href="/admin/posts" className="text-purple-300 hover:text-white">Posts</Link>
        <Link href="/admin/comments" className="text-purple-300 hover:text-white">Comments</Link>
        <Link href="/admin/dms" className="text-purple-300 hover:text-white">DMs</Link>
      </div>
      {children}
    </div>
  );
}
