import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_CONVERSATIONS } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(MOCK_CONVERSATIONS);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { studentId, channel, content } = await req.json();
  const conv = { id: `c${Date.now()}`, studentId, channel, isRead: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const msg = { id: `msg${Date.now()}`, conversationId: conv.id, content, senderType: "COUNSELOR", sentAt: new Date().toISOString() };
  return NextResponse.json({ conversation: conv, message: msg }, { status: 201 });
}
