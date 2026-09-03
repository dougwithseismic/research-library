---
name: market-opportunity-research
description: Research and compare commercial opportunities across niches and locations, producing evidence-backed demand, competition, buyer or partner, economics, SEO or site, compliance, and launch recommendations with retained source artifacts. Use for market reviews, city or niche selection, rank-and-rent screening, or a named venture's go-to-market review; use specialist skills directly for keyword-only or company-dossier-only requests.
---

# Market Opportunity Research

Produce a decision-grade market review, not a collage of search results. Keep sourced observations, calculations, commercial interpretations, and unknowns visibly separate.

## Define the decision unit

Translate the request into one or more comparable units:

```text
offer or lead type × customer intent × geography × delivery model
```

Record:

- the decision the research must support;
- the actual offer and price, or the lead type and intended buyer;
- audience, service radius, language, currency, and time horizon;
- whether the task is an initial screen, a deep review, or a buyer pipeline;
- the user's priorities, such as search volume, order value, buyer density, ease of ranking, recurring revenue, or compliance risk.

If the request is broad, such as “all businesses in every city,” stage it. Screen a representative or user-supplied market set first, then deepen only the strongest and most uncertain candidates. Do not imply exhaustive national coverage from a convenient sample.

For rank-and-rent and lead generation, treat each lane as a specific service or lead type in a specific territory. Demand without viable buyers is not an opportunity, and registered companies without consumer demand are not a market.

## Route specialist work

Use the smallest set of relevant modules:

- For Google Ads volumes, CPC, close variants, local geo targeting, or seasonality, read and follow `google-ads-search-volume`. Keep explicit place-name queries separate from generic queries inside a local geo.
- For UK company search, legal-entity resolution, officers, PSCs, filings, accounts, charges, new-company screens, or raw registry evidence, read and follow `companies-house-research`.
- For ordinary current company, competitor, product, price, regulation, claim, or website evidence, read and follow `web-evidence-research`. Use `deep-research` only when the user explicitly requests its deeper artifact workflow.
- For a polished company dossier or standalone HTML account pack, additionally read and follow `build-company-evidence-report`; do not force that presentation layer onto registry-only research.
- For a keyword-only, registry-only, web-evidence-only, or company-report-only request, use the matching specialist skill directly instead of expanding into this full workflow.

Use the authenticated clients and ignored root environment already contained in this repository. Do not duplicate credentials into publications or generated output. Do not query Supabase for research.

## Build an evidence ledger

Classify every material statement:

- **Observed:** directly supported by a current source or captured API response.
- **Derived:** transparent arithmetic from cited observations.
- **Inference:** a commercial interpretation with its reasoning stated.
- **Unknown:** a decision-relevant field that the available evidence does not establish.

Use current primary sources where available. For unstable facts such as prices, event inventory, company status, regulations, search results, and product claims, record the observation date. Use search snippets only for discovery; open the underlying page before treating a claim as evidence.

Read [references/research-contract.md](references/research-contract.md) when retaining a research pack, comparing several markets, or building a reusable scorecard.

## Research the market in layers

### 1. Offer and intent

Define what the customer is buying and which searches genuinely express that purchase mode. Separate adjacent intents such as:

- emergency service, planned service, product purchase, quote, information, employment, and training;
- event, community, coaching, agency, subscription, and personal service;
- consumer demand and potential buyer demand.

A high-volume adjacent query does not belong in the opportunity total merely because the offer might capture some of it.

### 2. Demand

Use consistent keyword construction across places. Retain:

- submitted keywords and any close-variant consolidation;
- average monthly volume, CPC, paid competition, bid signals, and meaningful seasonality;
- geo, language, network, currency, API version, and observation date;
- zero-volume rows when they affect interpretation.

Do not add explicit local phrases to generic local-geo results. Do not describe paid competition as organic difficulty or CPC as lead value.

Where Google Ads data is unavailable, use other demand signals but identify their limitations. Never silently replace volume data with result counts or trend anecdotes.

### 3. Supply and competitors

Map the alternatives a customer can actually choose, not only businesses using the same category label. For each important competitor capture:

- offer and target audience;
- location or service coverage;
- price or the fact it is undisclosed;
- business model and purchase path;
- trust and proof;
- positioning and meaningful differentiation;
- current source URL and observation date;
- whether the page is live, redirected, stale, or only a discovery lead.

Group brands that share one operator. Do not count directory pages, location pages, or sister brands as independent businesses without checking the legal or operating entity.

For local SEO feasibility, distinguish sponsored results, map results, directories, organic competitors, and informational pages. A manual result sample is directional because search results vary by device, location, and time.

### 4. Buyers, partners, and operating capacity

For lead generation, separately assess:

