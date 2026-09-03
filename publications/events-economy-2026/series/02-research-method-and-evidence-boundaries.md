# Research method and evidence boundaries

## The research question

This series asks a specific commercial question:

> Where can a new UK company build a defensible and economically credible structured-social-leisure product in 2026, across friendship, dating, talks, craft, games, sport and local discovery?

The unit of analysis is not “an event company.” It is:

```text
purchase motive × activity × customer segment × city density × event format × revenue model
```

A Timeleft subscription in London, a hosted friendship dinner in Devon, a Seed Talk, a pottery class, a Liiiv discovery booking and a Thursday singles party are not interchangeable observations. They solve different jobs and carry different operating costs.

## Evidence hierarchy

Sources were weighted in this order:

1. regulator and government publications;
2. SEC filings and public-company annual reports;
3. official product, pricing, terms, safety and help pages;
4. official app-store listings;
5. credible reporting with named sources;
6. operator-authored case studies and trend reports;
7. search-result snippets and self-described promotional claims.

Operator scale, satisfaction and attendance figures are labelled first-party unless independently audited. Company terms establish the contract presented to users, not whether every operational promise is delivered.

## Live-web observation

Sources were observed on 3 September 2026 unless a source carries its own historical date. The research distinguishes:

- **current operating evidence**, such as live prices, active event listings and terms;
- **historical evidence**, such as a 2024 founder interview or 2025 audience measurement;
- **trend evidence**, such as an event platform's own year-on-year analysis;
- **commercial inference**, which is the report's judgement rather than a source's fact.

Several live sources contain inconsistencies. The Dinners With Friends homepage, about page and an event page state materially different participation totals; the about page dates the first event to January 2025 while the press page says the business was founded in 2024. Its privacy notice still refers to Eventbrite while the live product uses credits. These are reported as unresolved content-governance issues, not reconciled into a preferred number.

Timeleft's UK subscription price is shown only during signup. Historical prices from other countries were excluded from the UK unit model.

## Foreign-currency normalisation

Every monetary amount stated in US dollars, euros or Indian rupees is followed by an approximate sterling equivalent. The conversions use the UK Foreign, Commonwealth & Development Office's September 2026 consular reference rates: £1 equals $1.41, €1.21 or ₹134. [FCDO September 2026 rates](https://www.gov.uk/csv-preview/6a92a2219a177a1decf97bab/consular-exchange-rates-September-2026.csv)

The original currency remains the observed fact. Sterling is a derived comparison calculated as:

```text
GBP equivalent = foreign-currency amount ÷ foreign-currency units per £1
```

Small prices are normally shown to the nearest penny; large company, funding and market values are rounded to a sensible £1,000, £10,000 or £1 million. These are present-day comparisons, not historical transaction-date conversions, accounting values or executable exchange rates. Full rates and formulae are retained in the [foreign-exchange file](../evidence/foreign-exchange-rates.csv).

## Google Ads historical metrics

The keyword evidence was gathered from Google Ads Keyword Planning historical metrics with:

- geography: United Kingdom;
- language: English;
- network: Google Search;
- API version: v25;
- observation date: 3 September 2026;
- outputs: average monthly searches, competition, competition index, average CPC and top-of-page bid range.

### Inclusion rules

The friendship basket retains eight canonical discovery phrases: `social events`, `social events near me`, `meet new people`, `make new friends`, `friendship app`, `dinner with strangers`, `social groups near me` and `make friends near me`.

The offline-dating national basket retains `singles events`, `singles events near me`, `speed dating`, `speed dating near me`, `dating events` and `singles nights`. London variants are kept as a separate local lens and are not added to the national basket.

Brand terms—including Timeleft, Dinners With Friends, Thursday, Bored of Dating Apps and Meetup—are reported individually rather than combined into a market total.

### Exclusion rules

- `supper club` is excluded from social-discovery totals because its dominant intent can be food rather than connection.
- Location variants are not added to national phrases where overlap is plausible.
- `dating app` is reported separately because it describes a different product and vastly larger incumbent category.
- Terms returning zero are not treated as proof of zero demand. Google Ads may suppress, group or interpret a phrase unexpectedly; `bumble` is an obvious example in this pull.
- Close variants are counted only where the API grouped them into the returned row.

### UK activity lens and international comparisons

A second pull used the same UK, English and Google Search configuration for craft, reading, games and sport. These terms are reported individually because they overlap heavily and mix adult, child, tourist, retail and informational intent. `things to do near me`, `events near me` and `classes near me` are retained as broad discovery context but excluded from every category total.

