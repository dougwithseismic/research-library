---
name: build-company-evidence-report
description: Research and build an evidence-led company hitlist as a polished, standalone interactive HTML report where every company slide combines public website captures, source-linked account intelligence, and Companies House financials. Use for local prospect lists, growth-company dossiers, sales-account packs, or dark editorial lead reports; use companies-house-research for registry-only searches or datasets without a presentation.
---

# Build Company Evidence Report

Create the research dataset and the final presentation together. Treat the report as a compact evidence product, not a decorated list of names.

## Start with the brief

1. Inspect the client website, service area, offer, and any earlier report the user says was good.
2. Reuse a strong earlier visual system when one exists. Preserve the new report's audience, facts, and commercial framing.
3. Define the territory literally. Exclude companies outside it unless their operating presence inside the territory is directly evidenced.
4. Set a useful target count and split uncertain new registrations into a visible verification watchlist rather than presenting them as qualified leads.
5. Inspect the current Research Library scripts and retained evidence before creating replacements. Never query Supabase merely to build a report.

## Produce a layered evidence model

Keep these layers distinct in the source data and presentation:

- Registry identity: legal entity, company number, status, incorporation, registered office, SIC codes, filing compliance.
- Public growth evidence: dated funding, awards, expansion, new premises, partnerships, contracts, visible operating scale, or recent registration.
- Commercial interpretation: why the signal matters for this client, a specific opening offer, target person or role, and a caveat.
- Contact path: first-party email, telephone, contact form, named director, or role. Never guess an email.
- Financial filing: accounts period and type, disclosed turnover, profit, employees, cash, assets, liabilities, equity, and filing limitations.

The research CSV is a delivery artifact, not merely an input stub. After Companies House capture, flatten the complete enrichment record into every account row: observation and source URLs, profile and compliance fields, officers, controllers, charges, filing document metadata, disclosure basis, warnings, every supported current and previous financial value and period, absolute and percentage changes, source concepts, and derived ratios. Use `Not disclosed` for absence while preserving a real filed zero as numeric zero.

Use the field and output contract in [references/report-contract.md](references/report-contract.md).

## Research and evidence rules

Prefer primary sources in this order:

1. Companies House for legal identity and filings.
2. The company's own site for products, locations, public contact routes, and operating evidence.
3. The named funder, university, award body, council, or partner for dated growth signals.
4. Reputable reporting when the primary announcement is unavailable.

Attach every material claim to a source URL. Label inference as inference. A growth signal prioritises a conversation; it does not prove budget, buying intent, revenue growth, or headcount growth.

For LinkedIn:

- Use a live profile link only when the named person is verified.
- Otherwise create a live people-search link for the named person and company.
- Never capture or embed LinkedIn screenshots.
- Do not scrape LinkedIn to fill missing employment facts.

## Enrich from Companies House

Use the official API when a key is already configured. If it is not, use the public company pages and the filing document links. Do not stop the whole report for a missing API key.

Capture the raw source for each request with its URL and observation time. Prefer content-addressed files so reruns preserve provenance without duplicating content.

For every company, collect when available:

- profile, officers, persons with significant control, charges, and filing history;
- the latest accounts filing and its real period end;
- structured XBRL or iXBRL facts when the latest filing exposes them;
- current and previous periods for each metric, with a source concept and period.

Never use an older structured filing merely because the latest filing is PDF-only. Mark the latest filing as PDF-only and leave structured metrics undisclosed unless the PDF is deliberately parsed and checked.

Never turn a missing value into zero. Render `Not disclosed`, `No accounts filed`, or `PDF-only` as appropriate. Companies House filings are company-submitted public records; say so in the report.

Read [references/companies-house-financials.md](references/companies-house-financials.md) before implementing or changing the filing extractor.

## Capture public visual evidence

Capture one strong image per qualified account when possible:

