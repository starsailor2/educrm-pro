import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const docs = await prisma.document.findMany({
    where: studentId ? { studentId } : {},
    include: { student: { select: { name: true } } },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const studentId = formData.get("studentId") as string;
  const type = formData.get("type") as string;
  const name = formData.get("name") as string;

  let fileUrl = "/placeholder-doc.pdf";
  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    fileUrl = `/uploads/${filename}`;
  }

  const doc = await prisma.document.create({
    data: { studentId, name: name ?? file?.name ?? "Document", type, fileUrl, fileSize: file?.size, mimeType: file?.type },
  });
  return NextResponse.json(doc, { status: 201 });
}
