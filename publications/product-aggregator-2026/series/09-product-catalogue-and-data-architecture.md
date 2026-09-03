# Product, catalogue and data architecture

## What should the system model?

The system should model decisions, evidence and money—not just products.

At minimum it needs four connected graphs:

1. **Product graph:** canonical products, variants, category attributes, compatibility and evidence.
2. **Offer graph:** merchants, programmes, prices, stock, delivery, commission eligibility and observations over time.
3. **Project graph:** buyer constraints, rooms or spaces, calculations, shortlists and recommendations.
4. **Attribution graph:** outbound clicks, transactions, validation, commission, creator allocation and corrections.

Installed projects add a fifth graph for leads, partners, service areas, qualification, acceptance and outcomes. Used machinery adds individual assets, condition and sellers.

```text
raw feeds ──→ canonical products ──→ category attributes ──→ comparisons
    │                 │                        │                   │
    └──→ offers ──→ offer observations         └──→ rules ──→ project shortlist
                      │                                        │
                      └──→ tracked click ──→ transaction ──→ commission ledger

project specification ──→ eligible installer/dealer ──→ accepted lead ──→ outcome
```

## Which entities are required?

### Catalogue entities

`Category`

- Stable platform category.
- Parent and child relationships.
- Attribute schema version.
- Publication and review policy.

`Product`

- Canonical manufacturer product.
- Brand, model, identifiers and lifecycle status.
- Category assignment.
- Canonical description written by the platform.
- Primary evidence and verification state.

`ProductVariant`

- A true manufacturer variant such as capacity, voltage, size or finish.
- Parent product.
- Variant-specific identifiers and attributes.

`AttributeDefinition`

- Stable key, label, data type and unit.
- Applicability by category.
- Allowed values or validation bounds.
- Comparison and filter behaviour.
- Evidence requirement.

`AttributeValue`

- Product or variant.
- Normalised value and original source value.
- Unit conversion.
- Source and observation time.
- confidence, verification and conflict state.

`CompatibilityRule`

- Inputs, condition and outcome.
- Version.
- Explanation shown to the user.
- Evidence or expert approval.

### Offer entities

`Merchant`

- Operating brand and domain.
- Country, delivery area and support routes.
- Trust and service observations.
- Programme relationships.

`AffiliateProgramme`

- Network and programme identifier.
- relationship status;
- attribution window;
- commission groups;
- PPC and content permissions;
- validation and de-duplication rules;
- feed availability;
- effective dates.

`Offer`

- Merchant-specific sellable item.
- Product or variant identity.
- Merchant SKU and URL.
- condition;
- delivery model;
- finance and installation flags;
- affiliate eligibility.

`OfferObservation`

- Offer, timestamp and source feed version.
- active price, previous price and currency.
- delivery cost and restrictions.
- stock status and quantity where available.
- lead time.
- observed affiliate URL.
- validation flags.

The current price is a view over observations, not a field that destroys history.

### Editorial and evidence entities

`EvidenceSource`

- URL or captured source.
- source type and owner.
- published, updated and observed dates.
- status: live, redirected, blocked, archived or dead.
- supported field and limitation.

`TestProtocol`

- Category, procedure, equipment and conditions.
- version and author.
- repeatability and limitations.

`ProductTest`

- Product, protocol and tester.
- raw observations.
- results, media and date.
- supplied, borrowed or purchased status.
- commercial relationship.

`EditorialAssessment`

- use case and audience;
- positive and negative evidence;
- recommendation and exclusions;
- author and reviewer;
- last verified date;
- affiliate and sponsorship disclosure.

### Project entities

`Project`

- User or anonymous session.
- Vertical-specific type.
- Location at the minimum precision needed.
- constraints, budget and timing.
- consent state.

`ProjectMeasurement`

- Dimension, service capacity or environmental condition.
- value, unit and confidence.
- user-supplied, measured, calculated or externally sourced.

`RecommendationRun`

- Project snapshot.
- rule and model versions.
- eligible and excluded products.
- reasons and scores.
- timestamp.

`Shortlist`

- Products and offers saved by the user.
- notes and comparison state.
- price-alert preferences.

### Attribution and finance entities

`OutboundClick`

- opaque public click identifier;
- product, offer, merchant and placement;
- project, creator and content context where permitted;
- source and campaign;
- timestamp and privacy-safe session association.

`MerchantTransaction`

- network transaction identifier;
- click/sub-ID match;
- merchant, order value, commission and currency;
- pending, approved, declined or corrected state;
- transaction and validation dates.

