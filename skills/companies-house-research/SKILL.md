---
name: companies-house-research
description: Search, resolve, and enrich UK company evidence through Companies House, including profiles, officers, PSCs, filings, accounts, charges, new-company screens, and legal-entity matching with retained lineage. Use for Companies House research and datasets; use build-company-evidence-report only when a polished company dossier or HTML account pack is required.
---

# Companies House Research

Use Companies House as a registry evidence source. Produce reusable legal-entity and filing data without coupling the work to a sales presentation.

## Establish the research mode

Choose the smallest relevant mode:

- **Known company:** verify one company number and retrieve its current registry evidence.
- **Entity resolution:** connect a trading brand or domain to the correct legal entity.
- **Batch enrichment:** enrich a CSV that already contains company numbers.
- **New-company screen:** find and assess recent incorporations by a defined name, SIC, location, or operating-market hypothesis.
- **Virtual-office screen:** find companies registered at a specific, normalized address or configured hub.
- **Market census:** build a reproducible candidate pool for a defined sector and geography.

State the question, geography, observation date, inclusion rules, exclusions, expected output, and whether the result is discovery, verification, or ongoing monitoring. Do not describe a convenient candidate sample as all companies unless the underlying snapshot, filters, and coverage establish that claim.

## Work from the Research Library implementation

From the repository root, inspect current interfaces before running them. Useful entry points include:

- `tooling/companies-house/server/src/jobs/export-report-financials.ts` for no-database profile, registry, officer, PSC, charge, filing, and accounts capture for known company numbers;
- `tooling/companies-house/server/src/lib/companies-house/` for API, public-page, registry, identity, officer, account, XBRL, and analysis logic;
- `scripts/companies-house-virtual-office-leads.mjs` for configured virtual-office hubs;
- `scripts/companies-house-city-agency-census.mjs` for the existing Bristol, Exeter, and Brighton software-agency census;
- `scripts/filter-companies-house-address.mjs` for address filtering;
- `scripts/lib/company-house-csv.mjs` and the enrichment validators for flattened delivery data.

Check the actual command help:

```sh
pnpm companies-house:leads --help
pnpm companies-house:city-agencies --help
```

Do not insert a second `--` before `--help` for these package scripts; it is passed to the Node program as an unknown argument.

The city-agency census is configured for particular cities and software-agency rules. Do not silently reuse it for an unrelated sector. Extend or create an explicit configuration when a new vertical requires different SIC, name, location, or evidence rules.

## Protect access and state

The known-company exporter uses `COMPANIES_HOUSE_API_KEY` when configured and falls back to public Companies House pages when it is not. Check only whether the key exists; never print, copy, commit, or include it in an artifact.

Research must not query Supabase. Prefer no-database exporters, public pages, official bulk files, and retained local artifacts. Do not ingest into a database, reprocess production state, or call mutating internal endpoints unless the user explicitly asks for that separate action.

Respect current Companies House API and bulk-data limits. Reuse cached source artifacts and existing snapshots where they satisfy the observation date. Do not repeatedly refetch unchanged filings.

## Resolve identity before enrichment

A brand, domain, or local office is not automatically a legal company.

Prefer identity evidence in this order:

1. company number and legal name disclosed in the site's footer, terms, privacy notice, invoices, or regulated-register entry;
2. a first-party statement linking the brand to the company;
3. corroborating address, officer, domain, and trading-name evidence;
4. cautious candidate matching for manual review.

Normalize company numbers, including Scottish and Northern Irish prefixes. Preserve both the submitted identity and the resolved legal identity. Record competing candidates and why one was selected or left unresolved.

Do not resolve by similar name alone. A registered office can be an accountant, formation agent, mail-forwarding address, or virtual office rather than an operating location.

## Capture registry layers separately

For each company, retain when available:

- company name, number, status, type, incorporation and cessation dates;
- registered office and jurisdiction;
- SIC codes;
- accounts and confirmation-statement due dates and overdue flags;
- active and resigned officers, roles, appointment dates, and source URLs;
- persons with significant control and available control statements;
- charges and insolvency records;
- filing history and exact document links;
- latest accounts period, filing description, standard, audit and dormant status;
- structured financial facts with concept, period, unit, scale, and warnings;
- raw source URL, fetch time, content type, content hash or artifact identifier, and retrieval mode.

Companies House filings are company-submitted public records. Registry presence is not substantive verification by Companies House and is not proof of trading quality, revenue, service coverage, solvency, or buying intent.

## Handle accounts correctly

Treat the latest accounts filing as authoritative for what was most recently filed, even when it is PDF-only.

- Do not substitute an older structured filing without saying so.
- Do not turn a missing fact into zero.
- Preserve a genuine filed zero as numeric zero.
- Use `Not disclosed`, `No accounts filed`, `PDF-only`, or an equivalent structured state.
- Compare periods only when both values use compatible concepts, units, periods, and signs.
- Keep turnover, profit, cash, employees, assets, liabilities, and equity distinct.
- Do not infer turnover from balance-sheet values or micro-entity status.
- Label estimates and heuristics as inference.

Before changing the XBRL, iXBRL, PDF, or financial-analysis implementation, read the financial reference in the `build-company-evidence-report` skill and run the relevant Companies House tests.

## Known-company capture

For a CSV containing a `company_number` column:

```sh
pnpm companies-house:export \
  --companies-file /absolute/input.csv \
  --output /absolute/companies-house-evidence.json
```

This is a research capture, not a database write. Retain its methodology, run time, per-company errors, source URLs, raw-artifact metadata, and coverage totals.

Use the shared CSV enrichment and validation stages only when a flattened CSV is required. Do not build the standalone HTML report unless the user asks for a presentation or account pack.

## New-company and market screens

Use official monthly bulk snapshots for broad reproducible coverage and live advanced search for post-snapshot registrations when appropriate.

Record:

- snapshot edition or download time;
- query and filter construction;
- SIC, name, incorporation-date, status, and geography logic;
- whether registered-office geography or operating geography is being measured;
- post-snapshot merge and deduplication method;
- result limits and uncovered segments.

For address screens, normalize punctuation, case, unit or floor notation, postcodes, and token order. Require independently meaningful address tokens rather than one fragile contiguous string.

A broad SIC code is a discovery signal. Qualify live operations from first-party web evidence before calling the company a market participant.

## Evidence states

Use explicit states such as:

- `registry-verified`;
- `identity-resolved`;
- `identity-ambiguous`;
- `active-trading-evidenced`;
- `registered-only`;
- `watchlist-newco`;
- `inactive-or-dissolved`;
- `accounts-not-filed`;
- `latest-accounts-pdf-only`;
- `needs-manual-review`.

Keep commercial fit and explicit buying or partnership intent outside the registry state. Only a direct interaction or statement can establish intent.

## Personal data and contact handling

Use public officer and PSC data only for a defined business purpose. Retain source and observation dates, avoid unnecessary personal fields, do not guess emails, and support correction or suppression in downstream workflows. Do not treat a registered residential-looking address as a marketing location.

## Validate the result

Before delivery:

- reconcile company numbers across input, normalized output, and raw artifacts;
- validate JSON and CSV structure;
- preserve per-company failures rather than dropping them;
- verify the latest filing and its real period end;
- distinguish missing, zero, and undisclosed values;
- spot-check company status, identity, officers, and accounts links against official pages;
- report source mode, coverage, warnings, and unresolved identities;
- scan retained artifacts for the API key and unrelated secrets.

Do not commit, push, publish, contact companies, update a CRM, or mutate production systems unless explicitly requested.
