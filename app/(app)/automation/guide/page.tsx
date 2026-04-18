"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Clock, GitBranch, CalendarClock, TrendingUp, CreditCard,
  MessageCircle, Mail, Smartphone, CheckSquare, UserCheck, Info, ChevronRight, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Data ────────────────────────────────────────────────────────────────────

const TRIGGERS = [
  {
    type: "INACTIVITY",
    label: "Student Inactivity",
    icon: Clock,
    color: "bg-orange-100 text-orange-700",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    description: "Fires when a student has had no activity (no messages, no notes, no stage change) for a specified number of days. Great for follow-up nudges to keep leads warm.",
    condition: `{ "days": 3 }`,
    conditionFields: [
      { field: "days", type: "number", desc: "Number of inactive days before the rule fires" },
    ],
    examples: [
      { label: "3-day check-in", value: `{ "days": 3 }` },
      { label: "Weekly re-engagement", value: `{ "days": 7 }` },
      { label: "30-day cold lead", value: `{ "days": 30 }` },
    ],
  },
  {
    type: "STAGE_CHANGE",
    label: "Stage Change",
    icon: GitBranch,
    color: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "Fires whenever a student moves into a specific pipeline stage. Use this to automate congratulatory messages, next-step instructions, or document requests.",
    condition: `{ "stage": "OFFER_RECEIVED" }`,
    conditionFields: [
      {
        field: "stage",
        type: "enum",
        desc: "Pipeline stage that triggers the rule",
        values: ["INQUIRY", "ASSESSMENT", "SHORTLISTING", "APPLICATION", "OFFER_RECEIVED", "VISA_APPLIED", "VISA_APPROVED", "ENROLLED", "DEPARTED"],
      },
    ],
    examples: [
      { label: "Offer received — congrats", value: `{ "stage": "OFFER_RECEIVED" }` },
      { label: "Visa approved — pre-departure", value: `{ "stage": "VISA_APPROVED" }` },
      { label: "Application started — doc checklist", value: `{ "stage": "APPLICATION" }` },
    ],
  },
  {
    type: "DEADLINE_PROXIMITY",
    label: "Deadline Approaching",
    icon: CalendarClock,
    color: "bg-red-100 text-red-700",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    description: "Fires when a calendar deadline is within N days. Useful for application submission warnings, visa document reminders, and fee payment alerts.",
    condition: `{ "days": 7 }`,
    conditionFields: [
      { field: "days", type: "number", desc: "Number of days before the deadline to fire the rule" },
    ],
    examples: [
      { label: "7-day warning", value: `{ "days": 7 }` },
      { label: "3-day urgent alert", value: `{ "days": 3 }` },
      { label: "1-day final reminder", value: `{ "days": 1 }` },
    ],
  },
  {
    type: "LEAD_SCORE",
    label: "Lead Score Threshold",
    icon: TrendingUp,
    color: "bg-violet-100 text-violet-700",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    description: "Fires when a student's AI lead score crosses a threshold. Use 'above' to escalate hot leads for priority follow-up, or 'below' to flag cold leads for re-engagement.",
    condition: `{ "above": 80 }`,
    conditionFields: [
      { field: "above", type: "number", desc: "Score threshold — fires when student score rises ABOVE this value" },
      { field: "below", type: "number", desc: "Score threshold — fires when student score drops BELOW this value" },
    ],
    examples: [
      { label: "Hot lead escalation (≥80)", value: `{ "above": 80 }` },
      { label: "Warm lead task (≥50)", value: `{ "above": 50 }` },
      { label: "Cold lead re-engage (<40)", value: `{ "below": 40 }` },
    ],
  },
  {
    type: "PAYMENT_RECEIVED",
    label: "Payment Received",
    icon: CreditCard,
    color: "bg-green-100 text-green-700",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    description: "Fires when a finance record is marked as PAID. Use to send automated receipts, thank-you messages, or unlock the next stage in the process.",
    condition: `{}`,
    conditionFields: [],
    examples: [
      { label: "Thank-you message", value: `{}` },
      { label: "With min amount filter", value: `{ "minAmount": 5000 }` },
    ],
  },
];

