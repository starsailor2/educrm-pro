"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, Plus, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const TRIGGER_LABELS: Record<string, string> = {
  INACTIVITY: "Student Inactivity", STAGE_CHANGE: "Stage Change",
  DEADLINE_PROXIMITY: "Deadline Approaching", LEAD_SCORE: "Lead Score Threshold",
  PAYMENT_RECEIVED: "Payment Received",
};
const ACTION_LABELS: Record<string, string> = {
  SEND_WHATSAPP: "Send WhatsApp", SEND_EMAIL: "Send Email", SEND_SMS: "Send SMS",
  CREATE_TASK: "Create Task", REASSIGN: "Reassign Counselor",
};

export default function AutomationPage() {
  const router = useRouter();
  const [rules, setRules] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", triggerType: "INACTIVITY", condition: '{"days": 3}',
    delay: 0, actionType: "SEND_WHATSAPP", actionData: '{"template": "Hi {student_name}, just checking in!"}'
  });

  function fetchRules() { fetch("/api/automation/rules").then(r => r.json()).then(setRules); }
  useEffect(() => { fetchRules(); }, []);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/automation/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, delay: Number(form.delay) }),
    });
    if (res.ok) { toast.success("Rule created!"); setShowAdd(false); fetchRules(); }
    else toast.error("Failed to create rule.");
  }

  async function toggleRule(id: string, isActive: boolean) {
    await fetch(`/api/automation/rules/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchRules();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />Automation Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure automated nudges and triggers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/automation/guide")}>
            <BookOpen className="w-4 h-4 mr-2" />Guide
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />New Rule
          </Button>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Automation Rule</DialogTitle></DialogHeader>
          <form onSubmit={addRule} className="space-y-4 mt-2">
            <div className="space-y-1"><Label>Rule Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Trigger</Label>
                <Select value={form.triggerType} onValueChange={(v) => setForm(f => ({ ...f, triggerType: v ?? "INACTIVITY" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Action</Label>
                <Select value={form.actionType} onValueChange={(v) => setForm(f => ({ ...f, actionType: v ?? "SEND_WHATSAPP" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTION_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Delay (hours)</Label><Input type="number" value={form.delay} onChange={e => setForm(f => ({ ...f, delay: Number(e.target.value) }))} /></div>
            <div className="space-y-1"><Label>Condition (JSON)</Label><Textarea value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="font-mono text-sm h-20 resize-none" /></div>
            <div className="space-y-1"><Label>Action Data (JSON)</Label><Textarea value={form.actionData} onChange={e => setForm(f => ({ ...f, actionData: e.target.value }))} className="font-mono text-sm h-24 resize-none" /></div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">Create Rule</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rule.isActive ? "bg-amber-100" : "bg-slate-100"}`}>
                <Zap className={`w-5 h-5 ${rule.isActive ? "text-amber-600" : "text-slate-400"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{rule.name}</p>
                  {rule.isActive ? <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge> : <Badge className="bg-slate-100 text-slate-500 text-xs">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500">IF <strong>{TRIGGER_LABELS[rule.triggerType]}</strong></span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-xs text-slate-500">THEN <strong>{ACTION_LABELS[rule.actionType]}</strong></span>
                  {rule.delay > 0 && <span className="text-xs text-slate-400">after {rule.delay}h</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{rule._count?.nudgeLogs ?? 0} fired</span>
                <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id, rule.isActive)} />
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No automation rules yet</p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Available Personalization Tokens</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["{student_name}", "{university}", "{deadline}", "{counselor_name}", "{intake_month}", "{course}", "{country}", "{score}"].map(token => (
              <div key={token} className="bg-slate-100 rounded-lg px-3 py-2 text-sm font-mono text-slate-600">{token}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
