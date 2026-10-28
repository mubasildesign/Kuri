import { useMemo, useState, type FormEvent } from "react";
import { SEARCH_CATEGORIES, MAPS_DEMO_KEY_URL } from "../constants";
import { TierBadge } from "../components/TierBadge";
import { useToast } from "../hooks/useToast";
import type { AreasByCity, Lead, PlaceResult } from "../types";
import {
  buildSearchQuery,
  guessAreaFromAddress,
  isProspectPresence,
  searchPlacesPage,
} from "../utils/places";
import {
  computePriorityScore,
  formatScore,
  getTier,
} from "../utils/scoring";

interface DiscoverViewProps {
  activeCity: string;
  areasByCity: AreasByCity;
  leads: Lead[];
  placesApiKey: string;
  onPlacesApiKeyChange: (key: string) => void;
  onAddLead: (lead: Lead) => void;
}

export function DiscoverView({
  activeCity,
  areasByCity,
  leads,
  placesApiKey,
  onPlacesApiKeyChange,
  onAddLead,
}: DiscoverViewProps) {
  const { toast } = useToast();
  const categories = Object.keys(SEARCH_CATEGORIES);
  const [category, setCategory] = useState(categories[0] ?? "Food & Catering");
  const terms = SEARCH_CATEGORIES[category] ?? [];
  const [term, setTerm] = useState(terms[0] ?? "restaurants");
  const areas = areasByCity[activeCity] ?? [];
  const [area, setArea] = useState("");
  const [keyDraft, setKeyDraft] = useState(placesApiKey);
  const [showKey, setShowKey] = useState(false);
  const [prospectsOnly, setProspectsOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Cached Places pages (max 20 each). */
  const [pages, setPages] = useState<PlaceResult[][]>([]);
  /** Token after each loaded page, used to fetch the next. */
  const [tokensAfter, setTokensAfter] = useState<(string | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastQuery, setLastQuery] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeKey, setActiveKey] = useState("");

  const existingNames = useMemo(
    () =>
      new Set(
        leads
          .filter((l) => l.city === activeCity)
          .map((l) => l.name.trim().toLowerCase()),
      ),
    [leads, activeCity],
  );

  // Keep term valid when category changes
  const [prevCategory, setPrevCategory] = useState(category);
  if (prevCategory !== category) {
    setPrevCategory(category);
    const nextTerms = SEARCH_CATEGORIES[category] ?? [];
    setTerm(nextTerms[0] ?? "");
  }

  // Keep draft in sync when cloud settings hydrate
  const [prevKey, setPrevKey] = useState(placesApiKey);
  if (prevKey !== placesApiKey) {
    setPrevKey(placesApiKey);
    setKeyDraft(placesApiKey);
  }

  const hasNextToken =
    pages.length > 0 && Boolean(tokensAfter[pages.length - 1]);
  const totalPagesKnown = pages.length + (hasNextToken ? 1 : 0);

  const visible = useMemo(() => {
    const pageResults = pages[currentPage - 1] ?? [];
    if (!prospectsOnly) return pageResults;
    return pageResults.filter((r) => isProspectPresence(r.presence));
  }, [pages, currentPage, prospectsOnly]);

  function persistKey() {
    const trimmed = keyDraft.trim();
    onPlacesApiKeyChange(trimmed);
    toast(trimmed ? "API key saved" : "API key cleared");
  }

  async function runSearch(e?: FormEvent) {
    e?.preventDefault();
    const key = placesApiKey || keyDraft.trim();
    if (!key) {
      setError("Add a Google Places API key below to search in-app.");
      return;
    }
    if (key !== placesApiKey) {
      onPlacesApiKeyChange(key);
    }

    const query = buildSearchQuery(term, activeCity, area || undefined);
    setLoading(true);
    setError(null);
    setLastQuery(query);
    setActiveKey(key);
    setPages([]);
    setTokensAfter([]);
    setCurrentPage(1);
    try {
      const page = await searchPlacesPage(key, query);
      setPages([page.places]);
      setTokensAfter([page.nextPageToken]);
      setCurrentPage(1);
      if (page.places.length === 0) {
        toast("No places found");
      }
    } catch (err) {
      setPages([]);
      setTokensAfter([]);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function goToPage(pageNum: number) {
    if (pageNum < 1 || pageLoading || loading) return;

    // Already cached
    if (pageNum <= pages.length) {
      setCurrentPage(pageNum);
      return;
    }

    // Only allow fetching the immediate next uncached page
    if (pageNum !== pages.length + 1) return;
    const token = tokensAfter[pages.length - 1];
    if (!token || !activeKey || !lastQuery) return;

    setPageLoading(true);
    setError(null);
    try {
      const page = await searchPlacesPage(activeKey, lastQuery, token);
      setPages((prev) => [...prev, page.places]);
      setTokensAfter((prev) => [...prev, page.nextPageToken]);
      setCurrentPage(pageNum);
      if (page.places.length === 0) {
        toast("No results on this page");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setPageLoading(false);
    }
  }

  function addPlace(place: PlaceResult) {
    const lead: Lead = {
      id: crypto.randomUUID(),
      city: activeCity,
      name: place.name,
      category,
      area: guessAreaFromAddress(place.address, areas),
      phone: place.phone,
      presence: place.presence,
      reviews: place.reviews,
      rating: place.rating,
      status: "Not contacted",
      channel: "",
      dateContacted: "",
      nextFollowUp: "",
      notes: [
        place.address && `Address: ${place.address}`,
        place.website && `Website: ${place.website}`,
        place.mapsUrl && `Maps: ${place.mapsUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
    onAddLead(lead);
    setAddedIds((prev) => new Set(prev).add(place.placeId));
    toast(`Added ${place.name}`);
  }

  function openMapsFallback() {
    const q = encodeURIComponent(
      buildSearchQuery(term, activeCity, area || undefined),
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Discover leads</h2>
        <p className="mt-1 text-sm text-muted">
          Search Google Places for{" "}
          <span className="font-medium text-accent">{activeCity}</span>, spot
          weak digital presence, and add growth-ready leads to your pipeline.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Google Places API key</h3>
        <p className="mt-1 text-sm text-muted">
          Stored only in this browser. Use a demo key for a quick trial, or
          create your own key with{" "}
          <strong>Places API (New)</strong> enabled and HTTP referrer
          restrictions for localhost / your domain.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type={showKey ? "text" : "password"}
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="AIza…"
            className="min-w-[16rem] flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
          >
            {showKey ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            onClick={persistKey}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Save key
          </button>
        </div>

        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>
            Get a free{" "}
            <a
              href={MAPS_DEMO_KEY_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Google Maps demo API key
            </a>
            .
          </li>
          <li>Paste the key above, save it, and start searching local businesses.</li>
        </ol>

        <p className="mt-2 text-xs text-muted">
          No key yet? Use <strong>Open in Google Maps</strong> below, then add
          leads manually in Leads.
        </p>
      </section>

      <form
        onSubmit={runSearch}
        className="space-y-3 rounded-xl border border-border bg-surface p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-medium text-muted">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-accent"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Search term
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-accent"
            >
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Area (optional)
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-accent"
            >
              <option value="">Whole city</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search Places"}
          </button>
          <button
            type="button"
            onClick={openMapsFallback}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:border-accent"
          >
            Open in Google Maps
          </button>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={prospectsOnly}
              onChange={(e) => setProspectsOnly(e.target.checked)}
              className="accent-accent"
            />
            Prospects only (no real website)
          </label>
        </div>

        {lastQuery && (
          <p className="text-xs text-muted">
            Query: <code className="text-ink">{lastQuery}</code>
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      <div className="space-y-3">
        {pages.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              Page {currentPage}
              {totalPagesKnown > 1
                ? ` of ${hasNextToken ? `${pages.length}+` : pages.length}`
                : ""}
              {" · "}
              {visible.length}
              {prospectsOnly ? " prospects" : " results"}
              {" · 20 per page"}
            </p>
            {pageLoading && (
              <p className="text-sm text-muted">Loading page…</p>
            )}
          </div>
        )}

        {visible.length === 0 && (pages[currentPage - 1]?.length ?? 0) > 0 && (
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Every result on this page already has a website. Uncheck
            &quot;Prospects only&quot; to see them, or try another page/term.
          </p>
        )}

        {visible.map((place) => {
          const score = computePriorityScore(place.reviews, place.presence);
          const tier = getTier(score);
          const already =
            addedIds.has(place.placeId) ||
            existingNames.has(place.name.trim().toLowerCase());
          return (
            <article
              key={place.placeId}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{place.name}</h3>
                    <TierBadge tier={tier} />
                    <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-xs text-muted">
                      {place.presence}
                    </span>
                  </div>
                  {place.address && (
                    <p className="mt-1 text-sm text-muted">{place.address}</p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {place.rating != null && <>★ {place.rating} · </>}
                    {place.reviews != null && <>{place.reviews} reviews · </>}
                    Score {formatScore(score)}
                    {place.phone && <> · {place.phone}</>}
                  </p>
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-accent hover:underline"
                    >
                      {place.website}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {place.mapsUrl && (
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-accent"
                    >
                      Maps
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={already}
                    onClick={() => addPlace(place)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {already ? "Added" : "Add lead"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {totalPagesKnown > 1 && (
          <nav
            className="flex flex-wrap items-center justify-center gap-1.5 pt-3"
            aria-label="Results pages"
          >
            <button
              type="button"
              disabled={currentPage <= 1 || pageLoading}
              onClick={() => goToPage(currentPage - 1)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPagesKnown }, (_, i) => i + 1).map(
              (n) => {
                const active = n === currentPage;
                const cached = n <= pages.length;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={pageLoading}
                    onClick={() => goToPage(n)}
                    aria-current={active ? "page" : undefined}
                    className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                      active
                        ? "border-accent bg-accent text-on-accent"
                        : cached
                          ? "border-border bg-surface text-ink hover:border-accent"
                          : "border-dashed border-border bg-surface-muted text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    {n}
                  </button>
                );
              },
            )}
            <button
              type="button"
              disabled={
                pageLoading ||
                currentPage >= totalPagesKnown ||
                (currentPage >= pages.length && !hasNextToken)
              }
              onClick={() => goToPage(currentPage + 1)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
