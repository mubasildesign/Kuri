import type { Channel, Lead, Presence, Status } from "./types";

export const STORAGE_KEYS = {
  leads: "tn-outreach-leads-v1",
  cities: "tn-outreach-cities-v1",
  areas: "tn-outreach-areas-v1",
  activeCity: "tn-outreach-active-city-v1",
  placesApiKey: "tn-outreach-places-api-key-v1",
  authSession: "tn-outreach-auth-session-v1",
  authName: "tn-outreach-auth-name-v1",
  migratedUid: "tn-outreach-migrated-uid-v1",
} as const;

/** Official Google Maps Platform demo key page for quick Discover setup. */
export const MAPS_DEMO_KEY_URL =
  "https://mapsplatform.google.com/maps-demo-key/";


/** Help Google resolve short local names. */
export const CITY_SEARCH_ALIASES: Record<string, string> = {
  Trichy: "Tiruchirappalli",
  Tuticorin: "Thoothukudi",
  Thoothukudi: "Thoothukudi",
  Ooty: "Udhagamandalam",
};

/**
 * Trichy + nearby first, then major Tamil Nadu cities.
 * Users can still add/rename/remove via Manage cities.
 */
export const DEFAULT_CITIES = [
  // Trichy cluster
  "Trichy",
  "Thanjavur",
  "Karur",
  "Pudukkottai",
  "Perambalur",
  "Ariyalur",
  "Namakkal",
  "Dindigul",
  "Madurai",
  // Major TN cities
  "Chennai",
  "Coimbatore",
  "Salem",
  "Tiruppur",
  "Erode",
  "Vellore",
  "Tirunelveli",
  "Thoothukudi",
  "Hosur",
  "Nagercoil",
  "Kanchipuram",
  "Cuddalore",
  "Kumbakonam",
  "Sivakasi",
  "Karaikudi",
  "Theni",
  "Pollachi",
  "Ranipet",
  "Krishnagiri",
  "Villupuram",
  "Nagapattinam",
  "Ramanathapuram",
  "Tiruvannamalai",
  "Chengalpattu",
  "Avadi",
  "Ambattur",
  "Tambaram",
] as const;

