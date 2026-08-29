export type PeriodRow = {
  id: number;
  label: string;
  monthName: string;
  workers: number;
  manHours: number;
  accidents: number;
  lostDays: number;
  ltiCount: number;
  nearMiss: number;
};

export type IncidentRow = {
  id: number;
  code: string;
  eventDate: string;
  location: string;
  category: string;
  severity: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  reporter: string;
  status: string;
};

export type AuditRow = {
  id: number;
  elementNo: number;
  name: string;
  criteria: number;
  status: string;
  note: string;
};

export type AppData = {
  periods: PeriodRow[];
  incidents: IncidentRow[];
  audit: AuditRow[];
};
