import {
  createExampleLead,
  mergeAreasWithSeeds,
  mergeCitiesWithDefaults,
  STORAGE_KEYS,
} from "../constants";
import type { AreasByCity, Lead } from "../types";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadCities(): string[] {
  const cities = readJson<string[] | null>(STORAGE_KEYS.cities, null);
  return mergeCitiesWithDefaults(cities);
}

export function loadActiveCity(cities: string[]): string {
  const stored = localStorage.getItem(STORAGE_KEYS.activeCity);
  if (stored && cities.includes(stored)) return stored;
  return cities[0] ?? "Trichy";
}

export function loadAreas(cities: string[]): AreasByCity {
  const stored = readJson<AreasByCity | null>(STORAGE_KEYS.areas, null);
  return mergeAreasWithSeeds(cities, stored);
}

export function loadLeads(): Lead[] {
  const stored = readJson<Lead[] | null>(STORAGE_KEYS.leads, null);
  if (stored === null) return [createExampleLead()];
  return stored;
}

export function saveCities(cities: string[]): void {
  localStorage.setItem(STORAGE_KEYS.cities, JSON.stringify(cities));
}

export function saveActiveCity(city: string): void {
  localStorage.setItem(STORAGE_KEYS.activeCity, city);
}

export function saveAreas(areas: AreasByCity): void {
  localStorage.setItem(STORAGE_KEYS.areas, JSON.stringify(areas));
}

export function saveLeads(leads: Lead[]): void {
  localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
}