/** Famous / useful localities seeded per city (others start empty). */
export const SEED_AREAS: Record<string, string[]> = {
  Trichy: [
    "Thillai Nagar",
    "Srirangam",
    "Cantonment",
    "K K Nagar",
    "Woraiyur",
    "Thennur",
    "Puthur",
    "Crawford",
    "Palakkarai",
    "Central Bus Stand",
    "Ariyamangalam",
    "Edamalaipatti Pudur",
    "TVS Tolgate",
    "Samayapuram",
  ],
  Thanjavur: [
    "Medical College Road",
    "New Bus Stand",
    "Old Bus Stand",
    "Kumbakonam Road",
    "Mariammankovil",
    "Nanjikottai",
  ],
  Karur: ["Vengamedu", "Pasupathipalayam", "Thanthonimalai", "Gandhigramam"],
  Pudukkottai: ["Raja's College Road", "Sathyamoorthy Road", "Malaiyur"],
  Perambalur: ["Bus Stand", "Elambalur", "Arumbavur"],
  Ariyalur: ["Bus Stand", "Reddipalayam", "Kayarlabath"],
  Namakkal: ["Mohanur Road", "Trichy Road", "Sendamangalam"],
  Dindigul: ["Natham Road", "Palani Road", "Begampur", "FS Road"],
  Madurai: [
    "Anna Nagar",
    "K K Nagar",
    "Tallakulam",
    "Goripalayam",
    "SS Colony",
    "Villapuram",
    "Thirunagar",
    "Mattuthavani",
    "Simmakkal",
    "Sellur",
  ],
  Chennai: [
    "T Nagar",
    "Anna Nagar",
    "Adyar",
    "Velachery",
    "OMR",
    "Guindy",
    "Nungambakkam",
    "Porur",
    "Tambaram",
    "Ambattur",
    "Chromepet",
    "Mylapore",
    "Kodambakkam",
    "Perungudi",
    "Sholinganallur",
  ],
  Coimbatore: [
    "RS Puram",
    "Gandhipuram",
    "Peelamedu",
    "Saibaba Colony",
    "Saravanampatti",
    "Singanallur",
    "Town Hall",
    "Ukkadam",
    "Race Course",
    "Vadavalli",
  ],
  Salem: [
    "Hasthampatti",
    "Fairlands",
    "Suramangalam",
    "Ammapet",
    "Five Roads",
    "Shevapet",
  ],
  Tiruppur: ["Kangeyam Road", "Avinashi Road", "PN Road", "Dharapuram Road"],
  Erode: ["Brough Road", "Perundurai Road", "Surampatti", "Solar"],
  Vellore: ["Katpadi", "Sathuvachari", "Gandhi Nagar", "Bagay Theatre"],
  Tirunelveli: ["Palayamkottai", "Junction", "Vannarpettai", "Melapalayam"],
  Thoothukudi: ["Palayamkottai Road", "Bryant Nagar", "Millerpuram", "Harbour"],
  Hosur: ["SIPCOT", "Bag Map", "Bag Road", "Mathigiri"],
  Nagercoil: ["Vadasery", "Meenakshipuram", "Asaripallam", "Chunkankadai"],
  Kanchipuram: ["Railway Road", "Ennaikaran", "Little Kanchipuram"],
  Cuddalore: ["Beach Road", "Manjakuppam", "Semmandalam"],
  Kumbakonam: ["TSR Big Street", "Bazaar Street", "Needamangalam Road"],
  Sivakasi: ["Virudhunagar Road", "Coronation Colony", "Pudhu Theru"],
  Karaikudi: ["Sekkalai Road", "100 Feet Road", "College Road"],
  Theni: ["Periyakulam Road", "Cumbum Road", "Allinagaram"],
  Pollachi: ["Udumalai Road", "Meenkarai Road", "Mahalingapuram"],
  Ranipet: ["SIPCOT", "Walajah", "Arcott"],
  Krishnagiri: ["Hosur Road", "Bangalore Road", "Old Pet"],
  Villupuram: ["Gingee Road", "Trichy Road", "East Pondy Road"],
  Nagapattinam: ["Velankanni Road", "Neela South Street"],
  Ramanathapuram: ["Collectorate", "Kenikarai", "Mandapam Road"],
  Tiruvannamalai: ["Chengam Road", "Polur Road", "Girivalam Road"],
  Chengalpattu: ["GST Road", "Vallam", "Maraimalai Nagar"],
  Avadi: ["Pattabiram", "Tirumullaivoyal", "HVF Road"],
  Ambattur: ["Mogappair", "OTTI", "Industrial Estate"],
  Tambaram: ["East Tambaram", "West Tambaram", "Selaiyur", "Camp Road"],
};

export const PRESENCE_OPTIONS: Presence[] = [
  "None",
  "Maps listing only",
  "Facebook only",
  "Instagram only",
  "Outdated site",
  "Has modern site",
];

export const STATUS_OPTIONS: Status[] = [
  "Not contacted",
  "Contacted",
  "Replied",
  "Meeting set",
  "Proposal sent",
  "Won",
  "Lost",
  "Not interested",
];

export const CHANNEL_OPTIONS: Channel[] = [
  "WhatsApp",
  "Call",
  "Walk-in",
  "Email",
  "Instagram DM",
  "Referral",
];

