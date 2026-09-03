# Companies House, CPC and buyer economics

## What the deeper pass changed

The first screen found attractive city phrases. The deeper screen asked whether those phrases survive three independent challenges:

1. does a generic query measured inside the city show a similar market;
2. is the twelve-month history stable rather than dominated by one spike;
3. can real providers and acquisition businesses be resolved to filed companies?

The answer changes the launch order. **Edinburgh commercial cleaning is no longer the first build.** Its supplier market is real, but its search evidence is not yet dependable. Manchester fire-risk assessment, Manchester asbestos survey, Bristol drainage and Edinburgh boilers now carry the best combinations of cross-method demand, advertiser pressure and identifiable fulfillment supply. They still require buyer interviews before SEO investment.

The complete outputs are the [priority cluster comparison](../evidence/google-ads-priority-cluster-summary.csv), [Companies House organisation evidence](../evidence/companies-house-organisations.csv), [segment summary](../evidence/companies-house-segment-summary.csv), [discovery screen](../evidence/companies-house-census-screen.csv) and [CPC sensitivity model](../evidence/cpc-economics-sensitivity.csv).

## The Google Ads quota was small and transient

The expanded screen produced:

- 144 generic-service observations inside nine city geo targets;
- 37 returned rows for expanded explicit-city variants across seven priority clusters;
- 37 returned rows for the same intent families measured generically inside their city targets;
- a twelve-month history for every returned priority row.

These are historical planning observations, not live campaign results.

### The comparable local-city basket

The same 16 generic service phrases were measured inside nine city targets. This is a cleaner location comparison than adding city words under UK targeting, but it covers fewer niches than the original 35-phrase screen.

| City        | Local-geo keyword basket | Weighted CPC | Paid-search-value proxy |
| ----------- | -----------------------: | -----------: | ----------------------: |
| London      |                   23,510 |       £13.47 |                £316,627 |
| Birmingham  |                    3,280 |        £6.70 |                 £21,968 |
| Bristol     |                    1,250 |       £12.01 |                 £15,008 |
| Manchester  |                    1,930 |        £6.74 |                 £13,001 |
| Leeds       |                    1,490 |        £8.13 |                 £12,120 |
| Edinburgh   |                    1,260 |        £6.10 |                  £7,689 |
| Reading     |                      340 |       £13.13 |                  £4,464 |
| Southampton |                      300 |       £12.88 |                  £3,865 |
| Nottingham  |                      260 |        £4.05 |                  £1,053 |

London is still the largest and most expensive arena. Bristol has the strongest substantial non-London mix of demand and CPC in this particular basket. Reading and Southampton are CPC-dense but small, so they suit tightly selected vertical tests rather than city-wide expansion. Edinburgh's broad explicit-city strength does not reproduce in the generic local-geo basket. See the [local-geo city summary](../evidence/google-ads-local-geo-city-summary.csv).

## Explicit city phrase versus local geo

These two methods are not expected to match exactly. They are most valuable when read together.

| Opportunity                      | Explicit-city keyword basket | Explicit weighted CPC | Local-geo keyword basket |      Local weighted CPC | Evidence agreement | Decision                        |
| -------------------------------- | ---------------------------: | --------------------: | -----------------------: | ----------------------: | ------------------ | ------------------------------- |
| Manchester asbestos surveys      |                          290 |                £19.50 |                      290 |                  £13.31 | Strong             | First-wave partner-led test     |
| Manchester fire-risk assessments |                          550 |                £26.02 |                      280 |                   £9.10 | Strong             | First-wave partner-led test     |
| Bristol drain unblocking         |                        1,600 |                £14.85 |                      690 |                   £6.66 | Strong             | First-wave call test            |
| Edinburgh boiler installation    |                        1,920 |                £19.39 |                      420 |                  £13.67 | Moderate           | First-wave buyer-led quote test |
| Bristol loft conversions         |                          730 |                £21.34 |                      310 |                   £7.21 | Moderate           | Second-wave appointment test    |
| Nottingham garage-door repair    |                          380 |                 £6.88 |                      100 |                   £5.94 | Moderate-low       | Recheck before second wave      |
| Edinburgh commercial cleaning    |                        6,210 |                £13.41 |                       90 | no reported average CPC | Weak               | Pause                           |

The values are keyword-basket comparisons, not unique searches. Google can group close variants, and several submitted terms may address the same underlying demand.

### Why cleaning was downgraded

The original `commercial cleaning Edinburgh` row reported 2,900 average monthly searches at £14.32. Expanded work found the same metrics attached to `office cleaning Edinburgh`, and both have an extreme April 2026 value of 22,200. Across the four returned explicit rows, April reaches 44,440 searches; the twelve-month basket mean is 5,644. That peak is 7.87 times the mean.

