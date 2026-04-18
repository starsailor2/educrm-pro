import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { name: true } } },
    orderBy: { sentAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { content } = await req.json();
  const userId = (session.user as any).id;

  const msg = await prisma.message.create({
    data: { conversationId: id, senderId: userId, senderType: "COUNSELOR", content },
    include: { sender: { select: { name: true } } },
  });

  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date(), isRead: false } });
  return NextResponse.json(msg, { status: 201 });
}
