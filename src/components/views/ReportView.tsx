"use client";

import { useState } from "react";
import { FileDown, MessageCircle, Printer, Table2 } from "lucide-react";
import { Badge, Card, Field, inputClass } from "@/components/ui";
import type { AppData } from "@/lib/types";
import type { Summary } from "@/lib/analytics";
import { auditGrade, fmt, fmtInt } from "@/lib/k3";

export default function ReportView({ data, summary }: { data: AppData; summary: Summary }) {
  const [phone, setPhone] = useState("6281234567890");
  const latest = summary.latest;
  const grade = auditGrade(summary.auditScorePct);

  const waText = [
    "*LAPORAN BULANAN K3 (SMK3 - PP No. 50 Tahun 2012)*",
    `Periode: ${latest?.monthName ?? "-"}`,
    "",
    `👷 Tenaga Kerja: ${fmtInt(latest?.workers ?? 0)} orang`,
    `⏱️ Man Hours: ${fmtInt(latest?.manHours ?? 0)} jam`,
    `🟢 Safe Man Hours: ${fmtInt(summary.safeManHours)} jam (tanpa LTI)`,
    "",
    `📉 Frequency Rate (FR): ${fmt(latest?.fr ?? 0)}`,
    `📈 Severity Rate (SR): ${fmt(latest?.sr ?? 0)}`,
    `🚨 Kecelakaan Kerja: ${latest?.accidents ?? 0} kasus | Hari Hilang: ${latest?.lostDays ?? 0} hari`,
    `⚠️ Near Miss: ${latest?.nearMiss ?? 0} laporan`,
    "",
    `📋 Total Laporan Insiden: ${summary.totalIncidents} (Open/In Progress: ${summary.openIncidents})`,
    `✅ Kepatuhan Audit SMK3: ${fmt(summary.auditScorePct, 1)}% — ${grade.flag}`,
    "",
    "Dikirim otomatis dari Sistem Pelaporan & Dashboard Manajemen K3.",
  ].join("\n");

  const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`;

  function downloadCsv() {
    const header = [
      "Periode",
      "Tenaga Kerja",
      "Man Hours",
      "Kecelakaan",
      "Hari Hilang",
      "LTI",
      "Near Miss",
      "FR",
      "SR",
    ];
    const lines = summary.list.map((p) =>
      [
        p.monthName,
        p.workers,
        p.manHours,
        p.accidents,
        p.lostDays,
        p.ltiCount,
        p.nearMiss,
        p.fr.toFixed(2),
        p.sr.toFixed(2),
      ].join(";"),
    );
    const blob = new Blob([[header.join(";"), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-statistik-k3.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:hidden">
        <Card title="Cetak / Unduh PDF" subtitle="Laporan bulanan K3 siap cetak" icon={<Printer size={16} />}>
          <p className="text-xs text-slate-600">
            Dokumen memuat rekap KPI, statistik FR/SR seluruh periode, hasil audit SMK3, dan daftar
            insiden. Pilih &quot;Save as PDF&quot; pada dialog cetak.
          </p>
          <button
            onClick={() => window.print()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#13315C]"
          >
            <FileDown size={16} /> Cetak / Unduh PDF
          </button>
        </Card>

        <Card
          title="Kirim Ringkasan via WhatsApp"
          subtitle="Rangkuman FR, SR, Safe Man Hours & status insiden"
          icon={<MessageCircle size={16} />}
        >
          <Field label="Nomor Tujuan (format internasional)">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <MessageCircle size={16} /> Kirim Laporan via WhatsApp
          </a>
        </Card>

        <Card title="Ekspor Data Mentah" subtitle="Rekap statistik dalam format CSV" icon={<Table2 size={16} />}>
          <p className="text-xs text-slate-600">
            Unduh seluruh data periode (man hours, kecelakaan, hari hilang, FR, SR) untuk diolah
            lebih lanjut di spreadsheet.
          </p>
          <button
            onClick={downloadCsv}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Table2 size={16} /> Unduh CSV
          </button>
        </Card>
      </div>

      {/* Printable report */}
      <div id="printable" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between border-b-2 border-[#0B2545] pb-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase text-[#0B2545]">
              Laporan Bulanan Keselamatan &amp; Kesehatan Kerja
            </h2>
            <p className="text-xs text-slate-500">
              PT Nusantara Karya Industri &middot; Berdasarkan PP No. 50 Tahun 2012 tentang SMK3
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-[#0B2545]">{latest?.monthName ?? "-"}</p>
            <p>Dicetak: {new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        <h3 className="mt-5 text-sm font-bold text-[#0B2545]">A. Ringkasan Indikator Kinerja K3</h3>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Safe Man Hours" value={`${fmtInt(summary.safeManHours)} jam`} />
          <Kpi label="Frequency Rate" value={fmt(latest?.fr ?? 0)} />
          <Kpi label="Severity Rate" value={fmt(latest?.sr ?? 0)} />
          <Kpi label="Kepatuhan SMK3" value={`${fmt(summary.auditScorePct, 1)}%`} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Kumulatif seluruh periode: FR {fmt(summary.cumulativeFR)} · SR {fmt(summary.cumulativeSR)}{" "}
          · Total Man Hours {fmtInt(summary.totalManHours)} jam · Total Kecelakaan{" "}
          {summary.totalAccidents} kasus · Total Near Miss {summary.totalNearMiss}.
        </p>

        <h3 className="mt-6 text-sm font-bold text-[#0B2545]">B. Statistik Bulanan</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-100 text-[10px] uppercase text-slate-600">
              <tr>
                <th className="px-2 py-2">Periode</th>
                <th className="px-2 py-2">Pekerja</th>
                <th className="px-2 py-2">Man Hours</th>
                <th className="px-2 py-2">Kecelakaan</th>
                <th className="px-2 py-2">Hari Hilang</th>
                <th className="px-2 py-2">FR</th>
                <th className="px-2 py-2">SR</th>
              </tr>
            </thead>
            <tbody>
              {summary.list.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 font-semibold">{p.monthName}</td>
                  <td className="px-2 py-1.5">{fmtInt(p.workers)}</td>
                  <td className="px-2 py-1.5">{fmtInt(p.manHours)}</td>
                  <td className="px-2 py-1.5">{p.accidents}</td>
                  <td className="px-2 py-1.5">{p.lostDays}</td>
                  <td className="px-2 py-1.5 font-semibold text-amber-700">{fmt(p.fr)}</td>
                  <td className="px-2 py-1.5 font-semibold text-red-700">{fmt(p.sr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-sm font-bold text-[#0B2545]">C. Hasil Self-Assessment SMK3</h3>
        <p className="mt-1 text-xs text-slate-600">
          Tingkat pencapaian <b>{fmt(summary.auditScorePct, 1)}%</b> — {grade.level}.{" "}
          Rekomendasi: <b>{grade.flag}</b>.
        </p>
        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {data.audit.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
              <span>
                {a.elementNo}. {a.name}
              </span>
              <Badge
                tone={a.status === "Penuh" ? "green" : a.status === "Sebagian" ? "amber" : "red"}
              >
                {a.status}
              </Badge>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-bold text-[#0B2545]">D. Daftar Insiden</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-100 text-[10px] uppercase text-slate-600">
              <tr>
                <th className="px-2 py-2">Kode</th>
                <th className="px-2 py-2">Tanggal</th>
                <th className="px-2 py-2">Lokasi</th>
                <th className="px-2 py-2">Kategori</th>
                <th className="px-2 py-2">Penyebab</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.incidents.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 font-mono">{i.code}</td>
                  <td className="px-2 py-1.5">{i.eventDate}</td>
                  <td className="px-2 py-1.5">{i.location}</td>
                  <td className="px-2 py-1.5">{i.category}</td>
                  <td className="px-2 py-1.5">{i.rootCause}</td>
                  <td className="px-2 py-1.5">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="text-center text-xs text-slate-600">
            <p>Disetujui oleh,</p>
            <div className="h-14" />
            <p className="font-semibold text-[#0B2545]">Ketua P2K3 / Ahli K3 Umum</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-[#0B2545]">{value}</p>
    </div>
  );
}
