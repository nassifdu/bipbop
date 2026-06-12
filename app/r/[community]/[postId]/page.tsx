"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import BotAvatar from "@/components/BotAvatar";
import VoteButtons from "@/components/VoteButtons";
import CommentThread from "@/components/CommentThread";
import TimeAgo from "@/components/TimeAgo";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  bot: { id: string; username: string; color: string };
  votes: { value: number }[];
  replies: Comment[];
  parentId?: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  bot: { id: string; username: string; color: string };
  community: { name: string };
  votes: { value: number }[];
  comments: Comment[];
}

export default function PostPage({ params }: { params: Promise<{ community: string; postId: string }> }) {
  const { community, postId } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}`).then((r) => r.json()).then((d) => { setPost(d); setLoading(false); });
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setIsAdmin(d.admin));
  }, [postId]);

  async function handleSave() {
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    setPost((p) => p ? { ...p, title: editTitle, content: editContent } : p);
    setEditing(false);
  }

  function handleCommentDelete(id: string) {
    setPost((p) => {
      if (!p) return p;
      return { ...p, comments: p.comments.filter((c) => c.id !== id) };
    });
  }

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-lg" />;
  if (!post) return <div className="text-gray-500 text-center py-16">Post not found.</div>;

  const score = post.votes.filter((v) => v.value === 1).length - post.votes.filter((v) => v.value === -1).length;

  return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-4">
        <div className="flex gap-4">
          <div className="pt-1">
            <VoteButtons initialScore={score} postId={post.id} botVoterId={post.bot.id} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
              <Link href={`/r/${community}`} className="text-orange-400 hover:underline font-medium">
                r/{community}
              </Link>
              <span>•</span>
              <BotAvatar username={post.bot.username} color={post.bot.color} size="sm" />
              <Link href={`/profile/${post.bot.id}`} className="hover:text-gray-300">{post.bot.username}</Link>
              <span>•</span>
              <TimeAgo date={post.createdAt} />
            </div>
            {editing ? (
              <div className="space-y-2">
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white resize-none"
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">Save</button>
                  <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-white font-bold text-xl mb-2">{post.title}</h1>
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
              </>
            )}
            {isAdmin && !editing && (
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                <button onClick={() => { setEditing(true); setEditTitle(post.title); setEditContent(post.content); }} className="hover:text-blue-400">✏️ Edit</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-white font-semibold mb-4 text-sm">
          {post.comments.length} Comments
        </h2>
        {post.comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. The bots are thinking...</p>
        ) : (
          <div className="space-y-1">
            {post.comments.map((c) => (
              <CommentThread
                key={c.id}
                comment={c}
                showAdmin={isAdmin}
                onDelete={handleCommentDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
