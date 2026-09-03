# Company evidence report workflows

The repository contains two reusable report systems:

- `skills/build-company-evidence-report/` defines the evidence, Companies House, CSV and standalone HTML contract.
- `skills/publish-drive-report-handoff/` creates the chaptered laptop-width MP4 and defines the Google Drive handoff checks.

The skills are mirrored from the local Codex skill installation so the workflow is versioned with the project and portable to another machine.

## What the pipeline produces

Every client handoff contains exactly:

1. A standalone HTML account pack with public evidence, commercial interpretation, contact actions and Companies House statistics together for each company.
2. A CSV with the editorial lead fields plus the complete flattened Companies House schema: legal identity, filing and compliance dates, officers, controllers, charges, current and previous financial values and periods, changes, source concepts, warnings and ratios.
3. A full-width 1728 x 1080 H.264 preview that pauses on the report, evidence, commercial read, registry information, financials and later leads.

Raw source captures and bulk Companies House downloads remain local reproducible caches. They are deliberately ignored by Git; the public source URL, observation time and content-addressed artifact metadata stay in the retained evidence JSON.

## Exe Squared

Run the complete refresh:

```sh
pnpm run research:rebuild-exe-squared
```

Reuse the existing public captures and Companies House evidence for a layout, CSV or preview rebuild:

```sh
pnpm run research:rebuild-exe-squared -- --skip-capture --skip-financials
```

Validate existing outputs without changing them:

```sh
pnpm run research:rebuild-exe-squared -- --validate-only
```

Use `--skip-preview` when FFmpeg or Playwright is intentionally unavailable.

## Solar on Steroids

Run the complete source-to-handoff workflow:

```sh
pnpm run research:rebuild-solar-on-steroids
```

The workflow obtains the current MCS Solar PV pool, verifies first-party websites and public contact routes, resolves legal entities, optionally uses the local Companies House bulk snapshot, captures live Companies House profiles and filings without database writes, ranks the accounts, enriches the final CSV, captures evidence, builds and validates the HTML, and creates the MP4 handoff.

For a deterministic rebuild from the retained research and financial evidence:

```sh
pnpm run research:rebuild-solar-on-steroids -- \
  --skip-research \
  --skip-financials \
  --skip-capture
```

Validate existing outputs without changing them:

```sh
pnpm run research:rebuild-solar-on-steroids -- --validate-only
```

Optional flags are `--skip-research`, `--skip-bulk`, `--skip-financials`, `--skip-capture`, `--skip-preview` and `--validate-only`.

## onsteroids.com — windows and doors

Run the complete source-to-handoff workflow:

```sh
pnpm run research:rebuild-on-steroids-windows-doors
```

This is a separate vertical play under the onsteroids.com brand. It uses geographically distributed public FENSA searches across England and Wales, retains consumer-facing window-and-door installers, verifies first-party offers and public contact routes, resolves legal entities, captures Companies House filings without database writes, ranks 100 installers, and produces the enriched CSV, standalone account pack and MP4 preview.

For a deterministic rebuild from retained research and financial evidence:

```sh
pnpm run research:rebuild-on-steroids-windows-doors -- \
  --skip-research \
  --skip-financials \
  --skip-capture
```

Validate existing outputs without changing them:

```sh
pnpm run research:rebuild-on-steroids-windows-doors -- --validate-only
```

Optional flags are `--skip-research`, `--skip-bulk`, `--skip-financials`, `--skip-capture`, `--skip-preview` and `--validate-only`.

## Generic stages

The client orchestrators compose these reusable stages:

```sh
# Capture Companies House evidence without Supabase or database writes.
pnpm --filter @leadmap/server exec tsx src/jobs/export-report-financials.ts \
  --companies-file /absolute/hitlist.csv \
  --output /absolute/companies-house-financials.json

# Flatten the captured record into every CSV row.
node scripts/enrich-company-evidence-csv.mjs \
  --input /absolute/hitlist.csv \
  --financials /absolute/companies-house-financials.json \
  --output /absolute/hitlist.csv

# Reconcile all flattened values to the retained JSON.
node scripts/validate-company-evidence-csv.mjs \
  --csv /absolute/hitlist.csv \
  --financials /absolute/companies-house-financials.json

# Build the standalone account pack.
node scripts/build-exe-squared-hitlist-html.mjs \
  --input /absolute/hitlist.csv \
  --captures /absolute/capture-manifest.json \
  --financials /absolute/companies-house-financials.json \
  --config /absolute/client-report-config.json \
  --output /absolute/account-pack.html

# Create the guided preview.
pnpm run research:create-report-preview -- \
  --html /absolute/account-pack.html \
  --output /absolute/account-pack-preview.mp4
```

The Drive skill requires explicit authorization for folder creation, upload and link-sharing changes. Drive publication remains a separate verified state from local package creation.
