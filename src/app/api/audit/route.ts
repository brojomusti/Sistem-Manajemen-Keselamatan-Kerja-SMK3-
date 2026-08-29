import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditElements } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  await ensureSeed();
  const b = await req.json();
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const patch: { status?: string; note?: string; updatedAt: Date } = { updatedAt: new Date() };
  if (typeof b.status === "string") patch.status = b.status;
  if (typeof b.note === "string") patch.note = b.note;
  const [row] = await db
    .update(auditElements)
    .set(patch)
    .where(eq(auditElements.id, id))
    .returning();
  return NextResponse.json({ element: row });
}
