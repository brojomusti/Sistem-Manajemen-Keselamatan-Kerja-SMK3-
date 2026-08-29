import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { incidents } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeed();
  const b = await req.json();
  const required = ["eventDate", "location", "category", "description"];
  for (const f of required) {
    if (!String(b[f] ?? "").trim()) {
      return NextResponse.json({ error: `Field ${f} wajib diisi` }, { status: 400 });
    }
  }
  const [{ count }] = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(incidents)) as { count: number }[];

  const [row] = await db
    .insert(incidents)
    .values({
      code: `INC-2025-${String(count + 1).padStart(3, "0")}`,
      eventDate: String(b.eventDate),
      location: String(b.location),
      category: String(b.category),
      severity: String(b.severity ?? "Rendah"),
      description: String(b.description),
      rootCause: String(b.rootCause ?? "Unsafe Act"),
      correctiveAction: String(b.correctiveAction ?? "-"),
      reporter: String(b.reporter ?? "Petugas K3"),
      status: String(b.status ?? "Open"),
    })
    .returning();
  return NextResponse.json({ incident: row });
}

export async function PATCH(req: Request) {
  const b = await req.json();
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const [row] = await db
    .update(incidents)
    .set({ status: String(b.status) })
    .where(eq(incidents.id, id))
    .returning();
  return NextResponse.json({ incident: row });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  await db.delete(incidents).where(eq(incidents.id, id));
  return NextResponse.json({ ok: true });
}
