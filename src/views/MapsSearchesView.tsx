import { useMemo, useState, type FormEvent } from "react";
import { SEARCH_CATEGORIES } from "../constants";
import { useToast } from "../hooks/useToast";
import type { AreasByCity } from "../types";

interface MapsSearchesViewProps {
  activeCity: string;
  areasByCity: AreasByCity;
  onAreasChange: (areas: AreasByCity) => void;
}

function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        toast("Copied");
      }}
      className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface-muted"
    >
      Copy
    </button>
  );
}

function SearchRow({ query }: { query: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/px-3 py-2">
      <code className="min-w-0 flex-1 truncate text-sm text-ink">{query}</code>
      <CopyButton text={query} />
    </li>
  );
}

export function MapsSearchesView({
  activeCity,
  areasByCity,
  onAreasChange,
}: MapsSearchesViewProps) {
  const areas = areasByCity[activeCity] ?? [];
  const [newArea, setNewArea] = useState("");
  const [sweepTerm, setSweepTerm] = useState("restaurants");

  const allTerms = useMemo(
    () => [...new Set(Object.values(SEARCH_CATEGORIES).flat())],
    [],
  );

  const googleOps = [
    `site:facebook.com ${activeCity} restaurant`,
    `site:facebook.com ${activeCity} manufacturing`,
    `site:facebook.com ${activeCity} transport`,
    `site:instagram.com ${activeCity} salon`,
    `${activeCity} manufacturers -site:indiamart.com`,
    `${activeCity} logistics company contact number`,
    `${activeCity} software company`,
    `${activeCity} caterers -site:zomato.com -site:swiggy.com`,
    `${activeCity} coaching centre contact number`,
  ];

  function addArea(e: FormEvent) {
    e.preventDefault();
    const trimmed = newArea.trim();
    if (!trimmed) return;
    if (areas.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setNewArea("");
      return;
    }
    onAreasChange({
      ...areasByCity,
      [activeCity]: [...areas, trimmed],
    });
    setNewArea("");
  }

  function removeArea(area: string) {
    onAreasChange({
      ...areasByCity,
      [activeCity]: areas.filter((a) => a !== area),
    });
  }

  function renameArea(oldName: string) {
    const next = prompt("Rename area", oldName)?.trim();
    if (!next || next === oldName) return;
    onAreasChange({
      ...areasByCity,
      [activeCity]: areas.map((a) => (a === oldName ? next : a)),
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Maps Searches</h2>
        <p className="mt-1 text-sm text-muted">
          Ready-made Google Maps queries for{" "}
          <span className="font-medium text-accent">{activeCity}</span>: local
          shops to factories, transport, SaaS, and more. Copy, paste into Maps,
          and flag weak digital presence.
        </p>
      </div>

      {Object.entries(SEARCH_CATEGORIES).map(([category, terms]) => (
        <section key={category} className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-semibold text-ink">{category}</h3>
          <ul className="space-y-2">
            {terms.map((term) => (
              <SearchRow key={term} query={`${term} in ${activeCity}`} />
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Areas in {activeCity}</h3>
        <p className="mt-1 text-sm text-muted">
          Localities for area-sweep searches. Trichy ships with seeds; other cities start empty.
        </p>
        <form onSubmit={addArea} className="mt-3 flex gap-2">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Add locality…"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Add
          </button>
        </form>
        {areas.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No areas yet. Add a few localities.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {areas.map((area) => (
              <li
                key={area}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted px-2 py-1 text-sm"
              >
                <button
                  type="button"
                  onClick={() => renameArea(area)}
                  className="text-ink hover:underline"
                  title="Rename"
                >
                  {area}
                </button>
                <button
                  type="button"
                  onClick={() => removeArea(area)}
                  className="ml-1 text-muted hover:text-red-600"
                  aria-label={`Remove ${area}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Area sweep</h3>
        <p className="mt-1 text-sm text-muted">
          Pick a term; generate <code className="text-xs">term in area city</code> for every
          locality.
        </p>
        <select
          value={sweepTerm}
          onChange={(e) => setSweepTerm(e.target.value)}
          className="mt-3 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {allTerms.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>
        {areas.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Add areas above to enable sweeps.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {areas.map((area) => (
              <SearchRow
                key={area}
                query={`${sweepTerm} in ${area} ${activeCity}`}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Google operators</h3>
        <p className="mt-1 text-sm text-muted">
          Open these in Google Search (not Maps) to find social-only businesses.
        </p>
        <ul className="mt-3 space-y-2">
          {googleOps.map((q) => (
            <SearchRow key={q} query={q} />
          ))}
        </ul>
      </section>
    </div>
  );
}
