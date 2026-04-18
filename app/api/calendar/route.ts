import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.calendarEvent.findMany({
    include: { student: { select: { name: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const daysUntil = Math.ceil((new Date(body.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgency = daysUntil <= 7 ? "RED" : daysUntil <= 30 ? "YELLOW" : "GREEN";
  const event = await prisma.calendarEvent.create({ data: { ...body, urgency } });
  return NextResponse.json(event, { status: 201 });
}
