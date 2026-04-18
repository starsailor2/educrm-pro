"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, Plus, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700", PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700", CANCELLED: "bg-slate-100 text-slate-500",
};

export default function FinancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ studentId: "", type: "INVOICE", amount: "", currency: "USD", description: "", status: "PENDING", dueDate: "" });

  function fetchRecords() { fetch("/api/finance").then(r => r.json()).then(setRecords); }
  useEffect(() => { fetchRecords(); fetch("/api/students").then(r => r.json()).then(setStudents); }, []);

  const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + r.amount, 0);
  const totalPending = records.filter(r => r.status === "PENDING").reduce((s, r) => s + r.amount, 0);
  const totalOverdue = records.filter(r => r.status === "OVERDUE").reduce((s, r) => s + r.amount, 0);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), dueDate: form.dueDate ? new Date(form.dueDate) : undefined }),
    });
    if (res.ok) { toast.success("Record added!"); setShowAdd(false); fetchRecords(); }
    else toast.error("Failed to add record.");
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/finance/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...(status === "PAID" ? { paidDate: new Date() } : {}) }) });
    fetchRecords();
    toast.success("Status updated");
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-500" />Finance</h1>
          <p className="text-slate-500 text-sm">Invoices, payments, and commissions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Record
        </Button>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Finance Record</DialogTitle></DialogHeader>
          <form onSubmit={addRecord} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm(f => ({ ...f, studentId: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v ?? "INVOICE" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INVOICE">Invoice</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="COMMISSION">Commission</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Amount (USD)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
            <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Add Record</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Collected</p><p className="text-2xl font-bold text-slate-900">${totalPaid.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-slate-900">${totalPending.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-sm text-slate-500">Overdue</p><p className="text-2xl font-bold text-slate-900">${totalOverdue.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">All Records</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-slate-500 text-left">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Due Date</th>
                <th className="pb-3 font-medium">Invoice #</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium text-slate-800">{r.student?.name}</td>
                    <td className="py-3 text-slate-500">{r.type}</td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">{r.description}</td>
                    <td className="py-3 font-semibold">${r.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-500">{r.dueDate ? format(new Date(r.dueDate), "dd MMM yyyy") : "—"}</td>
                    <td className="py-3 text-slate-400 font-mono text-xs">{r.invoiceNumber ?? "—"}</td>
                    <td className="py-3"><Badge className={STATUS_COLORS[r.status] ?? ""}>{r.status}</Badge></td>
                    <td className="py-3">
                      {r.status === "PENDING" && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 text-xs" onClick={() => updateStatus(r.id, "PAID")}>
                          Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">No finance records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
