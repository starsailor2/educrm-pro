"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function AIAssistantPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [type, setType] = useState("SOP");
  const [tone, setTone] = useState("formal");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [country, setCountry] = useState("");
  const [background, setBackground] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/students").then(r => r.json()).then(setStudents); }, []);

  async function generate() {
    setLoading(true);
    setOutput("");
    const student = students.find(s => s.id === selectedStudent);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type, studentName: student?.name ?? "Student",
        university, course, country, tone, background,
        englishScore: student?.englishScore && student?.englishScoreValue ? `${student.englishScore} ${student.englishScoreValue}` : undefined,
      }),
    });
    setLoading(false);
    if (res.ok) { const data = await res.json(); setOutput(data.content); }
    else toast.error("Failed to generate. Check your ANTHROPIC_API_KEY.");
  }

  function copyToClipboard() { navigator.clipboard.writeText(output); toast.success("Copied!"); }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-500" />AI Content Assistant
        </h1>
        <p className="text-slate-500 text-sm mt-1">Generate SOPs and visa letters with Claude AI</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Document Type</Label>
              <Tabs value={type} onValueChange={setType}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="SOP">Statement of Purpose</TabsTrigger>
                  <TabsTrigger value="VISA_LETTER">Visa Cover Letter</TabsTrigger>
                </TabsList>
                <TabsContent value="SOP" /><TabsContent value="VISA_LETTER" />
              </Tabs>
            </div>
            <div className="space-y-1">
              <Label>Student</Label>
              <Select value={selectedStudent} onValueChange={(v) => setSelectedStudent(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>University</Label><Input value={university} onChange={e => setUniversity(e.target.value)} placeholder="University of Toronto" /></div>
              <div className="space-y-1"><Label>Course</Label><Input value={course} onChange={e => setCourse(e.target.value)} placeholder="Computer Science" /></div>
              <div className="space-y-1"><Label>Country</Label><Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Canada" /></div>
              <div className="space-y-1">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v ?? "formal")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="semi-formal">Semi-formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {type === "SOP" && (
              <div className="space-y-1">
                <Label>Academic Background (optional)</Label>
                <Textarea value={background} onChange={e => setBackground(e.target.value)} placeholder="Brief academic and work experience summary..." className="h-24 resize-none" />
              </div>
            )}
            <Button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Generated Content</CardTitle>
              {output && <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="w-4 h-4 mr-1" />Copy</Button>}
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-500" /><p className="text-sm">Claude is writing...</p></div>
              </div>
            )}
            {!loading && !output && (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <div className="text-center"><Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Configure and click Generate</p></div>
              </div>
            )}
            {!loading && output && (
              <Textarea value={output} onChange={e => setOutput(e.target.value)} className="min-h-[400px] text-sm font-mono resize-none border-0 p-0 focus-visible:ring-0" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