Inside the Edinburgh geo target, the generic cleaning basket reports only 90 average monthly searches. The base `commercial cleaning` row is 40, and Google reports no average CPC for any of the four retained local rows even though it reports a top-of-page bid range on the base phrase. The safe interpretation is **sparse or grouped auction data plus an anomalous explicit-city series**, not a free £14-CPC market.

The supplier hypothesis remains plausible. The search-volume claim does not. Before a domain or content build, cleaning needs a fresh historical read, adjacent query expansion, a live paid impression test with strict budget controls, or Search Console evidence from an existing relevant property.

### The other anomaly

Nottingham's local garage-door basket has a September 2025 peak of 1,020 against a twelve-month mean of 112.5. Its CPC evidence is directionally coherent, but demand stability is not. It remains a small recheck rather than a first launch.

## What CPC really justifies

Google defines average CPC as historical advertiser cost, competition index as filled ad slots divided by available ad slots, and low and high top-of-page bids as the 20th and 80th percentile bid observations. [Google historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics) and [metric reference](https://developers.google.com/google-ads/api/reference/rpc/v22/KeywordPlanHistoricalMetrics)

This supports a precise commercial inference: advertisers have historically contested these queries and assigned money to the click. It does not identify the advertisers, show their conversion rates, prove that their campaigns were profitable, reveal what they pay a publisher for a lead, or measure organic ranking difficulty.

High CPC is most useful as:

- evidence that a search cohort sits near money rather than being purely informational;
- a warning that paid validation will be expensive;
- an input into the minimum economics a lead or booked appointment must support;
- a reason to prefer original organic utility if it can earn the same intent without paying for every click.

It is not a lead-price list.

## CPC-to-lead sensitivity

The base scenario assumes 10% of paid clicks become enquiries, 70% of enquiries meet the accepted-lead definition, and the buyer closes 20% of accepted leads. That is a 7% click-to-accepted-lead rate. The resulting figures are arithmetic break-even acquisition costs before staff, tracking, call handling, credits, overhead, tax or profit.

| Opportunity                      | Local weighted CPC | Paid cost per accepted lead | Paid media per won job |
| -------------------------------- | -----------------: | --------------------------: | ---------------------: |
| Manchester asbestos surveys      |             £13.31 |                     £190.16 |                £950.80 |
| Edinburgh boiler installation    |             £13.67 |                     £195.35 |                £976.74 |
| Manchester fire-risk assessments |              £9.10 |                     £129.94 |                £649.72 |
| Bristol drain unblocking         |              £6.66 |                      £95.12 |                £475.61 |
| Bristol loft conversions         |              £7.21 |                     £102.99 |                £514.97 |
| Nottingham garage-door repair    |              £5.94 |                      £84.91 |                £424.57 |

These numbers explain why “the CPC is high, therefore sell a £50 lead” is a broken argument. Under the base funnel, a £50 lead cannot fund a £16 click. A contractor may rationally pay the click because it owns the gross contribution from the completed job. An intermediary has only the lead fee or agreed revenue share.

The same model includes weak and strong funnels. At a strong 16% click-to-accepted-lead rate, Bristol drainage falls to £52.10 per accepted lead; at a weak 3% rate it rises to £277.86. The commercial gate is therefore measured conversion and buyer contribution, not CPC alone.

## What the platform accounts establish

Companies House filings show that paying for or monetising local-service acquisition is not a cottage-industry fiction. Three selected operators disclose more than £200 million of combined turnover, although their periods differ and the total is not a market-size estimate.

| Filed company                          | Account period      | Turnover | Operating result | Average employees | What it demonstrates                                                          |
| -------------------------------------- | ------------------- | -------: | ---------------: | ----------------: | ----------------------------------------------------------------------------- |
| Vetted Limited, trading as Checkatrade | year to 31 Dec 2024 | £105.86m |    £2.67m profit |               518 | A large paid membership and directory acquisition business                    |
| Bark.com Global Limited                | year to 31 Dec 2025 |  £71.60m |      £0.86m loss |               172 | Material lead and subscription revenue, but revenue does not guarantee profit |
| MyBuilder Limited                      | year to 31 Dec 2025 |  £25.02m |    £5.67m profit |                88 | A profitable shortlist-fee marketplace in the disclosed period                |

Vetted's filing reports 50,824 total memberships and says turnover includes website-directory and printed-directory revenue. Bark's accounts say revenue includes professional lead fees and subscriptions, with lead revenue recognised when a professional responds. MyBuilder's accounts describe UK shortlist-fee revenue. The figures come from the official [Vetted](https://find-and-update.company-information.service.gov.uk/company/04285394/filing-history), [Bark](https://find-and-update.company-information.service.gov.uk/company/10614196/filing-history) and [MyBuilder](https://find-and-update.company-information.service.gov.uk/company/05272398/filing-history) filings.

The contrast matters. MyBuilder reported an operating margin of about 22.7% while Bark reported an operating loss of about 1.2% of turnover in its latest filed period. Marketplace scale can create a real business, but buying and reselling attention is not automatically high margin.

Rated People and TrustATrader were also resolved, but their selected filings do not disclose turnover. Rated People reported 40 average employees, £690,128 cash and negative £6.74 million net assets. TrustATrader reported 34 employees, £2.08 million cash and negative £206,777 net assets. Those balance-sheet snapshots are not verdicts on current trading, and they should not be compared casually across different capital structures.

Companies House states that it does not independently verify the accuracy of company-filed information. The figures are company-filed evidence, not audited market research. [Companies House quality and methods guide](https://www.gov.uk/government/publications/incorporated-companies-in-the-uk-by-jurisdiction-and-month-quality-and-methods-guide/quality-and-methods-guide)

## Does identifiable local supplier capacity exist?

The selected filing sample says yes, with substantial variation.

### Edinburgh commercial cleaning

Five selected entities all disclose employee counts: 1,615, 137, 39, 28 and 27. The median is 39. Spotless accounts for most of the sample and operates beyond a narrow Edinburgh market, so the 1,846 total must not be described as city employment. No selected filing discloses turnover.

This proves a spectrum from sizeable operator to smaller local firm. It does not rescue the anomalous keyword data, and the largest operator may have no reason to buy from a new publisher.

### Manchester fire and asbestos

The fire sample includes Ashton Fire at 76 employees and two smaller firms at one and two employees. Jackson required special handling: the Manchester service site's footer identifies company 03893399, which reports 27 employees, while the initially resolved related company 08429080 reports one. They are kept as related entities, not counted as two independent buyer prospects. [Jackson Manchester](https://manchester.jacksonfire.co.uk/)

An advanced Companies House discovery screen returned 183 active companies with `FIRE` in the name and a Manchester registered-office location, six with `ASBESTOS`, 37 active SIC 84250 matches and 147 active SIC 71200 matches. These are discovery bounds full of omissions and false positives. They support building a buyer list; they are not buyer totals.

### Bristol drainage

Two selected operators disclose 13 and 37 employees. A third named company, Maintain-A-Drain (South West) Limited, files dormant accounts while an active website with the same trading name exists. The connection to the active trading entity was not established, so it is flagged rather than silently treated as a buyer.

The broad advanced-search screen returned 20 active Bristol registered-office matches under sewerage SIC 37000 and 636 under plumbing SIC 43220, plus seven active names containing `DRAIN` and ten containing `DRAINAGE`. The large plumbing number is mostly a prospecting universe, not a drainage market count.

### Edinburgh boilers

The six selected companies range from one to 218 employees, with a median of 26.5. City Technical Services reported £27.04 million turnover, £1.12 million operating profit and 218 average employees for the year ended 31 December 2024. The other selected filings do not disclose turnover.

This is strong evidence of fulfillment depth across business sizes, but it creates a sales insight too: large operators and owner-managed installers need different offers. A large facilities business may want contract-grade appointments and coverage data; a small installer may want a capped number of high-intent replacement quotes.

## Revised market order

### First commercial discovery wave

1. **Manchester asbestos surveys.** Strongest explicit/local CPC agreement. Recruit an accredited survey partner before publishing transactional claims. The accepted-lead value must be tested against actual survey contribution.
2. **Manchester fire-risk assessments.** Strong paid intent and a visible supplier spectrum. Sell premises-qualified appointments, not undifferentiated forms.
3. **Bristol drainage.** Best stable local demand in the priority set. Use connected qualified calls and test dispatch performance; base-job economics make lead prices sensitive.
4. **Edinburgh boiler replacement.** High local CPC and evident supplier capacity. Start only with a verified Gas Safe buyer and a quote funnel capable of converting expensive intent.

This is the order for **buyer interviews and controlled acquisition tests**, not permission to build four sites simultaneously. Fire and asbestos are commercially attractive but safety- and competence-sensitive; drainage is operationally harsher but faster to measure; boilers are high value but reputation-led.

### Second wave

- Bristol loft conversions, because job value is high but feedback cycles are slow.
- Nottingham garage-door repair, after the September spike is rechecked.
- Regional spray-foam removal, using a specialist publication rather than cloned city pages.

### Pause

- Edinburgh commercial cleaning, until query quality is independently verified.
- Any regulated health, finance or legal category as a learning market.
- London, unless a partner already supplies genuine coverage, reputation and contribution economics.

## The buyer interview now has hard questions

The next step is not “would you buy leads?” It is to request numbers that make the economics falsifiable:

- last 90 days of qualified enquiries by source;
- contact rate, quote or survey-booked rate, close rate and gross contribution;
- maximum response time and actual missed-call rate;
- service radius, job exclusions and capacity by week;
- credit reasons and duplicate lookback window;
- the economic value of a connected call, accepted form and attended appointment;
- credentials, insurance and register status required for publication;
- whether the buyer will fund a tightly capped paid validation cohort.

Companies House helps select and segment those conversations. CPC helps set the economic challenge. Neither substitutes for the conversation.
