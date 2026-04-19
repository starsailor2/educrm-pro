# Product Requirements Document
# EduCRM Pro — AI-Powered Education Consultancy Platform

**Version:** 1.0  
**Date:** 2026-04-18  
**Status:** Approved for Development  

---

## 1. Executive Summary

EduCRM Pro is an all-in-one, AI-powered CRM and automation platform purpose-built for international education consultancies. It unifies student communications (WhatsApp, Email, SMS), automates follow-ups, scores leads with AI, manages the full student lifecycle from inquiry to visa approval, and triggers automated business workflows across modules.

**Core Problem:** Counselors lose leads due to fragmented tools — they juggle WhatsApp, Gmail, spreadsheets, and Word docs manually, causing slow follow-ups, missed deadlines, and lost revenue.

**Solution:** One platform that handles every touchpoint, automates repetitive tasks, and uses AI to help counselors close more students faster.

---

## 2. User Personas

| Persona | Role | Key Pain Points |
|---|---|---|
| **Admin** | Owner / Director | No visibility into pipeline health, revenue forecasting |
| **Counselor** | Sales + Application handler | Too many tools, manual follow-ups, slow response time |
| **Application Manager** | Processes university applications | Document chaos, missed deadlines |
| **Student** | Applicant | No transparency into application status |
| **Parent** | Guardian | Wants real-time updates |

---

## 3. Feature Modules

### Module 1: Unified Communication (Omnichannel Inbox)

**FR-1.1 Omnichannel Inbox**
- Single dashboard aggregating WhatsApp, Email, and SMS
- Threads grouped by student
- Read/unread status, priority tagging
- Quick-reply templates
- File/document sharing in-thread

**FR-1.2 Auto-Nudge Engine**
- Rule engine: IF [condition] THEN [action] AFTER [delay]
- Trigger conditions: inactivity period, stage change, deadline proximity
- Action types: send WhatsApp, send Email, send SMS, create task, reassign counselor
- Personalization tokens: {student_name}, {university}, {deadline}
- Logs every triggered nudge with delivery status

**FR-1.3 Communication Timeline**
- Per-student unified log: calls, WhatsApp, SMS, emails in chronological order
- Manual note-adding by counselor
- Export timeline as PDF

---

### Module 2: AI & Automation Layer

**FR-2.1 AI Lead Scoring**
- Scores every lead: Hot (≥80), Warm (40–79), Cold (<40)
- Scoring inputs: response time, budget confirmed, documents uploaded, intake urgency, country preference, academic background
- Score auto-updates on every interaction
- Visual badge on student card

**FR-2.2 Smart Document OCR**
- Upload passport / transcript / IELTS certificate
- AI extracts: name, DOB, expiry date, grades, scores
- Auto-populates student profile fields
- Flags expiring documents (passport < 6 months)
- Eligibility check: matches grades against university requirements

**FR-2.3 AI Content Assistant**
- SOP (Statement of Purpose) generator
- Visa cover letter generator
- Inputs: student profile, destination country, university, course
- Tone selector: formal / semi-formal
- Human-editable rich text output
- Save as template or export to DOCX

---

### Module 3: Student Lifecycle & Experience

**FR-3.1 Student Lifecycle Stages**
Inquiry → Counseling → Document Collection → Application Submitted → Offer Received → Visa Applied → Visa Approved → Enrolled

Each stage has:
- Required checklist items
- Responsible team member
- Target completion date
- Auto-trigger on stage advance

**FR-3.2 Self-Service Student Portal**
- Unique login per student (magic link or password)
- Visual application roadmap / progress tracker
- Document upload center (with status: Pending / Approved / Rejected)
- Notification center (all milestone alerts)
- Messaging widget (contact counselor)

**FR-3.3 Milestone Alerts**
- System generates alerts for: interview date, visa appointment, fee deadline, offer expiry
- Sent to: student (WhatsApp + Email), parent (if configured), counselor (in-app)
- Alert cadence: 7 days before, 3 days before, day-of

---

### Module 4: Advanced Operational Logic

**FR-4.1 Cross-Module Triggers**
| Trigger Event | Automated Action |
|---|---|
| Visa Module → "Approved" | Finance Module generates commission invoice |
| Application → "Offer Received" | Student gets WhatsApp congratulation + next-steps |
| Document → "Passport Expiring" | Alert counselor + student 6 months before |
| Lead Score → "Hot" | Reassign to senior counselor |
| Payment → "Received" | Advance lifecycle stage |

**FR-4.2 Global Deadline Calendar**
- University intake deadlines (auto-populated from university DB)
- Visa submission deadlines per country
- Student-specific deadlines (offer expiry, fee payment)
- Color-coded urgency (Red: <7 days, Yellow: <30 days, Green: >30 days)
- Browser push notifications for approaching deadlines

**FR-4.3 E-Sign Integration**
- Digital contract templates: Service Agreement, Fee Structure, Terms & Conditions
- Student signs via browser (no download required)
- Counselor countersigns
- PDF stored in student profile
- Audit trail: IP, timestamp, device

---

## 4. Technical Architecture

### Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack Query |
| Backend | Next.js API Routes (serverless) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Auth | NextAuth.js (credentials + magic link) |
| WhatsApp | Twilio WhatsApp Business API |
| SMS | Twilio SMS |
| Email | SendGrid / Nodemailer |
| File Storage | Local (dev) / AWS S3 (prod) |
| E-Sign | Built-in canvas signature + PDF generation |
| Charts | Recharts |
| PDF | pdf-lib, jsPDF |

### Database Models
- User (counselors, admins, students)
- Student (full profile, lifecycle stage, score)
- Lead (inquiry details, source, score)
- Conversation (thread per channel per student)
- Message (individual message in thread)
- Document (uploads, OCR results, status)
- Application (university, course, stage)
- Milestone (event, date, alert config)
- AutomationRule (trigger, condition, action)
- NudgeLog (fired nudges + delivery status)
- FinanceRecord (invoices, commissions, payments)
- CalendarEvent (deadlines, appointments)
- Contract (e-sign agreements, status, signatures)
- Notification (in-app alerts)

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2 seconds |
| AI response time | < 8 seconds |
| Uptime | 99.9% |
| Mobile responsive | Yes |
| Role-based access control | Admin, Senior Counselor, Counselor, Student |
| Data encryption | At-rest + in-transit |
| Audit logs | All user actions logged |

---

## 6. MVP Scope (Phase 1)

1. Authentication + Role-based access
2. Student CRM with lifecycle stages
3. Omnichannel Inbox (UI + Twilio hooks)
4. AI Lead Scoring
5. Auto-Nudge Engine
6. Document management + OCR
7. AI Content Assistant (SOP + Visa letters)
8. Finance module + invoice generation
9. Global Deadline Calendar
10. E-Sign contracts
11. Student Self-Service Portal
12. Milestone alerts
13. Dashboard with KPIs + charts

---

## 7. Success Metrics

| Metric | Target (6 months) |
|---|---|
| Lead-to-enrollment conversion rate | +25% |
| Average response time to inquiry | < 2 hours |
| Counselor time on admin tasks | -40% |
| Missed deadlines | 0 |
| Student satisfaction (portal NPS) | > 8/10 |

---

*PRD prepared for EduCRM Pro v1.0 — Full development begins immediately.*
