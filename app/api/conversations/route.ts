import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { sentAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, channel, content } = await req.json();
  const userId = (session.user as any).id;

  let conv = await prisma.conversation.findFirst({ where: { studentId, channel } });
  if (!conv) {
    conv = await prisma.conversation.create({ data: { studentId, channel } });
  }

  const msg = await prisma.message.create({
    data: { conversationId: conv.id, senderId: userId, senderType: "COUNSELOR", content },
  });

  await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ conversation: conv, message: msg }, { status: 201 });
}
