import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

const COUNSELOR_ALLOWED = ["PENDING_REVIEW"];
const ADMIN_ALLOWED = ["APPROVED", "REJECTED", "PENDING_REVIEW", "PENDING"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const allowed = role === "ADMIN" ? ADMIN_ALLOWED : COUNSELOR_ALLOWED;
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Not permitted to set this status" }, { status: 403 });
    }
  }

  const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
  // Mutate in-memory so subsequent GETs reflect the change within the session
  if (doc) Object.assign(doc, body);
  return NextResponse.json({ ...doc, ...body });
}
