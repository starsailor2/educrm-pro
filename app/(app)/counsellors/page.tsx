"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserCog, ChevronDown, ChevronRight, Users, Flame, DollarSign, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STAGE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry", COUNSELING: "Counseling", DOCUMENT_COLLECTION: "Documents",
  APPLICATION_SUBMITTED: "Applied", OFFER_RECEIVED: "Offer",
  VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved", ENROLLED: "Enrolled",
};

export default function CounsellorManagementPage() {
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/counsellors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCounsellors(data);
        else toast.error("Failed to load counsellors");
      });
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-indigo-500" />
          Counsellors
        </h1>
        <p className="text-slate-500 text-sm">Manage counsellors and their student assignments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Counsellors"
          value={counsellors.length}
          icon={<UserCog className="w-5 h-5" />}
          color="bg-indigo-100 text-indigo-600"
        />
        <SummaryCard
          label="Total Students"
          value={counsellors.reduce((s, c) => s + c.totalStudents, 0)}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          label="Total Revenue"
          value={`$${counsellors.reduce((s, c) => s + c.revenue, 0).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Counsellors list */}
      <div className="space-y-4">
        {counsellors.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggle(c.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 text-sm">
                  {c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Stat label="Students" value={c.totalStudents} icon={<Users className="w-4 h-4 text-blue-500" />} />
                <Stat label="Hot Leads" value={c.hotLeads} icon={<Flame className="w-4 h-4 text-red-500" />} />
                <Stat label="Enrolled" value={c.enrolled} icon={<GraduationCap className="w-4 h-4 text-green-500" />} />
                <Stat label="Revenue" value={`$${c.revenue.toLocaleString()}`} icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
                <div className="text-slate-400">
                  {expanded[c.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {expanded[c.id] && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Assigned Students</p>
                <div className="space-y-2">
                  {c.students.length === 0 ? (
                    <p className="text-sm text-slate-400">No students assigned</p>
                  ) : (
                    c.students.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TempBadge temp={s.leadTemperature} />
                          <Badge variant="outline" className="text-xs">{STAGE_LABELS[s.stage] ?? s.stage}</Badge>
                          <Link href={`/students/${s.id}`}>
                            <Button size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-700 h-7 px-2">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}

        {counsellors.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No counsellors found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      {icon}
      <span className="font-medium">{value}</span>
      <span className="text-slate-400 text-xs hidden xl:inline">{label}</span>
    </div>
  );
}

function TempBadge({ temp }: { temp: string }) {
  const map: Record<string, string> = {
    HOT: "bg-red-100 text-red-700",
    WARM: "bg-amber-100 text-amber-700",
    COLD: "bg-blue-100 text-blue-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[temp] ?? ""}`}>{temp}</span>;
}
