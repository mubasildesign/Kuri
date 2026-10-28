import { useMemo, useState } from "react";
import { useToast } from "../hooks/useToast";
import type { Lead } from "../types";

interface TemplateDef {
  id: string;
  title: string;
  subject?: string;
  body: string;
}

const TEMPLATES: TemplateDef[] = [
  {
    id: "wa-weak-digital",
    title: "WhatsApp: weak or no digital presence",
    body: `Hi [Owner name], I noticed [Business name] in [area], [city]. [X] reviews and a strong local reputation, but limited digital presence online.

I partner with Tamil Nadu businesses as a digital growth partner: websites, apps, internal and external software, SEO and AEO, digital marketing, and practical AI integration, so the business can get found, convert more leads, and run smoother.

Would a short 15-min call this week help to map what would move [Business name] to the next level? Happy to share a free digital snapshot (no obligation).

[Your name], [Company]
[number]`,
  },
  {
    id: "wa-social-only",
    title: "WhatsApp: Facebook / Instagram only",
    body: `Hi [Owner name], I came across [Business name] on social media. Solid presence in [area], [city], with [X] reviews.

Social is great for trust, but most buyers still search Google or ask AI tools before they call. We help businesses like yours with a proper website plus SEO/AEO, lead systems, and AI-assisted follow-ups, not just a pretty page.

Open to a free digital growth snapshot for [Business name]?

[Your name], [Company]
[number]`,
  },
  {
    id: "wa-b2b-industry",
    title: "WhatsApp: manufacturing / B2B / industry",
    body: `Hi [Owner name], I was reviewing [category] companies around [city] and noticed [Business name].

Many industrial and trading firms still rely on calls and WhatsApp only. We work as a growth partner for operations like yours: company website and catalogues, CRM / internal tools, customer portals, digital marketing for B2B, and AI for enquiry handling and reporting.

If useful, I can send a short note on where digital and AI usually pay off fastest for [category] in [city]. Practical options only, no pitch-deck spam.

[Your name], [Company]
[number]`,
  },
  {
    id: "call",
    title: "Call opener (20 sec)",
    body: `Hi, is this [Owner name]? I'm [Your name] from [Company]. I help [category] businesses in [city] grow digitally: websites, apps, software, SEO/AEO, marketing, and AI tools. I saw [Business name] in [area] has [X] reviews and room to level up online. Can I send a free digital snapshot for you to glance at? No cost, no pressure.`,
  },
  {
    id: "email-growth",
    title: "Email: growth partner intro",
    subject: `Digital and AI growth ideas for [Business name] ([city])`,
    body: `Hi [Owner name],

I was looking at [category] businesses in [city] and noticed [Business name] in [area]. [X] reviews is a strong signal that customers already trust you.

We act as a digital growth partner for Tamil Nadu companies: websites and web apps, mobile/desktop applications, internal and customer-facing software, digital marketing, SEO and AEO (so you show up in Google and AI answers), and practical AI integration (chat, lead routing, automation).

If you're open to it, I can prepare a free digital snapshot for [Business name]: quick gaps plus 2-3 high-ROI next steps, before any commercial discussion.

Happy to send it on WhatsApp or email.

Best,
[Your name]
[Company]
[number]`,
  },
  {
    id: "email-saas-tech",
    title: "Email: SaaS / IT / startups",
    subject: `Partnership note for [Business name]: product, growth and AI`,
    body: `Hi [Owner name],

Reaching out from [Company]. I help SaaS, IT, and product teams in [city] ship faster and grow: product websites, customer portals, internal tools, SEO/AEO for acquisition, and AI features that users actually feel.

Saw [Business name] ([category]) and thought a short conversation on roadmap vs marketing vs AI leverage could be useful.

Open to a 15-min call, or shall I send a concise capability note first?

Best,
[Your name]
[Company]
[number]`,
  },
  {
    id: "followup",
    title: "Follow-up (3-4 days later)",
    body: `Hi [Owner name], quick follow-up on [Business name] in [area].

I offered a free digital snapshot earlier (website/apps/software, SEO/AEO, marketing, AI). Still happy to put one together if useful. Short, practical, no commitment.

[Your name], [Company]
[number]`,
  },
  {
    id: "wa-ai-angle",
    title: "WhatsApp: AI / next-level angle",
    body: `Hi [Owner name], quick thought for [Business name] ([city]).

A lot of [category] teams want "AI" but don't know where to start. We help with the full stack around it: clean digital presence, apps/software that hold your data, then AI on top (enquiry bots, content/SEO/AEO, reporting, internal copilots).

If [Business name] is exploring that path, I can share 3 AI use-cases that usually fit businesses like yours in [area].

[Your name], [Company]
[number]`,
  },
];

