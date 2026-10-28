import { TierBadge } from "../components/TierBadge";
import type { Tier } from "../types";

const STEPS = [
  {
    n: 1,
    title: "Search widely",
    body: "Use Discover or Maps Searches across shops, clinics, factories, transport, SaaS, and more. Switch the active city to cover Trichy, nearby towns, and major TN cities.",
  },
  {
    n: 2,
    title: "Flag weak digital presence",
    body: "Prefer listings with no website, Maps-only, or social-only pages. Those businesses are open to websites, apps, software, SEO/AEO, marketing, and AI, not just a brochure site.",
  },
  {
    n: 3,
    title: "Add to Leads",
    body: "Log the lead with city, category, presence, and reviews. Priority scoring helps you work the best gaps first.",
  },
  {
    n: 4,
    title: "Pitch as a growth partner",
    body: "Open Templates, personalize, and offer a free digital snapshot covering web, apps, software, marketing, SEO/AEO, and AI integration.",
  },
];

const TIERS: { tier: Tier; meaning: string }[] = [
  {
    tier: "Hot",
    meaning: "Strong trust signal and a clear digital gap. Reach out first.",
  },
  { tier: "Warm", meaning: "Good opportunity. Schedule soon." },
  { tier: "Cool", meaning: "Worth a note. Lower urgency." },
  {
    tier: "Low",
    meaning: "Weak gap or little social proof. Deprioritize.",
  },
];

interface GuideViewProps {
  activeCity: string;
}

export function GuideView({ activeCity }: GuideViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-ink">How to use Kuri</h2>
        <p className="mt-1 text-sm text-muted">
          Find Tamil Nadu businesses in{" "}
          <span className="font-medium text-accent">{activeCity}</span> that need a{" "}
          <strong className="font-medium text-ink">digital growth partner</strong>:
          websites, applications, software, marketing, SEO/AEO, and AI.
        </p>
      </div>

      <ol className="space-y-3">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="flex gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-on-accent">
              {step.n}
            </span>
            <div>
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">What you sell</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Websites and web applications</li>
          <li>Mobile / desktop apps and custom software (internal and external)</li>
          <li>Digital marketing, SEO, and AEO (visibility in Google and AI answers)</li>
          <li>AI integration: chat, automation, copilots, lead handling</li>
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Good vs weak leads</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-muted p-3 text-sm">
            <p className="font-medium text-accent">Good lead</p>
            <p className="mt-1 text-muted">
              Active business (reviews, enquiries, factory or shop footfall) with
              weak digital presence and room to grow with web, systems, marketing,
              or AI. Includes local SMEs and mid-size industry / B2B.
            </p>
          </div>
          <div className="rounded-lg bg-surface-muted p-3 text-sm">
            <p className="font-medium text-muted">Weak lead</p>
            <p className="mt-1 text-muted">
              Already mature digitally, unclear if operating, or large nationals
              with in-house teams that will not buy from outreach.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Priority tiers</h3>
        <ul className="mt-3 space-y-2">
          {TIERS.map(({ tier, meaning }) => (
            <li key={tier} className="flex items-start gap-3 text-sm">
              <TierBadge tier={tier} />
              <span className="text-muted">{meaning}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted">
        Switching the <strong className="text-ink">Active city</strong> in the
        header re-scopes Discover, Maps Searches, and Templates, and defaults
        the Leads filter. Use &quot;All cities&quot; for a statewide pipeline view.
      </p>
    </div>
  );
}
