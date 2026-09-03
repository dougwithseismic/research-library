# Demand, CPC and location screen

## Reading rule

Every table is a screen, not a forecast. The city basket uses the same 35 canonical service phrases in 26 places. It reveals where this basket carries search and auction value. It does not measure every synonym, suburb, postcode, problem query or service.

## Niche leaders across explicit city phrases

| Niche                | Sampled searches | Weighted CPC | Top cities by paid-value proxy                        |
| -------------------- | ---------------: | -----------: | ----------------------------------------------------- |
| Self storage         |           48,020 |       £13.96 | London, Manchester, Bristol, Leeds, Birmingham        |
| Skip hire            |           49,020 |        £2.05 | Birmingham, Nottingham, Leicester, Sheffield, Bristol |
| Removal company      |           29,040 |        £7.09 | Edinburgh, London, Nottingham, Leeds, Leicester       |
| Pest control         |           27,150 |        £3.70 | London, Birmingham, Manchester, Glasgow, Belfast      |
| Mortgage broker      |           15,910 |       £15.29 | London, Glasgow, Bristol, Leeds, Manchester           |
| Dental implants      |           12,590 |       £11.13 | London, Birmingham, Sheffield, Manchester, Edinburgh  |
| Funeral directors    |           11,400 |        £8.80 | London, Glasgow, Edinburgh, Leeds, Manchester         |
| Emergency plumber    |           10,770 |       £14.90 | London, Edinburgh, Bristol, Reading, Manchester       |
| House clearance      |           10,760 |        £4.36 | London, Birmingham, Manchester, Edinburgh, Newcastle  |
| Tree surgeon         |           10,700 |        £3.00 | London, Bristol, Manchester, Sheffield, Nottingham    |
| Commercial cleaning  |            9,410 |        £9.31 | Edinburgh, London, Leeds, Nottingham, Manchester      |
| Scaffolding          |            9,870 |        £6.09 | London, Reading, Birmingham, Bristol, Manchester      |
| Loft conversion      |            7,950 |        £8.62 | London, Bristol, Southampton, Birmingham, Cambridge   |
| Emergency locksmith  |            6,510 |       £32.06 | London, Edinburgh, Bristol, Leeds, Brighton           |
| Boiler installation  |            4,860 |        £9.39 | Edinburgh, London, Glasgow, Birmingham, Cardiff       |
| Drain unblocking     |            4,820 |       £10.98 | Bristol, London, Southampton, Coventry, Manchester    |
| Asbestos survey      |            3,250 |       £21.24 | London, Manchester, Birmingham, Nottingham, Leeds     |
| Fire risk assessment |            2,580 |       £23.85 | London, Manchester, Birmingham, Leeds, Bristol        |

Volume, CPC and business suitability disagree in useful ways. Skip hire has very high demand and a low weighted CPC. Emergency locksmith has one-eighth of the searches and more than fifteen times the CPC. Fire-risk and asbestos queries are smaller again but commercially dense. Each requires a different product and contract.

## City basket

| City        | Searches | Weighted CPC | Commercial read                                                          |
| ----------- | -------: | -----------: | ------------------------------------------------------------------------ |
| London      |   40,970 |       £16.77 | Largest and most expensive; defer unless a partner brings real authority |
| Birmingham  |   20,070 |        £7.28 | Large demand but substantial share from commodity marketplaces           |
| Edinburgh   |   19,530 |       £10.07 | Strongest non-London paid-value basket; inspect concentration carefully  |
| Manchester  |   18,190 |        £9.18 | Balanced B2B, compliance and mainstream service opportunity              |
| Leeds       |   17,100 |        £8.63 | Strong replication city with broad provider base                         |
| Glasgow     |   16,970 |        £7.87 | High volume and Scottish-specific operating work                         |
| Bristol     |   16,600 |        £9.63 | Strong high-ticket and urgent mix                                        |
| Nottingham  |   15,720 |        £7.54 | 34 niches with reportable volume; useful specialist tests                |
| Sheffield   |   14,570 |        £7.04 | Broad demand with lower CPC density                                      |
| Liverpool   |   13,070 |        £7.14 | Some value led by regulated or sensitive categories                      |
| Leicester   |   13,210 |        £6.47 | Removal, storage and skip categories dominate                            |
| Southampton |    9,490 |        £8.80 | Smaller but valuable drainage and project lanes                          |
| Reading     |    6,440 |        £8.53 | Lower volume with expensive urgent-service demand                        |

The complete 26-city table is in [`google-ads-city-summary.csv`](../evidence/google-ads-city-summary.csv).

## Local-geo city cross-check

The same 16 generic priority services measured inside nine cities produce a different, narrower comparison:

