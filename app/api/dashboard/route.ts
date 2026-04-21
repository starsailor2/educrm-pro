import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_DASHBOARD, MOCK_STUDENTS, MOCK_DOCUMENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "ADMIN") {
    // Counsellor performance breakdown
    const counsellorMap: Record<string, { name: string; email: string; students: typeof MOCK_STUDENTS }> = {};
    for (const s of MOCK_STUDENTS) {
      const cid = s.counselorId ?? "unassigned";
      if (!counsellorMap[cid]) {
        counsellorMap[cid] = {
          name: s.counselor?.name ?? "Unassigned",
          email: s.counselor?.email ?? "",
          students: [],
        };
      }
      counsellorMap[cid].students.push(s);
    }
    const counsellorStats = Object.entries(counsellorMap).map(([id, { name, email, students }]) => ({
      id,
      name,
      email,
      totalStudents: students.length,
      hotLeads: students.filter((s) => s.leadTemperature === "HOT").length,
      enrolled: students.filter((s) => s.stage === "ENROLLED").length,
      revenue: students.flatMap((s) => s.financeRecords ?? []).filter((f: any) => f.status === "PAID").reduce((sum: number, f: any) => sum + (f.amount ?? 0), 0),
    }));

    const pendingReviews = MOCK_DOCUMENTS.filter((d: any) => d.status === "PENDING_REVIEW").length;
    const enrolled = MOCK_STUDENTS.filter((s) => s.stage === "ENROLLED").length;
    const conversionRate = MOCK_STUDENTS.length > 0 ? Math.round((enrolled / MOCK_STUDENTS.length) * 100) : 0;

    return NextResponse.json({
      ...MOCK_DASHBOARD,
      counsellorStats,
      pendingReviews,
      conversionRate,
    });
  }

  // Counsellor: filter to their own students
  const myStudents = MOCK_STUDENTS.filter((s) => s.counselorId === userId || s.counselorId === "u2");
  const hotLeads = myStudents.filter((s) => s.leadTemperature === "HOT").length;
  const warmLeads = myStudents.filter((s) => s.leadTemperature === "WARM").length;
  const coldLeads = myStudents.filter((s) => s.leadTemperature === "COLD").length;
  const revenue = myStudents.flatMap((s) => s.financeRecords ?? []).filter((f: any) => f.status === "PAID").reduce((sum: number, f: any) => sum + (f.amount ?? 0), 0);

  const stageBreakdown = Object.entries(
    myStudents.reduce((acc: Record<string, number>, s) => {
      acc[s.stage] = (acc[s.stage] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([stage, count]) => ({ stage, _count: count }));

  // Hot leads or those with upcoming milestones (mock: all HOT students)
  const followUps = myStudents
    .filter((s) => s.leadTemperature === "HOT")
    .slice(0, 5)
    .map((s) => ({ id: s.id, name: s.name, email: s.email, leadTemperature: s.leadTemperature, stage: s.stage, counselor: s.counselor }));

  return NextResponse.json({
    totalStudents: myStudents.length,
    hotLeads,
    warmLeads,
    coldLeads,
    revenue,
    pendingTasks: MOCK_DASHBOARD.pendingTasks,
    stageBreakdown,
    recentStudents: myStudents.slice(0, 5).map((s) => ({ id: s.id, name: s.name, email: s.email, leadTemperature: s.leadTemperature, stage: s.stage, counselor: s.counselor })),
    followUps,
  });
}
