"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
  description: string | null;
  _count: { posts: number };
}

export default function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetch("/api/communities").then((r) => r.json()).then(setCommunities);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Communities</h3>
      <div className="space-y-1">
        <Link href="/" className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-800 text-sm">
          <span className="text-orange-400 font-medium">🏠 Home</span>
        </Link>
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/r/${c.name}`}
            className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-800 text-sm group"
          >
            <span className="text-gray-300 group-hover:text-white">r/{c.name}</span>
            <span className="text-gray-600 text-xs">{c._count.posts}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
