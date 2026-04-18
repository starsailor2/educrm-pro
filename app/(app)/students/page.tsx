"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Plus, Filter, Flame, Thermometer, Snowflake, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STAGES = ["INQUIRY", "COUNSELING", "DOCUMENT_COLLECTION", "APPLICATION_SUBMITTED", "OFFER_RECEIVED", "VISA_APPLIED", "VISA_APPROVED", "ENROLLED"];
const STAGE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry", COUNSELING: "Counseling", DOCUMENT_COLLECTION: "Documents",
  APPLICATION_SUBMITTED: "Applied", OFFER_RECEIVED: "Offer Received",
  VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved", ENROLLED: "Enrolled",
};
const STAGE_COLORS: Record<string, string> = {
  INQUIRY: "bg-slate-100 text-slate-700", COUNSELING: "bg-blue-100 text-blue-700",
  DOCUMENT_COLLECTION: "bg-indigo-100 text-indigo-700", APPLICATION_SUBMITTED: "bg-violet-100 text-violet-700",
  OFFER_RECEIVED: "bg-amber-100 text-amber-700", VISA_APPLIED: "bg-orange-100 text-orange-700",
  VISA_APPROVED: "bg-green-100 text-green-700", ENROLLED: "bg-emerald-100 text-emerald-700",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [tempFilter, setTempFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "", stage: "INQUIRY" });

  function fetchStudents() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stageFilter !== "all") params.set("stage", stageFilter);
    if (tempFilter !== "all") params.set("temp", tempFilter);
    fetch(`/api/students?${params}`).then((r) => r.json()).then(setStudents);
  }

  useEffect(() => { fetchStudents(); }, [search, stageFilter, tempFilter]);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success("Student added!"); setShowAdd(false); fetchStudents(); }
    else toast.error("Failed to add student.");
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm">{students.length} students in CRM</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Student
        </Button>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <form onSubmit={addStudent} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Source</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Website, Referral..." /></div>
            </div>
            <div className="space-y-1">
              <Label>Initial Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm(f => ({ ...f, stage: v ?? "INQUIRY" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Student</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? "all")}>
          <SelectTrigger className="w-44"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="All Stages" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tempFilter} onValueChange={(v) => setTempFilter(v ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Temperature" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Temps</SelectItem>
            <SelectItem value="HOT">Hot</SelectItem>
            <SelectItem value="WARM">Warm</SelectItem>
            <SelectItem value="COLD">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {students.map((s) => (
          <Link key={s.id} href={`/students/${s.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                    <TempIcon temp={s.leadTemperature} />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{s.email} · {s.phone ?? "No phone"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.counselor?.name ?? "Unassigned"} · Source: {s.source ?? "—"}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{s.leadScore}</p>
                    <p className="text-xs text-slate-400">Score</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[s.stage] ?? ""}`}>
                    {STAGE_LABELS[s.stage] ?? s.stage}
                  </span>
                  <div className="text-xs text-slate-400">
                    <p>{s._count.applications} apps</p>
                    <p>{s._count.documents} docs</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {students.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-medium">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TempIcon({ temp }: { temp: string }) {
  if (temp === "HOT") return <Flame className="w-4 h-4 text-red-500" />;
  if (temp === "WARM") return <Thermometer className="w-4 h-4 text-amber-500" />;
  return <Snowflake className="w-4 h-4 text-blue-400" />;
}