const ACTIONS = [
  {
    type: "SEND_WHATSAPP",
    label: "Send WhatsApp",
    icon: MessageCircle,
    color: "bg-green-100 text-green-700",
    description: "Sends a WhatsApp message to the student's phone number via Twilio. Supports personalization tokens.",
    template: `{ "template": "Hi {student_name}, this is a reminder about your {course} application deadline on {deadline}. Please contact your counselor {counselor_name} if you need help." }`,
    fields: [
      { field: "template", desc: "Message text with optional {tokens}" },
    ],
  },
  {
    type: "SEND_EMAIL",
    label: "Send Email",
    icon: Mail,
    color: "bg-blue-100 text-blue-700",
    description: "Sends an automated email to the student. Supports a subject line and rich body template.",
    template: `{ "subject": "Your {course} application update", "template": "Dear {student_name},\\n\\nWe wanted to check in on your application to {university}. Your intake is {intake_month}.\\n\\nBest,\\n{counselor_name}" }`,
    fields: [
      { field: "subject", desc: "Email subject line (tokens supported)" },
      { field: "template", desc: "Email body with optional {tokens}" },
    ],
  },
  {
    type: "SEND_SMS",
    label: "Send SMS",
    icon: Smartphone,
    color: "bg-amber-100 text-amber-700",
    description: "Sends a short SMS to the student. Keep templates under 160 characters for a single SMS segment.",
    template: `{ "template": "Reminder: Your {country} visa application docs are due soon. Call us: +1234567890" }`,
    fields: [
      { field: "template", desc: "SMS text (keep under 160 chars). Tokens supported." },
    ],
  },
  {
    type: "CREATE_TASK",
    label: "Create Task",
    icon: CheckSquare,
    color: "bg-violet-100 text-violet-700",
    description: "Creates an internal task assigned to the student's counselor. Useful when a human action is needed rather than an automated message.",
    template: `{ "title": "Follow up with {student_name} — {course}", "priority": "HIGH", "dueInDays": 1 }`,
    fields: [
      { field: "title", desc: "Task title (tokens supported)" },
      { field: "priority", desc: "LOW | MEDIUM | HIGH | URGENT" },
      { field: "dueInDays", desc: "Days from today to set the task due date" },
    ],
  },
  {
    type: "REASSIGN",
    label: "Reassign Counselor",
    icon: UserCheck,
    color: "bg-slate-100 text-slate-700",
    description: "Reassigns a student to a different counselor. Useful for load-balancing hot leads or escalating to a senior counselor.",
    template: `{ "counselorId": "<user-id-of-counselor>" }`,
    fields: [
      { field: "counselorId", desc: "The ID of the counselor to reassign to (from Users table)" },
    ],
  },
];

const TOKENS = [
  { token: "{student_name}", desc: "Full name of the student", example: "Rahul Sharma" },
  { token: "{university}", desc: "Target university name", example: "University of Melbourne" },
  { token: "{course}", desc: "Applied course name", example: "MBA in Finance" },
  { token: "{country}", desc: "Destination country", example: "Australia" },
  { token: "{intake_month}", desc: "Intake month + year", example: "September 2026" },
  { token: "{deadline}", desc: "Nearest upcoming deadline", example: "30 Apr 2026" },
  { token: "{counselor_name}", desc: "Assigned counselor's name", example: "Priya Mehta" },
  { token: "{score}", desc: "AI lead score (0–100)", example: "82" },
];

