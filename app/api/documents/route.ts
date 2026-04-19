import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const docs = studentId ? MOCK_DOCUMENTS.filter((d) => d.studentId === studentId) : MOCK_DOCUMENTS;
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
