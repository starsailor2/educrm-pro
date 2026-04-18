import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function computeScore(student: any): { score: number; temperature: string } {
  let score = 0;

  // Budget confirmed
  if (student.budget && student.budget > 0) score += 15;

  // Documents uploaded
  const docCount = student.documents?.length ?? 0;
  score += Math.min(docCount * 5, 20);

  // English score
  if (student.englishScoreValue) {
    if (student.englishScore === "IELTS" && student.englishScoreValue >= 6.5) score += 15;
    else if (student.englishScore === "TOEFL" && student.englishScoreValue >= 90) score += 15;
    else score += 8;
  }

  // Academic grade
  if (student.gradePercentage) {
    if (student.gradePercentage >= 80) score += 15;
    else if (student.gradePercentage >= 65) score += 10;
    else score += 5;
  }

  // Intake urgency (within 6 months = high urgency)
  if (student.intakeYear && student.intakeMonth) {
    const monthMap: Record<string, number> = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
    const intakeDate = new Date(student.intakeYear, (monthMap[student.intakeMonth] ?? 1) - 1);
    const monthsAway = (intakeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAway <= 3) score += 20;
    else if (monthsAway <= 6) score += 15;
    else score += 5;
  }

  // Country + course preference
  if (student.destinationCountries) score += 10;
  if (student.preferredCourses) score += 5;

  score = Math.min(score, 100);
  const temperature = score >= 80 ? "HOT" : score >= 40 ? "WARM" : "COLD";
  return { score, temperature };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId } = await req.json();
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { documents: true },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { score, temperature } = computeScore(student);
  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { leadScore: score, leadTemperature: temperature },
  });

  return NextResponse.json({ score, temperature, student: updated });
}
