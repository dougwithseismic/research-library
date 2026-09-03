# Report contract

Use this contract to keep research, enrichment, capture, and presentation reproducible.

## Inputs

The brief must define:

- client name and website;
- literal service territory;
- the client's real services and a practical first offer;
- target account count;
- recency window for growth evidence;
- output location and whether PPTX or PDF is also required.

## Core account row

Keep one stable record per legal entity:

| Field                    | Rule                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `rank`                   | Integer for qualified accounts; blank for watchlist rows.                           |
| `priority`               | `A`, `B`, or `Watch`.                                                               |
| `status`                 | `call_now` or `verify_first`.                                                       |
| `company`                | Trading/display name.                                                               |
| `legal_entity`           | Companies House name.                                                               |
| `company_number`         | Preserve leading zeroes.                                                            |
| `location`               | Evidence-backed registered or operating location. Label which one when they differ. |
| `incorporated`           | ISO date.                                                                           |
| `sector`                 | Plain-English operating sector.                                                     |
| `growth_or_new_signal`   | Specific public event or observed scale.                                            |
| `signal_date`            | ISO date, date range, or explicit `current_site`.                                   |
| `why_client_fits`        | Commercial inference tied to the client's capability.                               |
| `first_offer`            | Small, concrete opening engagement.                                                 |
| `target_contact_or_role` | Verified person or role; no invented name.                                          |
| `public_contact`         | First-party public routes only.                                                     |
| `website`                | Verified live URL or blank.                                                         |
| `companies_house_url`    | Official company profile.                                                           |
| `evidence_urls`          | One or more URLs supporting the trigger.                                            |
| `confidence`             | `high`, `medium`, or `low`.                                                         |
| `caveat`                 | The most important evidence limit.                                                  |

## Companies House enrichment record

Each account should resolve to:

```text
companyNumber
companyName
sourceUrl
observedAt
profile
  status, type, incorporatedOn, registeredOffice, sicCodes
  accountsType, accountsPeriodEnd, accountsNextDue, accountsOverdue
  confirmationNextDue, confirmationOverdue
officers[]
registry
  controllers[]
  charges
accountsDocument
  filingDate, filingDescription, documentUrl, contentType, format, pages
financials
  periodStart, periodEnd, currency, disclosure
  metrics.<metric>.current, previous, absoluteChange, percentageChange
  ratios, signals, warnings
quality
  financialWarnings, rawArtifactCount
rawArtifacts[]
  id, contentType, byteLength, storageUri, sourceUrl, fetchedAt
```

`accountsDocument` and `financials` may be null. Absence is an observation, not a value.

## Presentation outputs

Minimum deliverables:

1. Research CSV with all account rows and the complete flattened Companies House enrichment record.
2. Companies House financial JSON with provenance.
3. Screenshot manifest containing requested URL, final URL, local image, kind, and result.
4. Standalone interactive HTML with one complete dossier per company, combining account intelligence and Companies House financials.

Optional deliverables must be derived from the same data, not maintained as separate facts:

- PPTX for a short meeting narrative;
- PDF exported from the verified HTML;
- email-ready shortlist.

## Acceptance checks

- Every input row appears once as a complete company slide.
- Every company slide contains one company-statistics section with financial, filing, people and compliance facts.
- Qualified and watchlist counts match the dataset.
- Embedded capture count matches successful manifest entries.
- Every displayed company number maps to its exact Companies House profile.
- Every financial value has an accounts period and exact filing source.
- Every CSV row contains the Companies House profile, filing, people, control, charge and financial columns; current and previous values reconcile to the captured financial JSON.
- Commercial analysis and contact actions appear before the financial block within every company slide.
- Missing financial values display `Not disclosed`, never `0` unless zero is an actual filed fact.
- A latest PDF-only filing is not silently replaced by older structured accounts.
- No LinkedIn screenshot or guessed email appears.
- Every displayed person name has its own LinkedIn profile or search badge; every address has a Google Maps badge.
- Desktop and 390px mobile views have no horizontal overflow.
- Tabs, filters, sort, lightbox, links, and print mode have been exercised in a real browser.
