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
  await prisma.bot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
