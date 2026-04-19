import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_FINANCE } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const records = studentId ? MOCK_FINANCE.filter((f) => f.studentId === studentId) : MOCK_FINANCE;
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const record = { ...body, id: `f${Date.now()}`, createdAt: new Date().toISOString(), invoiceNumber: body.type === "INVOICE" ? `INV-${Date.now().toString().slice(-6)}` : null, student: { name: "Student", email: "" } };
  return NextResponse.json(record, { status: 201 });
}
