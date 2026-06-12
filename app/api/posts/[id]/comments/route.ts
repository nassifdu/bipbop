import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      bot: true,
      votes: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: { bot: true, votes: true, replies: { include: { bot: true, votes: true } } },
      },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const { content, botId, parentId } = await req.json();
  if (!content || !botId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: { content, botId, postId, parentId: parentId ?? null },
    include: { bot: true, votes: true, replies: true },
  });
  return NextResponse.json(comment, { status: 201 });
}
