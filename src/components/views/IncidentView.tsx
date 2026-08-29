"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Send, Loader2, Trash2, Filter } from "lucide-react";
import { Badge, Card, Field, inputClass } from "@/components/ui";
import type { AppData } from "@/lib/types";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES, ROOT_CAUSES } from "@/lib/k3";

const SEVERITIES = ["Rendah", "Sedang", "Tinggi"];

export default function IncidentView({
  data,
  onChanged,
}: {
  data: AppData;
  onChanged: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    eventDate: new Date().toISOString().slice(0, 10),
    location: "",
    category: "Near Miss",
    severity: "Rendah",
    description: "",
    rootCause: "Unsafe Act",
    correctiveAction: "",
    reporter: "",
    status: "Open",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState("Semua");
  const [catFilter, setCatFilter] = useState("Semua");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const rows = useMemo(
    () =>
      data.incidents.filter(
        (i) =>
          (filter === "Semua" || i.status === filter) &&
          (catFilter === "Semua" || i.category === catFilter),
      ),
    [data.incidents, filter, catFilter],
  );

  async function submit() {
    if (!form.location.trim() || !form.description.trim()) {
      setMsg("Lokasi dan deskripsi kronologi wajib diisi.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reporter: form.reporter.trim() || "Petugas K3",
          correctiveAction: form.correctiveAction.trim() || "Menunggu penetapan tindakan.",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Gagal");
      setMsg("Laporan insiden berhasil dikirim.");
      setForm((f) => ({ ...f, location: "", description: "", correctiveAction: "" }));
      await onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: number, status: string) {
    await fetch("/api/incidents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await onChanged();
  }

  async function remove(id: number) {
    await fetch(`/api/incidents?id=${id}`, { method: "DELETE" });
    await onChanged();
  }

  const counts = INCIDENT_STATUSES.map((s) => ({
    s,
    n: data.incidents.filter((i) => i.status === s).length,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {counts.map((c) => (
          <div
            key={c.s}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status {c.s}
              </p>
              <p className="text-2xl font-extrabold text-[#0B2545]">{c.n}</p>
            </div>
            <Badge tone={c.s === "Closed" ? "green" : c.s === "In Progress" ? "amber" : "red"}>
              {c.s}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          title="Form Pelaporan Insiden & Potensi Bahaya"
          subtitle="Laporkan kejadian kecelakaan kerja atau near miss di lapangan"
          icon={<AlertTriangle size={16} />}
        >
          <div className="space-y-3">
            <Field label="Tanggal Kejadian">
              <input
                type="date"
                className={inputClass}
                value={form.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
              />
            </Field>
            <Field label="Lokasi / Unit Kerja">
              <input
                className={inputClass}
                placeholder="Contoh: Area Produksi Line 2"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori Kejadian">
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {INCIDENT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tingkat Risiko">
                <select
                  className={inputClass}
                  value={form.severity}
                  onChange={(e) => set("severity", e.target.value)}
                >
                  {SEVERITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Deskripsi Kronologi">
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Uraikan kronologi kejadian secara singkat dan faktual..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Akar Penyebab">
              <select
                className={inputClass}
                value={form.rootCause}
                onChange={(e) => set("rootCause", e.target.value)}
              >
                {ROOT_CAUSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Rencana Tindakan Perbaikan (Corrective Action)">
              <textarea
                rows={2}
                className={inputClass}
                value={form.correctiveAction}
                onChange={(e) => set("correctiveAction", e.target.value)}
              />
            </Field>
            <Field label="Pelapor">
              <input
                className={inputClass}
                placeholder="Nama pelapor"
                value={form.reporter}
                onChange={(e) => set("reporter", e.target.value)}
              />
            </Field>
            <button
              onClick={() => void submit()}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-[#0B2545] transition hover:bg-amber-400 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Kirim Laporan
            </button>
            {msg && <p className="text-xs font-semibold text-emerald-600">{msg}</p>}
          </div>
        </Card>

        <Card
          className="xl:col-span-2"
          title="Daftar Laporan Insiden"
          subtitle={`${rows.length} laporan ditampilkan`}
          icon={<Filter size={16} />}
          action={
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
              >
                <option>Semua</option>
                {INCIDENT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>Semua</option>
                {INCIDENT_STATUSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          }
        >
          <div className="space-y-3">
            {rows.map((i) => (
              <article key={i.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{i.code}</span>
                    <Badge
                      tone={
                        i.category === "Near Miss"
                          ? "amber"
                          : i.category === "Minor Injury"
                            ? "blue"
                            : "red"
                      }
                    >
                      {i.category}
                    </Badge>
                    <Badge
                      tone={
                        i.severity === "Tinggi"
                          ? "red"
                          : i.severity === "Sedang"
                            ? "amber"
                            : "green"
                      }
                    >
                      Risiko {i.severity}
                    </Badge>
                    <Badge tone="slate">{i.rootCause}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={i.status}
                      onChange={(e) => void changeStatus(i.id, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                        i.status === "Closed"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : i.status === "In Progress"
                            ? "border-amber-300 bg-amber-50 text-amber-700"
                            : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {INCIDENT_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => void remove(i.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="mt-2 text-sm font-bold text-[#0B2545]">
                  {i.location} &middot; <span className="font-normal text-slate-500">{i.eventDate}</span>
                </h4>
                <p className="mt-1 text-sm text-slate-600">{i.description}</p>
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <b>Tindakan Perbaikan:</b> {i.correctiveAction}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400">Dilaporkan oleh {i.reporter}</p>
              </article>
            ))}
            {rows.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                Tidak ada laporan sesuai filter.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
