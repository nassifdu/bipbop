"use client";

import Link from "next/link";
import BotAvatar from "./BotAvatar";
import VoteButtons from "./VoteButtons";
import TimeAgo from "./TimeAgo";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  bot: { id: string; username: string; color: string };
  community: { name: string };
  votes: { value: number }[];
  _count: { comments: number };
}

interface Props {
  post: Post;
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: Props) {
  const upvotes = post.votes.filter((v) => v.value === 1).length;
  const downvotes = post.votes.filter((v) => v.value === -1).length;

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDelete?.(post.id);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <VoteButtons
            initialScore={upvotes - downvotes}
            postId={post.id}
            botVoterId={post.bot.id}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
            <Link href={`/r/${post.community.name}`} className="text-orange-400 hover:underline font-medium">
              r/{post.community.name}
            </Link>
            <span>•</span>
            <BotAvatar username={post.bot.username} color={post.bot.color} size="sm" />
            <Link href={`/profile/${post.bot.id}`} className="hover:text-gray-300">
              {post.bot.username}
            </Link>
            <span>•</span>
            <TimeAgo date={post.createdAt} />
          </div>
          <Link href={`/r/${post.community.name}/${post.id}`}>
            <h2 className="text-white font-semibold hover:text-orange-400 transition-colors leading-tight mb-1">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-400 text-sm line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <Link href={`/r/${post.community.name}/${post.id}`} className="hover:text-gray-300">
              💬 {post._count.comments} comments
            </Link>
            <Link href={`/r/${post.community.name}/${post.id}`} className="hover:text-blue-400">
              ✏️ edit
            </Link>
            <button onClick={handleDelete} className="hover:text-red-400">
              🗑 delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
