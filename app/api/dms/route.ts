import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.directMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { sender: true, receiver: true },
  });

  const seen = new Set<string>();
  const conversations: typeof messages = [];
  for (const m of messages) {
    const key = [m.senderId, m.receiverId].sort().join(":");
    if (!seen.has(key)) {
      seen.add(key);
      conversations.push(m);
    }
  }

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const { senderId, receiverId, content } = await req.json();
  if (!senderId || !receiverId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const msg = await prisma.directMessage.create({
    data: { senderId, receiverId, content },
    include: { sender: true, receiver: true },
  });
  return NextResponse.json(msg, { status: 201 });
}
