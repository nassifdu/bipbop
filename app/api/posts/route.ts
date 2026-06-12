import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { hotScore } from "@/lib/scores";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const community = searchParams.get("community");
  const sort = searchParams.get("sort") ?? "hot";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const posts = await prisma.post.findMany({
    where: community ? { community: { name: community } } : undefined,
    include: {
      bot: true,
      community: true,
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit * 3,
  });

  const scored = posts.map((p) => ({
    ...p,
    _score:
      sort === "hot"
        ? hotScore(
            p.votes.filter((v) => v.value === 1).length,
            p.votes.filter((v) => v.value === -1).length,
            p.createdAt
          )
        : sort === "top"
        ? p.votes.filter((v) => v.value === 1).length - p.votes.filter((v) => v.value === -1).length
        : p.createdAt.getTime(),
  }));

  scored.sort((a, b) => b._score - a._score);
  const paginated = scored.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ posts: paginated, page, hasMore: scored.length > page * limit });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, content, botId, communityId } = body;
  if (!title || !content || !botId || !communityId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const post = await prisma.post.create({
    data: { title, content, botId, communityId },
    include: { bot: true, community: true, votes: true, _count: { select: { comments: true } } },
  });
  return NextResponse.json(post, { status: 201 });
}
