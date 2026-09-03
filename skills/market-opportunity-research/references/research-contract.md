# Market research artifact contract

Read this contract when a market review will be retained, compared across several locations, or reused by another Research Library workflow. Create only the files the research actually needs.

## Evidence row

Every material observation should be representable as:

```text
claimId
subjectType
subjectName
field
value
unit
evidenceClass
sourceType
sourceName
sourceUrl
observedAt
geography
method
limitations
```

`evidenceClass` is one of `observed`, `derived`, `inference`, or `unknown`.

For a derived value, identify the input claim IDs or put the formula in `method`. For an inference, cite the observations that support it and state the uncertainty. Do not attach a citation to prose it does not support.

## Suggested retained files

Use stable, descriptive filenames. A full pack may contain:

- `research-manifest.json`: scope, decision, geographies, languages, currencies, methods, observation times, and tool or API versions;
- `sources.csv`: source name, type, URL, observation time, supported field or claim, and limitations;
- `google-ads-explicit-<market>.csv`: place-modified queries under the broader target;
- `google-ads-local-geo-<market>.csv`: generic queries inside a verified local geo;
- `google-ads-seasonality-sanitized.json`: retained normalized monthly metrics without account identifiers;
- `competitors.csv`: brand, operator, offer, audience, location, price, proof, status, and sources;
- `organizations.csv`: brand and legal-entity evidence for buyers or partners;
- `economics.json`: inputs, formulas, scenarios, units, and unknowns;
- `site-audit.json`: sampled URLs, metadata, schema, performance, accessibility, measurement, and limitations;
- `evidence-ledger.csv`: optional normalized claim-level provenance when the report is complex.

Keep raw or normalized API output when it materially supports reproducibility. If the authentic raw response contains account identifiers, store a sanitized snapshot and document the removed fields.

## Research manifest

A useful manifest includes:

```json
{
  "observedAt": "YYYY-MM-DD",
  "decision": "The decision this research supports",
  "offer": "The product, service, or lead type",
  "markets": [],
  "languages": [],
  "currencies": [],
  "methods": [],
  "includedArtifacts": [],
  "limitations": []
}
```

Do not claim the pack is exhaustive unless the sampling frame and coverage prove it.

## Competitor and organization identity

Keep these concepts separate:

- brand name;
- domain;
- legal entity and company number;
- parent or operating group;
- physical or service-area evidence;
- live trading evidence;
- pricing and offer evidence;
- public contact route;
- commercial fit;
- explicit buyer or partner intent.

A group with twelve location or brand sites is not twelve independent buyers. A registered company with a relevant name is not proof of a live service.

Recommended status values include:

- `qualified-operating`;
- `operating-unresolved-entity`;
- `discovery-lead`;
- `redirected-or-stale`;
- `inactive-or-dissolved`;
- `watchlist-newco`;
- `explicitly-qualified`;
- `explicitly-rejected`.

Only an interaction or direct statement can support the last two statuses.

## Demand comparison

For every Google Ads dataset retain:

- submitted keyword;
- returned keyword;
- close variants;
- average monthly searches;
- monthly history when material;
- competition and competition index;
- average CPC and bid fields in the account currency;
- target geo name and verified criterion ID;
- language, network, API version, and observation date.

Keep explicit-local and local-geo files separate. Deduplicate returned close variants before calculating any basket. Record the exact rows used in a weighted CPC or comparison proxy.

## Economics

Each calculation should contain:

- name and decision purpose;
- input values and units;
- whether each input is observed, provided, assumed, or derived;
- formula;
- output;
- sensitivity or range;
- limitations.

Do not silently substitute revenue for gross contribution, listed capacity for sell-through, search volume for visits, or visits for leads.

For lead generation, keep at least these stages distinct:

```text
searches → visits or calls → raw leads → qualified leads → accepted leads → sales
```

Buyer capacity and service radius can constrain the result before search volume does.

## Comparative scorecards

A scorecard should include both the normalized score and its evidence coverage. A market with sparse evidence must not outrank a well-evidenced market merely because unknown values defaulted optimistically.

For each dimension record:

```text
dimension
weight
raw evidence
normalization rule
score
confidence
missing evidence
```

Show an unweighted table when the user has not expressed priorities and the chosen weights would drive the conclusion.

## Site audit

Record:

- exact production URL and observation time;
- route sample and status;
- metadata, H1, canonical, schema, sitemap, and robots observations;
- viewport and browser for visual checks;
- audit runner, run count, and lab-versus-field caveat;
- analytics patterns searched;
- sampled response headers;
- inconsistencies in offer, price, availability, schedule, checkout, terms, or privacy.

Do not present one request, screenshot, or Lighthouse run as universal site behaviour.

## Validation

Before handoff:

1. Parse every JSON artifact.
2. Validate every CSV has a consistent header width and row width.
3. Recalculate report totals from retained rows.
4. Check important source links; mark redirects, blocks, and dead pages.
5. Confirm observation dates and currencies are visible.
6. Search artifacts for credential names paired with values, customer identifiers, tokens, and private profile data.
7. Confirm no source is being used beyond what it supports.
8. Run the repository formatter or structural checks on new report files.
9. Report whether files are uncommitted, committed, or published; never infer publication.
