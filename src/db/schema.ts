import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

/** Statistik K3 bulanan (basis perhitungan FR / SR / Safe Man Hours) */
export const periods = pgTable("k3_periods", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(), // contoh: "2025-01"
  monthName: text("month_name").notNull(), // contoh: "Januari 2025"
  workers: integer("workers").notNull().default(0),
  manHours: doublePrecision("man_hours").notNull().default(0),
  accidents: integer("accidents").notNull().default(0),
  lostDays: integer("lost_days").notNull().default(0),
  ltiCount: integer("lti_count").notNull().default(0),
  nearMiss: integer("near_miss").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Laporan Insiden & Near Miss */
export const incidents = pgTable("k3_incidents", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  eventDate: date("event_date").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(), // Near Miss | Minor Injury | Major Injury (LTI) | Fatality
  severity: text("severity").notNull().default("Rendah"), // Rendah | Sedang | Tinggi
  description: text("description").notNull(),
  rootCause: text("root_cause").notNull(), // Unsafe Act | Unsafe Condition
  correctiveAction: text("corrective_action").notNull(),
  reporter: text("reporter").notNull().default("Petugas K3"),
  status: text("status").notNull().default("Open"), // Open | In Progress | Closed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Self Assessment 12 Elemen SMK3 PP No. 50 Tahun 2012 */
export const auditElements = pgTable("k3_audit_elements", {
  id: serial("id").primaryKey(),
  elementNo: integer("element_no").notNull(),
  name: text("name").notNull(),
  criteria: integer("criteria").notNull().default(0), // jumlah kriteria
  status: text("status").notNull().default("Sebagian"), // Penuh | Sebagian | Tidak
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Period = typeof periods.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type AuditElement = typeof auditElements.$inferSelect;
