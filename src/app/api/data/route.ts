import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { periods, incidents, auditElements } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeed();
  const [p, i, a] = await Promise.all([
    db.select().from(periods).orderBy(asc(periods.label)),
    db.select().from(incidents).orderBy(desc(incidents.eventDate), desc(incidents.id)),
    db.select().from(auditElements).orderBy(asc(auditElements.elementNo)),
  ]);
  return NextResponse.json({ periods: p, incidents: i, audit: a });
}
