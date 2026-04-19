"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, ClipboardList, Flame, Thermometer, Snowflake } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STAGE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry",
  COUNSELING: "Counseling",
  DOCUMENT_COLLECTION: "Documents",
  APPLICATION_SUBMITTED: "Applied",
  OFFER_RECEIVED: "Offer",
  VISA_APPLIED: "Visa Applied",
  VISA_APPROVED: "Visa Approved",
  ENROLLED: "Enrolled",
};
const STAGE_COLORS = ["#6366f1", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b", "#f97316", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const stageData = data.stageBreakdown.map((s: any) => ({
    name: STAGE_LABELS[s.stage] ?? s.stage,
    value: s._count,
  }));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your consultancy pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Students" value={data.totalStudents} icon={<Users className="w-5 h-5" />} color="blue" />
        <KpiCard title="Hot Leads" value={data.hotLeads} icon={<Flame className="w-5 h-5" />} color="red" sub={`${data.warmLeads} warm, ${data.coldLeads} cold`} />
        <KpiCard title="Revenue (Paid)" value={`$${(data.revenue).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color="green" />
        <KpiCard title="Pending Tasks" value={data.pendingTasks} icon={<ClipboardList className="w-5 h-5" />} color="amber" />
      </div>

      {/* Lead Temperature */}
      <div className="grid grid-cols-3 gap-4">
        <TemperatureCard label="Hot" count={data.hotLeads} icon={<Flame className="w-6 h-6 text-red-500" />} color="bg-red-50 border-red-200" />
        <TemperatureCard label="Warm" count={data.warmLeads} icon={<Thermometer className="w-6 h-6 text-amber-500" />} color="bg-amber-50 border-amber-200" />
        <TemperatureCard label="Cold" count={data.coldLeads} icon={<Snowflake className="w-6 h-6 text-blue-400" />} color="bg-blue-50 border-blue-200" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Stage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">Students by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stageData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip cursor={false} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {stageData.map((_: any, i: number) => (
                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">Recent Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentStudents.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email} · {s.counselor?.name ?? "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TempBadge temp={s.leadTemperature} />
                  <Badge variant="outline" className="text-xs">{STAGE_LABELS[s.stage] ?? s.stage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, color, sub }: { title: string; value: any; icon: React.ReactNode; color: string; sub?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TemperatureCard({ label, count, icon, color }: { label: string; count: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 ${color}`}>
      {icon}
      <div>
        <p className="text-2xl font-bold text-slate-800">{count}</p>
        <p className="text-sm text-slate-500">{label} Leads</p>
      </div>
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
