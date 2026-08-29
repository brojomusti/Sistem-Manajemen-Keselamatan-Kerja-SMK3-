import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { periods, incidents, auditElements } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import SMK3App from "@/components/SMK3App";
import type { AppData } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadData(): Promise<AppData> {
  try {
    await ensureSeed();
    const [p, i, a] = await Promise.all([
      db.select().from(periods).orderBy(asc(periods.label)),
      db.select().from(incidents).orderBy(desc(incidents.eventDate), desc(incidents.id)),
      db.select().from(auditElements).orderBy(asc(auditElements.elementNo)),
    ]);
    return {
      periods: p.map((r) => ({ ...r })),
      incidents: i.map((r) => ({ ...r, eventDate: String(r.eventDate) })),
      audit: a.map((r) => ({ ...r })),
    };
  } catch {
    return { periods: [], incidents: [], audit: [] };
  }
}

export default async function Page() {
  const data = await loadData();
  return <SMK3App initialData={data} />;
}
