import { frequencyRate, severityRate, STATUS_WEIGHT } from "./k3";
import type { AppData, AuditRow, IncidentRow, PeriodRow } from "./types";

export function periodMetrics(p: PeriodRow) {
  return {
    ...p,
    fr: frequencyRate(p.accidents, p.manHours),
    sr: severityRate(p.lostDays, p.manHours),
  };
}

export function auditScore(rows: AuditRow[]) {
  const totalCriteria = rows.reduce((s, r) => s + r.criteria, 0);
  const achieved = rows.reduce((s, r) => s + r.criteria * (STATUS_WEIGHT[r.status] ?? 0), 0);
  return totalCriteria ? (achieved / totalCriteria) * 100 : 0;
}

export function elementScore(r: AuditRow) {
  return (STATUS_WEIGHT[r.status] ?? 0) * 100;
}

export function incidentDistribution(rows: IncidentRow[]) {
  const cats = ["Near Miss", "Minor Injury", "Major Injury (LTI)", "Fatality"];
  return cats.map((c) => ({
    name: c,
    value: rows.filter((r) => r.category === c).length,
  }));
}

export function summarize(data: AppData) {
  const list = data.periods.map(periodMetrics);
  const latest = list[list.length - 1];
  const prev = list[list.length - 2];

  const totalManHours = list.reduce((s, p) => s + p.manHours, 0);
  const totalAccidents = list.reduce((s, p) => s + p.accidents, 0);
  const totalLostDays = list.reduce((s, p) => s + p.lostDays, 0);
  const totalNearMiss = list.reduce((s, p) => s + p.nearMiss, 0);

  // Safe man hours: akumulasi jam kerja sejak periode terakhir yang memiliki LTI
  let safeManHours = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].ltiCount > 0) break;
    safeManHours += list[i].manHours;
  }

  const cumulativeFR = totalManHours ? (totalAccidents * 1_000_000) / totalManHours : 0;
  const cumulativeSR = totalManHours ? (totalLostDays * 1_000_000) / totalManHours : 0;

  const score = auditScore(data.audit);

  return {
    list,
    latest,
    prev,
    totalManHours,
    totalAccidents,
    totalLostDays,
    totalNearMiss,
    safeManHours,
    cumulativeFR,
    cumulativeSR,
    auditScorePct: score,
    openIncidents: data.incidents.filter((i) => i.status !== "Closed").length,
    totalIncidents: data.incidents.length,
    frTrend: latest && prev ? latest.fr - prev.fr : 0,
    srTrend: latest && prev ? latest.sr - prev.sr : 0,
  };
}

export type Summary = ReturnType<typeof summarize>;
