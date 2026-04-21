import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_DOCUMENTS, MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const statusFilter = searchParams.get("status");

  let docs = MOCK_DOCUMENTS;

  // Counsellors only see documents for their assigned students
  if (role === "COUNSELOR") {
    const myStudentIds = MOCK_STUDENTS.filter((s) => s.counselorId === userId || s.counselorId === "u2").map((s) => s.id);
    docs = docs.filter((d) => myStudentIds.includes(d.studentId));
  }

  if (studentId) docs = docs.filter((d) => d.studentId === studentId);
  if (statusFilter) docs = docs.filter((d) => d.status === statusFilter);

  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const doc = {
    id: `d${Date.now()}`, studentId: formData.get("studentId"), type: formData.get("type"),
    name: formData.get("name"), status: "PENDING", fileUrl: "#", uploadedAt: new Date().toISOString(),
    student: { name: "Student" },
  };
  return NextResponse.json(doc, { status: 201 });
}
