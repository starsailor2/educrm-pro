import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Derive counsellors from students' counselor field (mock has no separate users list)
  const counsellorMap: Record<string, { id: string; name: string; email: string; students: typeof MOCK_STUDENTS }> = {};
  for (const s of MOCK_STUDENTS) {
    if (!s.counselor) continue;
    const cid = s.counselorId;
    if (!counsellorMap[cid]) {
      counsellorMap[cid] = { id: cid, name: s.counselor.name, email: s.counselor.email, students: [] };
    }
    counsellorMap[cid].students.push(s);
  }

  const counsellors = Object.values(counsellorMap).map(({ id, name, email, students }) => ({
    id,
    name,
    email,
    totalStudents: students.length,
    hotLeads: students.filter((s) => s.leadTemperature === "HOT").length,
    enrolled: students.filter((s) => s.stage === "ENROLLED").length,
    revenue: students
      .flatMap((s) => s.financeRecords ?? [])
      .filter((f: any) => f.status === "PAID")
      .reduce((sum: number, f: any) => sum + (f.amount ?? 0), 0),
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      stage: s.stage,
      leadTemperature: s.leadTemperature,
      leadScore: s.leadScore,
    })),
  }));

  return NextResponse.json(counsellors);
}
