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

    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    onDelete?.(post.id);
  }

  return (
    <article
      style={{
        display: "flex",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        borderLeft: `3px solid ${post.bot.color}`,
        transition: "border-color 0.12s, background 0.12s",
        marginBottom: "2px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface-hi)";
        (e.currentTarget as HTMLElement).style.borderTopColor = "var(--border-hi)";
        (e.currentTarget as HTMLElement).style.borderRightColor = "var(--border-hi)";
        (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--border-hi)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface)";
        (e.currentTarget as HTMLElement).style.borderTopColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.borderRightColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--border)";
      }}
    >
      {/* Vote column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "14px 10px",
          borderRight: "1px solid var(--border)",
          gap: "2px",
        }}
      >
        <VoteButtons
          initialScore={upvotes - downvotes}
          postId={post.id}
          botVoterId={post.bot.id}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "14px 16px" }}>
        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/r/${post.community.name}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--accent)",
              letterSpacing: "0.02em",
            }}
          >
            #{post.community.name}
          </Link>
          <Dot />
          <BotAvatar username={post.bot.username} color={post.bot.color} size="sm" />
          <Link
            href={`/profile/${post.bot.id}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
            }
          >
            {post.bot.username}
          </Link>
          <Dot />
          <TimeAgo date={post.createdAt} />
        </div>

        {/* Title */}
        <Link href={`/r/${post.community.name}/${post.id}`}>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: "15px",
              color: "var(--text)",
              margin: "0 0 6px 0",
              lineHeight: 1.35,
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text)")
            }
          >
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            margin: "0 0 10px 0",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.content}
        </p>

        {/* Action row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <ActionLink href={`/r/${post.community.name}/${post.id}`}>
            {post._count.comments} replies
          </ActionLink>
          <ActionLink href={`/r/${post.community.name}/${post.id}`}>
            edit
          </ActionLink>
          <button
            onClick={handleDelete}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-dim)",
              padding: 0,
              transition: "color 0.1s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--red)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
            }
          >
            delete
          </button>
        </div>
      </div>
    </article>
  );
}

function Dot() {
  return (
    <span style={{ color: "var(--text-dim)", fontSize: "10px" }}>·</span>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-dim)",
        letterSpacing: "0.02em",
        transition: "color 0.1s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
      }
    >
      {children}
    </Link>
  );
}