interface PersonalizeFields {
  ownerName: string;
  businessName: string;
  area: string;
  city: string;
  reviews: string;
  category: string;
  yourName: string;
  company: string;
  number: string;
}

const EMPTY_FIELDS: PersonalizeFields = {
  ownerName: "",
  businessName: "",
  area: "",
  city: "",
  reviews: "",
  category: "",
  yourName: "",
  company: "",
  number: "",
};

function fillTemplate(text: string, fields: PersonalizeFields): string {
  return text
    .replaceAll("[Owner name]", fields.ownerName || "[Owner name]")
    .replaceAll("[Business name]", fields.businessName || "[Business name]")
    .replaceAll("[area]", fields.area || "[area]")
    .replaceAll("[city]", fields.city || "[city]")
    .replaceAll("[X]", fields.reviews || "[X]")
    .replaceAll("[category]", fields.category || "[category]")
    .replaceAll("[Your name]", fields.yourName || "[Your name]")
    .replaceAll("[Company]", fields.company || "[Company]")
    .replaceAll("[number]", fields.number || "[number]");
}

interface TemplatesViewProps {
  activeCity: string;
  leads: Lead[];
}

export function TemplatesView({ activeCity, leads }: TemplatesViewProps) {
  const { toast } = useToast();
  const cityLeads = useMemo(
    () => leads.filter((l) => l.city === activeCity && l.name.trim()),
    [leads, activeCity],
  );

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [fields, setFields] = useState<PersonalizeFields>({
    ...EMPTY_FIELDS,
    city: activeCity,
  });

  const [prevCity, setPrevCity] = useState(activeCity);
  if (prevCity !== activeCity) {
    setPrevCity(activeCity);
    setSelectedLeadId("");
    setFields((f) => ({ ...f, city: activeCity }));
  }

  function applyLead(id: string) {
    setSelectedLeadId(id);
    const lead = cityLeads.find((l) => l.id === id);
    if (!lead) return;
    setFields((f) => ({
      ...f,
      businessName: lead.name.replace(/\s*\(example\)\s*/i, "").trim(),
      area: lead.area,
      city: lead.city,
      reviews: lead.reviews != null ? String(lead.reviews) : "",
      category: lead.category,
    }));
  }

  function setField<K extends keyof PersonalizeFields>(
    key: K,
    value: PersonalizeFields[K],
  ) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  }

  const fieldInputs: {
    key: keyof PersonalizeFields;
    label: string;
  }[] = [
    { key: "ownerName", label: "Owner name" },
    { key: "businessName", label: "Business name" },
    { key: "area", label: "Area" },
    { key: "city", label: "City" },
    { key: "reviews", label: "Reviews (X)" },
    { key: "category", label: "Category" },
    { key: "yourName", label: "Your name" },
    { key: "company", label: "Company" },
    { key: "number", label: "Your number" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Templates</h2>
        <p className="mt-1 text-sm text-muted">
          Outreach for{" "}
          <span className="font-medium text-accent">{activeCity}</span> as a{" "}
          <strong className="font-medium text-ink">digital growth partner</strong>:
          websites, apps, software, SEO/AEO, marketing, and AI. CTA: free digital
          snapshot.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Services you can mention</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Website and web apps · Mobile / desktop applications · Internal and
          external software · Digital marketing · SEO · AEO (AI search
          visibility) · AI integration and automation · Lead systems / CRM-style
          tools
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-ink">Personalize</h3>
        <div className="mt-3">
          <label className="block text-xs font-medium text-muted">
            Pick a lead ({activeCity})
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => applyLead(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Type values manually…</option>
            {cityLeads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.area ? ` · ${l.area}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fieldInputs.map(({ key, label }) => (
            <label key={key} className="block text-xs font-medium text-muted">
              {label}
              <input
                value={fields[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {TEMPLATES.map((tpl) => {
          const subject = tpl.subject
            ? fillTemplate(tpl.subject, fields)
            : undefined;
          const body = fillTemplate(tpl.body, fields);
          const full = subject ? `Subject: ${subject}\n\n${body}` : body;
          return (
            <article
              key={tpl.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ink">{tpl.title}</h3>
                <button
                  type="button"
                  onClick={() => copyText(full)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-accent hover:bg-surface-muted"
                >
                  Copy
                </button>
              </div>
              {subject && (
                <p className="mb-2 text-sm">
                  <span className="font-medium text-muted">Subject: </span>
                  <span className="text-ink">{subject}</span>
                </p>
              )}
              <pre className="whitespace-pre-wrap rounded-lg bg-surface-muted p-3 text-sm leading-relaxed text-ink">
                {body}
              </pre>
            </article>
          );
        })}
      </div>
    </div>
  );
}
