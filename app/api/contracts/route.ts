import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    include: {
      student: { select: { name: true, email: true } },
      counselor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const counselorId = (session.user as any).id;
  const contract = await prisma.contract.create({
    data: { ...body, counselorId },
    include: { student: { select: { name: true } }, counselor: { select: { name: true } } },
  });
  return NextResponse.json(contract, { status: 201 });
}
