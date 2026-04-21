export const MOCK_STUDENTS = [
  {
    id: "s1", name: "Aarav Sharma", email: "aarav@gmail.com", phone: "+91 98765 43210",
    nationality: "Indian", passportNumber: "P1234567", dateOfBirth: "2000-03-15",
    stage: "OFFER_RECEIVED", leadTemperature: "HOT", leadScore: 88,
    preferredCountry: "Canada", preferredCourse: "Computer Science", preferredIntake: "Sep 2025",
    budget: "50000", englishScore: "IELTS 7.5", academicGrade: "A",
    counselorId: "u1", createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-03-20T10:00:00Z",
    counselor: { id: "u1", name: "Admin User", email: "admin@educrm.pro" },
    _count: { applications: 3, documents: 5 },
    applications: [
      { id: "a1", studentId: "s1", university: "University of Toronto", course: "CS", country: "Canada", status: "OFFER_RECEIVED", intake: "Sep 2025", createdAt: "2025-02-01T00:00:00Z" },
      { id: "a2", studentId: "s1", university: "UBC", course: "CS", country: "Canada", status: "PREPARING", intake: "Sep 2025", createdAt: "2025-02-05T00:00:00Z" },
    ],
    documents: [
      { id: "d1", studentId: "s1", name: "Passport", type: "PASSPORT", status: "VERIFIED", uploadedAt: "2025-01-15T00:00:00Z", expiryDate: "2030-01-01T00:00:00Z", fileUrl: "#" },
      { id: "d2", studentId: "s1", name: "IELTS Certificate", type: "ENGLISH_TEST", status: "VERIFIED", uploadedAt: "2025-01-18T00:00:00Z", expiryDate: "2027-01-01T00:00:00Z", fileUrl: "#" },
    ],
    notes: [
      { id: "n1", studentId: "s1", content: "Student is very motivated and well-prepared.", createdAt: "2025-02-10T00:00:00Z", author: { name: "Admin User" } },
    ],
    milestones: [
      { id: "m1", studentId: "s1", title: "Visa Application Deadline", date: "2025-06-01T00:00:00Z", alertDays: 7, student: { name: "Aarav Sharma" } },
    ],
    financeRecords: [
      { id: "f1", studentId: "s1", type: "INVOICE", amount: 1500, currency: "USD", description: "Counseling fee", status: "PAID", invoiceNumber: "INV-001", createdAt: "2025-01-20T00:00:00Z", student: { name: "Aarav Sharma", email: "aarav@gmail.com" } },
    ],
    conversations: [
      { id: "c1", studentId: "s1", channel: "EMAIL", isRead: true, createdAt: "2025-01-12T00:00:00Z", updatedAt: "2025-03-01T00:00:00Z",
        student: { id: "s1", name: "Aarav Sharma", email: "aarav@gmail.com" },
        messages: [{ id: "msg1", content: "Offer letter received from UoT!", sentAt: "2025-03-01T00:00:00Z", senderType: "STUDENT" }] },
    ],
    contracts: [
      { id: "ct1", studentId: "s1", counselorId: "u1", title: "Service Agreement", content: "Standard consultancy agreement...", status: "SIGNED", signedAt: "2025-01-25T00:00:00Z", signeeIp: "192.168.1.1", createdAt: "2025-01-20T00:00:00Z", student: { name: "Aarav Sharma", email: "aarav@gmail.com" }, counselor: { name: "Admin User" } },
    ],
  },
  {
    id: "s2", name: "Priya Patel", email: "priya@gmail.com", phone: "+91 87654 32109",
    nationality: "Indian", passportNumber: "P7654321", dateOfBirth: "2001-07-22",
    stage: "INQUIRY", leadTemperature: "HOT", leadScore: 75,
    preferredCountry: "UK", preferredCourse: "MBA", preferredIntake: "Jan 2026",
    budget: "60000", englishScore: "IELTS 7.0", academicGrade: "B+",
    counselorId: "u1", createdAt: "2025-02-01T08:00:00Z", updatedAt: "2025-03-22T10:00:00Z",
    counselor: { id: "u1", name: "Admin User", email: "admin@educrm.pro" },
    _count: { applications: 1, documents: 2 },
    applications: [
      { id: "a3", studentId: "s2", university: "University of Manchester", course: "MBA", country: "UK", status: "PREPARING", intake: "Jan 2026", createdAt: "2025-02-10T00:00:00Z" },
    ],
    documents: [
      { id: "d3", studentId: "s2", name: "Passport", type: "PASSPORT", status: "VERIFIED", uploadedAt: "2025-02-05T00:00:00Z", expiryDate: "2031-06-01T00:00:00Z", fileUrl: "#" },
    ],
    notes: [],
    milestones: [],
    financeRecords: [],
    conversations: [
      { id: "c2", studentId: "s2", channel: "WHATSAPP", isRead: false, createdAt: "2025-02-03T00:00:00Z", updatedAt: "2025-03-22T00:00:00Z",
        student: { id: "s2", name: "Priya Patel", email: "priya@gmail.com" },
        messages: [{ id: "msg2", content: "Hi, I need help with my UK visa application", sentAt: "2025-03-22T00:00:00Z", senderType: "STUDENT" }] },
    ],
    contracts: [],
  },
  {
    id: "s3", name: "Rahul Verma", email: "rahul@gmail.com", phone: "+91 76543 21098",
    nationality: "Indian", passportNumber: "P2345678", dateOfBirth: "1999-11-05",
    stage: "COUNSELING", leadTemperature: "HOT", leadScore: 82,
    preferredCountry: "Australia", preferredCourse: "Data Science", preferredIntake: "Feb 2026",
    budget: "45000", englishScore: "PTE 72", academicGrade: "A-",
    counselorId: "u2", createdAt: "2025-01-20T08:00:00Z", updatedAt: "2025-03-18T10:00:00Z",
    counselor: { id: "u2", name: "Counselor User", email: "counselor@educrm.pro" },
    _count: { applications: 2, documents: 4 },
    applications: [],
    documents: [
      { id: "d4", studentId: "s3", name: "Passport", type: "PASSPORT", status: "PENDING_REVIEW", uploadedAt: "2025-03-10T00:00:00Z", fileUrl: "#" },
      { id: "d5", studentId: "s3", name: "PTE Score Card", type: "ENGLISH_TEST", status: "PENDING", uploadedAt: "2025-03-15T00:00:00Z", fileUrl: "#" },
    ],
    notes: [
      { id: "n2", studentId: "s3", content: "Exploring Melbourne and Sydney universities.", createdAt: "2025-02-15T00:00:00Z", author: { name: "Counselor User" } },
    ],
    milestones: [],
    financeRecords: [
      { id: "f2", studentId: "s3", type: "INVOICE", amount: 1200, currency: "USD", description: "Application fee", status: "PENDING", invoiceNumber: "INV-002", createdAt: "2025-02-20T00:00:00Z", student: { name: "Rahul Verma", email: "rahul@gmail.com" } },
    ],
    conversations: [],
    contracts: [],
  },
  {
    id: "s4", name: "Sneha Kapoor", email: "sneha@gmail.com", phone: "+91 65432 10987",
    nationality: "Indian", passportNumber: "P3456789", dateOfBirth: "2002-04-18",
    stage: "DOCUMENT_COLLECTION", leadTemperature: "WARM", leadScore: 60,
    preferredCountry: "Germany", preferredCourse: "Engineering", preferredIntake: "Oct 2025",
    budget: "30000", englishScore: "IELTS 6.5", academicGrade: "B",
    counselorId: "u2", createdAt: "2025-02-10T08:00:00Z", updatedAt: "2025-03-15T10:00:00Z",
    counselor: { id: "u2", name: "Counselor User", email: "counselor@educrm.pro" },
    _count: { applications: 1, documents: 3 },
    applications: [],
    documents: [
      { id: "d6", studentId: "s4", name: "Transcript", type: "TRANSCRIPT", status: "PENDING", uploadedAt: "2025-03-12T00:00:00Z", fileUrl: "#" },
      { id: "d7", studentId: "s4", name: "IELTS Certificate", type: "ENGLISH_TEST", status: "PENDING_REVIEW", uploadedAt: "2025-03-14T00:00:00Z", fileUrl: "#" },
    ],
    notes: [],
    milestones: [],
    financeRecords: [],
    conversations: [],
    contracts: [],
  },
  {
    id: "s5", name: "Karan Mehta", email: "karan@gmail.com", phone: "+91 54321 09876",
    nationality: "Indian", passportNumber: "P4567890", dateOfBirth: "2000-09-30",
    stage: "OFFER_RECEIVED", leadTemperature: "WARM", leadScore: 65,
    preferredCountry: "USA", preferredCourse: "Finance", preferredIntake: "Aug 2025",
    budget: "70000", englishScore: "TOEFL 102", academicGrade: "B+",
    counselorId: "u1", createdAt: "2025-01-05T08:00:00Z", updatedAt: "2025-03-10T10:00:00Z",
    counselor: { id: "u1", name: "Admin User", email: "admin@educrm.pro" },
    _count: { applications: 4, documents: 6 },
    applications: [],
    documents: [],
    notes: [],
    milestones: [],
    financeRecords: [
      { id: "f3", studentId: "s5", type: "PAYMENT", amount: 2000, currency: "USD", description: "Visa filing fee", status: "PAID", invoiceNumber: null, createdAt: "2025-03-01T00:00:00Z", student: { name: "Karan Mehta", email: "karan@gmail.com" } },
    ],
    conversations: [],
    contracts: [],
  },
  {
    id: "s6", name: "Meera Joshi", email: "meera@gmail.com", phone: "+91 43210 98765",
    nationality: "Indian", passportNumber: "P5678901", dateOfBirth: "2001-12-10",
    stage: "INQUIRY", leadTemperature: "COLD", leadScore: 35,
    preferredCountry: "New Zealand", preferredCourse: "Hospitality", preferredIntake: "Mar 2026",
    budget: "25000", englishScore: "", academicGrade: "C+",
    counselorId: "u2", createdAt: "2025-03-01T08:00:00Z", updatedAt: "2025-03-05T10:00:00Z",
    counselor: { id: "u2", name: "Counselor User", email: "counselor@educrm.pro" },
    _count: { applications: 0, documents: 1 },
    applications: [],
    documents: [],
    notes: [],
    milestones: [],
    financeRecords: [],
    conversations: [],
    contracts: [],
  },
];

