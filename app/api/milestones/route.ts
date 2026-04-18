import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const milestones = await prisma.milestone.findMany({
    where: studentId ? { studentId } : {},
    include: { student: { select: { name: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(milestones);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const milestone = await prisma.milestone.create({ data: body, include: { student: { select: { name: true } } } });
  return NextResponse.json(milestone, { status: 201 });
}
