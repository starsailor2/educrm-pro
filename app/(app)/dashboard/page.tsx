"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, DollarSign, ClipboardList, Flame, Thermometer, Snowflake,
  FileCheck, CheckCircle2, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";

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
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
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

  if (role === "ADMIN") return <AdminDashboard data={data} />;
  return <CounsellorDashboard data={data} />;
}

function AdminDashboard({ data }: { data: any }) {
  const stageData = data.stageBreakdown.map((s: any) => ({
    name: STAGE_LABELS[s.stage] ?? s.stage,
    value: s._count,
  }));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Organisation-wide overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Students" value={data.totalStudents} icon={<Users className="w-5 h-5" />} color="blue" />
        <KpiCard title="Hot Leads" value={data.hotLeads} icon={<Flame className="w-5 h-5" />} color="red" sub={`${data.warmLeads} warm, ${data.coldLeads} cold`} />
        <KpiCard title="Revenue (Paid)" value={`$${data.revenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color="green" />
        <KpiCard title="Conversion Rate" value={`${data.conversionRate ?? 0}%`} icon={<TrendingUp className="w-5 h-5" />} color="purple" sub="Inquiry → Enrolled" />
      </div>

      {/* Admin-specific cards */}
      <div className="grid grid-cols-3 gap-4">
        <TemperatureCard label="Hot" count={data.hotLeads} icon={<Flame className="w-6 h-6 text-red-500" />} color="bg-red-50 border-red-200" />
        <TemperatureCard label="Warm" count={data.warmLeads} icon={<Thermometer className="w-6 h-6 text-amber-500" />} color="bg-amber-50 border-amber-200" />
        <Link href="/documents?filter=pending_review">
          <div className="border rounded-xl p-4 flex items-center gap-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors">
            <FileCheck className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">{data.pendingReviews ?? 0}</p>
              <p className="text-sm text-slate-500">Docs Pending Review</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

      {/* Counsellor Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-700">Counsellor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs">
                  <th className="text-left py-2 font-medium">Counsellor</th>
                  <th className="text-right py-2 font-medium">Students</th>
                  <th className="text-right py-2 font-medium">Hot Leads</th>
                  <th className="text-right py-2 font-medium">Enrolled</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data.counsellorStats ?? []).map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-2.5">
                      <p className="font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </td>
                    <td className="text-right py-2.5 text-slate-700">{c.totalStudents}</td>
                    <td className="text-right py-2.5">
                      <span className="text-red-600 font-medium">{c.hotLeads}</span>
                    </td>
                    <td className="text-right py-2.5">
                      <span className="text-green-600 font-medium">{c.enrolled}</span>
                    </td>
                    <td className="text-right py-2.5 text-slate-700">${c.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CounsellorDashboard({ data }: { data: any }) {
  const stageData = data.stageBreakdown.map((s: any) => ({
    name: STAGE_LABELS[s.stage] ?? s.stage,
    value: s._count,
  }));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your students and follow-ups</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="My Students" value={data.totalStudents} icon={<Users className="w-5 h-5" />} color="blue" />
        <KpiCard title="Hot Leads" value={data.hotLeads} icon={<Flame className="w-5 h-5" />} color="red" sub={`${data.warmLeads} warm, ${data.coldLeads} cold`} />
        <KpiCard title="Revenue (Paid)" value={`$${data.revenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color="green" />
        <KpiCard title="Pending Tasks" value={data.pendingTasks} icon={<ClipboardList className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Stage chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">My Students by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip cursor={false} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">Priority Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.followUps ?? []).length === 0 ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                No urgent follow-ups today
              </div>
            ) : (
              <div className="space-y-3">
                {(data.followUps ?? []).map((s: any) => (
                  <Link key={s.id} href={`/students/${s.id}`}>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-1 cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TempBadge temp={s.leadTemperature} />
                        <Badge variant="outline" className="text-xs">{STAGE_LABELS[s.stage] ?? s.stage}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
              <Link key={s.id} href={`/students/${s.id}`}>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-1 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TempBadge temp={s.leadTemperature} />
                    <Badge variant="outline" className="text-xs">{STAGE_LABELS[s.stage] ?? s.stage}</Badge>
                  </div>
                </div>
              </Link>
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
    purple: "bg-purple-100 text-purple-600",
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