No non-UK search-volume data is used in the recommendation. European and North American operators are included only as mechanism comparators—for example, whether a chapter licence, marketplace take rate, organiser subscription or hosted-sport model has been exposed publicly. Their presence does not establish UK demand, pricing power or transferability.

### Calculations

The volume-weighted CPC is:

```text
sum(average monthly searches × average CPC) ÷ sum(average monthly searches)
```

The tool returns average monthly searches, not a current-month forecast. CPC is the average amount advertisers historically paid for an ad click. It is neither the startup's obtainable click price nor its customer-acquisition cost.

## Company and registry evidence

Match Group and Bumble facts come from public-company filings and official results. Timeleft's terms identify Timeleft SAS and its French registry details.

The reviewed Dinners With Friends pages did not disclose an authoritative legal name or company number. No Companies House match was made from the brand name alone, because a similar registered name could identify the wrong operator. Registry evidence would establish filing identity and status; it would still not prove product quality, traction or buying intent.

## Unit economics

The report uses a transparent scenario rather than claiming access to operator accounts:

- £15 seat reservation: observed on Dinners With Friends;
- £20 host meal contribution and free host ticket: observed on its host page;
- six, ten and eleven paid attendees: sensitivity cases;
- payment fees, acquisition, support, insurance, software and tax: unknown and therefore not silently estimated in the base table;
- £25, £35 and £50 diner spend: explicit restaurant-GMV assumptions, not observed averages.

This separates operator revenue from venue gross sales. It does not infer restaurant margin.

## Scorecard

Each business-model archetype is scored from one to five across seven weighted criteria:

| Criterion              | Weight | Meaning                                                 |
| ---------------------- | -----: | ------------------------------------------------------- |
| Demand legibility      |     20 | Can the buyer recognise and find the proposition?       |
| Repeat potential       |     20 | Can attendance become a habit rather than a one-off?    |
| Contribution potential |     15 | Is there plausible revenue after direct delivery cost?  |
| Geographic portability |     15 | Can the model transfer without destroying quality?      |
| Differentiation        |     10 | Is the promise meaningfully distinct from substitutes?  |
| Operating ease         |     10 | Can a small team deliver it consistently?               |
| Trust and compliance   |     10 | Can risk be controlled without undermining the product? |

The scorecard covers ten archetypes. The highest-ranked model is an interest-led regional event house with a smaller relationship-depth layer. The weighted result is a decision aid, not empirical truth. A one-point change is not statistically meaningful. Raw scores and rationales are available in the evidence CSV.

## Operator census and revenue playbook

The company atlas includes 52 selected operators, institutions, networks and products. Inclusion means the operator exposes a useful current or historical commercial mechanism; it does not mean equivalent scale, direct competition, profitability or service quality. Each row retains a source identifier, evidence class and unresolved commercial fact.

The revenue playbook contains 43 mechanisms. “Observed example” means a named operator currently presents that mechanism; it does not establish realised revenue, margin or applicability to the proposed company. Launch-stage recommendations are the report's inference.

The cross-format economics are explicit scenarios. Except where an observed ticket or membership anchors a figure, price, capacity and every cost input are assumptions. They are intended to show sensitivity and operating shape rather than rank industries or estimate a named company's accounts.

## Capital and future scenarios

The capital analysis uses three distinct evidence types:

- current UK finance conditions and scheme limits from HMRC and the British Business Bank;
- attributed private-company funding and operating claims from founders, investors and company materials;
- bottom-up planning assumptions created for this report.

The stage budgets are not reported market averages. Each is designed to buy a named proof: paid demand, one-cell independence, second-cell portability or multi-cell replication. The operating and financing gates are recommendations rather than investor benchmarks. No investor was contacted and no term sheet, valuation or scheme eligibility was obtained for the proposed company.

The seat-scale model divides annual revenue by assumed seat price and paid capacity. It reports gross reservation revenue rather than contribution or cash flow. Rounded event counts must not be read as a delivery forecast.

The 2027–2030 analysis is scenario planning. It starts from observed incumbent actions and asks which assets remain valuable if managed friendship grows, incumbents absorb IRL, the category stays local or a trust shock raises operating standards. The scenarios are not assigned probabilities and do not claim to predict which market structure will occur.

## Evidence gaps

The report is based on public sources, historical demand observations and modelled scenarios. It contains no first-party attendee, host, venue or operator research, and no observed retention, event-level P&L, acquisition cost, cohort composition or incident-rate dataset.

The [primary research programme](./13-primary-research-programme.md) turns those unknowns into a bounded next step instead of disguising them as certainty.
