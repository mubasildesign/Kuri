export type Presence =
  | "None"
  | "Maps listing only"
  | "Facebook only"
  | "Instagram only"
  | "Outdated site"
  | "Has modern site";

export type Status =
  | "Not contacted"
  | "Contacted"
  | "Replied"
  | "Meeting set"
  | "Proposal sent"
  | "Won"
  | "Lost"
  | "Not interested";

export type Channel =
  | "WhatsApp"
  | "Call"
  | "Walk-in"
  | "Email"
  | "Instagram DM"
  | "Referral";

export type Tier = "Hot" | "Warm" | "Cool" | "Low";

export type ViewId =
  | "dashboard"
  | "guide"
  | "discover"
  | "maps"
  | "tracker"
  | "templates";

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  reviews: number | null;
  presence: Presence;
}

export interface Lead {
  id: string;
  city: string;
  name: string;
  category: string;
  area: string;
  phone: string;
  presence: Presence;
  reviews: number | null;
  rating: number | null;
  status: Status;
  channel: Channel | "";
  dateContacted: string;
  nextFollowUp: string;
  notes: string;
}

export type AreasByCity = Record<string, string[]>;