/** Wide prospecting categories: local, industrial, tech, and services. */
export const SEARCH_CATEGORIES: Record<string, string[]> = {
  "Food & Catering": [
    "restaurants",
    "caterers",
    "sweet shops",
    "bakeries",
    "cloud kitchens",
    "hotels restaurants",
    "mess hotels",
    "juice shops",
  ],
  "Retail & Shops": [
    "jewellery shops",
    "textile shops",
    "saree shops",
    "mobile stores",
    "furniture shops",
    "supermarkets",
    "electronics showrooms",
    "book shops",
    "pharmacy medical shops",
  ],
  Education: [
    "coaching centres",
    "tuition centres",
    "NEET JEE academy",
    "computer training institutes",
    "spoken english classes",
    "schools",
    "colleges",
    "skill training centres",
  ],
  "Health & Clinics": [
    "dental clinics",
    "physiotherapy clinics",
    "diagnostic labs",
    "skin clinics",
    "eye clinics",
    "hospitals",
    "ayurvedic clinics",
    "pharmacy",
  ],
  "Hospitality & Events": [
    "hotels",
    "lodges",
    "resorts",
    "wedding halls",
    "event management",
    "banquet halls",
    "travel agencies",
  ],
  "Property & Construction": [
    "real estate agents",
    "builders",
    "interior designers",
    "architects",
    "civil contractors",
    "hardware shops",
    "electrical contractors",
    "plumbing contractors",
  ],
  "Personal Care & Fitness": [
    "beauty parlours",
    "salons",
    "spa",
    "gyms",
    "yoga centres",
    "pet clinics",
  ],
  Automotive: [
    "car service centres",
    "bike service",
    "driving schools",
    "car accessories",
    "tyre shops",
    "auto spare parts",
    "car dealers",
  ],
  "Manufacturing & Industry": [
    "manufacturing units",
    "factories",
    "textile mills",
    "garment exporters",
    "engineering workshops",
    "CNC machine shops",
    "foundries",
    "plastic manufacturers",
    "packaging companies",
    "printing presses",
    "food processing units",
    "chemical manufacturers",
    "SIDCO industrial estate companies",
    "SIPCOT companies",
  ],
  "Transport & Logistics": [
    "transport companies",
    "lorry transport",
    "logistics companies",
    "courier services",
    "fleet operators",
    "warehouse services",
    "packers and movers",
    "tour operators",
    "taxi services",
    "bus operators",
  ],
  "Tech SaaS & IT": [
    "software companies",
    "IT companies",
    "SaaS companies",
    "startup companies",
    "BPO companies",
    "digital agencies",
    "app development companies",
    "IT parks companies",
  ],
  "Professional Services": [
    "CA firms",
    "chartered accountants",
    "advocates lawyers",
    "consulting firms",
    "HR consultants",
    "marketing agencies",
    "advertising agencies",
    "insurance brokers",
    "finance companies",
  ],
  "Agriculture & Trading": [
    "agro traders",
    "rice mills",
    "oil mills",
    "fertilizer dealers",
    "seed companies",
    "wholesale traders",
    "importers exporters",
  ],
  "Energy & Utilities": [
    "solar companies",
    "electrical contractors industrial",
    "UPS battery dealers",
    "water treatment companies",
    "EV charging companies",
    "renewable energy companies",
    "generator rental services",
  ],
  "Finance & Insurance": [
    "financial consultants",
    "loan consultants",
    "insurance companies",
    "insurance agents",
    "chit fund companies",
    "microfinance companies",
    "stock brokers",
    "tax consultants",
    "wealth management companies",
  ],
  "Home & Facility Services": [
    "home cleaning services",
    "pest control services",
    "security services",
    "facility management companies",
    "appliance repair services",
    "AC service companies",
    "waterproofing contractors",
    "landscaping services",
    "modular kitchen dealers",
  ],
  "Media & Creative": [
    "photography studios",
    "wedding photographers",
    "video production companies",
    "graphic design studios",
    "branding agencies",
    "sign board manufacturers",
    "advertising production houses",
    "content creation agencies",
    "animation studios",
  ],
  "Tourism & Recreation": [
    "local tour packages",
    "homestays",
    "farm stays",
    "adventure tourism companies",
    "amusement parks",
    "sports academies",
    "indoor play centres",
    "clubs and recreation centres",
    "heritage hotels",
  ],
  "Medical Supply & Pharma": [
    "medical equipment suppliers",
    "surgical equipment dealers",
    "pharmaceutical distributors",
    "pharmaceutical manufacturers",
    "hospital furniture suppliers",
    "laboratory equipment suppliers",
    "oxygen suppliers",
    "medical device companies",
  ],
  "Wholesale & Distribution": [
    "FMCG distributors",
    "wholesale dealers",
    "industrial suppliers",
    "building material suppliers",
    "electrical wholesalers",
    "food distributors",
    "beverage distributors",
    "paper product distributors",
    "consumer goods distributors",
  ],
  "Export & Global Trade": [
    "export companies",
    "merchant exporters",
    "freight forwarding companies",
    "customs clearance agents",
    "international trading companies",
    "export consultants",
    "coir exporters",
    "leather exporters",
    "spice exporters",
  ],
  "NGO & Community": [
    "NGO organisations",
    "charitable trusts",
    "foundations",
    "self help groups",
    "community organisations",
    "social service organisations",
    "trade associations",
    "business associations",
  ],
  "Marine & Fisheries": [
    "seafood exporters",
    "fish processing units",
    "fishing equipment suppliers",
    "marine logistics companies",
    "aquaculture farms",
    "shrimp farms",
    "cold storage companies",
  ],
  "Packaging & Printing": [
    "packaging manufacturers",
    "corrugated box manufacturers",
    "label printing companies",
    "commercial printers",
    "flex printing companies",
    "paper bag manufacturers",
    "plastic packaging companies",
    "offset printing presses",
  ],
  "Recruitment & Workforce": [
    "recruitment agencies",
    "staffing companies",
    "manpower consultants",
    "overseas job consultants",
    "housekeeping manpower services",
    "industrial labour contractors",
    "payroll outsourcing companies",
  ],
};

