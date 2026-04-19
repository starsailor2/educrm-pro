import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_MILESTONES } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const milestones = studentId ? MOCK_MILESTONES.filter((m) => m.studentId === studentId) : MOCK_MILESTONES;
  return NextResponse.json(milestones);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const milestone = { ...body, id: `m${Date.now()}`, student: { name: "Student" } };
  return NextResponse.json(milestone, { status: 201 });
}
