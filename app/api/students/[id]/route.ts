import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      counselor: { select: { id: true, name: true, email: true } },
      applications: true,
      documents: true,
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { date: "asc" } },
      financeRecords: { orderBy: { createdAt: "desc" } },
      conversations: { include: { messages: { orderBy: { sentAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const student = await prisma.student.update({ where: { id }, data: body });
  return NextResponse.json(student);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
