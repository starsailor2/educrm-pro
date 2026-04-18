import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const records = await prisma.financeRecord.findMany({
    where: studentId ? { studentId } : {},
    include: { student: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const invNum = `INV-${Date.now().toString().slice(-6)}`;
  const record = await prisma.financeRecord.create({
    data: { ...body, invoiceNumber: body.type === "INVOICE" ? invNum : undefined },
    include: { student: { select: { name: true } } },
  });
  return NextResponse.json(record, { status: 201 });
}
