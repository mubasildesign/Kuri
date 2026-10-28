import Papa from "papaparse";
import type { Channel, Lead, Presence, Status } from "../types";
import {
  CHANNEL_OPTIONS,
  PRESENCE_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";

const CSV_FIELDS = [
  "id",
  "city",
  "name",
  "category",
  "area",
  "phone",
  "presence",
  "reviews",
  "rating",
  "status",
  "channel",
  "dateContacted",
  "nextFollowUp",
  "notes",
] as const;

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asPresence(value: unknown): Presence {
  const s = String(value ?? "");
  return (PRESENCE_OPTIONS as string[]).includes(s)
    ? (s as Presence)
    : "None";
}

function asStatus(value: unknown): Status {
  const s = String(value ?? "");
  return (STATUS_OPTIONS as string[]).includes(s)
    ? (s as Status)
    : "Not contacted";
}

function asChannel(value: unknown): Channel | "" {
  const s = String(value ?? "");
  if (s === "") return "";
  return (CHANNEL_OPTIONS as string[]).includes(s) ? (s as Channel) : "";
}

export function leadsToCsv(leads: Lead[]): string {
  return Papa.unparse({
    fields: [...CSV_FIELDS],
    data: leads.map((lead) =>
      CSV_FIELDS.map((field) => {
        const v = lead[field];
        return v === null || v === undefined ? "" : v;
      }),
    ),
  });
}

export function csvToLeads(csvText: string): Lead[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .filter((row) => row.name || row.city)
    .map((row) => ({
      id: row.id?.trim() || crypto.randomUUID(),
      city: row.city?.trim() || "",
      name: row.name?.trim() || "",
      category: row.category?.trim() || "",
      area: row.area?.trim() || "",
      phone: row.phone?.trim() || "",
      presence: asPresence(row.presence),
      reviews: parseNullableNumber(row.reviews),
      rating: parseNullableNumber(row.rating),
      status: asStatus(row.status),
      channel: asChannel(row.channel),
      dateContacted: row.dateContacted?.trim() || "",
      nextFollowUp: row.nextFollowUp?.trim() || "",
      notes: row.notes?.trim() || "",
    }));
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
