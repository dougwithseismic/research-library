# Research method and evidence boundaries

## What decision does this research support?

The decision unit is:

```text
UK product vertical × explicit commercial intent × retailer or dealer purchase path × aggregator monetisation model
```

The research asks which non-fashion vertical can support a broad publication and decision product while retaining:

- meaningful UK commercial search demand;
- relatively low historical CPC;
- order values commonly around or above £1,000 in the monetised product set;
- several related product families rather than one micro-niche;
- comparison value beyond price alone;
- enough merchants, programmes or dealers to avoid a single-source catalogue;
- a credible route from content to tracked purchase or qualified lead.

The time horizon is a 2026 launch with a twelve-month validation period. This is a deep opportunity screen, not an exhaustive UK ecommerce census.

## What counts as commercial search intent?

The scored demand totals use phrases containing a clear purchase mode:

- `for sale`;
- `buy`;
- `price` or `prices`;
- `cost`;
- `quote`;
- inherently transactional qualifiers such as `made to measure` where the product is normally specified and purchased as a project.

Broad category terms were queried during exploration but excluded from the scored commercial baskets. Examples include `robot lawn mower`, `pottery wheel`, `greenhouse`, `hot tub`, `treadmill` and `pool table`. Those terms may contain commercial traffic, but they also contain definitions, images, instructions, repairs, used-product research and general curiosity.

The exclusion matters. `robot lawn mower` returned 27,100 average monthly searches, while the canonical explicit purchase phrase `robotic mower for sale` returned 480. `pottery wheel` returned 9,900, while `pottery wheel for sale` returned 1,900. Reporting the head terms as commercial demand would materially overstate the validated buying pool.

## How were the Google Ads observations collected?

Leadmap's authenticated read-only Google Ads historical-metrics runner was used with:

- Geography: United Kingdom, criterion `2826`.
- Language: English, criterion `1000`.
- Network: Google Search.
- Currency: GBP.
- API version: v25.
- Observation date: 3 September 2026.

Google describes average monthly searches as approximate monthly volume averaged over the previous twelve months. Competition and the competition index describe ad-slot demand, while bid fields describe historical auction ranges. [Google Ads historical-metrics documentation](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)

The sanitized retained rows are in [`commercial-keyword-ledger.csv`](../evidence/commercial-keyword-ledger.csv). The pack does not contain customer identifiers, OAuth values or account credentials.

## How were close variants and overlapping phrases handled?

Google can combine submitted queries and close variants into one result. Even where the returned `closeVariants` field is empty, identical volume and CPC profiles can indicate that two requested phrases are drawing on the same canonical pool.

The scored vertical totals therefore use **one canonical phrase per product family**. Supporting `buy`, `price` and `for sale` terms remain in the ledger but are not automatically added.

Examples:

- `pottery kiln for sale` and `buy pottery kiln` both returned 720 searches with the same CPC and bid values. Only `pottery kiln for sale` is scored.
- `swim spa prices` and `swim spa cost` both returned 480 with identical auction metrics. Only the price phrase is scored.
- `greenhouse for sale` and `greenhouses for sale` both returned 9,900 with identical metrics. One row represents the family.

This makes the totals conservative. It does not make them a unique-person count: one person can search several phrases or several product families.

## How is weighted CPC calculated?

The vertical CPC is volume-weighted:

```text
weighted CPC = Σ(keyword average monthly searches × keyword average CPC)
               ÷ Σ(keyword average monthly searches)
```

This prevents a ten-search keyword with an extreme CPC from receiving the same influence as a 9,900-search keyword.

Example for private leisure:

```text
Σ(volume × CPC) = approximately £8,125 of monthly auction-value proxy
Σ(volume)       = 9,670 average monthly searches
weighted CPC    = approximately £0.84
```

The numerator is a comparison proxy. It is not a forecast of spend, obtainable clicks, sales or revenue.

## What does “low CPC” mean here?

No universal low-CPC threshold exists. This research uses relative screening bands for high-ticket purchases:

| Weighted historical CPC | Screen                                                                     |
| ----------------------: | -------------------------------------------------------------------------- |
|             Below £1.00 | Strong                                                                     |
|             £1.00–£1.50 | Viable but category-specific                                               |
|             £1.50–£2.00 | Weak for a low-CPC thesis                                                  |
|             Above £2.00 | Paid acquisition needs exceptional economics or should be organic/lead-led |

These bands are research choices, not Google classifications. Individual terms can sit outside their vertical average. Laser cutters, installed awnings and golf simulators are examples of expensive subcategories inside otherwise efficient verticals.

Nearly all retained purchase phrases show `HIGH` paid competition and competition indices near 100. Low average CPC therefore does **not** mean few advertisers. It can reflect auction value, conversion uncertainty, fragmented merchants, used-product intent or other market conditions.

## How was high order value assessed?

Google Ads does not provide average order value. AOV evidence comes from two distinct source types:

1. **Merchant-disclosed AOV:** strongest available commercial evidence, but still self-reported by the merchant.
2. **Live product prices:** evidence that high-ticket transactions exist, not proof of the average order.

Observed merchant disclosures include:

