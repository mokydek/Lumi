# CellDrop

Automated cell viability counting for the Goryaev chamber (hemocytometer).

Load a photo of a counting chamber, and CellDrop separates live cells (transparent)
from dead cells (stained blue by Trypan Blue), then returns viability and concentration
in about one second. Every marker is editable by hand, so the result stays trustworthy
even when the computer vision is imperfect.

## What it does

- Detects live and dead cells from a single photo, fully in the browser.
- Manual correction layer: add, remove, or reclassify any marker with a click, with undo.
- Show or hide the overlay to compare the count against the raw photo.
- Computes viability and concentration with your dilution factor and squares counted.
- Region of interest tool to limit automatic detection to the grid area.
- Optional accounts and saved history through Supabase.
- Export a result as CSV.
- Interface localized in English and Russian, with the choice remembered.

## The math

- Viability percent = live / (live + dead) x 100
- Concentration (cells per mL) = average cells per large square x dilution factor x 10^4

The 10^4 comes from the counting volume of one large square:
1 mm x 1 mm x 0.1 mm depth = 0.1 mm^3 = 10^-4 mL.

## Tech stack

- React and TypeScript, built with Vite
- Client side canvas pipeline for the counting engine (no backend needed to analyze)
- Supabase for auth and saved history (optional)
- lucide-react for icons

## Project structure

```
src/
  landing/     marketing landing page
  frontend/    the application (analyzer, auth, history)
    pages/
    components/
    lib/        counting engine and domain math
  backend/     Supabase client, auth, data access
  shared/      header, footer, brand, base UI
supabase/
  schema.sql   database table and Row Level Security
```

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The analyzer works immediately, with no account required.

## Enabling accounts and history (optional)

1. Create a project at supabase.com.
2. In the Supabase SQL editor, run the contents of `supabase/schema.sql`.
3. Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

4. Restart `npm run dev`. Sign up, sign in, and saved history now appear.

## Build

```bash
npm run build
npm run preview
```

## Deploy

The app is a static Vite build. On Vercel, set the framework preset to Vite and add the
two `VITE_SUPABASE_` environment variables. The build command is `npm run build` and the
output directory is `dist`.
