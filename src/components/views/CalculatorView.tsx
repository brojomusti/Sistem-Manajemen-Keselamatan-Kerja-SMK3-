"use client";

import { useMemo, useState } from "react";
import { Calculator, Save, Trash2, Info, Loader2 } from "lucide-react";
import { Badge, Card, Field, inputClass } from "@/components/ui";
import type { AppData } from "@/lib/types";
import {
  fmt,
  fmtInt,
  frequencyRate,
  incidentRate,
  riskLevelFR,
  riskLevelSR,
  severityRate,
} from "@/lib/k3";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function CalculatorView({
  data,
  onChanged,
}: {
  data: AppData;
  onChanged: () => Promise<void>;
}) {
  const [month, setMonth] = useState("9");
  const [year, setYear] = useState("2025");
  const [workers, setWorkers] = useState("465");
  const [manHours, setManHours] = useState("93000");
  const [accidents, setAccidents] = useState("1");
  const [lostDays, setLostDays] = useState("5");
  const [lti, setLti] = useState("0");
  const [nearMiss, setNearMiss] = useState("14");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const n = (v: string) => Number(v) || 0;

  const calc = useMemo(() => {
    const mh = n(manHours);
    return {
      fr: frequencyRate(n(accidents), mh),
      sr: severityRate(n(lostDays), mh),
      ir: incidentRate(n(accidents), n(workers)),
      avgHours: n(workers) ? mh / n(workers) : 0,
      safe: n(lti) === 0 ? mh : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manHours, accidents, lostDays, workers, lti]);

  const frRisk = riskLevelFR(calc.fr);
  const srRisk = riskLevelSR(calc.sr);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const label = `${year}-${String(Number(month)).padStart(2, "0")}`;
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          monthName: `${MONTHS[Number(month) - 1]} ${year}`,
          workers: n(workers),
          manHours: n(manHours),
          accidents: n(accidents),
          lostDays: n(lostDays),
          ltiCount: n(lti),
          nearMiss: n(nearMiss),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
      setMsg(json.updated ? "Data periode diperbarui." : "Data periode tersimpan.");
      await onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/periods?id=${id}`, { method: "DELETE" });
    await onChanged();
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <Card
        className="xl:col-span-2"
        title="Kalkulator Statistik K3 Bulanan"
        subtitle="Perhitungan otomatis Frequency Rate, Severity Rate, dan Safe Man Hours"
        icon={<Calculator size={16} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Bulan Periode">
            <select className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tahun">
            <input className={inputClass} value={year} onChange={(e) => setYear(e.target.value)} />
          </Field>
          <Field label="Jumlah Tenaga Kerja (orang)">
            <input
              type="number"
              className={inputClass}
              value={workers}
              onChange={(e) => setWorkers(e.target.value)}
            />
          </Field>
          <Field
            label="Total Jam Kerja Orang (Man Hours)"
            hint="Jumlah tenaga kerja × jam kerja aktual dalam periode"
          >
            <input
              type="number"
              className={inputClass}
              value={manHours}
              onChange={(e) => setManHours(e.target.value)}
            />
          </Field>
          <Field label="Jumlah Kecelakaan Kerja">
            <input
              type="number"
              className={inputClass}
              value={accidents}
              onChange={(e) => setAccidents(e.target.value)}
            />
          </Field>
          <Field label="Jumlah Hari Hilang (Lost Days)">
            <input
              type="number"
              className={inputClass}
              value={lostDays}
              onChange={(e) => setLostDays(e.target.value)}
            />
          </Field>
          <Field label="Jumlah LTI (Lost Time Injury)" hint="Mereset akumulasi Safe Man Hours">
            <input
              type="number"
              className={inputClass}
              value={lti}
              onChange={(e) => setLti(e.target.value)}
            />
          </Field>
          <Field label="Jumlah Near Miss">
            <input
              type="number"
              className={inputClass}
              value={nearMiss}
              onChange={(e) => setNearMiss(e.target.value)}
            />
          </Field>
        </div>

        <button
          onClick={() => void save()}
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#13315C] disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Periode ke Database
        </button>
        {msg && <p className="mt-3 text-xs font-semibold text-emerald-600">{msg}</p>}

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-[#0B2545]">
            <Info size={13} /> Rumus Standar K3 Nasional
          </p>
          <p>FR = (Jumlah Kecelakaan Kerja × 1.000.000) ÷ Total Jam Kerja Orang</p>
          <p>SR = (Jumlah Hari Hilang × 1.000.000) ÷ Total Jam Kerja Orang</p>
          <p>Safe Man Hours = akumulasi jam kerja tanpa kejadian LTI</p>
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Hasil Perhitungan Real-Time" icon={<Calculator size={16} />}>
          <div className="space-y-3">
            <ResultRow
              label="Frequency Rate (FR)"
              value={fmt(calc.fr)}
              suffix="per 1.000.000 jam kerja"
              tone={frRisk.tone}
              badge={frRisk.label}
            />
            <ResultRow
              label="Severity Rate (SR)"
              value={fmt(calc.sr)}
              suffix="hari hilang / 10⁶ jam"
              tone={srRisk.tone}
              badge={srRisk.label}
            />
            <ResultRow
              label="Incident Rate"
              value={fmt(calc.ir)}
              suffix="per 100 pekerja"
              tone="blue"
              badge="Indikator pendukung"
            />
            <ResultRow
              label="Safe Man Hours Periode"
              value={fmtInt(calc.safe)}
              suffix="jam kerja selamat"
              tone={calc.safe > 0 ? "green" : "red"}
              badge={calc.safe > 0 ? "Tanpa LTI" : "Terjadi LTI"}
            />
            <ResultRow
              label="Rata-rata Jam / Pekerja"
              value={fmt(calc.avgHours, 1)}
              suffix="jam"
              tone="slate"
              badge="Beban kerja"
            />
          </div>
        </Card>

        <Card title="Riwayat Periode Tersimpan" subtitle={`${data.periods.length} periode`}>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {data.periods
              .slice()
              .reverse()
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{p.monthName}</p>
                    <p className="text-slate-500">
                      FR {fmt(frequencyRate(p.accidents, p.manHours))} · SR{" "}
                      {fmt(severityRate(p.lostDays, p.manHours))} · {fmtInt(p.manHours)} jam
                    </p>
                  </div>
                  <button
                    onClick={() => void remove(p.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus periode"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  suffix,
  tone,
  badge,
}: {
  label: string;
  value: string;
  suffix: string;
  tone: "green" | "amber" | "red" | "blue" | "slate";
  badge: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <Badge tone={tone}>{badge}</Badge>
      </div>
      <p className="mt-1 text-2xl font-extrabold text-[#0B2545]">{value}</p>
      <p className="text-[11px] text-slate-400">{suffix}</p>
    </div>
  );
}
