import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const counselorPassword = await bcrypt.hash("counselor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@educrm.pro" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@educrm.pro",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const counselor = await prisma.user.upsert({
    where: { email: "counselor@educrm.pro" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "counselor@educrm.pro",
      password: counselorPassword,
      role: "COUNSELOR",
    },
  });

  const senior = await prisma.user.upsert({
    where: { email: "senior@educrm.pro" },
    update: {},
    create: {
      name: "Michael Chen",
      email: "senior@educrm.pro",
      password: await bcrypt.hash("senior123", 10),
      role: "SENIOR_COUNSELOR",
    },
  });

  const students = [
    {
      name: "Arjun Sharma",
      email: "arjun@example.com",
      phone: "+91-9876543210",
      nationality: "Indian",
      stage: "COUNSELING",
      leadScore: 82,
      leadTemperature: "HOT",
      source: "Website",
      highestQualification: "Bachelor's",
      gradePercentage: 78.5,
      englishScore: "IELTS",
      englishScoreValue: 7.0,
      destinationCountries: JSON.stringify(["Canada", "Australia"]),
      preferredCourses: JSON.stringify(["Computer Science", "Data Science"]),
      budget: 25000,
      intakeMonth: "September",
      intakeYear: 2026,
    },
    {
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+91-9123456789",
      nationality: "Indian",
      stage: "DOCUMENT_COLLECTION",
      leadScore: 65,
      leadTemperature: "WARM",
      source: "Referral",
      highestQualification: "Bachelor's",
      gradePercentage: 72.0,
      englishScore: "TOEFL",
      englishScoreValue: 95,
      destinationCountries: JSON.stringify(["UK", "Germany"]),
      preferredCourses: JSON.stringify(["MBA", "Finance"]),
      budget: 30000,
      intakeMonth: "January",
      intakeYear: 2027,
    },
    {
      name: "Ahmed Hassan",
      email: "ahmed@example.com",
      phone: "+971-501234567",
      nationality: "Egyptian",
      stage: "INQUIRY",
      leadScore: 28,
      leadTemperature: "COLD",
      source: "WhatsApp",
      highestQualification: "Diploma",
      gradePercentage: 65.0,
      destinationCountries: JSON.stringify(["USA", "Canada"]),
      preferredCourses: JSON.stringify(["Engineering"]),
      budget: 20000,
      intakeMonth: "September",
      intakeYear: 2026,
    },
    {
      name: "Liu Wei",
      email: "liu@example.com",
      phone: "+86-13912345678",
      nationality: "Chinese",
      stage: "OFFER_RECEIVED",
      leadScore: 91,
      leadTemperature: "HOT",
      source: "Website",
      highestQualification: "Bachelor's",
      gradePercentage: 85.0,
      englishScore: "IELTS",
      englishScoreValue: 7.5,
      destinationCountries: JSON.stringify(["Australia", "UK"]),
      preferredCourses: JSON.stringify(["Architecture"]),
      budget: 35000,
      intakeMonth: "February",
      intakeYear: 2026,
    },
    {
      name: "Fatima Al-Rashidi",
      email: "fatima@example.com",
      phone: "+966-501234567",
      nationality: "Saudi",
      stage: "VISA_APPLIED",
      leadScore: 88,
      leadTemperature: "HOT",
      source: "Referral",
      highestQualification: "Bachelor's",
      gradePercentage: 80.0,
      englishScore: "IELTS",
      englishScoreValue: 6.5,
      destinationCountries: JSON.stringify(["UK"]),
      preferredCourses: JSON.stringify(["Medicine"]),
      budget: 50000,
      intakeMonth: "September",
      intakeYear: 2025,
    },
  ];

  for (const s of students) {
    await prisma.student.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, counselorId: counselor.id },
    });
  }

  const rules = [
    {
      name: "Inactivity Follow-up (3 days)",
      triggerType: "INACTIVITY",
      condition: JSON.stringify({ days: 3 }),
      delay: 0,
      actionType: "SEND_WHATSAPP",
      actionData: JSON.stringify({ template: "Hi {student_name}, just checking in! We'd love to help you take the next step." }),
    },
    {
      name: "Hot Lead — Senior Reassign",
      triggerType: "LEAD_SCORE",
      condition: JSON.stringify({ scoreThreshold: 80 }),
      delay: 0,
      actionType: "REASSIGN",
      actionData: JSON.stringify({ targetRole: "SENIOR_COUNSELOR" }),
    },
    {
      name: "Offer Received — Congratulations",
      triggerType: "STAGE_CHANGE",
      condition: JSON.stringify({ toStage: "OFFER_RECEIVED" }),
      delay: 0,
      actionType: "SEND_WHATSAPP",
      actionData: JSON.stringify({ template: "Congratulations {student_name}! You have received an offer!" }),
    },
    {
      name: "Deadline Reminder — 7 days",
      triggerType: "DEADLINE_PROXIMITY",
      condition: JSON.stringify({ days: 7 }),
      delay: 0,
      actionType: "SEND_EMAIL",
      actionData: JSON.stringify({ template: "Reminder: important deadline in 7 days.", subject: "Important Deadline Reminder" }),
    },
  ];
  for (const rule of rules) {
    const exists = await prisma.automationRule.findFirst({ where: { name: rule.name } });
    if (!exists) await prisma.automationRule.create({ data: rule });
  }

  const events = [
    { title: "University of Toronto — Fall 2026 Deadline", type: "INTAKE_DEADLINE", date: new Date("2026-05-01"), university: "University of Toronto", country: "Canada", course: "Computer Science", urgency: "YELLOW", description: "Application deadline for Fall 2026 intake." },
    { title: "Australian NZ Visa Processing", type: "VISA_DEADLINE", date: new Date("2026-04-30"), country: "Australia", urgency: "RED", description: "Visa applications must be submitted." },
    { title: "Imperial College London — MSc Deadline", type: "INTAKE_DEADLINE", date: new Date("2026-06-15"), university: "Imperial College London", country: "UK", course: "Engineering", urgency: "GREEN", description: "Application deadline for MSc programs." },
  ];
  for (const event of events) {
    const exists = await prisma.calendarEvent.findFirst({ where: { title: event.title } });
    if (!exists) await prisma.calendarEvent.create({ data: event });
  }

  console.log("Seed completed:", { admin: admin.email, counselor: counselor.email, senior: senior.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
