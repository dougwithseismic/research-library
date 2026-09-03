# Revenue architecture: CPA CPC CPL tenancy and beyond

**Decision:** Launch with CPA or CPS for retailer-checkout products and CPL or outcome-based fees for installed projects. Build direct CPC and tenancy capability into the commercial system but do not depend on either until the site can prove qualified traffic and useful audience access.

## What is the direct answer?

The company should not choose one payment acronym for the whole site. The unit sold should follow the purchase path.

| Buyer journey                            | Default launch model                                                               | Later commercial layer                                           | Why                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Standard product bought online           | CPA or CPS                                                                         | Higher product-level CPA; tenancy; CPC where directly contracted | The completed sale is observable and the order value is known                              |
| Configurable product still bought online | CPA or CPS                                                                         | Hybrid production fee plus CPA                                   | The publisher does material research before a trackable checkout                           |
| Installed or surveyed project            | CPL for an accepted specification; fee per booked survey; or completed-sale bounty | Territory tenancy; minimum monthly commitment                    | Checkout is not the real conversion and the buyer needs local fulfilment                   |
| Used or dealer machinery                 | Dealer subscription and listing fee                                                | CPC; qualified enquiry; promoted inventory                       | Seller inventory and lead access matter more than retailer ecommerce feeds                 |
| Category launch or seasonal campaign     | CPA remains active                                                                 | Fixed tenancy plus CPA and measurable deliverables               | The advertiser is buying guaranteed access as well as transactions                         |
| Data or embedded decision tool           | Subscription licence or service fee                                                | Usage pricing; data licence; revenue share                       | The customer is another business consuming infrastructure rather than one shopper referral |

In plain English: **CPA is the spine; CPL handles projects; tenancy pays for guaranteed presence; CPC is a direct comparison product; subscriptions and data become the later moat.**

## Which CPC are we talking about?

The first report uses Google Ads CPC as an **acquisition-side market signal**:

```text
what the aggregator may pay Google for one search-ad click
```

A merchant CPC agreement is **publisher revenue**:

```text
what a retailer pays the aggregator for one valid outbound product click
```

They are economically opposite. Calling both simply “CPC” conceals whether money is entering or leaving the company.

The data model and financial reports should therefore use explicit names:

- `search_acquisition_cpc`;
- `merchant_outbound_cpc`;
- `lead_acquisition_cpl`;
- `advertiser_accepted_lead_fee`;
- `approved_sale_commission`;
- `tenancy_fee`.

## Is merchant-funded CPC a real product-comparison model?

