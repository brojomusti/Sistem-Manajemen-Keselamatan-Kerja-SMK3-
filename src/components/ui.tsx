"use client";

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  icon,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-[#0B2545] text-amber-300">
                {icon}
              </span>
            )}
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const toneMap: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "blue" | "slate";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneMap[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0B2545] focus:ring-2 focus:ring-[#0B2545]/20";

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, "green" | "amber" | "red" | "blue" | "slate"> = {
    Open: "red",
    "In Progress": "amber",
    Closed: "green",
    Penuh: "green",
    Sebagian: "amber",
    Tidak: "red",
  };
  return <Badge tone={map[status] ?? "slate"}>{status}</Badge>;
}