- number of plausible operating buyers in the territory;
- service-area fit and evidence of current trading;
- apparent capacity, specialisation, and lead acceptance constraints;
- public contact route and likely decision role;
- concentration risk when many brands belong to one group;
- referral partners versus lead buyers.

Companies House establishes legal filings, not current operations or buying intent. Keep legal identity, brand, operating evidence, commercial fit, and explicit intent in separate fields. Never infer intent from incorporation, SIC, accounts, advertising, or website quality.

### 5. Economics

Start with transparent scenarios rather than one-point forecasts.

For the offered product or service, model only supported inputs:

- average order or contract value;
- gross contribution rather than revenue when known;
- capacity and fulfilment limits;
- click-to-lead, lead-to-qualified, and qualified-to-sale assumptions;
- CPC, target CPL or CPA, referral fees, refunds, tax, payment fees, and fixed costs;
- conservative, base, and upside cases when uncertainty is material.

Useful derived relationships include:

```text
CPA = CPC ÷ click-to-sale rate
CPL = CPC ÷ click-to-lead rate
maximum CPL = customer gross contribution × lead-to-sale rate × allowed acquisition share
lead revenue = accepted qualified leads × price per accepted lead
break-even units = fixed costs ÷ contribution per unit
```

Label calculations as scenarios unless they use observed conversion and margin data. Do not call gross capacity profit.

### 6. Acquisition and ranking feasibility

Assess channels in the context of the offer:

- search ads and the conversion event they should optimise;
- organic pages and map-pack feasibility;
- referrals, partnerships, directories, PR, outbound, community, and repeat purchase;
- trust required before a visitor will convert;
- lead qualification and routing;
- operational response time and capacity.

For rank-and-rent, include domain or site competition, local-pack incumbency, directory dominance, review moats, address or proximity dependence, lead quality, call handling, buyer concentration, and compliance. Keyword volume alone never produces a build recommendation.

### 7. Named-site and funnel review

When a live site is in scope, check proportionately:

- consistency of price, dates, inclusions, availability, and CTA;
- category clarity and differentiation;
- qualification, checkout, refunds, and abandonment risk;
- operator identity, contactability, credentials, testimonials, and claim support;
- titles, descriptions, headings, canonicals, structured data, sitemap, robots, indexation signals, and internal links;
- common mobile widths, accessibility, and obvious horizontal overflow;
- lab performance with the method and variability stated;
- analytics and funnel events without exposing user data;
- sampled security headers, described as observations rather than a penetration test.

A score from an automated audit does not override an observed conversion contradiction or broken mobile purchase path.

### 8. Compliance and delivery risk

Research current authoritative guidance when regulation can change the recommendation. Common risks include:

- special-category or sensitive personal data;
- consent, direct marketing, cookies, profiling, and data sharing;
- licensing or regulated-provider requirements;
- claims, guarantees, pricing, cancellation, and consumer terms;
- safety, insurance, fulfilment, and buyer conduct.

State when professional legal, tax, medical, or regulatory review is required. Do not convert a risk screen into legal advice.

## Compare markets without fake precision

Use a scorecard only when it clarifies a real choice. Show the raw evidence beside the score, disclose weights, and make missing evidence visible rather than treating it as zero.

Useful dimensions can include:

- relevant demand and intent quality;
- unit economics;
- buyer or partner density;
- competitive and SEO feasibility;
- fulfilment or capacity;
- recurring or expansion potential;
- compliance and operational risk;
- confidence and evidence coverage.

Adapt weights to the user's stated priorities. Always include a written reason a market is recommended, deferred, tested, or rejected.

## Produce the deliverable

Lead with the decision. A full review normally covers:

1. executive verdict and market order;
2. offer and target-customer hypothesis;
3. demand methodology and results;
4. competitor and substitute landscape;
5. buyer or partner capacity;
6. unit economics and sensitivity;
7. acquisition, SEO, site, and funnel feasibility;
8. compliance and operational risks;
9. prioritised test or launch plan;
10. metrics, stop/go rules, unknowns, and evidence limitations.

When the user requests a retained artifact in Research Library, prefer:

```text
publications/<slug>/series/
publications/<slug>/evidence/
```

Retain only relevant artifacts from the contract. Never include customer IDs, OAuth secrets, developer tokens, personal profile answers, or guessed contact data.

## Validate and stop at the authorization boundary

Before delivery:

- validate JSON and CSV structure;
- check important links and downgrade dead or redirected pages;
- reconcile report figures to retained data;
- scan new artifacts for credentials and customer identifiers;
- state which facts are observations, scenarios, or hypotheses;
- preserve unrelated worktree changes.

Research does not authorize campaigns, outreach, account mutations, purchases, CRM changes, commits, pushes, deployments, or publication. Report what was created and what remains untested.
