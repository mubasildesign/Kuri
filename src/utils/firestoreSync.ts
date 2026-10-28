import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import {
  createExampleLead,
  mergeAreasWithSeeds,
  mergeCitiesWithDefaults,
  STORAGE_KEYS,
} from "../constants";
import type { AreasByCity, Lead } from "../types";
import { db } from "../lib/firebase";
import {
  loadActiveCity,
  loadAreas,
  loadCities,
  loadLeads,
} from "./storage";

export interface UserSettings {
  cities: string[];
  areas: AreasByCity;
  activeCity: string;
  placesApiKey: string;
  displayName: string;
}

function userRef(uid: string) {
  return doc(db, "users", uid);
}

function leadsCol(uid: string) {
  return collection(db, "users", uid, "leads");
}

function leadRef(uid: string, leadId: string) {
  return doc(db, "users", uid, "leads", leadId);
}

function normalizeLead(id: string, data: Record<string, unknown>): Lead {
  return {
    id,
    city: typeof data.city === "string" ? data.city : "",
    name: typeof data.name === "string" ? data.name : "",
    category: typeof data.category === "string" ? data.category : "",
    area: typeof data.area === "string" ? data.area : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    presence:
      typeof data.presence === "string"
        ? (data.presence as Lead["presence"])
        : "None",
    reviews: typeof data.reviews === "number" ? data.reviews : null,
    rating: typeof data.rating === "number" ? data.rating : null,
    status:
      typeof data.status === "string"
        ? (data.status as Lead["status"])
        : "Not contacted",
    channel:
      typeof data.channel === "string"
        ? (data.channel as Lead["channel"])
        : "",
    dateContacted:
      typeof data.dateContacted === "string" ? data.dateContacted : "",
    nextFollowUp:
      typeof data.nextFollowUp === "string" ? data.nextFollowUp : "",
    notes: typeof data.notes === "string" ? data.notes : "",
  };
}

function leadToFirestore(lead: Lead): Record<string, unknown> {
  return {
    city: lead.city,
    name: lead.name,
    category: lead.category,
    area: lead.area,
    phone: lead.phone,
    presence: lead.presence,
    reviews: lead.reviews,
    rating: lead.rating,
    status: lead.status,
    channel: lead.channel,
    dateContacted: lead.dateContacted,
    nextFollowUp: lead.nextFollowUp,
    notes: lead.notes,
  };
}

export async function loadUserSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const cities = mergeCitiesWithDefaults(
    Array.isArray(data.cities) ? (data.cities as string[]) : null,
  );
  const areas = mergeAreasWithSeeds(
    cities,
    data.areas && typeof data.areas === "object"
      ? (data.areas as AreasByCity)
      : null,
  );
  const activeCity =
    typeof data.activeCity === "string" && cities.includes(data.activeCity)
      ? data.activeCity
      : (cities[0] ?? "Trichy");
  return {
    cities,
    areas,
    activeCity,
    placesApiKey:
      typeof data.placesApiKey === "string" ? data.placesApiKey : "",
    displayName:
      typeof data.displayName === "string" ? data.displayName : "",
  };
}

