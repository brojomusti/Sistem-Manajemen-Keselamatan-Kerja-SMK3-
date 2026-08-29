export const SMK3_ELEMENTS: { no: number; name: string; criteria: number }[] = [
  { no: 1, name: "Pembangunan & Pemeliharaan Komitmen", criteria: 26 },
  { no: 2, name: "Strategi Pendokumentasian", criteria: 14 },
  { no: 3, name: "Peninjauan Ulang Desain & Kontrak", criteria: 8 },
  { no: 4, name: "Pengendalian Dokumen", criteria: 7 },
  { no: 5, name: "Pembelian & Pengendalian Produk", criteria: 9 },
  { no: 6, name: "Keamanan Bekerja Berdasarkan SMK3", criteria: 41 },
  { no: 7, name: "Standar Pemantauan", criteria: 17 },
  { no: 8, name: "Pelaporan & Perbaikan Kekurangan", criteria: 9 },
  { no: 9, name: "Pengelolaan Material & Perpindahannya", criteria: 12 },
  { no: 10, name: "Pengumpulan & Penggunaan Data", criteria: 6 },
  { no: 11, name: "Audit SMK3", criteria: 3 },
  { no: 12, name: "Pengembangan Keterampilan & Kemampuan", criteria: 14 },
];

export const AUDIT_STATUS = ["Penuh", "Sebagian", "Tidak"] as const;
export type AuditStatus = (typeof AUDIT_STATUS)[number];

export const STATUS_WEIGHT: Record<string, number> = {
  Penuh: 1,
  Sebagian: 0.5,
  Tidak: 0,
};

export const INCIDENT_CATEGORIES = [
  "Near Miss",
  "Minor Injury",
  "Major Injury (LTI)",
  "Fatality",
] as const;

export const INCIDENT_STATUSES = ["Open", "In Progress", "Closed"] as const;
export const ROOT_CAUSES = ["Unsafe Act", "Unsafe Condition"] as const;

export function frequencyRate(accidents: number, manHours: number) {
  if (!manHours) return 0;
  return (accidents * 1_000_000) / manHours;
}

export function severityRate(lostDays: number, manHours: number) {
  if (!manHours) return 0;
  return (lostDays * 1_000_000) / manHours;
}

/** Incident Rate per 100 pekerja (indikator pendukung) */
export function incidentRate(accidents: number, workers: number) {
  if (!workers) return 0;
  return (accidents * 100) / workers;
}

export function riskLevelFR(fr: number) {
  if (fr === 0) return { label: "Zero Accident", tone: "green" as const };
  if (fr <= 2) return { label: "Risiko Rendah", tone: "green" as const };
  if (fr <= 5) return { label: "Risiko Sedang", tone: "amber" as const };
  return { label: "Risiko Tinggi", tone: "red" as const };
}

export function riskLevelSR(sr: number) {
  if (sr === 0) return { label: "Tanpa Hari Hilang", tone: "green" as const };
  if (sr <= 100) return { label: "Keparahan Rendah", tone: "green" as const };
  if (sr <= 500) return { label: "Keparahan Sedang", tone: "amber" as const };
  return { label: "Keparahan Tinggi", tone: "red" as const };
}

export function auditGrade(score: number) {
  if (score < 60)
    return {
      level: "Tingkat Awal — Kurang",
      flag: "Belum memenuhi (Tindakan Perbaikan Wajib)",
      tone: "red" as const,
      desc: "Pencapaian < 60%. Perusahaan dikenai tindakan hukum sesuai PP No. 50 Tahun 2012.",
    };
  if (score < 85)
    return {
      level: "Tingkat Transisi — Baik",
      flag: "Sertifikat & Bendera Perak",
      tone: "amber" as const,
      desc: "Pencapaian 60–84%. Berhak mendapat Sertifikat dan Bendera Perak.",
    };
  return {
    level: "Tingkat Lanjutan — Sangat Baik",
    flag: "Sertifikat & Bendera Emas",
    tone: "green" as const,
    desc: "Pencapaian 85–100%. Berhak mendapat Sertifikat dan Bendera Emas.",
  };
}

export function fmt(n: number, digits = 2) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}

export function fmtInt(n: number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n || 0));
}
