import type { Lead, Status } from "../types";
import { computePriorityScore, getTier } from "./scoring";

/** Statuses that should leave the follow-up work queues. */
export const CLOSED_STATUSES: Status[] = [
  "Won",
  "Lost",
  "Not interested",
];

/** Local calendar date as YYYY-MM-DD. */
export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** True when the string looks like YYYY-MM-DD. */
export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function isOpenLead(lead: Lead): boolean {
  return !CLOSED_STATUSES.includes(lead.status);
}

export function isOverdue(lead: Lead, today: string = todayIsoDate()): boolean {
  if (!isOpenLead(lead)) return false;
  const date = lead.nextFollowUp.trim();
  if (!isIsoDate(date)) return false;
  return date < today;
}

export function isDueToday(lead: Lead, today: string = todayIsoDate()): boolean {
  if (!isOpenLead(lead)) return false;
  const date = lead.nextFollowUp.trim();
  if (!isIsoDate(date)) return false;
  return date === today;
}

export function isHotNotContacted(lead: Lead): boolean {
  if (lead.status !== "Not contacted") return false;
  const score = computePriorityScore(lead.reviews, lead.presence);
  return getTier(score) === "Hot";
}

export function scopeLeadsByCity(
  leads: Lead[],
  cityFilter: string | "all",
): Lead[] {
  if (cityFilter === "all") return leads;
  return leads.filter((l) => l.city === cityFilter);
}

function sortByFollowUpThenName(a: Lead, b: Lead): number {
  const da = a.nextFollowUp || "9999-99-99";
  const db = b.nextFollowUp || "9999-99-99";
  if (da !== db) return da.localeCompare(db);
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function sortByScoreThenName(a: Lead, b: Lead): number {
  const sa = computePriorityScore(a.reviews, a.presence);
  const sb = computePriorityScore(b.reviews, b.presence);
  if (sa !== sb) return sb - sa;
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export interface DashboardQueues {
  overdue: Lead[];
  dueToday: Lead[];
  hotNotContacted: Lead[];
}

export function buildDashboardQueues(
  leads: Lead[],
  today: string = todayIsoDate(),
): DashboardQueues {
  return {
    overdue: leads.filter((l) => isOverdue(l, today)).sort(sortByFollowUpThenName),
    dueToday: leads
      .filter((l) => isDueToday(l, today))
      .sort(sortByFollowUpThenName),
    hotNotContacted: leads
      .filter((l) => isHotNotContacted(l))
      .sort(sortByScoreThenName),
  };
}

export interface DashboardStats {
  total: number;
  hot: number;
  overdue: number;
  dueToday: number;
  notContacted: number;
}

export function buildDashboardStats(
  leads: Lead[],
  today: string = todayIsoDate(),
): DashboardStats {
  return {
    total: leads.length,
    hot: leads.filter(
      (l) => getTier(computePriorityScore(l.reviews, l.presence)) === "Hot",
    ).length,
    overdue: leads.filter((l) => isOverdue(l, today)).length,
    dueToday: leads.filter((l) => isDueToday(l, today)).length,
    notContacted: leads.filter((l) => l.status === "Not contacted").length,
  };
}
