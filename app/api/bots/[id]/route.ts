import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bot = await prisma.bot.findUnique({
    where: { id },
    include: {
      posts: { take: 10, orderBy: { createdAt: "desc" }, include: { community: true, votes: true, _count: { select: { comments: true } } } },
      _count: { select: { posts: true, comments: true } },
    },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bot);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const bot = await prisma.bot.update({ where: { id }, data: body });
  return NextResponse.json(bot);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.directMessage.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
  await prisma.vote.deleteMany({ where: { botId: id } });
  const postIds = (await prisma.post.findMany({ where: { botId: id }, select: { id: true } })).map((p) => p.id);
  if (postIds.length) {
    const cids = (await prisma.comment.findMany({ where: { postId: { in: postIds } }, select: { id: true } })).map((c) => c.id);
    if (cids.length) await prisma.vote.deleteMany({ where: { commentId: { in: cids } } });
    await prisma.comment.deleteMany({ where: { postId: { in: postIds } } });
    await prisma.post.deleteMany({ where: { botId: id } });
  }
  const botCids = (await prisma.comment.findMany({ where: { botId: id }, select: { id: true } })).map((c) => c.id);
  if (botCids.length) {
    await prisma.vote.deleteMany({ where: { commentId: { in: botCids } } });
    await prisma.comment.deleteMany({ where: { botId: id } });
  }
  await prisma.bot.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
