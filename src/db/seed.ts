import { sql } from "drizzle-orm";
import { db } from "@/db";
import { periods, incidents, auditElements } from "@/db/schema";
import { SMK3_ELEMENTS } from "@/lib/k3";

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

const PERIOD_SEED = [
  { m: 1, workers: 420, manHours: 78400, accidents: 3, lostDays: 21, lti: 1, nm: 12 },
  { m: 2, workers: 425, manHours: 76500, accidents: 2, lostDays: 12, lti: 1, nm: 15 },
  { m: 3, workers: 430, manHours: 82600, accidents: 4, lostDays: 34, lti: 2, nm: 11 },
  { m: 4, workers: 438, manHours: 84100, accidents: 2, lostDays: 9, lti: 0, nm: 18 },
  { m: 5, workers: 445, manHours: 86300, accidents: 1, lostDays: 4, lti: 0, nm: 21 },
  { m: 6, workers: 450, manHours: 88200, accidents: 2, lostDays: 15, lti: 1, nm: 17 },
  { m: 7, workers: 455, manHours: 90100, accidents: 1, lostDays: 3, lti: 0, nm: 23 },
  { m: 8, workers: 460, manHours: 92400, accidents: 1, lostDays: 6, lti: 0, nm: 19 },
];

const INCIDENT_SEED = [
  {
    code: "INC-2025-001",
    eventDate: "2025-08-04",
    location: "Area Produksi Line 2",
    category: "Near Miss",
    severity: "Rendah",
    description:
      "Operator hampir terpeleset akibat ceceran oli hidrolik di jalur lalu lintas forklift saat shift pagi.",
    rootCause: "Unsafe Condition",
    correctiveAction:
      "Pembersihan segera, pemasangan drip tray pada mesin press, dan inspeksi kebocoran harian.",
    reporter: "Ahmad Fauzi",
    status: "Closed",
  },
  {
    code: "INC-2025-002",
    eventDate: "2025-08-11",
    location: "Gudang Bahan Baku",
    category: "Minor Injury",
    severity: "Sedang",
    description:
      "Pekerja tergores tepi pallet besi saat melakukan stacking manual tanpa sarung tangan.",
    rootCause: "Unsafe Act",
    correctiveAction:
      "Toolbox meeting APD, penyediaan cut-resistant gloves, dan pengawasan penggunaan APD.",
    reporter: "Siti Nurhaliza",
    status: "In Progress",
  },
  {
    code: "INC-2025-003",
    eventDate: "2025-07-19",
    location: "Workshop Maintenance",
    category: "Major Injury (LTI)",
    severity: "Tinggi",
    description:
      "Jari teknisi terjepit kopling mesin gerinda karena LOTO tidak dipasang sebelum perawatan.",
    rootCause: "Unsafe Act",
    correctiveAction:
      "Penerapan ulang prosedur LOTO, refreshment training, audit kepatuhan mingguan.",
    reporter: "Budi Santoso",
    status: "Closed",
  },
  {
    code: "INC-2025-004",
    eventDate: "2025-08-21",
    location: "Area Boiler",
    category: "Near Miss",
    severity: "Sedang",
    description:
      "Tekanan boiler sempat melebihi ambang batas akibat pressure gauge tidak terkalibrasi.",
    rootCause: "Unsafe Condition",
    correctiveAction: "Kalibrasi ulang instrumen dan penjadwalan preventive maintenance 3 bulanan.",
    reporter: "Rizky Pratama",
    status: "Open",
  },
  {
    code: "INC-2025-005",
    eventDate: "2025-08-26",
    location: "Proyek Konstruksi Gedung B",
    category: "Near Miss",
    severity: "Tinggi",
    description:
      "Material scaffolding jatuh dari lantai 3 ke area lalu lalang pekerja, tidak ada korban.",
    rootCause: "Unsafe Condition",
    correctiveAction:
      "Pemasangan safety net & toe board, penetapan exclusion zone, briefing pekerja ketinggian.",
    reporter: "Dewi Anggraini",
    status: "In Progress",
  },
  {
    code: "INC-2025-006",
    eventDate: "2025-06-14",
    location: "Area Loading Dock",
    category: "Minor Injury",
    severity: "Rendah",
    description: "Pekerja mengalami memar pada kaki akibat tertimpa kardus dari tumpukan tinggi.",
    rootCause: "Unsafe Act",
    correctiveAction: "Pembatasan tinggi tumpukan maksimal 1,8 m dan sosialisasi manual handling.",
    reporter: "Joko Widodo",
    status: "Closed",
  },
  {
    code: "INC-2025-007",
    eventDate: "2025-08-29",
    location: "Laboratorium QC",
    category: "Near Miss",
    severity: "Sedang",
    description: "Tumpahan bahan kimia asam kecil akibat wadah tidak tertutup rapat.",
    rootCause: "Unsafe Act",
    correctiveAction: "Penyediaan spill kit, pelabelan ulang B3, dan pelatihan penanganan kimia.",
    reporter: "Maria Yosefa",
    status: "Open",
  },
  {
    code: "INC-2025-008",
    eventDate: "2025-05-08",
    location: "Area Parkir & Lalu Lintas Internal",
    category: "Minor Injury",
    severity: "Rendah",
    description: "Benturan ringan antara forklift dan pagar pembatas saat manuver mundur.",
    rootCause: "Unsafe Act",
    correctiveAction: "Pemasangan cermin cembung dan penerapan aturan spotter untuk manuver mundur.",
    reporter: "Hendra Gunawan",
    status: "Closed",
  },
];

