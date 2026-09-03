# Method and evidence boundaries

## Decision question

The research asks whether a UK local lead-generation or rank-and-rent business is investable in 2026, which niches and locations deserve validation, what revenue model fits each service shape, and how Google Business Profile rules and AI search alter the old playbook.

It does not ask which keyword has the largest number. It asks where demand, customer value, buyer capacity, organic opportunity, platform safety and operating reality can coexist.

## Google Ads method

The retained screen used Google Ads `GenerateKeywordHistoricalMetrics` through the repository's authenticated read-only tooling.

| Parameter                             | Value                         |
| ------------------------------------- | ----------------------------- |
| Observation date                      | 3 September 2026              |
| API version                           | v25                           |
| Network                               | Google Search                 |
| Language                              | English criterion 1000        |
| Geography                             | United Kingdom criterion 2826 |
| Working account currency              | GBP                           |
| Niches                                | 35                            |
| Cities                                | 26                            |
| Explicit city phrases                 | 910                           |
| National generic and near-me phrases  | 70                            |
| Generic local-geo rows                | 144 across nine city targets  |
| Expanded priority rows                | 37 explicit and 37 local-geo  |
| Final four-cell depth rows            | 49 explicit and 50 local-geo  |
| Buyer-acquisition rows                | 33                            |
| Platform-brand rows                   | 17                            |
| Retained rows across overlapping sets | 1,347                         |

Every niche used one canonical phrase and every city used the same basket. Examples are `commercial cleaning Edinburgh`, `fire risk assessment Manchester` and `drain unblocking Bristol`. The national layer submitted `commercial cleaning` and `commercial cleaning near me` separately.

The full observations are in:

- [`google-ads-explicit-city-screen.csv`](../evidence/google-ads-explicit-city-screen.csv)
- [`google-ads-national-intent-screen.csv`](../evidence/google-ads-national-intent-screen.csv)
- [`google-ads-niche-summary.csv`](../evidence/google-ads-niche-summary.csv)
- [`google-ads-city-summary.csv`](../evidence/google-ads-city-summary.csv)
- [`google-ads-local-geo-screen.csv`](../evidence/google-ads-local-geo-screen.csv)
- [`google-ads-priority-intent-screen.csv`](../evidence/google-ads-priority-intent-screen.csv)
- [`google-ads-priority-local-geo-intent-screen.csv`](../evidence/google-ads-priority-local-geo-intent-screen.csv)
- [`google-ads-priority-cluster-summary.csv`](../evidence/google-ads-priority-cluster-summary.csv)
- [`google-ads-priority-depth-explicit.csv`](../evidence/google-ads-priority-depth-explicit.csv)
- [`google-ads-priority-depth-local-geo.csv`](../evidence/google-ads-priority-depth-local-geo.csv)
- [`google-ads-buyer-intent-screen.csv`](../evidence/google-ads-buyer-intent-screen.csv)
- [`google-ads-platform-brand-demand.csv`](../evidence/google-ads-platform-brand-demand.csv)
- [`google-ads-depth-cluster-summary.csv`](../evidence/google-ads-depth-cluster-summary.csv)

## Why the two geographic methods are not interchangeable

An explicit city query under UK targeting measures people in the UK searching a phrase that includes the city. A generic query measured inside a city geo target would measure people Google associates with that location searching the generic service phrase.

Both are valid. They answer different questions.

The deeper pass retained a local-geo cross-check using Google's active 2026 city criteria. It first submitted 16 generic priority services inside each of nine cities. It then submitted expanded variants for seven priority city-niche clusters through both methods. Agreement increases confidence that paid commercial intent exists; disagreement triggers query-grouping, seasonality and real-impression validation.

