import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalStudents, hotLeads, warmLeads, coldLeads, stageBreakdown, recentStudents, totalFinance, pendingTasks] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { leadTemperature: "HOT" } }),
    prisma.student.count({ where: { leadTemperature: "WARM" } }),
    prisma.student.count({ where: { leadTemperature: "COLD" } }),
    prisma.student.groupBy({ by: ["stage"], _count: true }),
    prisma.student.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { counselor: { select: { name: true } } } }),
    prisma.financeRecord.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.task.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    totalStudents,
    hotLeads,
    warmLeads,
    coldLeads,
    stageBreakdown,
    recentStudents,
    revenue: totalFinance._sum.amount ?? 0,
    pendingTasks,
  });
}
