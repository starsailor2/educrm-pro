import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_CONTRACTS } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(MOCK_CONTRACTS);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const counselorId = (session.user as any).id;
  const contract = { ...body, id: `ct${Date.now()}`, counselorId, status: "DRAFT", createdAt: new Date().toISOString(), student: { name: "Student", email: "" }, counselor: { name: "Admin User" } };
  return NextResponse.json(contract, { status: 201 });
}
