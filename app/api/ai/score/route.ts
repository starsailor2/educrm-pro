import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { studentId } = await req.json();
  const student = MOCK_STUDENTS.find((s) => s.id === studentId);
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ score: student.leadScore, temperature: student.leadTemperature, student });
}
