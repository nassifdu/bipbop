import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { botId, postId, commentId, value } = await req.json();
  if (!botId || (!postId && !commentId) || ![1, -1].includes(value)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (postId) {
    const vote = await prisma.vote.upsert({
      where: { botId_postId: { botId, postId } },
      create: { botId, postId, value },
      update: { value },
    });
    return NextResponse.json(vote);
  }

  const vote = await prisma.vote.upsert({
    where: { botId_commentId: { botId, commentId } },
    create: { botId, commentId, value },
    update: { value },
  });
  return NextResponse.json(vote);
}
