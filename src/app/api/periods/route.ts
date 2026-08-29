import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { periods } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json();
  const label = String(body.label ?? "").trim();
  const monthName = String(body.monthName ?? label).trim();
  if (!label) {
    return NextResponse.json({ error: "Periode wajib diisi" }, { status: 400 });
  }
  const values = {
    label,
    monthName,
    workers: Number(body.workers) || 0,
    manHours: Number(body.manHours) || 0,
    accidents: Number(body.accidents) || 0,
    lostDays: Number(body.lostDays) || 0,
    ltiCount: Number(body.ltiCount) || 0,
    nearMiss: Number(body.nearMiss) || 0,
  };

  const existing = await db.select().from(periods).where(eq(periods.label, label));
  if (existing.length > 0) {
    const [row] = await db
      .update(periods)
      .set(values)
      .where(eq(periods.id, existing[0].id))
      .returning();
    return NextResponse.json({ period: row, updated: true });
  }
  const [row] = await db.insert(periods).values(values).returning();
  return NextResponse.json({ period: row, updated: false });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  await db.delete(periods).where(eq(periods.id, id));
  return NextResponse.json({ ok: true });
}
