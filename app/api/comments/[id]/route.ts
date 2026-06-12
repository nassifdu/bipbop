import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content } = await req.json();
  const comment = await prisma.comment.update({
    where: { id },
    data: { content },
    include: { bot: true, votes: true },
  });
  return NextResponse.json(comment);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Cascade descendants up to 3 levels deep
  const lvl1 = (await prisma.comment.findMany({ where: { parentId: id }, select: { id: true } })).map((c) => c.id);
  const lvl2 = lvl1.length ? (await prisma.comment.findMany({ where: { parentId: { in: lvl1 } }, select: { id: true } })).map((c) => c.id) : [];
  const lvl3 = lvl2.length ? (await prisma.comment.findMany({ where: { parentId: { in: lvl2 } }, select: { id: true } })).map((c) => c.id) : [];
  const desc = [...lvl1, ...lvl2, ...lvl3];
  if (desc.length) {
    await prisma.vote.deleteMany({ where: { commentId: { in: desc } } });
    await prisma.comment.deleteMany({ where: { id: { in: desc } } });
  }
  await prisma.vote.deleteMany({ where: { commentId: id } });
  await prisma.comment.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
