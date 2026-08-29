import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard SMK3 — Sistem Pelaporan & Manajemen K3 (PP No. 50 Tahun 2012)",
  description:
    "Aplikasi pelaporan insiden K3, kalkulator Frequency Rate & Severity Rate, self-assessment audit SMK3, dan dashboard analitik keselamatan kerja.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
