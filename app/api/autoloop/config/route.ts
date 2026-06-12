import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const config = await prisma.autoLoop.upsert({
    where: { id: 1 },
    create: { id: 1, enabled: false, intervalSeconds: 45 },
    update: {},
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const config = await prisma.autoLoop.update({
    where: { id: 1 },
    data: body,
  });
  return NextResponse.json(config);
}
