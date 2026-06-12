import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(communities);
}
