import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_CALENDAR } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(MOCK_CALENDAR);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const daysUntil = Math.ceil((new Date(body.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgency = daysUntil <= 7 ? "RED" : daysUntil <= 30 ? "YELLOW" : "GREEN";
  const event = { ...body, id: `cal${Date.now()}`, urgency, createdAt: new Date().toISOString(), student: { name: "Student" } };
  return NextResponse.json(event, { status: 201 });
}
