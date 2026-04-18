"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Flame, Thermometer, Snowflake, Edit, Plus, FileText, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import Link from "next/link";

const STAGES = ["INQUIRY", "COUNSELING", "DOCUMENT_COLLECTION", "APPLICATION_SUBMITTED", "OFFER_RECEIVED", "VISA_APPLIED", "VISA_APPROVED", "ENROLLED"];
const STAGE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry", COUNSELING: "Counseling", DOCUMENT_COLLECTION: "Documents",
  APPLICATION_SUBMITTED: "Applied", OFFER_RECEIVED: "Offer Received",
  VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved", ENROLLED: "Enrolled",
};

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [scoring, setScoring] = useState(false);

  useEffect(() => { fetchStudent(); }, [id]);

  async function fetchStudent() {
    const res = await fetch(`/api/students/${id}`);
    if (res.ok) setStudent(await res.json());
  }

  async function updateStage(stage: string) {
    await fetch(`/api/students/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) });
    toast.success(`Stage updated to ${STAGE_LABELS[stage]}`);
    fetchStudent();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id, content: noteText }) });
    if (res.ok) { setNoteText(""); fetchStudent(); toast.success("Note added"); }
  }

  async function scoreStudent() {
    setScoring(true);
    const res = await fetch(`/api/ai/score`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id }) });
    if (res.ok) { fetchStudent(); toast.success("AI score updated"); }
    setScoring(false);
  }

  if (!student) return <div className="p-8 animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64" /><div className="h-64 bg-gray-200 rounded" /></div>;

  const stageIndex = STAGES.indexOf(student.stage);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                <TempIcon temp={student.leadTemperature} />
              </div>
              <p className="text-slate-500 text-sm">{student.email} · {student.phone ?? "No phone"}</p>
            </div>
          </div>
        </div>
        <Button onClick={scoreStudent} disabled={scoring} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
          {scoring ? "Scoring..." : "AI Score"}
        </Button>
      </div>

      {/* Stage Pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STAGES.map((stage, i) => (
              <button key={stage} onClick={() => updateStage(stage)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${i === stageIndex ? "bg-blue-600 text-white border-blue-600" : i < stageIndex ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}>
                {STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Nationality" value={student.nationality} />
            <Row label="Passport" value={student.passportNumber} />
            <Row label="Passport Expiry" value={student.passportExpiry ? format(new Date(student.passportExpiry), "dd MMM yyyy") : null} />
            <Row label="Qualification" value={student.highestQualification} />
            <Row label="Grade" value={student.gradePercentage ? `${student.gradePercentage}%` : null} />
            <Row label="English" value={student.englishScore ? `${student.englishScore}: ${student.englishScoreValue}` : null} />
            <Row label="Budget" value={student.budget ? `$${student.budget.toLocaleString()}` : null} />
            <Row label="Intake" value={student.intakeMonth && student.intakeYear ? `${student.intakeMonth} ${student.intakeYear}` : null} />
            <Row label="Source" value={student.source} />
            <Row label="Counselor" value={student.counselor?.name} />
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lead Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${student.leadScore}%` }} />
                  </div>
                  <span className="font-bold text-slate-800">{student.leadScore}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="notes">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <form onSubmit={addNote} className="flex gap-2">
                <Textarea placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} className="flex-1 min-h-0 h-10 resize-none" />
                <Button type="submit" size="sm">Add</Button>
              </form>
              <div className="space-y-3">
                {student.notes?.map((n: any) => (
                  <div key={n.id} className="bg-white border rounded-lg p-3">
                    <p className="text-sm text-slate-800">{n.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.author?.name} · {format(new Date(n.createdAt), "dd MMM yyyy HH:mm")}</p>
                  </div>
                ))}
                {!student.notes?.length && <p className="text-sm text-slate-400 text-center py-8">No notes yet</p>}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-3 mt-4">
              {student.applications?.map((a: any) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{a.university}</p>
                        <p className="text-sm text-slate-500">{a.course} · {a.country} · {a.intake}</p>
                        {a.tuitionFee && <p className="text-xs text-slate-400">Tuition: ${a.tuitionFee.toLocaleString()}</p>}
                      </div>
                      <Badge className={a.status === "OFFER_RECEIVED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                        {a.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!student.applications?.length && <p className="text-sm text-slate-400 text-center py-8">No applications yet</p>}
            </TabsContent>

            <TabsContent value="documents" className="space-y-3 mt-4">
              {student.documents?.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.type} · {format(new Date(d.uploadedAt), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <Badge className={d.status === "APPROVED" ? "bg-green-100 text-green-700" : d.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                    {d.status}
                  </Badge>
                </div>
              ))}
              {!student.documents?.length && <p className="text-sm text-slate-400 text-center py-8">No documents uploaded</p>}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-3 mt-4">
              {student.milestones?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-400">{format(new Date(m.date), "dd MMM yyyy")} · {m.type}</p>
                    </div>
                  </div>
                  {m.isCompleted && <Badge className="bg-green-100 text-green-700">Done</Badge>}
                </div>
              ))}
              {!student.milestones?.length && <p className="text-sm text-slate-400 text-center py-8">No milestones set</p>}
            </TabsContent>

            <TabsContent value="finance" className="space-y-3 mt-4">
              {student.financeRecords?.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{f.description}</p>
                    <p className="text-xs text-slate-400">{f.type} · {f.invoiceNumber ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">${f.amount.toLocaleString()}</p>
                    <Badge className={f.status === "PAID" ? "bg-green-100 text-green-700" : f.status === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                      {f.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {!student.financeRecords?.length && <p className="text-sm text-slate-400 text-center py-8">No finance records</p>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value ?? "—"}</span>
    </div>
  );
}

function TempIcon({ temp }: { temp: string }) {
  if (temp === "HOT") return <Flame className="w-5 h-5 text-red-500" />;
  if (temp === "WARM") return <Thermometer className="w-5 h-5 text-amber-500" />;
  return <Snowflake className="w-5 h-5 text-blue-400" />;
}
