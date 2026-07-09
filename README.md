# GrowEasy Lead Importer

An AI-powered CSV importer that accepts *any* lead export — Facebook Lead Ads,
Google Ads, a real-estate CRM dump, or a spreadsheet someone put together by
hand — and maps it into the GrowEasy CRM schema automatically, using Claude.

Built for the GrowEasy Software Developer assignment.

## How it works

1. **Upload** — drag & drop or pick a `.csv` file. Parsing happens entirely in
   the browser (PapaParse), nothing is sent anywhere yet.
2. **Preview** — a scrollable, sticky-header table shows every raw row exactly
   as it was uploaded, so you can sanity-check the file before committing to
   an AI call.
3. **Confirm & import** — only on click does the frontend call
   `POST /api/extract` on the backend.
4. **AI extraction** — the backend batches rows (20 at a time) and sends each
   batch to Claude with a strict system prompt describing the 15 GrowEasy CRM
   fields, the allowed `crm_status` / `data_source` enums, and the rules for
   merging duplicate emails/phones into `crm_note`. Failed batches are retried
   with backoff before being marked as skipped, so one bad batch never fails
   the whole import.
5. **Results** — imported records and skipped rows (with a reason for each
   skip) are shown in separate tabs, with a one-click CSV download of the
   final CRM-formatted file.

Rows without an `email` **and** a `mobile_without_country_code` are skipped,
per the assignment spec — this is enforced in code after the AI call, not
left to the model's judgment, so it's deterministic.

## Tech stack

- **Next.js 16** (App Router, TypeScript) — frontend + backend in one project,
  deployable as a single Vercel app.
- **PapaParse** — client-side CSV parsing for the preview step.
- **Gemini API** (`@google/generative-ai`) — server-side AI extraction, using
  the free `gemini-2.0-flash` model and the `GEMINI_API_KEY` env var. Swap in
  OpenAI or Claude in `src/lib/extract.ts` if you'd rather use those.
- **Tailwind CSS v4** — utility styling, custom design tokens in
  `src/app/globals.css`.
- **lucide-react** — icons.

## Project structure

```
src/
  app/
    page.tsx                 # orchestrates upload -> preview -> processing -> results
    api/extract/route.ts     # backend endpoint, calls extractCrmRecords
    globals.css               # design tokens (colors, fonts)
  components/
    Stepper.tsx               # left-hand progress rail
    UploadStep.tsx             # drag & drop + file picker
    PreviewTable.tsx            # raw CSV preview, sticky header, scroll
    ProcessingView.tsx           # loading / error state while AI runs
    ResultsTable.tsx              # imported + skipped tabs, CSV export
  lib/
    types.ts                    # CrmRecord, enums, API request/response shapes
    constants.ts                 # batch size, model name, retry count
    extract.ts                    # prompt, batching, retries, validation
```

## Local setup

```bash
npm install
cp .env.example .env.local
# then edit .env.local and paste in a real GEMINI_API_KEY (free at https://aistudio.google.com/apikey)
npm run dev
```

Open http://localhost:3000 and upload one of the files in `sample-data/`:

- `crm-format-sample.csv` — the exact sample rows from the assignment brief.
- `messy-facebook-export.csv` — differently-named columns, multiple
  emails/phones in one cell, and a row with neither email nor phone (to prove
  the skip rule works) — this is the file that actually shows off the "any
  CSV shape" claim.

Preview it, then click **Confirm & run AI import**.

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Go to vercel.com/new and import the repo.
3. In **Project Settings -> Environment Variables**, add:
   - `GEMINI_API_KEY` = your free Gemini API key (from aistudio.google.com/apikey)
4. Deploy. Vercel auto-detects Next.js — no extra build config needed.

If you're on Vercel's free Hobby plan and importing very large CSVs, note the
serverless function timeout (10s on Hobby, longer on Pro). `maxDuration` is
already set to 60s in `route.ts` for plans that support it; for Hobby, keep
imports under a few hundred rows or reduce `BATCH_SIZE` in
`src/lib/constants.ts` so each request finishes faster.

## Design notes

The visual direction leans into what the tool actually does: taking messy,
differently-shaped spreadsheets and snapping them into one clean structure.
Dark ink background, an amber "incoming signal" accent for primary actions, a
teal accent for successfully matched data, and a clay/red accent for skipped
rows. Data tables use a monospace type so raw values (phone numbers, emails,
dates) stay visually distinct from UI copy.

## Known limitations / things to extend

- No database — every import is stateless; refresh and it's gone. Add a
  `records` table (Postgres/Supabase/etc.) if persistence is needed.
- No auth — anyone with the URL can use the importer.
- No streaming progress per-batch to the frontend yet (the UI shows a single
  "processing" state) — a nice extension would be Server-Sent Events or a
  polling endpoint that reports `batchIndex / totalBatches` as
  `src/lib/extract.ts` already computes it internally.
