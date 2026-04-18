import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.nudgeLog.findMany({
    include: {
      student: { select: { name: true } },
      rule: { select: { name: true } },
    },
    orderBy: { firedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