export const MOCK_DASHBOARD = {
  totalStudents: 6,
  hotLeads: 3,
  warmLeads: 2,
  coldLeads: 1,
  stageBreakdown: [
    { stage: "INQUIRY", _count: 2 },
    { stage: "COUNSELING", _count: 1 },
    { stage: "DOCUMENT_COLLECTION", _count: 1 },
    { stage: "OFFER_RECEIVED", _count: 2 },
  ],
  recentStudents: MOCK_STUDENTS.slice(0, 5).map((s) => ({
    id: s.id, name: s.name, email: s.email, leadTemperature: s.leadTemperature,
    stage: s.stage, counselor: s.counselor,
  })),
  revenue: 13456789,
  pendingTasks: 3,
};

export const MOCK_CONVERSATIONS: any[] = MOCK_STUDENTS.flatMap((s) => s.conversations);

export const MOCK_MESSAGES: Record<string, any[]> = {
  c1: [
    { id: "msg0", conversationId: "c1", content: "Hello, I got my offer letter from University of Toronto!", sentAt: "2025-02-28T10:00:00Z", senderType: "STUDENT", sender: { name: "Aarav Sharma" } },
    { id: "msg1", conversationId: "c1", content: "Congratulations! Let's start the visa process.", sentAt: "2025-03-01T11:00:00Z", senderType: "COUNSELOR", sender: { name: "Admin User" } },
  ],
  c2: [
    { id: "msg2", conversationId: "c2", content: "Hi, I need help with my UK visa application", sentAt: "2025-03-22T09:00:00Z", senderType: "STUDENT", sender: { name: "Priya Patel" } },
  ],
};

