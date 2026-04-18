"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserCircle, Clock, Plus, Bell, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const STAGES = ["INQUIRY", "COUNSELING", "DOCUMENT_COLLECTION", "APPLICATION_SUBMITTED", "OFFER_RECEIVED", "VISA_APPLIED", "VISA_APPROVED", "ENROLLED"];
const STAGE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry", COUNSELING: "Counseling", DOCUMENT_COLLECTION: "Document Collection",
  APPLICATION_SUBMITTED: "Application Submitted", OFFER_RECEIVED: "Offer Received",
  VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved", ENROLLED: "Enrolled",
};

export default function PortalPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mForm, setMForm] = useState({ studentId: "", title: "", type: "INTERVIEW", date: "", parentEmail: "" });

  function fetchData() {
    fetch("/api/students").then(r => r.json()).then(setStudents);
    fetch("/api/milestones").then(r => r.json()).then(setMilestones);
  }
  useEffect(() => { fetchData(); }, []);

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/milestones", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...mForm, date: new Date(mForm.date) }),
    });
    if (res.ok) { toast.success("Milestone added!"); setShowAddMilestone(false); fetchData(); }
  }

  const studentMilestones = milestones.filter(m => m.studentId === selected?.id);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserCircle className="w-6 h-6 text-teal-500" />Student Self-Service Portal</h1>
          <p className="text-slate-500 text-sm">Student journey tracker, milestones, and alerts</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddMilestone(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Milestone
        </Button>
      </div>

      <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
          <form onSubmit={addMilestone} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Student</Label>
              <Select value={mForm.studentId} onValueChange={(v) => setMForm(f => ({ ...f, studentId: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={mForm.type} onValueChange={(v) => setMForm(f => ({ ...f, type: v ?? "INTERVIEW" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="VISA_APPOINTMENT">Visa Appointment</SelectItem>
                    <SelectItem value="FEE_DEADLINE">Fee Deadline</SelectItem>
                    <SelectItem value="OFFER_EXPIRY">Offer Expiry</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={mForm.date} onChange={e => setMForm(f => ({ ...f, date: e.target.value }))} required /></div>
            </div>
            <div className="space-y-1"><Label>Title</Label><Input value={mForm.title} onChange={e => setMForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-1"><Label>Parent Email (optional)</Label><Input type="email" value={mForm.parentEmail} onChange={e => setMForm(f => ({ ...f, parentEmail: e.target.value }))} placeholder="parent@example.com" /></div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Add Milestone</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Student List */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Students ({students.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {students.map(s => (
              <button key={s.id} onClick={() => setSelected(s)}
                className={cn("w-full text-left p-3 rounded-lg border transition-colors", selected?.id === s.id ? "border-teal-400 bg-teal-50" : "border-transparent hover:bg-slate-50")}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{STAGE_LABELS[s.stage] ?? s.stage}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          {selected ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Application Roadmap — {selected.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">{STAGE_LABELS[selected.stage]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div className="space-y-4">
                      {STAGES.map((stage, i) => {
                        const current = STAGES.indexOf(selected.stage);
                        const done = i < current;
                        const active = i === current;
                        return (
                          <div key={stage} className="flex items-center gap-4 pl-2">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0", done ? "bg-green-500" : active ? "bg-blue-600" : "bg-slate-200")}>
                              {done ? <CheckCircle className="w-4 h-4 text-white" /> : <div className={cn("w-2 h-2 rounded-full", active ? "bg-white" : "bg-slate-400")} />}
                            </div>
                            <span className={cn("text-sm", active ? "font-bold text-blue-700" : done ? "text-slate-400 line-through" : "text-slate-400")}>
                              {STAGE_LABELS[stage]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Milestones & Alerts ({studentMilestones.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {studentMilestones.map(m => {
                    const days = differenceInDays(new Date(m.date), new Date());
                    return (
                      <div key={m.id} className={cn("flex items-center justify-between p-3 rounded-lg border", days <= 3 ? "bg-red-50 border-red-200" : days <= 7 ? "bg-amber-50 border-amber-200" : "bg-white")}>
                        <div className="flex items-center gap-3">
                          <Clock className={cn("w-5 h-5", days <= 3 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-slate-400")} />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{m.title}</p>
                            <p className="text-xs text-slate-500">{m.type} · {format(new Date(m.date), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {days <= 7 && !m.isCompleted && <Bell className="w-4 h-4 text-amber-500" />}
                          <span className={cn("text-xs font-medium", days < 0 ? "text-slate-400" : days <= 3 ? "text-red-600" : days <= 7 ? "text-amber-600" : "text-green-600")}>
                            {days < 0 ? "Overdue" : days === 0 ? "Today!" : `${days}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {studentMilestones.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No milestones set for this student</p>}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a student to view their portal</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