- Prefer the first-party homepage or the specific first-party evidence page.
- A credible partner or news page is acceptable for a dated growth signal.
- Use a clean desktop viewport and retain the live destination URL.
- Reject cookie walls, consent overlays, error pages, missing-site placeholders, and irrelevant redirects.
- Replace a failed capture with a clearly designed verification state; do not disguise failure as evidence.
- Never use LinkedIn as the screenshot source.

Visually inspect every retained capture. Capture counts in the report must equal the number of images actually embedded.

## Build the standalone report

Use the visual starting point in [assets/editorial-report-theme.css](assets/editorial-report-theme.css). Inline the final styles, scripts, and approved captures so the HTML opens without a build server.

Each company must be one complete slide. Do not split the sales case and the financial record into separate account and financial tabs.

### Every company slide

- order the slide as identity, public evidence, commercial read/contact/registry/evidence limits, then Companies House financials;
- ranked call-now accounts followed by the verification watchlist;
- public evidence capture and live source;
- legal identity and company number;
- growth trigger, fit, opening offer, named target or role, public contact route;
- evidence links, confidence, status, and caveat;
- accounts period, filing description, accounting standard, and audit status;
- turnover, average employees, profit before tax, cash, current assets, and net assets;
- every other structured metric disclosed in the latest accounts, including fixed assets, debtors, creditors, equity and additional profit measures;
- YoY comparisons only when both periods exist;
- active officers, active controllers, charge summary, compliance dates, SIC codes;
- direct links to the company profile and exact accounts document;
- disclosure warnings next to the affected company.

Make names and addresses actionable:

- put a compact LinkedIn `in` badge beside every named target, officer, controller, or other person;
- link the badge directly to a verified profile when one is known, otherwise to a live LinkedIn search for that person plus the company;
- render multiple names as separate rows so each name has its own badge;
- put a compact map-pin badge beside every registered or operating address and link it to a Google Maps search for the full address;
- preserve real `mailto:` and `tel:` actions for every disclosed email address and telephone number.

At report level include a financial-coverage summary plus search, status, priority, confidence, and sort controls. Keep each company's evidence, commercial read and filing statistics together beneath one company heading.

Use `#17231f` ink, `#c9ff5b` acid green, warm paper, strong editorial typography, crisp rules, generous spacing, and restrained motion. The financial block should look native to the company slide, not like an exported spreadsheet pasted into it.

Use a Utopia fluid type and spacing system across the report. Define shared `--step-*` and `--space-*` clamp tokens from the intended mobile and desktop viewports, then build headings, body copy, card padding, grid gaps and vertical rhythm from those tokens. Avoid scattered one-off responsive font sizes and margins.

## Validate before delivery

Run the included structural validator:

```bash
node scripts/validate_report.mjs --html /absolute/path/to/report.html --expected-accounts 19 --expected-financials 19
```

Then use a real browser at desktop and mobile widths to verify:

- every company slide contains exactly one Companies House statistics section;
- company and statistics-section counts match the input dataset;
- every filter and sort control works;
- turnover and employee disclosure filters match the generated coverage counts;
- there are no console or page errors;
- there is no horizontal overflow at 390px;
- images enlarge and their live links resolve;
- no LinkedIn screenshot is present;
- every rendered person name has an adjacent live LinkedIn profile or search action;
- registered and operating addresses expose working Google Maps actions;
- print or save-to-PDF keeps every company dossier together as cleanly as possible;
- at least the hero, one complete company slide, and one verification state have been visually inspected.

The reusable Research Library implementation is:

- `tooling/companies-house/server/src/jobs/export-report-financials.ts` for no-database Companies House capture and financial JSON;
- `scripts/lib/company-house-csv.mjs` for the shared flattened Companies House CSV schema used by every client;
- `scripts/enrich-company-evidence-csv.mjs` for joining captured financial evidence back into the delivery CSV;
- `scripts/validate-company-evidence-csv.mjs` for reconciling every flattened field to the source JSON;
- project-specific capture and HTML builders should live inside the relevant publication directory rather than the shared tooling layer.

Do not commit, push, deploy, send outreach, or mutate a CRM unless the user explicitly asks for that separate action.
