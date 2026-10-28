<div align="center">
  <img src="./public/kuri-logo.jpg" alt="Kuri" width="220" />

  <h3>Research. Qualify. Convert.</h3>

  <p>
    A local-first prospecting workspace for finding Tamil Nadu businesses<br />
    ready for better websites, software, marketing, SEO, AEO, and AI.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-011936?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-011936?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-011936?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Vite-8-ED254E?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/data-local_only-F9DC5C?style=flat-square" alt="Local-only data" />
  </p>
</div>

---

## Why Kuri?

Great prospects are often hiding in plain sight: active businesses with strong
reviews, real customer demand, and a weak digital presence. Kuri turns that gap
into a focused outreach pipeline.

- **Start the day on a dashboard** of overdue, due-today, and Hot uncontacted leads
- **Discover prospects** using Google Places without leaving the app
- **Search city by city** with curated categories and neighborhood sweeps
- **Qualify automatically** using review strength and digital-presence gaps
- **Track every conversation** from first contact to won or lost
- **Start outreach faster** with ready-to-personalize WhatsApp, call, and email copy
- **Keep ownership of your data** with browser-only storage and CSV export

## The workflow

```text
Dashboard work queue  →  Discover / Maps  →  Add leads
         →  Work Hot + due follow-ups  →  Personalize outreach  →  Follow up
```

### 0. Dashboard

Open Kuri to **Today's work**: overdue follow-ups, due today, and Hot leads not
yet contacted. Scope by active city or all cities, then jump into Leads.

### 1. Discover

Search Google Places by city, area, and category. Filter the results, move
through numbered pages, and add useful prospects to your pipeline in one click.

### 2. Map the market

Use **Maps Searches** to sweep local services, manufacturing, transport, SaaS,
finance, exports, and more across seeded areas in Tamil Nadu.

### 3. Qualify

Kuri combines social proof with the size of the digital gap:

```text
Priority score = review strength (0–5) + presence gap (0–5)
```

Every lead is grouped into a clear **Hot**, **Warm**, **Cool**, or **Low** tier,
so the best opportunities rise to the top.

### 4. Convert

Manage status, channel, contact dates, follow-ups, and notes from one editable
lead table. Then open **Templates** for outreach written around digital growth,
not just brochure websites.

## Built for local outreach

Kuri ships with Trichy and nearby towns plus major Tamil Nadu cities. Each city
can have its own areas, searches, and pipeline view. Use **Manage cities** to
add, rename, or remove locations as your territory grows.

## Quick start

You need [Node.js](https://nodejs.org/) 20.19+ or 22.12+.

```bash
git clone <your-repository-url>
cd tn-outreach-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Create an account with **email + password**. Your leads, cities, areas, active
city, and Places API key sync to Firebase under your user.

## Firebase setup

1. In [Firebase Console](https://console.firebase.google.com/) open project **Kuri**.
2. **Authentication → Sign-in method → Email/Password** → enable.
3. **Firestore Database → Create database** (production mode).
4. **Firestore → Rules** → paste the contents of [`firestore.rules`](./firestore.rules) → Publish.
5. **Authentication → Settings → Authorized domains** → include `localhost` and your deploy domain.
6. Copy `.env.example` to `.env` and fill the `VITE_FIREBASE_*` values from Project settings → Your apps.

```bash
cp .env.example .env
npm install
npm run dev
```

On Vercel, add the same `VITE_FIREBASE_*` variables and redeploy.

### Data model

- `users/{uid}` — settings (cities, areas, activeCity, placesApiKey, displayName)
- `users/{uid}/leads/{leadId}` — one document per lead

First sign-in on a browser that still has old local data will import that workspace once into your cloud account.

## Google Places setup

Fastest path for a trial key:

1. Open [Google Maps demo key](https://mapsplatform.google.com/maps-demo-key/).
2. Copy the demo key.
3. In Kuri, open **Discover**, paste the key, and select **Save key**.

For a production-style key:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Places API (New)**.
3. Create an API key.
4. Restrict the key to your allowed HTTP referrers, such as
   `http://localhost:5173/*`.
5. Paste it into Discover and select **Save key**.

> [!IMPORTANT]
> The Places key is stored in your Firebase user settings. Apply API and
> referrer restrictions in Google Cloud before using a non-demo key.

## Privacy by default

Accounts are secured with Firebase Authentication. Each user’s leads and settings
live in Cloud Firestore and are readable/writable only by that signed-in user
(see `firestore.rules`). CSV export remains available for backups.

## Tech stack

- **Firebase Auth + Firestore** for accounts and per-user sync
- **React 19 + TypeScript** for the application
- **Vite 8** for development and production builds
- **Tailwind CSS 4** for the interface
- **Phosphor Icons** for iconography
- **Papa Parse** for CSV import and export
- **Vitest + Testing Library** for tests
- **oxlint** for static analysis

## Commands

```bash
npm run dev        # Start the development server
npm run build      # Type-check and create a production build
npm run preview    # Preview the production build
npm test           # Run the test suite once
npm run test:watch # Run tests in watch mode
npm run lint       # Check the code with oxlint
```

## Project map

```text
src/
├── components/    # Header, sidebar, city manager, and tier UI
├── hooks/         # Toast state and presentation
├── utils/         # Places API, scoring, storage, and CSV helpers
├── views/         # Guide, Discover, Maps, Leads, and Templates
├── constants.ts   # Cities, areas, categories, and defaults
├── types.ts       # Shared domain types
└── App.tsx        # Application state and view composition
```

## Production build

```bash
npm run build
npm run preview
```

The deployable static output is generated in `dist/` and can be hosted on
Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static web server.

---

<div align="center">
  <strong>Kuri</strong> · Find the gap. Start the conversation. Grow together.
</div>
