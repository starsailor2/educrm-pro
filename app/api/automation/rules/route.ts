import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_AUTOMATION_RULES } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(MOCK_AUTOMATION_RULES);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const rule = { ...body, id: `r${Date.now()}`, createdAt: new Date().toISOString(), _count: { nudgeLogs: 0 } };
  return NextResponse.json(rule, { status: 201 });
}
