"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Upload, Check, X, AlertCircle, Clock, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const DOC_TYPES = ["PASSPORT", "TRANSCRIPT", "IELTS", "TOEFL", "SOP", "LOR", "FINANCIAL", "OTHER"];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
  PENDING_REVIEW: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PENDING_REVIEW: "Awaiting Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  VERIFIED: "Verified",
};

const ALL_TABS = ["All", "Awaiting Review", "Pending", "Approved", "Rejected"] as const;
const COUNSELLOR_TABS = ["All", "Pending", "Awaiting Review", "Approved", "Rejected"] as const;

const TAB_TO_STATUS: Record<string, string | null> = {
  "All": null,
  "Awaiting Review": "PENDING_REVIEW",
  "Pending": "PENDING",
  "Approved": "APPROVED",
  "Rejected": "REJECTED",
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const searchParams = useSearchParams();

  const [docs, setDocs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [docType, setDocType] = useState("PASSPORT");
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [rejectDialogDoc, setRejectDialogDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Honour ?filter=pending_review from dashboard link
  useEffect(() => {
    if (searchParams.get("filter") === "pending_review") setActiveTab("Awaiting Review");
  }, [searchParams]);

  function fetchDocs() {
    const statusParam = TAB_TO_STATUS[activeTab];
    const url = statusParam ? `/api/documents?status=${statusParam}` : "/api/documents";
    fetch(url).then(r => r.json()).then(setDocs);
  }

  useEffect(() => { fetchDocs(); }, [activeTab]);
  useEffect(() => { fetch("/api/students").then(r => r.json()).then(setStudents); }, []);

  async function uploadDoc(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !studentId) { toast.error("Select a student and file"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("studentId", studentId);
    fd.append("type", docType);
    fd.append("name", docName || file.name);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      toast.success("Uploaded!");
      fetchDocs();
      if (fileRef.current) fileRef.current.value = "";
      setDocName("");
    } else {
      toast.error("Upload failed.");
    }
  }

  async function updateStatus(id: string, status: string, extra?: Record<string, string>) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    if (res.ok) {
      fetchDocs();
      toast.success(`Document marked as ${STATUS_LABELS[status] ?? status}`);
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Action failed");
    }
  }

  async function handleReject() {
    if (!rejectDialogDoc) return;
    await updateStatus(rejectDialogDoc.id, "REJECTED", { rejectionReason });
    setRejectDialogDoc(null);
    setRejectionReason("");
  }

  const expiringDocs = docs.filter(d => d.isExpiringSoon);
  const tabs = role === "ADMIN" ? ALL_TABS : COUNSELLOR_TABS;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          Documents
        </h1>
        <p className="text-slate-500 text-sm">
          {role === "ADMIN" ? "Review and approve student documents" : "Upload and submit documents for review"}
        </p>
      </div>

      {expiringDocs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {expiringDocs.length} document(s) expiring soon: {expiringDocs.map((d: any) => d.name).join(", ")}
          </p>
        </div>
      )}

      {/* Upload — both roles */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Upload Document</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={uploadDoc} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1 min-w-48">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={(v) => setStudentId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v ?? "PASSPORT")}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-40">
              <Label>Name (optional)</Label>
              <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. IELTS Certificate" />
            </div>
            <div className="space-y-1">
              <Label>File</Label>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="block text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-sm file:bg-white hover:file:bg-slate-50" />
            </div>
            <Button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
              <Upload className="w-4 h-4 mr-2" />{uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {activeTab === "All" ? `All Documents (${docs.length})` : `${activeTab} (${docs.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{doc.name}</p>
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      {doc.isExpiringSoon && <Badge className="bg-red-100 text-red-700 text-xs">Expiring Soon</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">
                      {doc.student?.name} · {format(new Date(doc.uploadedAt), "dd MMM yyyy")}
                    </p>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-0.5">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_COLORS[doc.status] ?? ""}>
                    {STATUS_LABELS[doc.status] ?? doc.status}
                  </Badge>

                  {/* Counsellor: can submit PENDING docs for review */}
                  {role !== "ADMIN" && doc.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 text-xs"
                      onClick={() => updateStatus(doc.id, "PENDING_REVIEW")}
                    >
                      <Send className="w-3 h-3 mr-1" />Submit for Review
                    </Button>
                  )}

                  {/* Admin: can approve / reject PENDING_REVIEW docs */}
                  {role === "ADMIN" && doc.status === "PENDING_REVIEW" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300 text-xs"
                        onClick={() => updateStatus(doc.id, "APPROVED")}
                      >
                        <Check className="w-3 h-3 mr-1" />Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 text-xs"
                        onClick={() => setRejectDialogDoc(doc)}
                      >
                        <X className="w-3 h-3 mr-1" />Reject
                      </Button>
                    </div>
                  )}

                  {doc.fileUrl && doc.fileUrl !== "#" && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View</a>
                  )}
                </div>
              </div>
            ))}
            {docs.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No documents in this category</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject dialog (admin only) */}
      <Dialog open={!!rejectDialogDoc} onOpenChange={(open) => { if (!open) { setRejectDialogDoc(null); setRejectionReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">
              Rejecting <span className="font-medium">{rejectDialogDoc?.name}</span> for {rejectDialogDoc?.student?.name}
            </p>
            <div className="space-y-1">
              <Label>Reason for rejection</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document is expired, please upload a valid copy"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialogDoc(null); setRejectionReason(""); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject} disabled={!rejectionReason.trim()}>
              <X className="w-4 h-4 mr-1" />Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
