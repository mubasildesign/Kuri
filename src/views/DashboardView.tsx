import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarBlank,
  Fire,
  WarningCircle,
} from "@phosphor-icons/react";
import { TierBadge } from "../components/TierBadge";
import type { Lead } from "../types";
import {
  buildDashboardQueues,
  buildDashboardStats,
  scopeLeadsByCity,
} from "../utils/followUps";
import {
  computePriorityScore,
  formatScore,
  getTier,
} from "../utils/scoring";

interface DashboardViewProps {
  leads: Lead[];
  activeCity: string;
  onOpenLeads: () => void;
  onOpenGuide: () => void;
}

function StatChip({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        warn
          ? "border-accent/30 bg-[#FDEBEC]"
          : accent
            ? "border-accent/25 bg-accent/5"
            : "border-border bg-surface"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-0.5 text-xl font-semibold tabular-nums ${
          warn || accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QueueSection({
  title,
  hint,
  icon,
  leads,
  empty,
  dateLabel,
  onOpenLeads,
}: {
  title: string;
  hint: string;
  icon: ReactNode;
  leads: Lead[];
  empty: string;
  dateLabel?: "followUp" | "none";
  onOpenLeads: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink">
            {title}
            <span className="ml-2 text-sm font-medium text-muted">
              {leads.length}
            </span>
          </h3>
          <p className="text-xs text-muted">{hint}</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {leads.slice(0, 8).map((lead) => {
            const score = computePriorityScore(lead.reviews, lead.presence);
            const tier = getTier(score);
            return (
              <li
                key={lead.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{lead.name}</p>
                  <p className="truncate text-xs text-muted">
                    {[lead.city, lead.area].filter(Boolean).join(" · ")}
                    {dateLabel === "followUp" && lead.nextFollowUp
                      ? ` · Follow-up ${lead.nextFollowUp}`
                      : null}
                    {` · ${lead.status}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TierBadge tier={tier} />
                  <span className="hidden text-xs tabular-nums text-muted sm:inline">
                    {formatScore(score)}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenLeads}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    Open
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {leads.length > 8 && (
        <div className="border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={onOpenLeads}
            className="text-xs font-semibold text-accent hover:underline"
          >
            View all {leads.length} in Leads
          </button>
        </div>
      )}
    </section>
  );
}

export function DashboardView({
  leads,
  activeCity,
  onOpenLeads,
  onOpenGuide,
}: DashboardViewProps) {
  const [cityScope, setCityScope] = useState<"active" | "all">("active");

  const scoped = useMemo(
    () =>
      scopeLeadsByCity(
        leads,
        cityScope === "all" ? "all" : activeCity,
      ),
    [leads, cityScope, activeCity],
  );

  const stats = useMemo(() => buildDashboardStats(scoped), [scoped]);
  const queues = useMemo(() => buildDashboardQueues(scoped), [scoped]);

  const scopeLabel =
    cityScope === "all" ? "All cities" : activeCity;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Today&apos;s work</h2>
          <p className="mt-1 text-sm text-muted">
            Follow-ups and Hot prospects for{" "}
            <span className="font-medium text-accent">{scopeLabel}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setCityScope("active")}
              className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
                cityScope === "active"
                  ? "bg-ink text-on-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {activeCity}
            </button>
            <button
              type="button"
              onClick={() => setCityScope("all")}
              className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
                cityScope === "all"
                  ? "bg-ink text-on-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              All cities
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenLeads}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            Open Leads
            <ArrowRight size={16} weight="bold" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <StatChip label="Total" value={stats.total} />
        <StatChip label="Hot" value={stats.hot} accent />
        <StatChip label="Overdue" value={stats.overdue} warn={stats.overdue > 0} />
        <StatChip label="Due today" value={stats.dueToday} accent={stats.dueToday > 0} />
        <StatChip label="Not contacted" value={stats.notContacted} />
      </div>

      <div className="space-y-4">
        <QueueSection
          title="Overdue follow-ups"
          hint="Past due dates that still need a reply or next step."
          icon={<WarningCircle size={18} weight="bold" aria-hidden />}
          leads={queues.overdue}
          empty="No overdue follow-ups. Nice."
          dateLabel="followUp"
          onOpenLeads={onOpenLeads}
        />
        <QueueSection
          title="Due today"
          hint="Scheduled for today. Work these before the day ends."
          icon={<CalendarBlank size={18} weight="bold" aria-hidden />}
          leads={queues.dueToday}
          empty="Nothing due today."
          dateLabel="followUp"
          onOpenLeads={onOpenLeads}
        />
        <QueueSection
          title="Hot, not contacted"
          hint="Highest priority gaps you have not reached yet."
          icon={<Fire size={18} weight="bold" aria-hidden />}
          leads={queues.hotNotContacted}
          empty="No Hot leads waiting for first contact."
          dateLabel="none"
          onOpenLeads={onOpenLeads}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-surface px-4 py-3">
        <p className="text-sm text-muted">
          New here? Skim the short guide for the prospecting workflow.
        </p>
        <button
          type="button"
          onClick={onOpenGuide}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <BookOpenText size={16} weight="bold" aria-hidden />
          How to use Kuri
        </button>
      </div>
    </div>
  );
}
