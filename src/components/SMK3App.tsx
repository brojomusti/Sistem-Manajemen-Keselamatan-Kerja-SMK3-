"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Calculator,
  AlertTriangle,
  ClipboardCheck,
  FileDown,
  HardHat,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { AppData } from "@/lib/types";
import { summarize } from "@/lib/analytics";
import DashboardView from "@/components/views/DashboardView";
import CalculatorView from "@/components/views/CalculatorView";
import IncidentView from "@/components/views/IncidentView";
import AuditView from "@/components/views/AuditView";
import ReportView from "@/components/views/ReportView";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "kalkulator", label: "Kalkulator FR & SR", icon: Calculator },
  { key: "insiden", label: "Laporan Insiden", icon: AlertTriangle },
  { key: "audit", label: "Audit SMK3", icon: ClipboardCheck },
  { key: "laporan", label: "Ekspor & Kirim", icon: FileDown },
] as const;

type NavKey = (typeof NAV)[number]["key"];

export default function SMK3App({ initialData }: { initialData: AppData }) {
  const [data, setData] = useState<AppData>(initialData);
  const [tab, setTab] = useState<NavKey>("dashboard");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) setData((await res.json()) as AppData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData.periods.length) void refresh();
  }, [initialData.periods.length, refresh]);

  const summary = useMemo(() => summarize(data), [data]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0B2545] text-slate-100 lg:flex print:hidden">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-400 text-[#0B2545]">
            <HardHat size={24} />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">SMK3 Dashboard</p>
            <p className="text-[11px] text-slate-300">PP No. 50 Tahun 2012</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-amber-400 text-[#0B2545] shadow"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-[11px] leading-relaxed text-slate-400">
          <p className="font-semibold text-emerald-300">Zero Accident Campaign</p>
          <p>Keselamatan adalah tanggung jawab bersama seluruh insan perusahaan.</p>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0B2545] text-amber-300 lg:hidden">
                <HardHat size={18} />
              </span>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[#0B2545] sm:text-lg">
                  Sistem Pelaporan &amp; Manajemen K3
                </h1>
                <p className="text-[11px] text-slate-500">
                  PT Nusantara Karya Industri &middot; Periode 2025
                </p>
              </div>
            </div>
            <button
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Sinkron Data
            </button>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
          {tab === "dashboard" && <DashboardView data={data} summary={summary} />}
          {tab === "kalkulator" && <CalculatorView data={data} onChanged={refresh} />}
          {tab === "insiden" && <IncidentView data={data} onChanged={refresh} />}
          {tab === "audit" && <AuditView data={data} onChanged={refresh} />}
          {tab === "laporan" && <ReportView data={data} summary={summary} />}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#0B2545] lg:hidden print:hidden">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                active ? "text-amber-400" : "text-slate-400"
              }`}
            >
              <Icon size={18} />
              {n.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