const AUDIT_SEED: Record<number, { status: string; note: string }> = {
  1: { status: "Penuh", note: "Kebijakan K3 ditandatangani direksi & dikomunikasikan." },
  2: { status: "Penuh", note: "Manual SMK3 dan prosedur terdokumentasi lengkap." },
  3: { status: "Sebagian", note: "Review desain belum melibatkan personel K3 secara konsisten." },
  4: { status: "Penuh", note: "Dokumen terkendali melalui sistem nomor revisi." },
  5: { status: "Sebagian", note: "Verifikasi MSDS pada pembelian B3 belum menyeluruh." },
  6: { status: "Penuh", note: "Izin kerja, LOTO, dan JSA berjalan pada area kritis." },
  7: { status: "Sebagian", note: "Pemantauan lingkungan kerja baru 2 dari 4 parameter." },
  8: { status: "Penuh", note: "Sistem pelaporan insiden online aktif dengan tindak lanjut." },
  9: { status: "Sebagian", note: "Pelabelan area penyimpanan B3 perlu pembaruan." },
  10: { status: "Penuh", note: "Data statistik K3 direkap dan dianalisis bulanan." },
  11: { status: "Sebagian", note: "Audit internal dilakukan 1x/tahun, target 2x/tahun." },
  12: { status: "Penuh", note: "Program pelatihan K3 tahunan terlaksana 92%." },
};

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS k3_periods (
      id serial PRIMARY KEY,
      label text NOT NULL,
      month_name text NOT NULL,
      workers integer NOT NULL DEFAULT 0,
      man_hours double precision NOT NULL DEFAULT 0,
      accidents integer NOT NULL DEFAULT 0,
      lost_days integer NOT NULL DEFAULT 0,
      lti_count integer NOT NULL DEFAULT 0,
      near_miss integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS k3_incidents (
      id serial PRIMARY KEY,
      code text NOT NULL,
      event_date date NOT NULL,
      location text NOT NULL,
      category text NOT NULL,
      severity text NOT NULL DEFAULT 'Rendah',
      description text NOT NULL,
      root_cause text NOT NULL,
      corrective_action text NOT NULL,
      reporter text NOT NULL DEFAULT 'Petugas K3',
      status text NOT NULL DEFAULT 'Open',
      created_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS k3_audit_elements (
      id serial PRIMARY KEY,
      element_no integer NOT NULL,
      name text NOT NULL,
      criteria integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'Sebagian',
      note text NOT NULL DEFAULT '',
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);

  const [{ count: pCount }] = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(periods)) as { count: number }[];
  if (pCount === 0) {
    await db.insert(periods).values(
      PERIOD_SEED.map((p) => ({
        label: `2025-${String(p.m).padStart(2, "0")}`,
        monthName: `${MONTHS[p.m - 1]} 2025`,
        workers: p.workers,
        manHours: p.manHours,
        accidents: p.accidents,
        lostDays: p.lostDays,
        ltiCount: p.lti,
        nearMiss: p.nm,
      })),
    );
  }

  const [{ count: iCount }] = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(incidents)) as { count: number }[];
  if (iCount === 0) {
    await db.insert(incidents).values(INCIDENT_SEED);
  }

  const [{ count: aCount }] = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditElements)) as { count: number }[];
  if (aCount === 0) {
    await db.insert(auditElements).values(
      SMK3_ELEMENTS.map((e) => ({
        elementNo: e.no,
        name: e.name,
        criteria: e.criteria,
        status: AUDIT_SEED[e.no]?.status ?? "Sebagian",
        note: AUDIT_SEED[e.no]?.note ?? "",
      })),
    );
  }

  seeded = true;
}
