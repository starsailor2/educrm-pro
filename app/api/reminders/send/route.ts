import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_REMINDER_LOGS, MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const counselorId = (session.user as any).id ?? "u2";
  const logs = MOCK_REMINDER_LOGS.filter((l) => l.counselorId === counselorId || l.counselorId === "u2");
  return NextResponse.json(logs.slice().reverse());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role === "ADMIN") {
    return NextResponse.json({ error: "Admins use automation rules, not manual reminders" }, { status: 403 });
  }

  const body = await req.json();
  const { studentId, channel, message, templateType } = body;

  if (!studentId || !channel || !message) {
    return NextResponse.json({ error: "studentId, channel, and message are required" }, { status: 400 });
  }

  const student = MOCK_STUDENTS.find((s) => s.id === studentId);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const counselorId = (session.user as any).id ?? "u2";

  const log = {
    id: `rl${Date.now()}`,
    studentId,
    counselorId,
    channel,
    templateType: templateType ?? "CUSTOM",
    message,
    status: channel === "WHATSAPP" ? "QUEUED" : "SENT",
    sentAt: new Date().toISOString(),
    student: { name: student.name },
  };

  MOCK_REMINDER_LOGS.push(log);

  return NextResponse.json(log, { status: 201 });
}