export const MOCK_DOCUMENTS: any[] = MOCK_STUDENTS.flatMap((s) =>
  s.documents.map((d) => ({ ...d, student: { name: s.name } }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_FINANCE: any[] = (MOCK_STUDENTS as any[]).flatMap((s) => s.financeRecords);

export const MOCK_MILESTONES = [
  { id: "m1", studentId: "s1", title: "Visa Application Deadline", date: "2025-06-01T00:00:00Z", alertDays: 7, student: { name: "Aarav Sharma" } },
  { id: "m2", studentId: "s2", title: "UK CAS Letter Request", date: "2025-07-15T00:00:00Z", alertDays: 14, student: { name: "Priya Patel" } },
];

export const MOCK_CALENDAR = [
  { id: "cal1", title: "Aarav - Visa Appointment", date: "2025-06-01T10:00:00Z", description: "Canadian visa appointment at VFS", urgency: "RED", studentId: "s1", student: { name: "Aarav Sharma" }, createdAt: "2025-04-01T00:00:00Z" },
  { id: "cal2", title: "Priya - University Interview", date: "2025-07-20T14:00:00Z", description: "Manchester MBA interview call", urgency: "YELLOW", studentId: "s2", student: { name: "Priya Patel" }, createdAt: "2025-04-01T00:00:00Z" },
  { id: "cal3", title: "Rahul - Document Submission", date: "2025-09-01T09:00:00Z", description: "ANU documents deadline", urgency: "GREEN", studentId: "s3", student: { name: "Rahul Verma" }, createdAt: "2025-04-01T00:00:00Z" },
];

export const MOCK_AUTOMATION_RULES = [
  { id: "r1", name: "Hot Lead Follow-up", isActive: true, triggerType: "LEAD_SCORE_CHANGE", condition: { minScore: 70 }, delay: 0, actionType: "SEND_EMAIL", actionData: { template: "hot_lead_followup" }, _count: { nudgeLogs: 12 }, createdAt: "2025-01-01T00:00:00Z" },
  { id: "r2", name: "Inactive Student Nudge", isActive: true, triggerType: "INACTIVITY", condition: { days: 7 }, delay: 1, actionType: "SEND_WHATSAPP", actionData: { template: "inactivity_nudge" }, _count: { nudgeLogs: 8 }, createdAt: "2025-01-15T00:00:00Z" },
  { id: "r3", name: "Document Reminder", isActive: false, triggerType: "DOCUMENT_EXPIRY", condition: { daysBefore: 30 }, delay: 0, actionType: "SEND_EMAIL", actionData: { template: "doc_expiry_reminder" }, _count: { nudgeLogs: 3 }, createdAt: "2025-02-01T00:00:00Z" },
];

export const MOCK_AUTOMATION_LOGS = [
  { id: "l1", studentId: "s1", ruleId: "r1", status: "SENT", triggeredAt: "2025-03-20T09:00:00Z", student: { name: "Aarav Sharma" }, rule: { name: "Hot Lead Follow-up" } },
  { id: "l2", studentId: "s2", ruleId: "r1", status: "SENT", triggeredAt: "2025-03-21T10:00:00Z", student: { name: "Priya Patel" }, rule: { name: "Hot Lead Follow-up" } },
  { id: "l3", studentId: "s6", ruleId: "r2", status: "SENT", triggeredAt: "2025-03-19T08:00:00Z", student: { name: "Meera Joshi" }, rule: { name: "Inactive Student Nudge" } },
];

// Manual reminders sent by counsellors (in-memory, accumulates during session)
export const MOCK_REMINDER_LOGS: any[] = [
  { id: "rl1", studentId: "s3", counselorId: "u2", channel: "IN_APP", templateType: "DOCUMENT_SUBMISSION", message: "Hi Rahul, please submit your passport copy by 1st April.", status: "SENT", sentAt: "2025-03-22T10:30:00Z", student: { name: "Rahul Verma" } },
];

export const MOCK_CONTRACTS: any[] = MOCK_STUDENTS.flatMap((s) => s.contracts);
