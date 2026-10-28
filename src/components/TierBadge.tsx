import type { Tier } from "../types";
import { TIER_STYLES } from "../utils/scoring";

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TIER_STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}
