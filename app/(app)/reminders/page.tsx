"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Send, MessageSquare, Phone, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CHANNELS = [
  { value: "IN_APP", label: "In-App / Email", icon: <MessageSquare className="w-4 h-4" /> },
  { value: "WHATSAPP", label: "WhatsApp", icon: <Phone className="w-4 h-4" /> },
];

const TEMPLATES: { value: string; label: string; body: (name: string) => string }[] = [
  {
    value: "DOCUMENT_SUBMISSION",
    label: "Document Submission",
    body: (name) => `Hi ${name}, please submit your pending documents at the earliest to keep your application on track. Let us know if you need any help.`,
  },
  {
    value: "FEE_PAYMENT",
    label: "Fee Payment",
    body: (name) => `Hi ${name}, a friendly reminder that your fee payment is due soon. Please make the payment to avoid any delays with your application.`,
  },
  {
    value: "INTERVIEW_PREP",
    label: "Interview Preparation",
    body: (name) => `Hi ${name}, your university interview is coming up. Please review the interview guide we shared and feel free to schedule a mock interview with us.`,
  },
  {
    value: "DEADLINE_ALERT",
    label: "Application Deadline",
    body: (name) => `Hi ${name}, the application deadline for your chosen university is approaching. Please ensure all required documents and forms are submitted on time.`,
  },
  {
    value: "CUSTOM",
    label: "Custom Message",
    body: () => "",
  },
];

const STATUS_COLORS: Record<string, string> = {
  SENT: "bg-green-100 text-green-700",
  QUEUED: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
};

const CHANNEL_COLORS: Record<string, string> = {
  IN_APP: "bg-indigo-100 text-indigo-700",
  WHATSAPP: "bg-green-100 text-green-700",
};

export default function RemindersPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [channel, setChannel] = useState("IN_APP");
  const [template, setTemplate] = useState("DOCUMENT_SUBMISSION");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function fetchLogs() {
    fetch("/api/reminders/send").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setLogs(data);
    });
  }

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents);
    fetchLogs();
  }, []);

  // Pre-fill message when template or student changes
  useEffect(() => {
    const studentName = students.find((s) => s.id === selectedStudent)?.name ?? "{Student}";
    const tpl = TEMPLATES.find((t) => t.value === template);
    if (tpl && template !== "CUSTOM") {
      setMessage(tpl.body(studentName.split(" ")[0]));
    } else if (template === "CUSTOM") {
      setMessage("");
    }
  }, [template, selectedStudent, students]);

  async function sendReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent || !message.trim()) {
      toast.error("Select a student and enter a message");
      return;
    }
    setSending(true);
    const res = await fetch("/api/reminders/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudent, channel, message, templateType: template }),
    });
    setSending(false);

    if (res.ok) {
      const log = await res.json();
      if (channel === "WHATSAPP") {
        toast.success("Reminder queued. WhatsApp delivery requires Twilio configuration.", { duration: 5000 });
      } else {
        toast.success(`Reminder sent to ${students.find((s) => s.id === selectedStudent)?.name}`);
      }
      fetchLogs();
      setMessage("");
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to send reminder");
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-500" />
          Reminders
        </h1>
        <p className="text-slate-500 text-sm">Send direct reminders to your students</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">Send a Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendReminder} className="space-y-4">
              <div className="space-y-1">
                <Label>Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Channel</Label>
                <div className="flex gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChannel(c.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        channel === c.value
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "text-slate-600 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>
                {channel === "WHATSAPP" && (
                  <p className="text-xs text-amber-600 mt-1">
                    WhatsApp delivery requires Twilio to be configured. Message will be queued.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-slate-400 text-right">{message.length} chars</p>
              </div>

              <Button
                type="submit"
                disabled={sending || !selectedStudent || !message.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Reminder"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reminder history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Reminder History ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No reminders sent yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {logs.map((log: any) => (
                  <div key={log.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-medium text-slate-800 text-sm">{log.student?.name ?? "Unknown"}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className={`text-xs ${CHANNEL_COLORS[log.channel] ?? ""}`}>{log.channel}</Badge>
                        <Badge className={`text-xs ${STATUS_COLORS[log.status] ?? ""}`}>
                          {log.status === "SENT" ? <CheckCircle2 className="w-3 h-3 mr-1 inline" /> : <Clock className="w-3 h-3 mr-1 inline" />}
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{log.message}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {format(new Date(log.sentAt), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
