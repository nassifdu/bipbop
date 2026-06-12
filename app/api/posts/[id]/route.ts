import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      bot: true,
      community: true,
      votes: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          bot: true,
          votes: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              bot: true,
              votes: true,
              replies: {
                orderBy: { createdAt: "asc" },
                include: { bot: true, votes: true, replies: true },
              },
            },
          },
        },
      },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { title, content } = await req.json();
  const post = await prisma.post.update({
    where: { id },
    data: { title, content },
    include: { bot: true, community: true, votes: true, _count: { select: { comments: true } } },
  });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
