import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_MESSAGES } from "@/lib/mock-data";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(MOCK_MESSAGES[id] ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { content } = await req.json();
  const msg = { id: `msg${Date.now()}`, conversationId: id, content, senderType: "COUNSELOR", sentAt: new Date().toISOString(), sender: { name: "Admin User" } };
  return NextResponse.json(msg, { status: 201 });
}
