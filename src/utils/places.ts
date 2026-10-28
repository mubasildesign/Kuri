import type { Presence, PlaceResult } from "../types";
import { CITY_SEARCH_ALIASES } from "../constants";

interface PlacesApiPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
}

interface PlacesSearchResponse {
  places?: PlacesApiPlace[];
  nextPageToken?: string;
  error?: { message?: string; status?: string };
}

export interface PlacesPage {
  places: PlaceResult[];
  nextPageToken: string | null;
}

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "nextPageToken",
].join(",");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function inferPresence(websiteUri: string | null | undefined): Presence {
  if (!websiteUri) return "Maps listing only";
  const url = websiteUri.toLowerCase();
  if (url.includes("facebook.com") || url.includes("fb.com") || url.includes("fb.me")) {
    return "Facebook only";
  }
  if (url.includes("instagram.com")) {
    return "Instagram only";
  }
  return "Has modern site";
}

export function isProspectPresence(presence: Presence): boolean {
  return (
    presence === "None" ||
    presence === "Maps listing only" ||
    presence === "Facebook only" ||
    presence === "Instagram only" ||
    presence === "Outdated site"
  );
}

export function buildSearchQuery(
  term: string,
  city: string,
  area?: string,
): string {
  const cityLabel = CITY_SEARCH_ALIASES[city] ?? city;
  if (area?.trim()) {
    return `${term} in ${area.trim()}, ${cityLabel}, Tamil Nadu`;
  }
  return `${term} in ${cityLabel}, Tamil Nadu`;
}

function mapPlace(place: PlacesApiPlace): PlaceResult {
  const website = place.websiteUri?.trim() || null;
  return {
    placeId: place.id ?? crypto.randomUUID(),
    name: place.displayName?.text?.trim() || "Unknown",
    address: place.formattedAddress?.trim() || "",
    phone:
      place.nationalPhoneNumber?.trim() ||
      place.internationalPhoneNumber?.trim() ||
      "",
    website,
    mapsUrl: place.googleMapsUri ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    reviews:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    presence: inferPresence(website),
  };
}

/**
 * One page of Text Search results.
 * Google caps pageSize at 20; use nextPageToken for more.
 */
export async function searchPlacesPage(
  apiKey: string,
  textQuery: string,
  pageToken?: string | null,
): Promise<PlacesPage> {
  // Tokens from a prior page often need a brief delay before they become valid.
  if (pageToken) {
    await sleep(1500);
  }

  const body: Record<string, unknown> = {
    textQuery,
    languageCode: "en",
    regionCode: "IN",
    pageSize: 20,
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as PlacesSearchResponse;

  if (!res.ok) {
    const msg =
      data.error?.message ||
      `Places API error (${res.status}). Check the API key and that Places API (New) is enabled.`;
    throw new Error(msg);
  }

  return {
    places: (data.places ?? []).map(mapPlace),
    nextPageToken: data.nextPageToken?.trim() || null,
  };
}

/** @deprecated Prefer searchPlacesPage. Kept for simple one-shot searches. */
export async function searchPlaces(
  apiKey: string,
  textQuery: string,
): Promise<PlaceResult[]> {
  const page = await searchPlacesPage(apiKey, textQuery);
  return page.places;
}

/** Best-effort locality from a formatted address, matched against known areas. */
export function guessAreaFromAddress(
  address: string,
  knownAreas: string[],
): string {
  const lower = address.toLowerCase();
  for (const area of knownAreas) {
    if (lower.includes(area.toLowerCase())) return area;
  }
  // e.g. "Thillai Nagar, Tiruchirappalli, Tamil Nadu 620018, India"
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) return parts[0] ?? "";
  return "";
}
