# E-CIRA — EIH Corporate Innovation Readiness Assessment

Web version of the E-CIRA spreadsheet. SOE leaders sign up, create an organisation, invite 2–3 colleagues, each fills the assessment independently, and the team averages are calculated automatically.

- **Stack:** SvelteKit (Svelte 5 runes) · TailwindCSS v4 · Supabase (Postgres + Auth + RLS) · Vercel
- **Source of truth for content:** `src/lib/assessment.ts` (derived from `EIH_Innovation_Readiness_Assessment_ECIRA.xlsx`).

## Setup

### 1. Create a Supabase project

1. Go to <https://supabase.com> → New project.
2. In the project dashboard, open **SQL Editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run.
3. Open **Authentication → Providers → Email**. Turn **Confirm email** OFF (we are using open signup with no verification, per the design brief).
4. Open **Project Settings → API**, copy:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`

### 2. Local development

```sh
cp .env.example .env
# fill in PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

App runs at <http://localhost:5173>.

### 3. Deploy to Vercel

1. Push this folder to a Git repo.
2. Import the repo in Vercel. Framework auto-detect: **SvelteKit**.
3. In the Vercel project's **Environment Variables**, add:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase, **Authentication → URL Configuration**, set:
   - **Site URL** to your Vercel deployment URL.
   - Add the same URL to **Redirect URLs**.

Deploy. That's it.

## How it works

- **Auth:** Supabase email + password, no verification. `src/hooks.server.ts` creates a per-request server client and reads the session.
- **Orgs:** Each SOE is an `orgs` row. Users join via invite links. RLS makes sure people only see orgs they belong to.
- **Assessment:** One row per `(org_id, user_id)` in `assessments`. `scores` and `diagnostics` are JSONB. A draft is editable; once submitted, RLS locks updates.
- **Results:** `/org/[id]/results` averages all `submitted` assessments across the 6 dimensions. The zone (RED 0–10, YELLOW 11–20, GREEN 21–30) drives the JSE pathway recommendation.
- **CSV:** `/org/[id]/export.csv` returns every respondent's per-dimension scores, all 30 diagnostics, total, zone, and a trailing AVERAGE row.

## Editing the assessment content

If JSE wants to tweak a level description, an evidence example, or a diagnostic question, edit `src/lib/assessment.ts` — that is the single source of truth. The schema does not need to change: new dimensions or diagnostics flow through automatically because everything lives in JSONB.

## File map

```
src/
  lib/assessment.ts             # Dimensions, levels, diagnostics, zones, scoring helpers
  hooks.server.ts               # Supabase SSR client + auth gate
  routes/
    +layout.svelte              # Shell (header/footer)
    +page.svelte                # Landing
    signin/, signup/            # Auth
    auth/signout/               # POST /auth/signout
    dashboard/                  # User's orgs + "create org"
    invite/[token]/             # Redeem invite link (calls redeem_invite RPC)
    org/[orgId]/
      +layout.server.ts         # Loads the org (RLS-gated)
      +page.svelte              # Org overview, members, invite link
      assessment/               # Fill draft, submit
      results/                  # Team averages + per-respondent table
      export.csv/               # CSV download
supabase/schema.sql             # All tables, RLS, triggers, redeem_invite RPC
```
