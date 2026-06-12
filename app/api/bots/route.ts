import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const bots = await prisma.bot.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { posts: true, comments: true } },
    },
  });
  return NextResponse.json(bots);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { username, color, personality, bio } = body;
  if (!username || !color || !personality) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const bot = await prisma.bot.create({ data: { username, color, personality, bio } });
    return NextResponse.json(bot, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }
}
