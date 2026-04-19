import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const stage = searchParams.get("stage") ?? "";
  const temp = searchParams.get("temp") ?? "";

  let students = MOCK_STUDENTS;
  if (search) students = students.filter((s) => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search));
  if (stage) students = students.filter((s) => s.stage === stage);
  if (temp) students = students.filter((s) => s.leadTemperature === temp);

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const newStudent = { ...body, id: `s${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), counselor: null, _count: { applications: 0, documents: 0 } };
  return NextResponse.json(newStudent, { status: 201 });
}