- Navimow: £1,000-plus AOV for qualifying robotic mower sales. [Source](https://uk.navimow.com/pages/affiliate-program)
- Home Leisure Direct: approximately £1,400 AOV. [Source](https://ui.awin.com/merchant-profile/22809)
- Pro-Line Direct: £2,000–£5,000 average order across high-ticket wellness equipment. [Source](https://ui.awin.com/merchant-profile/122698)
- One Garden: £314 AOV for its broader garden catalogue, useful negative evidence that “garden” as a whole is not automatically high-ticket. [Source](https://ui.awin.com/merchant-profile/109432)
- Machine Mart: AOV above £100 across its broad tool catalogue, also below the target despite high-value machines inside the assortment. [Source](https://www.machinemart.co.uk/affiliates/)

Observed representative prices include:

- Kiln Crafts pottery-wheel package: £1,199.
- Kiln Crafts home studio kiln-and-wheel bundle: £4,833.
- Aura professionally installed awnings: most residential projects £2,200–£5,500.

The research therefore evaluates the **monetised high-ticket subset**, not the average price of every object that could appear on the site.

## How were merchant and partner routes evaluated?

An active affiliate profile establishes that a programme exists. It does not establish:

- that a new publisher will be accepted;
- that generic paid search is permitted;
- that the relevant products are commissionable;
- that a complete or fresh product feed is available;
- the applicable commission group;
- attribution priority against other channels;
- reversal and validation rates;
- payment timing;
- whether offline or finance-assisted sales remain tracked.

The series treats those fields as unknown until the programme terms or a direct merchant conversation resolve them.

The primary programmes examined are listed in [`sources.csv`](../evidence/sources.csv). The research did not apply to any programme or contact any merchant.

## How were competitors interpreted?

The competitor sample includes:

- direct retailers with strong buying guides;
- affiliate or editorial comparison publishers;
- general comparison engines;
- specialist marketplaces and dealer listings;
- project installers whose quote journey substitutes for a product comparison.

Retailer content is a real competitor for attention even if its commercial model differs. A manufacturer selector can solve the buyer's problem without comparing merchants. Google Shopping can solve a simple price query. A marketplace can solve used-equipment discovery. The relevant competitive question is therefore not “who calls themselves an aggregator?” but “what alternative completes this buying decision?”

The sample is directional, not exhaustive. Search results vary by location, device and time, and this work did not claim permanent organic rankings.

## What does the scorecard measure?

The heuristic score uses seven dimensions:

| Dimension                  | Weight | What a high score means                                                        |
| -------------------------- | -----: | ------------------------------------------------------------------------------ |
| Explicit commercial demand |     20 | Several product families have meaningful purchase-intent volume                |
| CPC efficiency             |     15 | The weighted commercial basket is inexpensive relative to peers                |
| AOV evidence               |     20 | Merchant AOV or repeated live pricing supports high-ticket transactions        |
| Decision complexity        |     15 | Specification, compatibility or installation creates useful comparison work    |
| Merchant breadth           |     15 | Several credible merchants or dealers can support the catalogue                |
| Model fit                  |     10 | Transactions can be attributed and monetised in the intended operating model   |
| Operational and legal risk |      5 | The model avoids disproportionate fulfilment, condition and compliance burdens |

Scores are from one to five, then multiplied by the weight. They are not statistically calibrated market probabilities. Raw volume, CPC, AOV evidence and model caveats sit beside the score so the ranking can be challenged.

## What evidence classes does the series use?

- **Observed:** a Google Ads result or a statement visible on a live primary source on the research date.
- **Derived:** arithmetic whose inputs and formula are shown.
- **Inference:** a proposed strategy that follows from observations but remains untested.
- **Unknown:** a decision-relevant field without adequate evidence.

Examples:

- “`pool table for sale` returned 4,400 average monthly searches” is observed.
- “The leisure basket's weighted CPC is £0.84” is derived.
- “A room planner is the best differentiation layer” is inference.
- “Liberty Games will approve the publisher and expose a suitable feed” is unknown.

## What are the main limitations?

1. Search demand is not traffic. Ranking, ad position, click-through and budget determine visits.
2. Searches are not buyers. Commercial modifiers improve intent quality but do not guarantee a purchase.
3. CPC is historical. Future auctions can change.
4. Paid competition is not SEO difficulty. A separate SERP and link analysis is required before an organic forecast.
5. Product prices are not AOV. Only explicit merchant statements are described as AOV evidence.
6. Affiliate commission is not cash. Validation, returns, attribution loss and payment delay intervene.
7. `For sale` can include used goods. The effect is largest in machinery, lathes, pinball and jukeboxes.
8. Feed availability is not feed quality. Identifiers, freshness and category attributes must be sampled.
9. The scorecard reflects stated priorities. Different weights could change the order.
10. Compliance guidance is a risk screen, not legal advice.

## What would the next research pass add?

Before selecting a final launch category, the next pass should obtain:

- a 50–100-product feed sample from each target merchant;
- programme acceptance, commission-group and PPC confirmation;
- twelve-month keyword seasonality for the chosen vertical;
- a manual UK SERP sample for twenty high-intent phrases;
- top-50 product identity and specification completeness;
- actual delivery, installation, returns and finance paths;
- merchant conversion, validation and reversal data after the first tracked traffic;
- five to ten buyer interviews focused on the decision process rather than site preferences.

Those observations would replace the largest current unknowns. More speculative keyword expansion would not.
