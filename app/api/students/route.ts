import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const stage = searchParams.get("stage") ?? "";
  const temp = searchParams.get("temp") ?? "";

  const students = await prisma.student.findMany({
    where: {
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
      ...(stage ? { stage } : {}),
      ...(temp ? { leadTemperature: temp } : {}),
    },
    include: { counselor: { select: { name: true } }, _count: { select: { applications: true, documents: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const student = await prisma.student.create({ data: body });
  return NextResponse.json(student, { status: 201 });
}