`CommissionJournal`

- immutable debit and credit entries;
- transaction and correction references;
- platform and creator allocation;
- funding and payout state;
- idempotency key.

### Installed-project entities

`Partner`

- Installer or dealer.
- operating evidence and service categories.
- postcode or area coverage.
- capacity and minimum project.
- lead terms and response commitment.

`QualifiedLead`

- frozen project specification.
- explicit contact and data-sharing consent.
- eligibility result.
- duplicate and fraud checks.
- partner assignment.

`LeadOutcome`

- accepted, rejected, booked, sold or lost.
- reason and timestamp.
- commercial charge and dispute state.

## How should feed ingestion work?

Awin describes feeds containing deep links, names, descriptions, prices, discounts, delivery, images and additional vertical attributes. It provides a feed list with last-update time and recommends downloading only changed feeds. [Awin publisher feed guide](https://help.awin.com/developers/docs/product-feed-publisher-guide-intro)

The ingestion process should be staged:

### 1. Discover and authorise

- Verify programme relationship and feed permission.
- Record programme terms and effective date.
- Obtain feed identifier without exposing API keys.
- Register expected format, delimiter, compression and update behaviour.

### 2. Capture raw

- Download the immutable source file.
- Record checksum, byte size, row count, headers and source timestamp.
- Store access-controlled raw data with retention appropriate to terms.
- Never log feed keys in job output or error reporting.

### 3. Validate structure

- Parse with strict column-width and encoding checks.
- Validate URLs and currencies.
- Validate numeric prices and delivery fields.
- reject impossible dates and negative stock;
- quarantine duplicate merchant product IDs;
- measure missing identifier and attribute rates.

### 4. Stage source rows

- Preserve merchant values without overwriting canonical fields.
- Attach source feed and row lineage.
- Convert units into normalised fields while retaining originals.
- Mark unknown rather than fabricating defaults.

### 5. Resolve identity

Use a hierarchy:

1. Exact valid GTIN or other global identifier.
2. Exact brand plus manufacturer part number.
3. Controlled brand, model and variant fingerprint.
4. Manually approved match.

Never auto-merge from title similarity alone in high-value categories. `Rohde Ecotop 60`, a controller bundle and a similarly named larger-capacity model can appear close while being commercially different.

Potential matches should carry scores and reasons, with thresholds for auto-match, human review and rejection.

### 6. Map attributes

- Map source columns to typed category attributes.
- Extract specifications only into a review queue unless the source format is trusted.
- convert units;
- detect conflicts;
- record evidence and observation date;
- recompute filters and compatibility.

### 7. Create offer observations

Every accepted row creates a time-bounded observation. The system should never rewrite yesterday's price into oblivion.

### 8. Publish safely

Publish only if:

- product identity is resolved;
- price and currency are valid;
- affiliate URL is eligible and safe;
- stock or availability is recent enough;
- required comparison attributes meet the category threshold;
- no unresolved severe conflict exists;
- merchant and programme remain active.

## How fresh should the catalogue be?

Awin recommends updating feeds at least every 24 hours because mismatched prices reduce conversion. [Feed management guidance](https://help.awin.com/developers/docs/en/managing-your-feed)

The platform should define category-level freshness budgets:

| Data                           |                  Freshness target | Stale behaviour                                              |
| ------------------------------ | --------------------------------: | ------------------------------------------------------------ |
| Price and stock                |       24 hours where feed permits | Hide price or label last checked; suppress unavailable offer |
| Delivery and lead time         |                       24–72 hours | Label timestamp and avoid ranking on stale promise           |
| Commission and programme terms | Daily API plus manual term review | Stop paid acquisition or creator promise on uncertainty      |
| Manufacturer specifications    |            Review on model update | Preserve previous evidence; flag conflict                    |
| Editorial test                 |   Versioned, no artificial expiry | Show test date and model version                             |
| Installer coverage             |          Confirm at least monthly | Do not route leads to unconfirmed areas                      |

Feed health should be visible in operations:

- last successful fetch;
- last source update;
- row-count change;
- new, removed and changed offers;
- invalid-row rate;
- identity-match rate;
- price anomaly count;
- stale published offer count;
- link health;
- programme eligibility state.

## How should recommendations be generated?

The first recommendation engine should be deterministic and explainable.

```text
hard constraints → eligible set → suitability scoring → offer ranking
```

Hard constraints exclude products that cannot work. Suitability scoring ranks the remaining products for the stated use case. Offer ranking then compares merchant price, delivery, installation, service and availability.

Commission must not enter product suitability. If commercial value affects an offer placement, label it and keep an uncommercialised relevance order available.

Every recommendation run should persist:

- inputs;
- rule version;
- product and attribute versions;
- exclusions and reasons;
- resulting order;
- commercial placement context.

This allows corrections and audits when an attribute changes.

Machine-learning ranking should wait until the platform has enough clean outcome data. A model trained on affiliate clicks will learn merchant creative and commission effects, not necessarily product suitability.

## How should search and filtering work?

Search should resolve buyer language to platform entities:

- synonyms and common misspellings;
- brand, model and manufacturer number;
- project language such as “steep lawn” or “13 amp kiln”;
- attribute ranges and units;
- availability and service geography;
- new, used and restored condition.

Filters should be generated from typed attributes, never parsed ad hoc from titles at request time. Counts should reflect currently eligible offers and products.

The index should support:

- product search;
- project guides;
- merchant and brand pages;
- compatibility and use-case landing pages;
- saved search and price alerts;
- operations search over conflicts and stale data.

## What structured data should the public site use?

Google distinguishes merchant listings from editorial product snippets. Merchant listing experiences require that the shopper can purchase on the marked-up page; an affiliate aggregator that sends buyers elsewhere is not the seller. [Google merchant-listing guidance](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)

The aggregator should therefore use:

- `Product` structured data on specific canonical product pages;
- `AggregateOffer` where the page genuinely aggregates several merchant offers for one product;
- `Review` only for a real, visible editorial assessment with a named person or team;
- `positiveNotes` and `negativeNotes` that match visible pros and cons;
- `ItemList` for ranked or compared collections where appropriate;
- `BreadcrumbList` for category hierarchy;
- `Article` for editorial guides.

Google's product-snippet documentation explicitly supports `AggregateOffer` for a product sold by several merchants and warns not to use it for product variants. [Product snippet guidance](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)

Do not mark affiliate pages as merchant listings or invent aggregate ratings. Affiliate links should use `rel="sponsored"` as Google requests. [Google affiliate-link guidance](https://developers.google.com/search/blog/2021/07/link-tagging-and-link-spam-update)

## What should the application topology be?

The existing multi-surface shape is appropriate:

- **Public web:** anonymous, cacheable editorial, category, product and comparison pages.
- **Application:** saved projects, shortlists, price alerts and creator tools.
- **Admin:** catalogue review, offer health, attribution, finance and lead operations.
- **API:** authentication, authorisation and the only browser-facing route to persistent data.
- **Worker:** feed sync, link health, transaction polling, reconciliation, alerts and scheduled publication checks.
- **Redirect service:** low-latency tracked outbound links with durable event capture.

The public site should degrade gracefully if the application or admin surface is unavailable. A comparison page may show last-verified offers, but it must not show a fabricated live price when the feed pipeline is down.

## What events should be instrumented?

Core decision events:

- `project_started`;
- `constraint_answered`;
- `recommendation_run`;
- `product_excluded_viewed`;
- `comparison_started`;
- `product_added_to_shortlist`;
- `offer_selected`;
- `merchant_click_created`;
- `price_alert_created`;
- `project_specification_submitted`;
- `lead_consent_recorded`.

Commercial events:

- `transaction_ingested`;
- `transaction_matched`;
- `transaction_approved`;
- `transaction_declined`;
- `commission_funded`;
- `creator_payable_created`;
- `creator_paid`;
- `lead_accepted`;
- `lead_rejected`;
- `survey_booked`;
- `project_sold`.

Events should carry opaque IDs, schema versions and only the minimum personal data required. Analytics state must never become the financial ledger.

## What should be built first?

### MVP

- One vertical and one decision ontology.
- 50–100 canonical products.
- At least two eligible offers on the most important products.
- One deterministic selector.
- Product, comparison and project-guide pages.
- Saved shortlist.
- Tracked outbound links.
- Transaction ingest and reconciliation.
- Feed health and manual catalogue review.
- Visible evidence, timestamp and affiliate disclosure.

### After product-market evidence

- Price history and alerts.
- Creator project collections.
- Second and third category ontology.
- Installed-project lead routing.
- Merchant self-service inventory and corrections.
- Personalised recommendation ranking.
- Native mobile surfaces.
- Data products.

The first technical milestone is not “ingest an entire feed.” It is “resolve, compare, recommend and attribute a small serious catalogue correctly.”
