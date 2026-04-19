import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { studentId, content } = await req.json();
  const note = { id: `n${Date.now()}`, studentId, content, authorId: (session.user as any).id, createdAt: new Date().toISOString(), author: { name: session.user?.name ?? "Counselor" } };
  return NextResponse.json(note, { status: 201 });
}