| City        | Keyword basket | Weighted CPC |
| ----------- | -------------: | -----------: |
| London      |         23,510 |       £13.47 |
| Birmingham  |          3,280 |        £6.70 |
| Manchester  |          1,930 |        £6.74 |
| Leeds       |          1,490 |        £8.13 |
| Edinburgh   |          1,260 |        £6.10 |
| Bristol     |          1,250 |       £12.01 |
| Reading     |            340 |       £13.13 |
| Southampton |            300 |       £12.88 |
| Nottingham  |            260 |        £4.05 |

London remains the expensive scale market. Bristol has the highest weighted CPC among the substantial non-London baskets. Reading and Southampton are commercially dense but small. Edinburgh's lead over the other regional cities disappears under this method, reinforcing the need to challenge its explicit-city outliers. The complete table is in [`google-ads-local-geo-city-summary.csv`](../evidence/google-ads-local-geo-city-summary.csv).

## Market-specific reads

### Edinburgh

- `commercial cleaning Edinburgh`: 2,900 at £14.32, but April 2026 alone reports 22,200.
- The expanded cleaning basket totals 6,210 across four overlapping returned rows and peaks at 44,440 in April, 7.87 times its monthly mean.
- The generic cleaning basket inside Edinburgh totals only 90 and reports no average CPC.
- The expanded boiler basket returns £19.04 explicit-city and £16.89 local-geo weighted CPC.

The first row made Edinburgh appear to be the strongest learning city. The cross-method result reverses that confidence: cleaning is paused, while boilers remain a credible buyer-led test. `removal company Edinburgh` also needs the same local-geo and seasonality challenge before it can inherit the top position.

### Manchester

- `fire risk assessment Manchester`: 260 at £27.11.
- `asbestos survey Manchester`: 170 at £24.66.
- Stronger mainstream categories include storage, mortgages and emergency plumbing.

Manchester supports a credible B2B compliance hypothesis. The organic result sample also contains institutional information, so the lead site must add premises-specific decision value.

Expanded intent strengthens the commercial signal. Fire-risk assessment returns a 540-search explicit keyword basket at £26.51 weighted CPC and a 210-search local-geo basket at £11.57. Asbestos returns 270 at £20.95 and 220 at £16.23 respectively. These are overlapping keyword baskets, but the agreement across methods is stronger than Edinburgh cleaning.

### Bristol

- `drain unblocking Bristol`: 590 at £16.09.
- `loft conversion Bristol`: 590 at £24.06.
- `roof repair Bristol`: 590 at £8.62.
- `tree surgeon Bristol`: 720 at £3.42.

Bristol can test how different job value and urgency alter the same city's economics. It should not be one catch-all trades brand.

The local-geo drainage basket returns 450 average monthly searches at £8.34 weighted CPC. Its monthly mean is 454 and peak 550, making it the steadiest priority history. Loft conversion returns a 310-search local basket at £7.21; its slower buying cycle remains the bigger commercial constraint.

### Nottingham and Southampton

`garage door repair Nottingham` returned 210 at £7.52. The visible competitors include established specialists and marketplaces, but the job lends itself to photo triage, diagnostic pricing and availability.

Its expanded local basket is only 100 at £5.94 weighted CPC and has a September 2025 peak of 1,020 against a 112.5 monthly mean. Recheck that spike before treating the average as durable.

`resin driveways Southampton` returned 170 at £21.44. High CPC and low phrase volume suggest a high-value but lumpy project funnel, not a fixed monthly lease on day one.

## London decision

London's basket is compelling and dangerous. The top categories include storage, emergency locksmith, emergency plumbing, mortgages and dental implants. High CPC reflects advertiser value but also increases the cost of learning. Regulated and profile-led categories occupy much of the value.

Do not choose a borough by intuition. The present screen did not test boroughs or city-geo generic phrases. London should be a later workstream with:

1. borough and postcode keyword research;
2. target-postcode local-pack grids;
3. real provider coverage and review strength;
4. contribution economics that tolerate paid CPC;
5. an organic proposition stronger than a city token.

## Architectural implications from national intent

`spray foam removal` and `conservatory roof replacement` have much larger generic demand than city-modified demand. They favour a national specialist publication with regional provider coverage.

Urgent trades have strong `near me` cohorts and require genuine local availability. B2B compliance categories show substantial generic demand, so guides, templates and premises-specific tools can feed quote capture without relying entirely on city pages.

Self storage and skip hire need inventory. The user wants to know what is available, what size, at what price and when. A booking or affiliate product is more credible than sending every visitor to one rented number.

## Before any domain purchase

For each shortlisted row, complete four missing measurements:

- at least ten exact and problem-form query variations;
- real target-postcode local pack and organic composition;
- at least twenty plausible providers and ten buyer conversations;
- contribution-based willingness to pay for an accepted lead.

For the seven current priorities, the first query-variation and local-geo step is now complete. The remaining work is real local-pack observation, provider interviews and contribution evidence. The complete comparison is in [`google-ads-priority-cluster-summary.csv`](../evidence/google-ads-priority-cluster-summary.csv).

The demand screen points to the interview. It does not replace it.