The first local-geo attempt returned `RESOURCE_EXHAUSTED`. Google documents `GenerateKeywordHistoricalMetrics` at one request per second per customer ID on a rolling 60-second interval. It separately documents daily operation allowances by developer-token access level. Requests succeeded after adding 1.5-second pacing and one ten-second retry. The failure was therefore a transient rate-limit event, not evidence that the account had no keyword requests remaining. [Google Ads quota documentation](https://developers.google.com/google-ads/api/docs/best-practices/quotas)

The final depth run broadened only the four recommended cells. Buyer-acquisition queries and platform-brand queries were placed in separate clusters so that contractor demand for leads could not be confused with homeowner service demand or consumer navigation. “Retained rows” is a research-workload count; overlapping keyword sets make it unusable as a demand total.

## What each metric means

**Average monthly searches** are rounded historical averages returned by Google. They are not a forecast, addressable traffic or unique people.

**Average CPC** is a paid-search auction observation in the working account currency. It is not a lead price, contractor margin or the cost of ranking organically.

**Competition and competition index** describe advertiser participation. They do not measure domain authority, local-pack difficulty or content quality.

**Top-of-page bid ranges** are directional advertiser bid observations, not the price a new advertiser is guaranteed to pay.

**Weighted CPC** is:

```text
sum(searches × average CPC) ÷ sum(searches)
```

**Paid-search-value proxy** is:

```text
sum(searches × average CPC)
```

The proxy lets niches or cities be compared on the same screen. It is not a revenue forecast.

## Overlap and close variants

Google can group close variants. The retained rows include the submitted phrase, returned phrase, reported close variants and any grouped submitted phrases. Generic, near-me and explicit city datasets overlap in the underlying people and intent; they must not be added.

Zeros also require care. A zero can mean sparse demand, withholding, grouping into another term or a weak seed. It cannot safely be translated into “no one searches this.”

## Live-web method

Primary sources were used for platform and legal-operating constraints: Google, GOV.UK, HSE, FCA, ICO, ASA/CAP and official registers. Marketplace programme and price pages were used for observable commercial architecture. Independent or industry studies were used for AI-search behaviour with their geography and sample limits attached.

Public case studies were retained even where weak because the weakness is decision-relevant. Every case records whether the source is an operator, course seller, network or community poster and what could not be verified.

The live result sample is deliberately called a **web result sample**, not a Google SERP audit. It was not geolocated to target postcodes, personalised, or used to scrape Google automatically. It identifies visible competitor types and propositions, not definitive rank positions.

## Companies House method

The deeper pass used only read-only public Companies House endpoints and official filed-account documents. It did not query a project database or Supabase. Five lead marketplaces and 18 initially selected local suppliers were resolved by company number; one additional Jackson entity was captured after a Manchester website footer exposed an identity mismatch. A subsequent platform pass captured nine further legal entities around Yell, FMB, Airtasker, Houzz, Which, BookaBuilder and HaMuch. The public financial comparison includes only entities whose selected filing supported a useful, correctly bounded observation.

Public derived files exclude officers and people with significant control. They retain registered name, company number, filing period, selected financial metrics, extraction method, source links, parser warnings and trading-identity state. Raw captures remain under `private-data/`.

Most small-company filings do not disclose turnover or a profit-and-loss account. Missing values remain blank, not zero. Three PDF or XHTML accounts required manual transcription of selected headline metrics, and that method is stated row by row. Companies House states that it does not independently verify the accuracy of company-filed information. The registry establishes legal and filing evidence; it does not establish service quality, geographic coverage, buying intent or present financial performance. [Companies House quality and methods guide](https://www.gov.uk/government/publications/incorporated-companies-in-the-uk-by-jurisdiction-and-month-quality-and-methods-guide/quality-and-methods-guide)

## Landscape and financial comparison method

The 32-operator atlas is a purposive strategic sample, not a census. Operators were selected to expose different layers and charging units. Public product and pricing pages establish what each operator says it sells; they do not verify retention, conversion or customer results.

The platform financial comparison normalises latest available filed figures where disclosure permits. Turnover is never replaced with a balance-sheet proxy. Period duration, year end, geography, company boundary, product mix, employee disclosure and manual extraction limitations are retained. Adding disclosed turnover is used only to demonstrate economic scale and is explicitly not market sizing.

## Modelled datasets

Buyer segments, market-dossier price bands, revenue architectures, AI risk and capital scenarios are inference or assumption layers. They are published as CSVs so inputs can be challenged. None becomes observed simply because it is formatted as a number.

## Evidence hierarchy

1. Official policy, regulator guidance and project Google Ads data.
2. Independent research with visible method.
3. Current marketplace terms, prices and public result observations.
4. Named operator interviews and case studies.
5. Anonymous or community anecdotes.
6. Inference and explicit assumptions.

An official platform source is authoritative for the platform's stated rule, but not necessarily for the commercial effect of that rule. A first-party case can establish what the publisher claims, but not whether the result is representative.

## Material limitations

- No audited representative UK rank-and-rent dataset was found.
- No original buyer interviews were conducted.
- No site was launched, so Search Console and lead-quality data do not exist.
- No target-postcode local-pack grid was captured.
- Search volume does not reveal how many advertisers are contractors, lead brokers, marketplaces or national brands.
- A high CPC shows auction participation, not that any advertiser was profitable or would buy a publisher's lead.
- Companies House discovery screens are registered-office and filing searches, not supplier censuses or buyer counts.
- Public price guides provide order-value context, not contractor gross contribution.
- Scotland, Wales and Northern Ireland have nation-specific regulatory and registry details that must be validated for each live category.
- This is commercial research, not legal advice.

The [manifest](../evidence/manifest.json), [source register](../evidence/sources.csv) and [claim ledger](../evidence/claim-evidence-ledger.csv) keep these boundaries attached to the conclusions.
