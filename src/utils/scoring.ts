import type { Presence, Tier } from "../types";

const PRESENCE_GAP: Record<Presence, number> = {
  None: 5,
  "Maps listing only": 4,
  "Facebook only": 4,
  "Instagram only": 3,
  "Outdated site": 3,
  "Has modern site": 0,
};

/** Clamp a number to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Priority score = reviewScore (0-5) + presenceGap (0-5).
 * reviewScore = clamp(min(reviews ?? 0, 100) / 20, 0, 5)
 * Never store. Derive on render.
 */
export function computePriorityScore(
  reviews: number | null,
  presence: Presence,
): number {
  const reviewScore = clamp(Math.min(reviews ?? 0, 100) / 20, 0, 5);
  return reviewScore + PRESENCE_GAP[presence];
}

export function getTier(score: number): Tier {
  if (score >= 8) return "Hot";
  if (score >= 6) return "Warm";
  if (score >= 4) return "Cool";
  return "Low";
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export const TIER_STYLES: Record<Tier, string> = {
  Hot: "bg-[#FDEBEC] text-accent border-accent/30",
  Warm: "bg-gold-soft text-ink border-gold",
  Cool: "bg-surface-muted text-ink border-border",
  Low: "bg-[#EEF1F5] text-muted border-border",
};
