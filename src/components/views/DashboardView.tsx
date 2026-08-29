"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import {
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  AlertOctagon,
  ClipboardCheck,
  Clock,
  Minus,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui";
import type { AppData } from "@/lib/types";
import type { Summary } from "@/lib/analytics";
import { elementScore, incidentDistribution } from "@/lib/analytics";
import { auditGrade, fmt, fmtInt, riskLevelFR, riskLevelSR } from "@/lib/k3";

const PIE_COLORS = ["#F59E0B", "#38BDF8", "#DC2626", "#7F1D1D"];

function KpiCard({
  title,
  value,
  unit,
  icon,
  tone,
  footer,
}: {
  title: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  tone: "navy" | "green" | "amber" | "red" | "blue";
  footer?: ReactNode;
}) {
  const bar: Record<string, string> = {
    navy: "from-[#0B2545] to-[#13315C]",
    green: "from-emerald-600 to-emerald-500",
    amber: "from-amber-500 to-amber-400",
    red: "from-red-600 to-red-500",
    blue: "from-sky-600 to-sky-500",
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${bar[tone]}`} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-[#0B2545]">
            {icon}
          </span>
        </div>
        <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#0B2545]">
          {value}
          {unit && <span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span>}
        </p>
        <div className="mt-2">{footer}</div>
      </div>
    </div>
  );
}

function Trend({ delta, invert = true }: { delta: number; invert?: boolean }) {
  const improving = invert ? delta < 0 : delta > 0;
  if (Math.abs(delta) < 0.001)
    return (
      <Badge tone="slate">
        <Minus size={11} /> Stabil
      </Badge>
    );
  return (
    <Badge tone={improving ? "green" : "red"}>
      {improving ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
      {improving ? "Membaik" : "Memburuk"} {fmt(Math.abs(delta))}
    </Badge>
  );
}

export default function DashboardView({ data, summary }: { data: AppData; summary: Summary }) {
  const latest = summary.latest;
  const trendData = summary.list.map((p) => ({
    name: p.monthName.split(" ")[0].slice(0, 3),
    FR: Number(p.fr.toFixed(2)),
    SR: Number(p.sr.toFixed(2)),
    ManHours: p.manHours,
  }));
  const dist = incidentDistribution(data.incidents).filter((d) => d.value > 0);
  const elementData = data.audit.map((a) => ({
    name: `E${a.elementNo}`,
    full: a.name,
    pct: elementScore(a),
  }));
  const grade = auditGrade(summary.auditScorePct);
  const frRisk = riskLevelFR(latest?.fr ?? 0);
  const srRisk = riskLevelSR(latest?.sr ?? 0);

  const monthIncidents = data.incidents.filter((i) => i.eventDate.startsWith("2025-08"));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-[#0B2545] via-[#13315C] to-[#1B4079] p-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-amber-300">
              Executive Safety Summary
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Kinerja K3 {latest ? latest.monthName : "—"}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Mengacu pada PP No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan
              Kesehatan Kerja
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl bg-white/10 px-3 py-2 text-xs">
              Tenaga Kerja:{" "}
              <b className="text-amber-300">{fmtInt(latest?.workers ?? 0)} orang</b>
            </span>
            <span className="rounded-xl bg-white/10 px-3 py-2 text-xs">
              Man Hours Bulan Ini:{" "}
              <b className="text-amber-300">{fmtInt(latest?.manHours ?? 0)} jam</b>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Safe Man Hours"
          value={fmtInt(summary.safeManHours)}
          unit="jam"
          tone="green"
          icon={<Clock size={16} />}
          footer={<Badge tone="green"><ShieldCheck size={11} /> Tanpa LTI</Badge>}
        />
        <KpiCard
          title="Frequency Rate (FR)"
          value={fmt(latest?.fr ?? 0)}
          unit="/10⁶ jam"
          tone="amber"
          icon={<Activity size={16} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <Trend delta={summary.frTrend} />
              <Badge tone={frRisk.tone}>{frRisk.label}</Badge>
            </div>
          }
        />
        <KpiCard
          title="Severity Rate (SR)"
          value={fmt(latest?.sr ?? 0)}
          unit="/10⁶ jam"
          tone="red"
          icon={<AlertOctagon size={16} />}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <Trend delta={summary.srTrend} />
              <Badge tone={srRisk.tone}>{srRisk.label}</Badge>
            </div>
          }
        />
        <KpiCard
          title="Insiden & Near Miss Bulan Ini"
          value={`${monthIncidents.length}`}
          unit="laporan"
          tone="blue"
          icon={<AlertOctagon size={16} />}
          footer={
            <Badge tone={summary.openIncidents > 0 ? "amber" : "green"}>
              {summary.openIncidents} belum selesai
            </Badge>
          }
        />
        <KpiCard
          title="Kepatuhan Audit SMK3"
          value={fmt(summary.auditScorePct, 1)}
          unit="%"
          tone="navy"
          icon={<ClipboardCheck size={16} />}
          footer={<Badge tone={grade.tone}>{grade.flag}</Badge>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Tren Bulanan FR vs SR"
          subtitle="Perbandingan Frequency Rate dan Severity Rate per juta jam kerja"
          icon={<Activity size={16} />}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="frGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="srGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, borderColor: "#CBD5E1" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="FR"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#frGrad)"
                  name="Frequency Rate"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="SR"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  fill="url(#srGrad)"
                  name="Severity Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Distribusi Kategori Insiden"
          subtitle={`Total ${data.incidents.length} laporan terdata`}
          icon={<AlertOctagon size={16} />}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="none"
                >
                  {dist.map((d, i) => (
                    <Cell key={d.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Pemenuhan 12 Elemen SMK3 (PP 50/2012)"
          subtitle="Persentase kepatuhan tiap elemen berdasarkan self-assessment"
          icon={<ClipboardCheck size={16} />}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elementData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => [`${Number(v)}%`, "Kepatuhan"]}
                  labelFormatter={(l) =>
                    elementData.find((e) => e.name === String(l))?.full ?? String(l)
                  }
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} name="Kepatuhan">
                  {elementData.map((e) => (
                    <Cell
                      key={e.name}
                      fill={e.pct >= 85 ? "#059669" : e.pct >= 50 ? "#F59E0B" : "#DC2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Man Hours & Kecelakaan"
          subtitle="Beban kerja vs jumlah kejadian kecelakaan"
          icon={<Clock size={16} />}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={summary.list.map((p) => ({
                  name: p.monthName.split(" ")[0].slice(0, 3),
                  ManHours: p.manHours,
                  Kecelakaan: p.accidents,
                }))}
                margin={{ top: 6, right: 8, left: -28, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  stroke="#94A3B8"
                  width={28}
                />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="ManHours" fill="#13315C" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="Kecelakaan"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card
        title="Laporan Insiden Terbaru"
        subtitle="5 laporan terakhir yang masuk ke sistem"
        icon={<AlertOctagon size={16} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Kode</th>
                <th className="py-2 pr-3">Tanggal</th>
                <th className="py-2 pr-3">Lokasi</th>
                <th className="py-2 pr-3">Kategori</th>
                <th className="py-2 pr-3">Penyebab</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.incidents.slice(0, 5).map((i) => (
                <tr key={i.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-500">{i.code}</td>
                  <td className="py-2.5 pr-3">{i.eventDate}</td>
                  <td className="py-2.5 pr-3">{i.location}</td>
                  <td className="py-2.5 pr-3">
                    <Badge
                      tone={
                        i.category === "Near Miss"
                          ? "amber"
                          : i.category === "Minor Injury"
                            ? "blue"
                            : "red"
                      }
                    >
                      {i.category}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">{i.rootCause}</td>
                  <td className="py-2.5 pr-3">
                    <Badge
                      tone={
                        i.status === "Closed"
                          ? "green"
                          : i.status === "In Progress"
                            ? "amber"
                            : "red"
                      }
                    >
                      {i.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
