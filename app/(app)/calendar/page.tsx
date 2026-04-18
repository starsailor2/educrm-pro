"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const URGENCY_CLASSES: Record<string, string> = {
  RED: "border-l-4 border-l-red-500 bg-red-50",
  YELLOW: "border-l-4 border-l-amber-400 bg-amber-50",
  GREEN: "border-l-4 border-l-green-500 bg-green-50",
};
const TYPE_LABELS: Record<string, string> = {
  INTAKE_DEADLINE: "Intake Deadline", VISA_DEADLINE: "Visa Deadline",
  STUDENT_DEADLINE: "Student Deadline", APPOINTMENT: "Appointment",
};

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "INTAKE_DEADLINE", date: "", description: "", university: "", country: "", course: "" });

  function fetchEvents() { fetch("/api/calendar").then(r => r.json()).then(setEvents); }
  useEffect(() => { fetchEvents(); }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success("Event added!"); setShowAdd(false); fetchEvents(); }
  }

  const redEvents = events.filter(e => e.urgency === "RED");
  const yellowEvents = events.filter(e => e.urgency === "YELLOW");
  const greenEvents = events.filter(e => e.urgency === "GREEN");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-500" />Deadline Calendar</h1>
          <p className="text-slate-500 text-sm">University intakes, visa deadlines, and student milestones</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Event
        </Button>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
          <form onSubmit={addEvent} className="space-y-4 mt-2">
            <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v ?? "INTAKE_DEADLINE" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>University</Label><Input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Course</Label><Input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Event</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Urgency Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div><p className="text-2xl font-bold text-red-700">{redEvents.length}</p><p className="text-sm text-red-500">Critical (&lt;7 days)</p></div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-amber-500" />
          <div><p className="text-2xl font-bold text-amber-700">{yellowEvents.length}</p><p className="text-sm text-amber-500">Upcoming (&lt;30 days)</p></div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-green-500" />
          <div><p className="text-2xl font-bold text-green-700">{greenEvents.length}</p><p className="text-sm text-green-500">Future (&gt;30 days)</p></div>
        </div>
      </div>

      {/* Events */}
      <div className="space-y-3">
        {events.map(event => {
          const days = differenceInDays(new Date(event.date), new Date());
          return (
            <div key={event.id} className={cn("rounded-xl p-4", URGENCY_CLASSES[event.urgency] ?? "bg-white border")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{event.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                    {event.university && <span className="text-xs text-slate-500">{event.university}</span>}
                    {event.country && <span className="text-xs text-slate-500">· {event.country}</span>}
                    {event.course && <span className="text-xs text-slate-500">· {event.course}</span>}
                  </div>
                  {event.description && <p className="text-sm text-slate-600 mt-1">{event.description}</p>}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-slate-800">{format(new Date(event.date), "dd MMM yyyy")}</p>
                  <p className={cn("text-sm font-medium", days < 0 ? "text-slate-400" : days <= 7 ? "text-red-600" : days <= 30 ? "text-amber-600" : "text-green-600")}>
                    {days < 0 ? `${Math.abs(days)} days ago` : days === 0 ? "Today!" : `In ${days} days`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