export async function saveUserSettings(
  uid: string,
  settings: UserSettings,
): Promise<void> {
  await setDoc(
    userRef(uid),
    {
      cities: settings.cities,
      areas: settings.areas,
      activeCity: settings.activeCity,
      placesApiKey: settings.placesApiKey,
      displayName: settings.displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadUserLeads(uid: string): Promise<Lead[]> {
  const snap = await getDocs(leadsCol(uid));
  return snap.docs.map((d) =>
    normalizeLead(d.id, d.data() as Record<string, unknown>),
  );
}

export function subscribeUserLeads(
  uid: string,
  onChange: (leads: Lead[]) => void,
): Unsubscribe {
  return onSnapshot(leadsCol(uid), (snap) => {
    const leads = snap.docs.map((d) =>
      normalizeLead(d.id, d.data() as Record<string, unknown>),
    );
    onChange(leads);
  });
}

/** Upsert current leads and delete removed ones (chunked batches). */
export async function syncUserLeads(
  uid: string,
  leads: Lead[],
): Promise<void> {
  const existing = await getDocs(leadsCol(uid));
  const nextIds = new Set(leads.map((l) => l.id));
  const toDelete = existing.docs.filter((d) => !nextIds.has(d.id));

  const allWrites: Array<{
    type: "set" | "delete";
    id: string;
    data?: Record<string, unknown>;
  }> = [
    ...leads.map((lead) => ({
      type: "set" as const,
      id: lead.id,
      data: leadToFirestore(lead),
    })),
    ...toDelete.map((d) => ({ type: "delete" as const, id: d.id })),
  ];

  const chunkSize = 400;
  for (let i = 0; i < allWrites.length; i += chunkSize) {
    const chunk = allWrites.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const op of chunk) {
      if (op.type === "set" && op.data) {
        batch.set(leadRef(uid, op.id), op.data, { merge: true });
      } else {
        batch.delete(leadRef(uid, op.id));
      }
    }
    await batch.commit();
  }
}

export async function deleteUserLead(
  uid: string,
  leadId: string,
): Promise<void> {
  await deleteDoc(leadRef(uid, leadId));
}

function alreadyMigrated(uid: string): boolean {
  return localStorage.getItem(STORAGE_KEYS.migratedUid) === uid;
}

function markMigrated(uid: string): void {
  localStorage.setItem(STORAGE_KEYS.migratedUid, uid);
}

function hasLocalWorkspaceData(): boolean {
  return (
    localStorage.getItem(STORAGE_KEYS.leads) !== null ||
    localStorage.getItem(STORAGE_KEYS.cities) !== null ||
    localStorage.getItem(STORAGE_KEYS.placesApiKey) !== null
  );
}

function readLocalPlacesKey(): string {
  return localStorage.getItem(STORAGE_KEYS.placesApiKey) ?? "";
}

/**
 * If cloud profile is empty and this browser has older localStorage data,
 * upload it once for this user.
 */
export async function migrateLocalDataIfNeeded(
  uid: string,
  displayName: string,
): Promise<{ settings: UserSettings; leads: Lead[]; migrated: boolean }> {
  const remoteSettings = await loadUserSettings(uid);
  const remoteLeads = await loadUserLeads(uid);
  const cloudEmpty =
    remoteSettings === null && remoteLeads.length === 0;

  if (!cloudEmpty || alreadyMigrated(uid) || !hasLocalWorkspaceData()) {
    if (remoteSettings) {
      return {
        settings: remoteSettings,
        leads: remoteLeads,
        migrated: false,
      };
    }
    const cities = mergeCitiesWithDefaults(null);
    const settings: UserSettings = {
      cities,
      areas: mergeAreasWithSeeds(cities, null),
      activeCity: cities[0] ?? "Trichy",
      placesApiKey: "",
      displayName,
    };
    await saveUserSettings(uid, settings);
    if (remoteLeads.length === 0) {
      const seed = [createExampleLead()];
      await syncUserLeads(uid, seed);
      return { settings, leads: seed, migrated: false };
    }
    return { settings, leads: remoteLeads, migrated: false };
  }

  const cities = loadCities();
  const settings: UserSettings = {
    cities,
    areas: loadAreas(cities),
    activeCity: loadActiveCity(cities),
    placesApiKey: readLocalPlacesKey(),
    displayName,
  };
  const leads = loadLeads();
  await saveUserSettings(uid, settings);
  await syncUserLeads(uid, leads);
  markMigrated(uid);
  return { settings, leads, migrated: true };
}

export async function bootstrapUserData(
  uid: string,
  displayName: string,
): Promise<{ settings: UserSettings; leads: Lead[]; migrated: boolean }> {
  return migrateLocalDataIfNeeded(uid, displayName);
}
