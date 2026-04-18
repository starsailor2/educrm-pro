"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CHANNEL_COLORS: Record<string, string> = {
  WHATSAPP: "bg-green-100 text-green-700", EMAIL: "bg-blue-100 text-blue-700",
  SMS: "bg-violet-100 text-violet-700", IN_APP: "bg-slate-100 text-slate-700",
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [newStudentId, setNewStudentId] = useState("");
  const [newChannel, setNewChannel] = useState("EMAIL");
  const [newMsg, setNewMsg] = useState("");
  const [showNew, setShowNew] = useState(false);

  function fetchConvs() { fetch("/api/conversations").then(r => r.json()).then(setConversations); }
  useEffect(() => {
    fetchConvs();
    fetch("/api/students").then(r => r.json()).then(setStudents);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/conversations/${selected.id}/messages`).then(r => r.json()).then(setMessages);
  }, [selected]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    const res = await fetch(`/api/conversations/${selected.id}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply }),
    });
    if (res.ok) { const msg = await res.json(); setMessages(m => [...m, msg]); setReply(""); }
  }

  async function startConversation(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: newStudentId, channel: newChannel, content: newMsg }),
    });
    if (res.ok) { toast.success("Conversation started"); setShowNew(false); fetchConvs(); }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversation list */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Inbox</h2>
          <Button size="sm" variant="outline" onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => setSelected(conv)}
              className={cn("w-full text-left p-4 border-b hover:bg-slate-50 transition-colors", selected?.id === conv.id && "bg-blue-50 border-l-2 border-l-blue-500")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{conv.student?.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.messages?.[0]?.content ?? "No messages"}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <Badge className={`text-xs ${CHANNEL_COLORS[conv.channel] ?? ""}`}>{conv.channel}</Badge>
                  {!conv.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{format(new Date(conv.updatedAt), "dd MMM HH:mm")}</p>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Message thread */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {selected.student?.name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{selected.student?.name}</p>
              <p className="text-xs text-slate-400">{selected.channel}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex", msg.senderType === "COUNSELOR" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm", msg.senderType === "COUNSELOR" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border")}>
                  <p>{msg.content}</p>
                  <p className={cn("text-xs mt-1", msg.senderType === "COUNSELOR" ? "text-blue-200" : "text-slate-400")}>
                    {msg.sender?.name ?? "Student"} · {format(new Date(msg.sentAt), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendReply} className="p-4 bg-white border-t flex gap-3">
            <Input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a reply..." className="flex-1" />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Select a conversation</p>
          </div>
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Conversation</DialogTitle></DialogHeader>
          <form onSubmit={startConversation} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Student</Label>
              <Select value={newStudentId} onValueChange={(v) => setNewStudentId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Channel</Label>
              <Select value={newChannel} onValueChange={(v) => setNewChannel(v ?? "EMAIL")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type your message..." required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Send</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