const EXAMPLE_RULES = [
  {
    name: "3-Day Inactivity WhatsApp Nudge",
    trigger: "INACTIVITY",
    action: "SEND_WHATSAPP",
    delay: 0,
    condition: `{ "days": 3 }`,
    actionData: `{ "template": "Hi {student_name}! 👋 Just checking in on your {course} application. Your counselor {counselor_name} is here to help — reply to this message or book a call." }`,
    tag: "Most Common",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    name: "Offer Received — Congrats Email",
    trigger: "STAGE_CHANGE",
    action: "SEND_EMAIL",
    delay: 0,
    condition: `{ "stage": "OFFER_RECEIVED" }`,
    actionData: `{ "subject": "Congratulations on your offer from {university}!", "template": "Dear {student_name},\\n\\nWonderful news — you have received an offer from {university} for {course}!\\n\\nNext steps: review the offer letter and confirm your acceptance with {counselor_name}.\\n\\nBest regards,\\nEduCRM Pro Team" }`,
    tag: "High Impact",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Deadline Warning — 7 Days Out",
    trigger: "DEADLINE_PROXIMITY",
    action: "SEND_SMS",
    delay: 0,
    condition: `{ "days": 7 }`,
    actionData: `{ "template": "⚠️ {student_name}: Your deadline is in 7 days ({deadline}). Contact {counselor_name} immediately to ensure everything is submitted." }`,
    tag: "Urgent",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    name: "Hot Lead — Priority Task",
    trigger: "LEAD_SCORE",
    action: "CREATE_TASK",
    delay: 0,
    condition: `{ "above": 80 }`,
    actionData: `{ "title": "HOT LEAD: Call {student_name} today — score {score}", "priority": "URGENT", "dueInDays": 0 }`,
    tag: "Sales",
    tagColor: "bg-violet-100 text-violet-700",
  },
  {
    name: "Payment Received — Thank You",
    trigger: "PAYMENT_RECEIVED",
    action: "SEND_WHATSAPP",
    delay: 1,
    condition: `{}`,
    actionData: `{ "template": "Hi {student_name}, we have received your payment — thank you! 🎉 Your {course} journey is officially underway. We'll be in touch with next steps." }`,
    tag: "Retention",
    tagColor: "bg-amber-100 text-amber-700",
  },
];

