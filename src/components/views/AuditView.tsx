"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Award, CheckCircle2 } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { AppData } from "@/lib/types";
import { auditScore } from "@/lib/analytics";
import { AUDIT_STATUS, auditGrade, fmt, STATUS_WEIGHT } from "@/lib/k3";

export default function AuditView({
  data,
  onChanged,
}: {
  data: AppData;
  onChanged: () => Promise<void>;
}) {
  const [local, setLocal] = useState<Record<number, string>>({});
  const rows = data.audit.map((a) => ({ ...a, status: local[a.id] ?? a.status }));
  const score = useMemo(() => auditScore(rows), [rows]);
  const grade = auditGrade(score);

  async function setStatus(id: number, status: string) {
    setLocal((l) => ({ ...l, [id]: status }));
    await fetch("/api/audit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await onChanged();
  }

  const totalCriteria = rows.reduce((s, r) => s + r.criteria, 0);
  const achieved = rows.reduce((s, r) => s + r.criteria * (STATUS_WEIGHT[r.status] ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#1B4079] p-5 text-white shadow-lg">
          <p className="text-[11px] uppercase tracking-widest text-amber-300">
            Tingkat Pencapaian Penerapan SMK3
          </p>
          <p className="mt-2 text-5xl font-extrabold">{fmt(score, 1)}%</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full ${
                grade.tone === "green"
                  ? "bg-emerald-400"
                  : grade.tone === "amber"
                    ? "bg-amber-400"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-bold text-amber-300">{grade.level}</p>
          <p className="mt-1 text-xs text-slate-300">{grade.desc}</p>
        </div>

        <Card title="Rekomendasi Sertifikasi" icon={<Award size={16} />}>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Hasil Penilaian</p>
              <p className="mt-1 text-lg font-bold text-[#0B2545]">{grade.flag}</p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Badge tone="red">&lt; 60%</Badge> Tingkat Awal — Kurang (tindakan hukum)
              </li>
              <li className="flex items-center gap-2">
                <Badge tone="amber">60–84%</Badge> Transisi — Bendera Perak
              </li>
              <li className="flex items-center gap-2">
                <Badge tone="green">85–100%</Badge> Lanjutan — Bendera Emas
              </li>
            </ul>
          </div>
        </Card>

        <Card title="Ringkasan Kriteria" icon={<CheckCircle2 size={16} />}>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Stat label="Total Kriteria" value={`${totalCriteria}`} />
            <Stat label="Kriteria Terpenuhi" value={fmt(achieved, 1)} />
            <Stat
              label="Elemen Penuh"
              value={`${rows.filter((r) => r.status === "Penuh").length}/12`}
            />
            <Stat
              label="Elemen Belum"
              value={`${rows.filter((r) => r.status === "Tidak").length}`}
            />
          </div>
        </Card>
      </div>

      <Card
        title="Checklist Self-Assessment 12 Elemen SMK3"
        subtitle="Lampiran PP No. 50 Tahun 2012 — pilih status pemenuhan setiap elemen"
        icon={<ClipboardCheck size={16} />}
      >
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0B2545] text-xs font-bold text-amber-300">
                  {r.elementNo}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0B2545]">{r.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {r.criteria} kriteria &middot; {r.note || "Belum ada catatan."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {AUDIT_STATUS.map((s) => {
                  const active = r.status === s;
                  const color =
                    s === "Penuh"
                      ? "bg-emerald-600 border-emerald-600"
                      : s === "Sebagian"
                        ? "bg-amber-500 border-amber-500"
                        : "bg-red-600 border-red-600";
                  return (
                    <button
                      key={s}
                      onClick={() => void setStatus(r.id, s)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? `${color} text-white`
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-lg font-extrabold text-[#0B2545]">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
