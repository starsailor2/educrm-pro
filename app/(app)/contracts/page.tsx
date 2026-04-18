"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PenLine, Plus, Check, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  STUDENT_SIGNED: "bg-blue-100 text-blue-700",
  FULLY_SIGNED: "bg-green-100 text-green-700",
  EXPIRED: "bg-slate-100 text-slate-500",
};

const CONTRACT_TEMPLATES: Record<string, string> = {
  SERVICE_AGREEMENT: `SERVICE AGREEMENT

This Service Agreement is entered into between EduCRM Pro Consultancy and the student named below.

1. SERVICES: University shortlisting, application assistance, visa support, pre-departure briefing.
2. FEES: As separately communicated.
3. CONFIDENTIALITY: All student information kept strictly confidential.
4. TERMS: Valid for the academic intake specified at signing.`,
  FEE_STRUCTURE: `FEE STRUCTURE AGREEMENT

Service Fee: As per agreed quotation
Payment Schedule: As discussed
Refund Policy: Non-refundable once application is submitted

By signing below, the student confirms understanding and agreement to the fee structure.`,
  TERMS_CONDITIONS: `TERMS AND CONDITIONS

1. The consultancy is not responsible for visa rejections.
2. All application deadlines must be met by the student.
3. Final admission decisions rest with the universities.
4. The consultancy will make best efforts to support the student throughout the process.

By signing, you agree to these terms.`,
};

export default function ContractsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;
  const isCounselor = role === "ADMIN" || role === "SENIOR_COUNSELOR" || role === "COUNSELOR";

  const [contracts, setContracts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [signRole, setSignRole] = useState<"counselor" | "student">("counselor");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    title: "",
    type: "SERVICE_AGREEMENT",
    content: CONTRACT_TEMPLATES.SERVICE_AGREEMENT,
  });

  function fetchContracts() {
    fetch("/api/contracts").then(r => r.json()).then(setContracts);
  }

  useEffect(() => {
    fetchContracts();
    fetch("/api/students").then(r => r.json()).then(setStudents);
  }, []);

  function updateTemplate(type: string) {
    setForm(f => ({ ...f, type, content: CONTRACT_TEMPLATES[type] ?? "" }));
  }

  async function createContract(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Contract created!");
      setShowAdd(false);
      setForm({ studentId: "", title: "", type: "SERVICE_AGREEMENT", content: CONTRACT_TEMPLATES.SERVICE_AGREEMENT });
      fetchContracts();
    } else {
      toast.error("Failed to create contract");
    }
  }

  function openSignDialog(contract: any, asRole: "counselor" | "student") {
    setSelectedContract(contract);
    setSignRole(asRole);
    setSignature("");
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function endDraw() {
    setIsDrawing(false);
    setSignature(canvasRef.current!.toDataURL());
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  }

  async function signContract() {
    if (!signature) { toast.error("Please draw your signature"); return; }
    const isSigningAsCounselor = signRole === "counselor";
    const alreadyHasOtherSig = isSigningAsCounselor
      ? !!selectedContract?.studentSignature
      : !!selectedContract?.counselorSignature;

    const data = isSigningAsCounselor
      ? {
          counselorSignature: signature,
          counselorSignedAt: new Date(),
          status: alreadyHasOtherSig ? "FULLY_SIGNED" : "PENDING",
        }
      : {
          studentSignature: signature,
          studentSignedAt: new Date(),
          status: alreadyHasOtherSig ? "FULLY_SIGNED" : "STUDENT_SIGNED",
        };

    const res = await fetch(`/api/contracts/${selectedContract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success(`Signed as ${isSigningAsCounselor ? "counselor" : "student"}!`);
      setSelectedContract(null);
      clearCanvas();
      fetchContracts();
    } else {
      toast.error("Failed to sign contract");
    }
  }

  const pendingCounselorSign = contracts.filter(c => !c.counselorSignedAt);
  const pendingStudentSign = contracts.filter(c => c.counselorSignedAt && !c.studentSignedAt);
  const fullySigned = contracts.filter(c => c.status === "FULLY_SIGNED");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PenLine className="w-6 h-6 text-violet-500" />
            Contracts
          </h1>
          <p className="text-slate-500 text-sm">Digital contracts with e-signature</p>
        </div>
        {isCounselor && (
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />New Contract
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Awaiting Counselor</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCounselorSign.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Awaiting Student</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{pendingStudentSign.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Fully Signed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{fullySigned.length}</p>
        </CardContent></Card>
      </div>

      {/* Create contract dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
          <form onSubmit={createContract} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Student</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm(f => ({ ...f, studentId: v ?? "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => v && updateTemplate(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE_AGREEMENT">Service Agreement</SelectItem>
                    <SelectItem value="FEE_STRUCTURE">Fee Structure</SelectItem>
                    <SelectItem value="TERMS_CONDITIONS">Terms & Conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Service Agreement — Student Name"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="h-48 text-sm font-mono resize-none"
              />
            </div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Create Contract</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contracts list */}
      <div className="space-y-4">
        {contracts.map(c => {
          const canCounselorSign = isCounselor && !c.counselorSignedAt;
          const canStudentSign = !c.studentSignedAt;

          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.student?.name} · {c.type.replace(/_/g, " ")} · Created {format(new Date(c.createdAt), "dd MMM yyyy")}
                      </p>
                      {c.counselor?.name && (
                        <p className="text-xs text-slate-400 mt-0.5">Counselor: {c.counselor.name}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs flex items-center gap-1.5">
                          {c.counselorSignedAt
                            ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-700">Counselor signed</span></>
                            : <><Clock className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-600">Awaiting counselor</span></>}
                        </span>
                        <span className="text-xs flex items-center gap-1.5">
                          {c.studentSignedAt
                            ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-700">Student signed</span></>
                            : <><Clock className="w-3.5 h-3.5 text-blue-400" /><span className="text-blue-600">Awaiting student</span></>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={STATUS_COLORS[c.status] ?? ""}>{c.status.replace(/_/g, " ")}</Badge>
                    {canCounselorSign && (
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => openSignDialog(c, "counselor")}>
                        <PenLine className="w-3 h-3 mr-1" />Sign as Counselor
                      </Button>
                    )}
                    {canStudentSign && c.status !== "FULLY_SIGNED" && (
                      <Button size="sm" variant="outline" onClick={() => openSignDialog(c, "student")}>
                        <PenLine className="w-3 h-3 mr-1" />Sign as Student
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {contracts.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <PenLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contracts yet</p>
            {isCounselor && (
              <p className="text-sm mt-1">Click "New Contract" to create one</p>
            )}
          </div>
        )}
      </div>

      {/* Sign dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => { if (!open) { setSelectedContract(null); clearCanvas(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Sign as {signRole === "counselor" ? "Counselor" : "Student"}: {selectedContract?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap border">
              {selectedContract?.content}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Signing as: <strong>{signRole === "counselor" ? "Counselor / Consultant" : "Student"}</strong>
            </div>
            <div className="space-y-2">
              <Label>Draw Your Signature</Label>
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="border-2 border-dashed border-slate-300 rounded-lg w-full cursor-crosshair bg-white"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
              />
              <Button variant="ghost" size="sm" onClick={clearCanvas}>Clear</Button>
            </div>
            <Button onClick={signContract} className="w-full bg-violet-600 hover:bg-violet-700">
              Confirm Signature
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
