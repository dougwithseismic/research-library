# Trust, compliance and operating controls

## Why is trust part of the product?

The aggregator influences expensive consumer decisions while earning money from some of the resulting purchases. That creates an unavoidable tension: the platform must recommend products and merchants while remaining commercially interested in the outcome.

The correct response is not a disclaimer hidden in the footer. Commercial relationships, evidence quality, rankings, prices, reviews and tracking must be designed so a buyer can understand what is editorial, what is advertising, what was directly tested and what remains unknown.

This chapter is a current risk screen for a UK launch, not legal advice. The final product, agreements, privacy design and category claims require professional review proportionate to the launch scope.

## How should affiliate relationships be disclosed?

ASA/CAP guidance says affiliate marketing must be obviously identifiable. Where an article wholly concerns affiliate-linked products, the commercial nature may need to be clear before the reader engages. Where only some links are affiliate links, the linked content itself should be identifiable at the point it appears. A generic or ambiguous footer disclaimer may be insufficient. [ASA affiliate-marketing guidance](https://www.asa.org.uk/advice-online/affiliate-marketing.html)

Practical controls:

- Put a plain disclosure before the first affiliate product or link.
- Mark affiliate offers consistently, for example `Ad — affiliate link`.
- Explain that the platform receives commission if a qualifying purchase occurs.
- Do not say the platform “may” earn commission when it ordinarily will on a qualifying attributed purchase.
- Label sponsored placements separately from ordinary affiliate links.
- Repeat the disclosure in creator projects and social posts.
- Make the site's overall commercial model visible in navigation, not only terms.
- Store the disclosure version shown with the click event where feasible.

Suggested plain-language disclosure:

> Some retailer links are advertising links. If you buy after using one, the retailer may pay us a commission. This does not change the price you pay. Paid placements are labelled separately and do not determine our product-suitability scores.

The exact wording should be reviewed against the final experience and contracts.

## How should affiliate links be marked technically?

Google asks sites to qualify affiliate links with `rel="sponsored"`. [Google affiliate-link guidance](https://developers.google.com/search/blog/2021/07/link-tagging-and-link-spam-update)

Outbound links should also:

- pass through an opaque tracked redirect without exposing internal data;
- validate the destination against an approved merchant domain;
- prevent open redirects;
- retain product, offer and placement context through approved sub-ID fields;
- show a safe unavailable-link page when an offer disappears;
- avoid placing personal project details in the destination URL;
- follow programme rules for deep links, voucher codes and direct linking.

## How should editorial rankings remain independent?

Maintain three separate systems:

1. **Suitability:** whether a product fits the buyer's constraints.
2. **Offer quality:** total price, stock, delivery, service and merchant evidence.
3. **Commercial value:** commission, sponsorship and campaign terms.

Commercial value should not enter suitability scoring. If it affects placement, the placement is advertising and must be labelled.

Every ranked page should publish:

- the audience and use case;
- hard exclusions;
- score dimensions and weights;
- evidence date;
- what was tested directly;
- what came from a manufacturer or merchant;
- commercial relationship;
- correction route.

The editorial team should be able to recommend a non-commissionable product or “buy nothing/hire instead” when the evidence supports it.

## What does Google consider a thin affiliate page?

Google describes thin affiliation as affiliate content that copies product descriptions or reviews from merchants without original value. It gives additional price information, original reviews, rigorous testing, ratings, navigation and comparison as examples of added value. [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

Publication controls should therefore block pages that contain only:

- merchant title and description;
- one merchant image;
- current price;
- affiliate link;
- generic generated pros and cons;
- unsupported star rating.

A publishable product page should meet a category threshold such as:

- resolved canonical identity;
- several material normalised attributes;
- evidence source and verification date;
- at least one meaningful comparison context;
- visible offer freshness;
- editorial limitation or exclusion;
- more than one merchant offer where the page claims comparison;
- no unsupported first-hand language.

## How should product tests and reviews be governed?

The platform must distinguish:

- manufacturer claim;
- merchant description;
- expert assessment;
- original test;
- owner report;
- aggregated consumer review.

An original test requires a protocol, tester, date, product version, conditions, raw observations and commercial disclosure. Receiving a product for free does not invalidate a review, but the incentive must be disclosed and the review cannot be represented as an ordinary verified purchase.

Do not use phrases such as “we tested” unless a named person or team performed and documented a test. Do not generate experience claims from specifications.

## What controls apply to consumer reviews?

The Digital Markets, Competition and Consumers Act 2024 introduced more detailed rules around fake reviews, concealed incentivised reviews and misleading review information from 6 April 2025. CMA guidance applies to traders publishing reviews or aggregated review information, including material collected elsewhere. It says publishers need reasonable and proportionate procedures to prevent and remove banned material. [CMA unfair-commercial-practices guidance](https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices), [CMA review-publisher guide](https://www.gov.uk/government/publications/fake-reviews/short-guide-for-businesses-publishing-consumer-reviews-and-complying-with-consumer-protection-law)

The safest MVP is not to host open consumer reviews.

If reviews launch later, implement:

- a public review policy;
- verified-purchase or verified-ownership status;
- incentive disclosure;
- moderation and fraud detection;
- prohibited-content rules;
- reporting and appeal;
- reviewer account controls;
- duplicate and coordinated-review detection;
- preservation of negative reviews subject to lawful moderation;
- transparent calculation of aggregates;
- retraction and correction history;
- staff training and audit logs.

Do not import merchant star ratings into one platform score unless the source, sample, date and aggregation method remain visible and contractually permitted.

## How should prices be represented?

The displayed value should distinguish:

- product price;
- delivery;
- mandatory installation;
- unavoidable fees;
- optional extras;
- finance price and total payable;
- indicative project estimate;
- final surveyed quote.

The DMCC Act rules and CMA guidance include more detailed prohibitions around drip pricing. A low headline that excludes unavoidable delivery or installation can mislead the buyer. [CMA guidance](https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices)

Operational controls:

- Store active and previous prices as observations.
- Preserve currency and VAT status.
- Show delivery separately when variable.
- Never claim a discount without a supportable reference price and period.
- Timestamp every displayed offer.
- Hide or label stale prices.
- Treat “from” prices as ranges with assumptions.
- Do not present an awning estimator as a binding quote.
- Link to merchant terms before checkout.
- Capture screenshots or source snapshots for disputed price observations where permitted.

## What product structured data is appropriate?

An affiliate aggregator is not the merchant merely because it displays an offer. Google says merchant listing experiences require a page where the shopper can purchase from the page owner, while product snippets cover editorial and aggregated product information. [Google merchant-listing guidance](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing), [product guidance](https://developers.google.com/search/docs/appearance/structured-data/product)

Use:

- `Product` on one canonical product page;
- `AggregateOffer` only for several genuine merchant offers for that product;
- `Review` only for visible, attributable editorial review;
- visible pros and cons matching structured data;
- accurate current price currency and offer count;
- `Article` for guides and methodologies.

Do not:

- mark the platform as seller when checkout is elsewhere;
- combine variants as `AggregateOffer`;
- fabricate rating counts;
- leave expired `priceValidUntil` values;
- emit prices the visible page does not show;
- mark a category grid as one product.

## What controls apply to cookies and affiliate tracking?

The ICO published final Storage and Access Technologies guidance on 29 April 2026 covering PECR and, where relevant, UK GDPR across cookies, tracking pixels, fingerprinting and similar technologies. [ICO announcement and guidance route](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/04/final-storage-and-access-technologies-guidance-published/)

The actual consent requirement depends on the technology, purpose and current law. Before launch:

- inventory every first- and third-party storage/access technology;
- record purpose, provider, duration and data recipients;
- separate strictly necessary operation from analytics, advertising and personalisation;
- block non-essential technologies until the required consent state exists;
- provide an equally accessible reject route where consent is the basis;
- preserve and honour consent changes;
- avoid fingerprinting or covert identifiers;
- minimise click payloads;
- review affiliate-network tracking documentation;
- document international transfers and processors where applicable;
- run the final design through current ICO guidance and legal review.

An affiliate redirect can record a server-side click without automatically justifying every downstream browser tracker. Each technology and purpose still needs analysis.

## How should project and lead data be handled?

Garden measurements and product preferences are usually ordinary data, but lead records can contain identity, contact, address, property details and inferred budget.

Controls:

- collect only fields required for recommendation or routing;
- keep anonymous project planning separate from identified contact data;
- ask for identity only when saving, alerting or requesting contact;
- state which partner will receive the lead, or define the recipient category clearly where lawful;
- record the exact consent or other lawful-basis notice shown;
- do not send a lead outside a partner's category or geography;
- encrypt sensitive fields and restrict operations access;
- set retention by outcome and legal need;
- provide deletion, correction and subject-rights processes;
- prevent raw lead data from entering analytics tools;
- log access and export.

If wellness project questions begin collecting health information, stop and redesign. Do not collect special-category data merely to improve product personalisation without a documented lawful and proportionate basis.

## What claims require special care?

### Safety and installation

Electrical supply, structural fixing, ventilation, fire risk, machinery guarding, lifting, water treatment and floor loading can cause harm. The site should:

- distinguish general information from site-specific professional advice;
- cite current manufacturer and authoritative instructions;
- use qualified expert review for consequential guides;
- display product and model version;
- avoid universal installation claims;
- retain corrections;
- direct buyers to qualified installers where required.

### Wellness

Avoid medical claims for saunas, cold plunges, massage chairs or exercise equipment unless supported and lawfully presented. The product proposition is space, operation and buying suitability—not diagnosis or treatment.

### Environmental and efficiency claims

Claims such as energy saving, sustainability, chemical-free operation or lower carbon impact need evidence and defined comparisons. Do not copy broad manufacturer claims without context.

### Planning and property

Planning and permitted-development guidance can change and depends on property and location. Date it, source it and tell users when to consult the local planning authority or a qualified adviser.

## How should merchant terms be operationalised?

Terms should not live only in a PDF or admin note. Convert them into effective-dated rules:

- brand-bidding prohibited;
- generic PPC allowed, restricted or unknown;
- direct linking allowed;
- voucher use restricted;
- finance orders excluded;
- product categories excluded;
- creator or subnetwork activity allowed;
- image and creative use permitted;
- negative-review or content review conditions;
- commission group and cookie window;
- de-duplication and validation.

The acquisition system should refuse to launch a campaign when permission is unknown or prohibited. The catalogue should refuse to promise creator commission on excluded categories.

Terms that undermine editorial independence deserve special scrutiny. A programme may welcome honest reviews while imposing conditions on negative coverage. The platform must decide whether participation is compatible with its published methodology rather than silently accepting the conflict.

## How should creator governance work?

Every creator relationship needs:

- identity and contractual status;
- disclosure requirements;
- direct-experience claims and evidence;
- supplied-product and incentive records;
- prohibited claims;
- editorial review and correction rights;
- affiliate-link rules;
- ownership and licence for media;
- commission allocation and reversal terms;
- payout eligibility and tax information;
- suspension and removal process.

Creators should not be allowed to alter product identity, price, stock or merchant terms. They can add experience and interpretation through versioned editorial records.

## What should the public trust centre contain?

- How the platform makes money.
- How rankings work.
- Affiliate and sponsorship policy.
- Testing methodology.
- Product and price-data sources.
- Last-verified timestamps.
- Corrections policy and changelog.
- Review and incentive policy.
- Privacy and tracking choices.
- Merchant and creator standards.
- Contact and responsible publisher identity.

Trust should be accessible from every comparison and review, not isolated from the buying journey.

## What must be checked before launch?

### Commercial

- Programme approval and current terms.
- Commissionable categories.
- PPC and direct-link permission.
- Feed and image licences.
- Creator/subnetwork permission.
- Lead contracts and accepted-event definitions.

### Editorial

- Named author and reviewer.
- Evidence class for material claims.
- Test and supplied-product disclosure.
- Ranking method.
- Correction route.
- No copied merchant description as primary content.

### Data

- Product identity and offer freshness.
- Price, VAT, delivery and installation clarity.
- Review provenance.
- Consent and tracking inventory.
- Data retention and access controls.
- No personal project data in outbound URLs.

### Technical

- `rel="sponsored"` on affiliate links.
- No open redirect.
- Structured data matches visible content and seller role.
- Stale-offer suppression.
- Idempotent transaction ingestion.
- Immutable commission journal.
- Safe unavailable-link route.
- Monitoring and incident response.

### Legal and insurance

- UK consumer, privacy, advertising and contract review.
- Product and public liability appropriate to the actual role.
- Expert review for safety-sensitive content.
- Lead data-sharing agreements.
- Creator and merchant agreements.

The launch is ready only when the platform can explain a recommendation, a price, a commercial relationship and a tracking event without relying on hidden assumptions.
