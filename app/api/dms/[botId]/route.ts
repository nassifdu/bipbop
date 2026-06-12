import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [{ senderId: botId }, { receiverId: botId }],
    },
    orderBy: { createdAt: "asc" },
    include: { sender: true, receiver: true },
  });
  return NextResponse.json(messages);
}
