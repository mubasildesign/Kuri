import { useMemo, useRef, useState } from "react";
import {
  CATEGORY_OPTIONS,
  CHANNEL_OPTIONS,
  createEmptyLead,
  EXAMPLE_LEAD_ID,
  PRESENCE_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";
import { TierBadge } from "../components/TierBadge";
import { csvToLeads, downloadCsv, leadsToCsv } from "../utils/csv";
import {
  computePriorityScore,
  formatScore,
  getTier,
} from "../utils/scoring";
import type { Lead, Status, Tier } from "../types";

type SortKey =
  | "name"
  | "city"
  | "category"
  | "area"
  | "presence"
  | "reviews"
  | "rating"
  | "status"
  | "score"
  | "dateContacted"
  | "nextFollowUp";

type SortDir = "asc" | "desc";

const TIERS: Tier[] = ["Hot", "Warm", "Cool", "Low"];

const CONTACTED_STATUSES: Status[] = [
  "Contacted",
  "Replied",
  "Meeting set",
  "Proposal sent",
  "Won",
  "Lost",
  "Not interested",
];

interface TargetTrackerViewProps {
  leads: Lead[];
  cities: string[];
  activeCity: string;
  onLeadsChange: (leads: Lead[]) => void;
}

function cmpNullable(a: number | null, b: number | null, dir: SortDir): number {
  const av = a ?? -Infinity;
  const bv = b ?? -Infinity;
  return dir === "asc" ? av - bv : bv - av;
}

function cmpStr(a: string, b: string, dir: SortDir): number {
  const r = a.localeCompare(b, undefined, { sensitivity: "base" });
  return dir === "asc" ? r : -r;
}

export function TargetTrackerView({
  leads,
  cities,
  activeCity,
  onLeadsChange,
}: TargetTrackerViewProps) {
  const [cityFilter, setCityFilter] = useState<string>(activeCity);
  const [tierFilter, setTierFilter] = useState<Tier | "">("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync default city filter when active city changes (only if still on a city name)
  const [prevActive, setPrevActive] = useState(activeCity);
  if (prevActive !== activeCity) {
    setPrevActive(activeCity);
    if (cityFilter !== "all") {
      setCityFilter(activeCity);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = leads.filter((lead) => {
      if (cityFilter !== "all" && lead.city !== cityFilter) return false;
      if (statusFilter && lead.status !== statusFilter) return false;
      if (categoryFilter && lead.category !== categoryFilter) return false;
      const score = computePriorityScore(lead.reviews, lead.presence);
      const tier = getTier(score);
      if (tierFilter && tier !== tierFilter) return false;
      if (q) {
        const hay = `${lead.name} ${lead.area} ${lead.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const sa = computePriorityScore(a.reviews, a.presence);
      const sb = computePriorityScore(b.reviews, b.presence);
      switch (sortKey) {
        case "score":
          return sortDir === "asc" ? sa - sb : sb - sa;
        case "reviews":
          return cmpNullable(a.reviews, b.reviews, sortDir);
        case "rating":
          return cmpNullable(a.rating, b.rating, sortDir);
        case "name":
          return cmpStr(a.name, b.name, sortDir);
        case "city":
          return cmpStr(a.city, b.city, sortDir);
        case "category":
          return cmpStr(a.category, b.category, sortDir);
        case "area":
          return cmpStr(a.area, b.area, sortDir);
        case "presence":
          return cmpStr(a.presence, b.presence, sortDir);
        case "status":
          return cmpStr(a.status, b.status, sortDir);
        case "dateContacted":
          return cmpStr(a.dateContacted, b.dateContacted, sortDir);
        case "nextFollowUp":
          return cmpStr(a.nextFollowUp, b.nextFollowUp, sortDir);
        default:
          return 0;
      }
    });

    return rows;
  }, [
    leads,
    cityFilter,
    tierFilter,
    statusFilter,
    categoryFilter,
    search,
    sortKey,
    sortDir,
  ]);

  const stats = useMemo(() => {
    const scoped =
      cityFilter === "all"
        ? leads
        : leads.filter((l) => l.city === cityFilter);
    return {
      total: scoped.length,
      hot: scoped.filter(
        (l) => getTier(computePriorityScore(l.reviews, l.presence)) === "Hot",
      ).length,
      contacted: scoped.filter((l) =>
        CONTACTED_STATUSES.includes(l.status),
      ).length,
      won: scoped.filter((l) => l.status === "Won").length,
    };
  }, [leads, cityFilter]);

  function updateLead(id: string, patch: Partial<Lead>) {
    onLeadsChange(
      leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }

  function addLead() {
    const city = cityFilter === "all" ? activeCity : cityFilter;
    onLeadsChange([createEmptyLead(city), ...leads]);
  }

  function deleteLead(id: string, name: string) {
    if (!confirm(`Delete lead "${name || "untitled"}"?`)) return;
    onLeadsChange(leads.filter((l) => l.id !== id));
  }

  function clearExample() {
    onLeadsChange(leads.filter((l) => l.id !== EXAMPLE_LEAD_ID));
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "score" ? "desc" : "asc");
    }
  }

  function exportCsv() {
    downloadCsv("kuri-leads.csv", leadsToCsv(leads));
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const imported = csvToLeads(text);
      if (imported.length === 0) {
        alert("No leads found in that CSV.");
        return;
      }
      const byId = new Map(leads.map((l) => [l.id, l]));
      for (const lead of imported) {
        byId.set(lead.id, lead);
      }
      onLeadsChange([...byId.values()]);
    };
    reader.readAsText(file);
  }

  const hasExample = leads.some((l) => l.id === EXAMPLE_LEAD_ID);

  function SortBtn({
    label,
    k,
  }: {
    label: string;
    k: SortKey;
  }) {
    const active = sortKey === k;
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-ink hover:text-accent"
      >
        {label}
        {active && (
          <span className="text-[10px] text-accent">
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    );
  }

  const inputClass =
    "w-full min-w-[6rem] rounded border border-border bg-surface px-1.5 py-1 text-xs outline-none focus:border-accent";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Leads</h2>
          <p className="mt-1 text-sm text-muted">
            Log prospects, sort by priority, and work Hot leads first.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addLead}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Add lead
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink hover:border-accent"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink hover:border-accent"
          >
            Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCsv(f);
              e.target.value = "";
            }}
          />
          {hasExample && (
            <button
              type="button"
              onClick={clearExample}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-600"
            >
              Clear example data
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatChip label="Total" value={stats.total} />
        <StatChip label="Hot" value={stats.hot} accent />
        <StatChip label="Contacted" value={stats.contacted} />
        <StatChip label="Won" value={stats.won} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as Tier | "")}
          className="rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | "")}
          className="rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, area, notes…"
          className="min-w-[12rem] flex-1 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-2 py-2">
                <SortBtn label="Name" k="name" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="City" k="city" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Category" k="category" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Area" k="area" />
              </th>
              <th className="px-2 py-2">Phone</th>
              <th className="px-2 py-2">
                <SortBtn label="Presence" k="presence" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Reviews" k="reviews" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Rating" k="rating" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Score" k="score" />
              </th>
              <th className="px-2 py-2">Tier</th>
              <th className="px-2 py-2">
                <SortBtn label="Status" k="status" />
              </th>
              <th className="px-2 py-2">Channel</th>
              <th className="px-2 py-2">
                <SortBtn label="Contacted" k="dateContacted" />
              </th>
              <th className="px-2 py-2">
                <SortBtn label="Follow-up" k="nextFollowUp" />
              </th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={16}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  No leads match these filters. Add a lead or widen filters.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const score = computePriorityScore(lead.reviews, lead.presence);
                const tier = getTier(score);
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border align-top hover:bg-surface-muted/40"
                  >
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={lead.name}
                        onChange={(e) =>
                          updateLead(lead.id, { name: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={inputClass}
                        value={lead.city}
                        onChange={(e) =>
                          updateLead(lead.id, { city: e.target.value })
                        }
                      >
                        {!cities.includes(lead.city) && lead.city && (
                          <option value={lead.city}>{lead.city}</option>
                        )}
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={inputClass}
                        value={lead.category}
                        onChange={(e) =>
                          updateLead(lead.id, { category: e.target.value })
                        }
                      >
                        {!CATEGORY_OPTIONS.includes(lead.category) &&
                          lead.category && (
                            <option value={lead.category}>
                              {lead.category}
                            </option>
                          )}
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={lead.area}
                        onChange={(e) =>
                          updateLead(lead.id, { area: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={lead.phone}
                        onChange={(e) =>
                          updateLead(lead.id, { phone: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={inputClass}
                        value={lead.presence}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            presence: e.target.value as Lead["presence"],
                          })
                        }
                      >
                        {PRESENCE_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={lead.reviews ?? ""}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            reviews:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        className={inputClass}
                        value={lead.rating ?? ""}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            rating:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5 font-medium text-ink">
                      {formatScore(score)}
                    </td>
                    <td className="px-2 py-1.5">
                      <TierBadge tier={tier} />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={inputClass}
                        value={lead.status}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            status: e.target.value as Status,
                          })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={inputClass}
                        value={lead.channel}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            channel: e.target.value as Lead["channel"],
                          })
                        }
                      >
                        <option value="">None</option>
                        {CHANNEL_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="date"
                        className={inputClass}
                        value={lead.dateContacted}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            dateContacted: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="date"
                        className={inputClass}
                        value={lead.nextFollowUp}
                        onChange={(e) =>
                          updateLead(lead.id, {
                            nextFollowUp: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={`${inputClass} min-w-[8rem]`}
                        value={lead.notes}
                        onChange={(e) =>
                          updateLead(lead.id, { notes: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => deleteLead(lead.id, lead.name)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        accent
          ? "border-gold bg-gold-soft"
          : "border-border bg-surface"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
