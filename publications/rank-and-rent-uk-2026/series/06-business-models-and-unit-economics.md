# Business models and unit economics

## The commercial decision

Use **pay per accepted lead or qualified appointment** to discover value. Use **base plus performance** once the cohort is stable. Treat a fixed monthly tenancy as a pricing transformation of proven lead flow, not the starting assumption.

The full [model scorecard](../evidence/business-model-scorecard.csv) separates cash-flow predictability, alignment, measurement, control and downside.

## Pay per qualified call

Best for urgent trades where the caller needs an immediate human response.

The billable event must be contractually precise:

- caller is in the covered territory;
- requested service is included;
- call connects to the buyer or approved overflow;
- minimum connected duration is met, unless a valid appointment is booked sooner;
- repeat and duplicate window is defined;
- spam, sales calls and recruitment calls are excluded;
- operating hours and overflow rules are visible;
- call recording and privacy notice are implemented appropriately.

Call volume is not lead volume. The US Lead Smart case illustrates the leakage: 124 inbound calls became 39 completed calls and 15 conversions. UK values are unknown, but the funnel discipline transfers.

## Pay per accepted lead

Best for planned work and compliance surveys. The form can reduce wasted sales time by collecting the details required for a real quote.

Acceptance should be decided from objective fields, not the buyer's mood after a weak sales call. A suitable definition covers service, geography, contactability, duplicate status, timing, authority and category-specific information.

This is the recommended discovery contract because every acceptance and rejection creates pricing evidence.

## Fixed territory tenancy

The attraction is predictable publisher revenue and simple buyer budgeting. The weakness is that the fixed fee hides changing quality and seasonality. A tenant that receives several weak months may leave exactly when the publisher has become dependent on that payment.

Only offer tenancy after at least 90 days of evidence. A practical floor is:

```text
tenant floor
= rolling monthly accepted leads
× tested accepted-lead value
× risk and volume factor
```

The factor can sit around 65%–80% to compensate the tenant for volume commitment and quality variance. That range is an operating assumption, not a UK benchmark.

## Base fee plus performance

This is the recommended mature model.

The base pays for exclusivity, routing, reporting and minimum territory maintenance. The performance component tracks accepted leads, connected calls or qualified appointments. It keeps upside linked to delivered value while giving the publisher a cash-flow floor.

For B2B services, a booked site visit may be better than a lead. For high-ticket home projects, a completed survey can be the paid event. The deeper the event, the higher the value and the more carefully attribution and buyer behaviour must be measured.

## Affiliate and booking revenue

Bark publicly advertises up to £80 for an eligible referred project when at least one professional responds. It also pays for referred professionals under a separate structure. [Bark affiliate programme](https://www.bark.com/en/gb/affiliates/)

This creates a useful fallback where no exclusive buyer exists. It is not proof of an £80 average lead value. Category payout, approval, response, attribution and programme changes remain outside the publisher's control.

For self storage and skip hire, a booking or availability relationship is more natural. The user wants a size, date, price and location—not a vague callback.

## Owned operator or joint venture

The maximum a pure lead seller can capture is constrained by the buyer's willingness to pay. A joint venture can share job contribution and makes high CPC more rational. It also imports hiring, scheduling, health and safety, warranties, refunds, reputation and service liability.

Do not use ownership to rescue an unproven acquisition thesis. Enter fulfillment only after lead quality, close rate and contribution are measured.

## Economics framework

The minimum model has six rates:

```text
accepted leads = raw leads × acceptance rate
wins = accepted leads × buyer close rate
lead revenue = accepted leads × accepted-lead price
buyer contribution = wins × contribution per won job
publisher contribution = lead revenue − acquisition − content − routing − credits
```

Revenue is not buyer value. A £3,000 boiler installation includes equipment, labour, VAT, warranty and overhead. Lead pricing should use gross contribution after variable job cost, not the consumer invoice.

## Illustrative scenarios

| Scenario                   | Raw leads |   Accepted |                Price | Gross revenue | Contribution before labour |
| -------------------------- | --------: | ---------: | -------------------: | ------------: | -------------------------: |
| Small proof                |         8 | 5.2 at 65% |                  £35 |          £182 |                       -£58 |
| Credible territory         |        20 |  15 at 75% |                  £60 |          £900 |                       £525 |
| Strong mature territory    |        40 |  34 at 85% |                 £100 |        £3,400 |                     £2,725 |
| Illustrative tenancy floor |        20 |         15 |       £42 equivalent |          £630 |                       £255 |
| Illustrative hybrid        |        20 |         15 | £400 base + £40 each |        £1,000 |                       £625 |

The cost assumptions and calculations are preserved in [`economics-scenarios.csv`](../evidence/economics-scenarios.csv). None is a forecast or claimed market price.

## CPC break-even

For paid search feeding a lead sale:

```text
break-even media CPC
= accepted-lead price × paid-click-to-accepted-lead rate
```

At £60 per accepted lead and a 12% conversion rate, break-even media CPC before overhead is £7.20. The deeper local-geo weighted CPCs are £11.57 for Manchester fire risk, £16.23 for Manchester asbestos, £8.34 for Bristol drainage and £16.89 for Edinburgh boilers. To buy that traffic sustainably, the business needs a much higher accepted event value, a materially stronger conversion rate, or participation in downstream job economics.

This is why CPC should be read as evidence that somebody values the customer, not evidence that a publisher can buy the click and resell the lead.

The [CPC economics sensitivity](../evidence/cpc-economics-sensitivity.csv) applies three explicit funnels. Its base case assumes 10% click-to-enquiry and 70% enquiry acceptance, producing a 7% click-to-accepted rate. Before overhead, that implies £119 per accepted Bristol drainage lead, £165 for Manchester fire risk, £232 for Manchester asbestos and £241 for Edinburgh boilers. A strong 16% click-to-accepted rate reduces Bristol drainage to £52; a weak 3% rate raises it to £278. These are hurdle calculations, not forecasts.

## Model selection by opportunity

- Commercial cleaning, only after query verification: qualified site visit, then hybrid.
- Fire risk and asbestos: verified-provider appointment.
- Drainage and emergency plumbing: connected qualified call.
- Boiler, loft and resin projects: accepted survey lead with long attribution.
- House clearance: photo-qualified accepted lead.
- Storage and skip hire: booking, affiliate or revenue share.
- Stable mature cohort: tenancy floor plus performance.

## Financial stop rules

Pause investment if any of the following persists across a meaningful cohort:

- accepted-lead revenue does not cover tracking, support and incremental acquisition;
- more than 25% of leads are credited for reasons the publisher could have screened;
- one buyer represents all revenue and refuses outcome feedback;
- the economics work only when buyer revenue is mistaken for contribution;
- paid CPC is above break-even and there is no downstream share;
- a tenancy fee is being set from projected rather than observed volume.