export const CATEGORY_OPTIONS = Object.keys(SEARCH_CATEGORIES);

export const EXAMPLE_LEAD_ID = "example-sri-krishna-sweets";

export function createExampleLead(): Lead {
  return {
    id: EXAMPLE_LEAD_ID,
    city: "Trichy",
    name: "Sri Krishna Sweets (example)",
    category: "Food & Catering",
    area: "Thillai Nagar",
    phone: "",
    presence: "Facebook only",
    reviews: 320,
    rating: 4.4,
    status: "Not contacted",
    channel: "",
    dateContacted: "",
    nextFollowUp: "",
    notes:
      "High footfall, only a FB page. Good candidate for website, Google presence, and basic digital growth.",
  };
}

export function createEmptyLead(city: string): Lead {
  return {
    id: crypto.randomUUID(),
    city,
    name: "",
    category: CATEGORY_OPTIONS[0] ?? "Food & Catering",
    area: "",
    phone: "",
    presence: "None",
    reviews: null,
    rating: null,
    status: "Not contacted",
    channel: "",
    dateContacted: "",
    nextFollowUp: "",
    notes: "",
  };
}

export function defaultAreasByCity(cities: string[]): Record<string, string[]> {
  const areas: Record<string, string[]> = {};
  for (const city of cities) {
    areas[city] = SEED_AREAS[city] ? [...SEED_AREAS[city]] : [];
  }
  return areas;
}

/** Merge stored cities with new defaults (keeps user order, appends missing defaults). */
export function mergeCitiesWithDefaults(stored: string[] | null): string[] {
  if (!stored || stored.length === 0) return [...DEFAULT_CITIES];
  const seen = new Set(stored.map((c) => c.toLowerCase()));
  const merged = [...stored];
  for (const city of DEFAULT_CITIES) {
    if (!seen.has(city.toLowerCase())) {
      merged.push(city);
      seen.add(city.toLowerCase());
    }
  }
  return merged;
}

/** Fill empty area lists from seeds without overwriting user-edited lists. */
export function mergeAreasWithSeeds(
  cities: string[],
  stored: Record<string, string[]> | null,
): Record<string, string[]> {
  const base = defaultAreasByCity(cities);
  if (!stored) return base;
  const merged: Record<string, string[]> = {};
  for (const city of cities) {
    const existing = stored[city];
    if (Array.isArray(existing) && existing.length > 0) {
      merged[city] = existing;
    } else {
      merged[city] = base[city] ?? [];
    }
  }
  return merged;
}