const TRIGGER_ICON: Record<string, any> = {
  INACTIVITY: Clock, STAGE_CHANGE: GitBranch, DEADLINE_PROXIMITY: CalendarClock,
  LEAD_SCORE: TrendingUp, PAYMENT_RECEIVED: CreditCard,
};
const TRIGGER_LABEL: Record<string, string> = {
  INACTIVITY: "Student Inactivity", STAGE_CHANGE: "Stage Change",
  DEADLINE_PROXIMITY: "Deadline Approaching", LEAD_SCORE: "Lead Score Threshold",
  PAYMENT_RECEIVED: "Payment Received",
};
const ACTION_LABEL: Record<string, string> = {
  SEND_WHATSAPP: "Send WhatsApp", SEND_EMAIL: "Send Email", SEND_SMS: "Send SMS",
  CREATE_TASK: "Create Task", REASSIGN: "Reassign Counselor",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AutomationGuidePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <div>
        <Link href="/automation" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Automation
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Automation Engine — Complete Guide</h1>
            <p className="text-slate-500 mt-1">How triggers, conditions, delays, actions, and tokens work together to automate your student follow-up workflow.</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />How the Engine Works
        </h2>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <div className="bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-800 shadow-sm">
                <span className="text-xs uppercase tracking-wide text-blue-400 block mb-0.5">1. Event</span>
                Something happens in the CRM
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-800 shadow-sm">
                <span className="text-xs uppercase tracking-wide text-blue-400 block mb-0.5">2. Trigger Matches</span>
                Rule condition is evaluated
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-800 shadow-sm">
                <span className="text-xs uppercase tracking-wide text-blue-400 block mb-0.5">3. Delay</span>
                Wait N hours (optional)
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-800 shadow-sm">
                <span className="text-xs uppercase tracking-wide text-blue-400 block mb-0.5">4. Action Fires</span>
                Message sent / task created
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-800 shadow-sm">
                <span className="text-xs uppercase tracking-wide text-blue-400 block mb-0.5">5. Logged</span>
                NudgeLog record saved
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-4 leading-relaxed">
              Rules are evaluated on a schedule (every hour) and on real-time events. A rule only fires <strong>once per student per firing window</strong> to prevent spam. All fired actions are stored in the Nudge Log with a status of SENT, FAILED, or PENDING.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Triggers */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />Triggers
        </h2>
        <p className="text-sm text-slate-500 mb-4">A trigger defines <em>what event</em> causes a rule to fire. Each trigger type expects a specific condition JSON format.</p>
        <div className="space-y-4">
          {TRIGGERS.map(t => {
            const Icon = t.icon;
            return (
              <Card key={t.type}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${t.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-5 h-5 ${t.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{t.label}</h3>
                        <code className={`text-xs px-2 py-0.5 rounded-full font-mono ${t.color}`}>{t.type}</code>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{t.description}</p>

                      {t.conditionFields.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Condition Fields</p>
                          <div className="space-y-1.5">
                            {t.conditionFields.map(f => (
                              <div key={f.field} className="flex items-start gap-2 text-sm">
                                <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono flex-shrink-0">{f.field}</code>
                                <span className="text-slate-500">{f.desc}</span>
                                {(f as any).values && (
                                  <div className="flex flex-wrap gap-1 ml-1">
                                    {(f as any).values.map((v: string) => (
                                      <code key={v} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{v}</code>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Examples</p>
                        <div className="flex flex-wrap gap-2">
                          {t.examples.map(ex => (
                            <div key={ex.label} className="bg-slate-900 rounded-lg px-3 py-2">
                              <span className="text-slate-400 text-xs block mb-1">{ex.label}</span>
                              <code className="text-green-400 text-xs font-mono">{ex.value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-violet-500" />Actions
        </h2>
        <p className="text-sm text-slate-500 mb-4">An action defines <em>what happens</em> when a rule fires. The Action Data JSON configures the content and behavior of the action.</p>
        <div className="space-y-4">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <Card key={a.type}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${a.color.replace("text-", "").split(" ")[0]} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-5 h-5 ${a.color.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{a.label}</h3>
                        <code className={`text-xs px-2 py-0.5 rounded-full font-mono ${a.color}`}>{a.type}</code>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{a.description}</p>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Action Data Fields</p>
                        <div className="space-y-1.5">
                          {a.fields.map(f => (
                            <div key={f.field} className="flex items-start gap-2 text-sm">
                              <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono flex-shrink-0">{f.field}</code>
                              <span className="text-slate-500">{f.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Template</p>
                        <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                          <code className="text-green-400 text-xs font-mono whitespace-pre-wrap break-all">{a.template}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Delay */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" />Delay
        </h2>
        <Card>
          <CardContent className="p-5 text-sm text-slate-600 space-y-2 leading-relaxed">
            <p>The <strong>Delay</strong> field (in hours) introduces a wait between when the trigger fires and when the action executes.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Set to <code className="bg-slate-100 px-1 rounded text-xs">0</code> to fire immediately when the trigger condition is met.</li>
              <li>Set to <code className="bg-slate-100 px-1 rounded text-xs">24</code> to wait 24 hours (e.g., send a follow-up the next morning).</li>
              <li>Useful for "give the student time to respond before the next nudge."</li>
              <li>Combined with <strong>INACTIVITY</strong>, a 24h delay means: inactive for 3 days → wait 24h → send message on day 4.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Tokens */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Personalization Tokens</h2>
        <p className="text-sm text-slate-500 mb-4">Use these tokens in your WhatsApp, Email, and SMS templates. They are replaced with real student data at the time the action fires.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOKENS.map(t => (
            <Card key={t.token}>
              <CardContent className="p-4 flex items-start gap-3">
                <code className="bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1.5 rounded-lg text-sm font-mono flex-shrink-0">{t.token}</code>
                <div>
                  <p className="text-sm text-slate-700">{t.desc}</p>
                  <p className="text-xs text-slate-400 mt-0.5">e.g. "{t.example}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example Rules */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Ready-to-Use Example Rules</h2>
        <p className="text-sm text-slate-500 mb-4">Copy these directly into the "Create Automation Rule" form.</p>
        <div className="space-y-4">
          {EXAMPLE_RULES.map(rule => {
            const TriggerIcon = TRIGGER_ICON[rule.trigger];
            return (
              <Card key={rule.name} className="border-l-4 border-l-amber-400">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{rule.name}</h3>
                        <Badge className={`text-xs ${rule.tagColor}`}>{rule.tag}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <TriggerIcon className="w-3.5 h-3.5" />
                        <span>{TRIGGER_LABEL[rule.trigger]}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{ACTION_LABEL[rule.action]}</span>
                        {rule.delay > 0 && <span className="text-slate-400">· {rule.delay}h delay</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Condition JSON</p>
                      <div className="bg-slate-900 rounded-lg p-3">
                        <code className="text-green-400 text-xs font-mono whitespace-pre-wrap">{rule.condition}</code>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Action Data JSON</p>
                      <div className="bg-slate-900 rounded-lg p-3 max-h-28 overflow-y-auto">
                        <code className="text-green-400 text-xs font-mono whitespace-pre-wrap break-all">{rule.actionData}</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="border-t pt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Ready to build your first rule?</p>
        <Link href="/automation">
          <div className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
            <Zap className="w-4 h-4" />Open Automation Engine
          </div>
        </Link>
      </div>

    </div>
  );
}