Yes. idealo currently publishes a £0.35 UK standard merchant CPC and the same £0.35 figure for Home & Garden and Leisure & Outdoors. A merchant is charged when a comparison user clicks its offer and is redirected to the merchant's shop. idealo separately states that payment cannot alter the retailer's position in organic comparison results. [idealo pricing](https://partner.idealo.com/partner-idealo-com/uk/pricing), [consumer explanation](https://www.idealo.co.uk/magazine/faqs)

Kelkoo's publisher API similarly exposes estimated revenue per click by merchant, device and category. It includes merchant target cost-of-sale and campaign quality fields. That shows how a mature CPC network prices traffic according to expected downstream economics rather than treating every click as equally valuable. [Kelkoo merchant-feed documentation](https://docs.kelkoogroup.com/for-publishers/shopping-api-feeds/feeds-merchants)

MoneySuperMarket provides a second model. Its consumer explanation says some providers pay a flat click-through fee while others pay a fixed completed-sale amount or a percentage commission. Its annual report recognises that price-comparison lead revenue can become receivable either on a completed downstream sale or when the click is supplied depending on the contract. [MoneySuperMarket commercial explanation](https://www.moneysupermarket.com/how-moneysupermarket-works/), [MONY 2025 annual report](https://www.monygroup.com/application/files/3417/7304/3833/MONY-Group-plc-Annual-Report-2025.pdf)

The model is real. It is not automatically the best launch model.

## Why should the new aggregator not begin as CPC-only?

### It creates adverse selection

A weak merchant may prefer CPC because the publisher carries the risk of the merchant's poor price, stock, checkout, delivery proposition and conversion. Strong merchants may prefer CPA because they only pay after a valid transaction. If every merchant chooses its preferred risk transfer, the publisher can end up with CPC offers that disappoint users and CPA offers that fail to compensate early-funnel work.

### It creates click-quality and fraud obligations

A direct CPC product needs:

- one billable click definition;
- invalid-traffic detection;
- bot and repeat-click policies;
- device and country rules;
- merchant-level pacing and monthly caps;
- reconciliation and dispute windows;
- proof that a click reached the correct merchant page;
- a policy for stale stock or a price mismatch;
- audit logs that explain every invoice line.

Affiliate networks already provide much of the transaction and payment machinery for CPA. A direct CPC contract moves those responsibilities onto the publisher.

### Published comparison CPC is too low for simple paid-search arbitrage

Use the garden research as a sanity check.

```text
illustrative visitor-to-merchant click rate = 55%
idealo Home & Garden reference CPC          = £0.35
merchant CPC revenue per site visit         = 55% × £0.35 = £0.1925
garden Google Ads basket CPC                = £0.94
gross gap before all operating costs        = £0.1925 − £0.94 = −£0.7475
```

This is not a like-for-like forecast: idealo's price is its merchant rate and the search basket is an observed acquisition auction. It still kills the naive arbitrage thesis. Buying one Google click for approximately £0.94 and selling an outbound merchant click for £0.35 cannot work when fewer than all visitors click out.

CPC revenue is useful against organic, direct, creator or returning traffic. It is not permission to buy search traffic indiscriminately.

### A new publisher has not earned direct contracts

A merchant can join an established comparison engine because it understands the traffic, billing, rankings and volume. A new category publisher must first demonstrate:

- high-intent sessions;
- outbound click quality;
- category and product-level conversion evidence;
- low invalid-traffic rates;
- transparent ranking;
- predictable billing;
- enough monthly volume to justify merchant administration.

CPA through existing programmes is a lower-friction way to generate that evidence.

## Why should CPA or CPS launch first?

CPA aligns publisher revenue with the retailer's validated result. For a physical product it is commonly expressed as a percentage of commissionable order value; it can also be a fixed amount per approved purchase.

Its main strengths are:

- easy merchant budget control;
- upside from high order value;
- network tracking and payment infrastructure;
- no direct invoice for every click;
- product and customer-group commissioning can be negotiated;
- the publisher can keep earning from evergreen work.

Its risks are equally material:

- last-click loss;
- cross-device and cross-session loss;
- consent and tag failures;
- uncommissionable products or finance routes;
- partial-basket rules;
- returns and cancellations;
- approval delays and unexplained rejections;
- merchant conversion problems outside publisher control;
- a programme or rate changing after content has been produced.

The APMA's 2026 dataset places CPA at 81% of UK affiliate investment. That is why it is the practical launch mechanism. It is also why the architecture must track pending, approved, declined, funded and paid states separately. [APMA 2026 State of the Affiliate Nation](https://theapma.co.uk/download/9188/?tmstv=1777836706)

## How should CPA be negotiated?

Do not ask only for “the commission rate.” Ask for the full economic contract:

| Field                | What must be known                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- |
| Commission base      | Gross or net of VAT; delivery included or excluded; product-only or full basket    |
| Rate                 | Percentage or fixed bounty; product and customer-group differences                 |
| New customer premium | Definition and extra payment                                                       |
| Attribution          | Window; last click; voucher overwrite; app and cross-device rules                  |
| Validation           | Expected duration; partial returns; cancellation rules                             |
| Reversal             | Reason codes and evidence                                                          |
| Funding              | Network funded; advertiser funded; invoice and remittance timing                   |
| PPC policy           | Generic keywords; brand bidding; Shopping and CSS; direct-to-merchant restrictions |
| Feed                 | Coverage; identifiers; update schedule; price and stock fields                     |
| Offline completion   | Phone; showroom; booked survey; finance-assisted order                             |
| Incrementality       | New-to-file; new category customer; assisted sale; holdout capability              |

Product-level commissioning matters. A manufacturer may pay more to launch a new robotic mower, move an older greenhouse line or promote a high-margin accessory package. The SharkNinja and Blue Light Card interview shows the advertiser using specific offers and products as the commercial unit rather than treating all brand revenue identically. [Practitioner interview](https://www.awin.com/us/awin-win-marketing-podcast/episode/sharkninja-blue-light-card)

## When is CPL the right answer?

CPL belongs where the useful action is a buyer specification handed to an eligible seller rather than a web checkout.

For a made-to-measure awning the lead should contain enough information to support a real sales action:

- postcode and service-area eligibility;
- approximate width and projection;
- wall material and mounting constraints;
- manual or motorised preference;
- power availability;
- budget range;
- desired timing;
- owner or authorised decision-maker status;
- consent for named partners to make contact.

A billable event could be:

1. **Accepted specification:** partner confirms it meets agreed rules.
2. **Connected lead:** the buyer completes a verified call or responds to contact.
3. **Booked survey:** a site visit is arranged.
4. **Attended survey:** the appointment occurs.
5. **Completed project:** a sale is reported and evidenced.

The further down the funnel the event sits, the higher the nominal fee can be—but the publisher accepts more delay and seller-side execution risk. A blended agreement can pay a smaller accepted-lead amount plus a completion bonus.

The APMA reports only 3% of measured affiliate investment as CPL in 2025. That does not make CPL unsuitable for installed garden projects. The report explicitly excludes some lead-generation programmes from its overall market measurement, and the broad UK mix is driven by many ecommerce transactions. Use purchase-path fit rather than market share to choose the model.

## What exactly is tenancy?

Tenancy is a fixed payment for defined access to publisher inventory over a defined period. It is closer to buying a temporary commercial position than paying for one result.

Possible inventory includes:

- category-hub sponsorship;
- a clearly labelled promoted offer above or beside organic comparisons;
- newsletter placement;
- a buying-guide sponsorship wrapper;
- homepage or seasonal-hub presence;
- dedicated but clearly commercial content;
- video sponsorship;
- sponsored research or a calculator launch;
- retargeting or audience-extension rights where lawful and separately agreed;
- trade-show or webinar presence.

APMA says tenancy represented 13% of UK affiliate investment in 2025 and grew 18% year on year. MONY Group explicitly describes Tenancy as a tailored advertising product using clearly labelled sponsored positions informed by first-party data. [APMA report](https://theapma.co.uk/download/9188/?tmstv=1777836706), [MONY annual report](https://www.monygroup.com/application/files/3417/7304/3833/MONY-Group-plc-Annual-Report-2025.pdf)

Tenancy should never mean “pay to win the supposedly independent ranking.” A sponsor can buy visibility. It cannot buy an invented test result, an undisclosed score change or the removal of a better product.

## When should tenancy be sold?

Not when the site has no defensible audience and no delivery record.

Open paid-placement sales only after the relevant property meets all of these gates:

- at least three months of stable category traffic;
- a defined audience and intent breakdown;
- measured viewability or exposure for the unit being sold;
- an email list with known consent and engagement where email is included;
- a sponsor-safe editorial and disclosure policy;
- an inventory calendar and fulfilment owner;
- post-campaign reporting that can separate guaranteed delivery from attributed outcomes;
- a benchmark from unpaid placements or CPA history.

Selling tenancy before these exist turns a promising merchant relationship into a dispute about what was purchased.

## How should tenancy be priced?

The first rate card should be derived from cost, scarcity and expected advertiser value rather than copied from a large publisher.

```text
tenancy floor = production cost
                + allocated sales and account-management cost
                + displaced inventory value
                + delivery-risk reserve
                + required contribution
```

Then report the implied economics:

```text
effective CPM = tenancy fee ÷ guaranteed impressions × 1,000

blended advertiser CPA =
  (tenancy fee + variable commission + other campaign spend)
  ÷ approved incremental orders

blended publisher revenue per visit =
  (tenancy fee allocated to campaign traffic
   + approved variable revenue)
  ÷ campaign visits
```

The advertiser should see both delivery and outcome metrics. A tenancy is not converted into a fake CPA guarantee merely because the buyer ultimately evaluates return.

## What should the first packages look like?

These are proposed products, not observed market prices.

### Package A: performance listing

- No fixed fee.
- Standard organic eligibility and feed requirements.
- CPA or CPS on approved sales.
- No guaranteed placement.
- Normal performance reporting.

Use this to build the launch catalogue and prove traffic quality.

### Package B: category test partner

- Four-to-eight-week insertion order.
- Clearly labelled sponsored unit on one category hub.
- One newsletter placement if audience thresholds are met.
- Merchant-supplied product access or sample where necessary.
- CPA remains active.
- Fixed production or tenancy fee covers guaranteed work and inventory.
- Report covers delivery, engagement, outbound clicks, approved sales and assisted indicators.

Use this to test whether fixed plus performance pricing works without compromising rankings.

### Package C: product-launch partnership

- Original product inspection or test with disclosed methodology.
- Photography or video rights defined in writing.
- Comparison-table inclusion remains editorially controlled.
- A separate sponsored launch page or media unit is guaranteed.
- Product-level enhanced CPA or performance bonus.
- Optional exclusive bundle or price for readers.
- Reuse and paid-amplification rights priced separately.

Use this when original production cost is too high for uncertain last-click commission alone.

### Package D: project territory partner

- Defined postcodes and product scope.
- Minimum monthly capacity.
- Fee per accepted lead or booked survey.
- Optional fixed territory commitment that reserves capacity.
- Completed-sale bonus where the seller can report outcomes reliably.
- Service-level agreement for response time and lead disposition.

Use this for awnings, garden rooms, cabins and installation-heavy products.

### Package E: dealer marketplace

- Monthly inventory allowance.
- Dealer profile and trust information.
- Inventory feed or manual listing tools.
- Standard enquiries included up to a threshold.
- Optional promoted inventory priced separately.
- Reporting and market-demand tools at higher tiers.

Use this only for a dedicated marketplace such as smallholding machinery.

## Should the company use a hybrid model?

Yes. Hybrid is the most defensible target state for expensive editorial and high-consideration purchases.

An illustrative arrangement for a £1,000 product might be:

```text
fixed campaign fee                           £2,000
commission                                   3% of approved order value
approved orders                              50
variable commission                          £1,500
total publisher revenue                      £3,500
effective advertiser CPA                     £70
effective publisher share of order value     7%
```

If the same campaign produces only 20 approved orders:

```text
variable commission                          £600
total publisher revenue                      £2,600
effective advertiser CPA                     £130
effective publisher share of order value     13%
```

The example shows why a brand evaluates tenancy through a blended CPA even though the fixed fee bought guaranteed media and production. The contract should define which outcome is a target and which delivery is guaranteed.

The numbers above are illustrative. They are not proposed market rates and do not use observed conversion data.

## What other revenue avenues are credible?

### Merchant data and category intelligence

Once the platform owns normalised product, offer, price-history and buyer-intent data it can sell:

- share-of-visibility dashboards;
- price-position and delivery-position alerts;
- attribute-demand analysis;
- anonymised shortlist trends;
- product-gap and competitor-set reports;
- feed-quality diagnostics;
- APIs or scheduled data exports.

MONY Group's Market Boost product demonstrates this progression at scale: the company packages first-party marketplace data into dashboards, datasets and predictive tools for providers. More than 100 providers used it according to the 2025 annual report. This is evidence that the revenue class exists, not evidence of demand from garden merchants at a proposed price.

### White-label selectors and comparison tools

Manufacturers, publishers and trade associations may licence a selector, total-cost calculator or comparison module. Revenue can be:

- implementation fee;
- monthly platform fee;
- usage fee;
- data-refresh fee;
- shared CPA or CPL from resulting transactions.

The risk is independence. A manufacturer-funded selector can be useful on the manufacturer's own site, but it must not masquerade as the independent market-wide product.

### Original content production and rights

A brand can fund photography, testing logistics, installation documentation or video production while the publisher retains editorial conclusions. Rights to reuse the resulting media in brand channels or paid advertising should be explicit and separately priced.

This can support creator partnerships where a flat production fee covers labour and CPA preserves performance upside. It also creates disclosure and usage-right obligations.

### Newsletter and video sponsorship

Specialist briefing emails and video series can sell:

- issue sponsorship;
- category segment sponsorship;
- clearly labelled native placements;
- pre-roll or mid-roll acknowledgements;
- sponsored field tests;
- annual presenting-partner packages.

These should be sold on an audience and delivery basis rather than attributed sale alone. They should not dominate until direct and repeat audience exists.

### Consumer membership and concierge

Possible paid consumer products include:

- project workspaces and saved specifications;
- price-history and availability alerts;
- expert shortlist review;
- installer-quote comparison;
- warranty and maintenance record;
- buyer club pricing;
- professional studio or smallholding planning tools.

The free product must already solve a meaningful problem. A paywall in front of basic comparison would weaken audience formation. Membership should add continuity, expertise or time savings that merchants do not provide.

### Dealer and merchant software

The supplier side can pay for:

- inventory synchronisation;
- listing quality and identifier repair;
- enquiry routing;
- staff access and CRM export;
- lead disposition tools;
- response-time reporting;
- category benchmarking;
- review and warranty documentation.

Autotrader demonstrates the ceiling of a dense marketplace: its 2026 average revenue per retailer was £2,995 per month and retailer revenue reached £501.1 million. That is an outcome of extraordinary marketplace scale and is not a start-up pricing benchmark. [Autotrader 2026 results](https://plc.autotrader.co.uk/media/etud5vca/full-year-press-release-fy26.pdf)

### Events training and professional education

Maker studios and smallholding equipment have credible professional audiences. Later possibilities include:

- sponsored demonstrations;
- equipment-selection workshops;
- supplier webinars;
- safety and studio-planning courses;
- trade events;
- paid vendor briefings.

Future's B2B publishing portfolio monetises newsletters, webinars, lead generation, events and magazines alongside digital advertising. That confirms the shape of the model at publisher scale. It does not validate a launch event before an audience exists. [Future annual report](https://futureplc.com/wp-content/uploads/2025/12/Annual-Report-and-Accounts-FY-2025-incl-Notice-of-AGM.pdf)

### Display and programmatic advertising

Display can monetise non-commercial informational traffic but should remain secondary:

- revenue per user is usually weak without scale;
- intrusive units can damage comparison use and trust;
- the advertiser may conflict with ranked merchants;
- consent requirements and page performance add cost;
- programmatic demand does not fund category-specific research reliably.

Direct category sponsorship is more strategically aligned than filling every available space with generic programmatic ads.

### Ancillary referrals

High-ticket products produce adjacent needs:

- installation;
- electrical work;
- bases and groundwork;
- transport;
- maintenance and repairs;
- warranties;
- storage;
- training;
- finance and insurance.

Each should be evaluated independently. Finance and insurance can introduce regulated financial-promotion and disclosure obligations. They are not casual affiliate add-ons.

## What revenue portfolio should the business aim for?

The following ranges are portfolio guardrails rather than forecasts.

| Period          | CPA or CPS | CPL and project outcomes | Tenancy and fixed media | Listing subscription data and services |
| --------------- | ---------: | -----------------------: | ----------------------: | -------------------------------------: |
| Validation year |     55–70% |                   15–25% |                  10–20% |                                  0–10% |
| Developed model |     35–50% |                   15–25% |                  20–30% |                                 10–25% |

The purpose is not to force revenue into these boxes. It is to avoid becoming dependent on one merchant's last-click programme. A vertical that cannot earn CPA may still work as a lead marketplace; a vertical that cannot secure supply subscriptions may still work as a publisher. Actual revenue mix should follow measured contribution and customer demand.

## How should the model vary by vertical?

| Vertical                  | Core transaction                         | Recommended launch mix                                                 | Main later expansion                                             |
| ------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Premium garden systems    | Retail sale plus installed project       | CPA/CPS for products; accepted-lead or booked-survey fees for projects | Tenancy; product launches; installer territory commitments; data |
| Private games and leisure | Specialist retailer checkout             | CPA/CPS with product-level rates                                       | Tenancy; original video; service and restored-product leads      |
| Serious maker studios     | Specialist equipment checkout and advice | CPA/CPS; production-supported reviews                                  | Education; supplier sponsorship; studio-design leads; B2B data   |
| Land and smallholding     | Dealer/private inventory and enquiry     | Listing and dealer subscription; qualified enquiry                     | CPC promoted stock; data; transport and inspection referrals     |

This is why the vertical choice and business-model choice cannot be separated. Smallholding's low search CPC does not make it a good conventional affiliate site. Its natural payer and transaction are different.

## How should advertiser economics be modelled?

The advertiser's ceiling begins with contribution rather than order value:

```text
available acquisition budget per order =
  net order value
  × gross margin rate
  × allowable acquisition share of gross margin
```

Illustrative example:

```text
net order value                           £1,000
gross margin                              30%
gross margin pounds                       £300
allowed acquisition share                30%
maximum acquisition budget               £90
```

A 5% CPA consumes £50 of that £90. A hybrid package with an effective £70 CPA may still work. A £130 blended CPA would exceed this illustrative ceiling unless repeat value, installation margin, accessory attachment or another contribution source justifies it.

The aggregator will not know real gross margin until an advertiser shares it. Negotiations should therefore ask for target cost of sale, target new-customer CPA or allowable marketing share rather than guessing margin from retail price.

## How should publisher economics be modelled?

```text
approved revenue per 1,000 visits =
  approved CPA or CPS revenue
  + billable merchant CPC revenue
  + accepted lead revenue
  + tenancy allocated to delivered traffic
  + membership and service revenue attributable to the cohort
```

Then subtract:

- paid acquisition;
- creator share;
- production and product-testing cost;
- invalid traffic and billing credits;
- lead disputes;
- refunds and reversals;
- network fees where borne by the publisher;
- payment processing;
- support and commercial fulfilment;
- a working-capital charge for delayed cash.

Pending affiliate commission should never fund creator payouts or acquisition scaling.

## What should the commercial system store?

Every commercial agreement needs a versioned object containing:

- counterparty and legal entity;
- programme or direct-contract identifier;
- model: CPA; CPS; CPL; CPC; tenancy; subscription; licence; hybrid;
- eligible products and categories;
- rate and currency;
- start and end time;
- caps and minimum commitments;
- attribution and deduplication rules;
- validation and dispute window;
- payment terms;
- prohibited traffic;
- promised inventory and delivery status;
- disclosure treatment;
- ranking impact set explicitly to `none` for paid inventory;
- reporting obligations;
- rights to content and data;
- termination and rate-change rules.

This is not paperwork around the product. It is part of the product. Without it the publisher cannot explain why revenue changed or whether a placement was delivered.

## What should the media kit contain?

The first media kit should exist before outreach but contain no invented reach claims.

1. Audience and vertical promise.
2. Current measured sessions, subscribers and buyer-intent events.
3. Product families and project stages.
4. Available inventory with format, duration and delivery definition.
5. CPA, CPC, CPL and hybrid capabilities.
6. Original testing and disclosure policy.
7. Data returned to partners.
8. Case evidence once available.
9. Lead and click-quality controls.
10. Contact and contracting process.

Richa Dani's publisher interview specifically recommends an updated media kit, clear paid-placement opportunities and audience segmentation so brands understand what they are buying. [Publisher-growth interview](https://impact.com/podcasts/episodes/fewer-delays-more-paydays-with-richa-dani/)

## What is the recommended commercial sequence?

### Months 0–3: prove the transaction spine

- Join eligible programmes.
- Confirm product-level terms and traffic restrictions.
- Implement click and transaction reconciliation.
- Secure one or two direct project-lead pilots.
- Collect approval rate and days-to-cash rather than pending commission alone.
- Do not sell undeliverable tenancy.

### Months 4–6: negotiate against evidence

- Present category-level traffic and conversion cohorts.
- Ask high-performing merchants for enhanced product CPA.
- Ask poor-tracking merchants to repair tracking or move to a controlled CPC test.
- Define one paid-placement pilot with an insertion order.
- Publish the media kit and editorial firewall.

### Months 7–12: diversify carefully

- Sell seasonal category packages with fixed plus performance economics.
- Introduce installer territory commitments where lead supply is stable.
- Pilot one product launch with original video or field testing.
- Offer a basic merchant feed-quality and visibility report.
- Keep every revenue line visible in the ledger.

### After repeatability: productise supplier revenue

- Merchant or dealer portal.
- Subscription inventory and reporting.
- Category intelligence.
- White-label selectors.
- Data exports and APIs.
- Events or professional education where the audience supports them.

## What are the commercial stop rules?

- Stop CPC for any merchant whose effective downstream cost of sale breaches the agreed range or whose offer quality damages buyers.
- Stop paid acquisition when approved blended revenue per incremental visit remains below variable cost after two material conversion changes.
- Do not renew tenancy that failed guaranteed delivery; do not conceal that failure behind assisted-attribution claims.
- Pause a programme when validation or rejection changes make its effective commission uncompetitive.
- Do not sell a comparison rank.
- Do not launch a data product until enough observations exist to make it useful and privacy-safe.
- Do not count barter samples or discounts as cash revenue.
- Do not recognise pending affiliate commission as funded income.

## Final commercial recommendation

The aggregator should begin as a **performance-led decision publisher**, not a CPC arbitrage engine and not an ad-supported magazine.

For premium garden systems:

1. Use CPA/CPS for normal merchant checkout.
2. Use accepted-lead or booked-survey fees for installed work.
3. Add fixed plus CPA product-launch packages when audience and production capability exist.
4. Offer merchant CPC only through direct controlled tests where conversion tracking is weak but click quality is demonstrable.
5. Add tenancy as clearly labelled commercial inventory with no effect on organic ranking.
6. Build merchant intelligence, white-label selectors and supplier subscriptions only after the underlying product and behavioural data becomes genuinely distinctive.

That model reflects how the affiliate market is actually paid today while preserving room to become a much better business than a pile of affiliate links.
