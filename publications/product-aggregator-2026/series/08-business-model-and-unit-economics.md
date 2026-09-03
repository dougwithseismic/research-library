# Business model and unit economics

## What business model should launch first?

The launch model should be a hybrid publisher with two explicit transaction paths:

1. **Retail product path:** the buyer compares a canonical product, clicks a tracked offer and completes checkout with the merchant. Revenue is affiliate commission after attribution, validation and funding.
2. **Installed project path:** the buyer completes a structured specification, consents to contact and is matched with an eligible installer or dealer. Revenue is attached to a defined accepted lead, survey or completed project.

The platform should not become the merchant of record during the initial validation period. That avoids owning inventory, consumer payment, fulfilment, returns, product warranties and the full seller-side compliance surface before the decision product is proven.

The existing Kickback architecture already expresses the retail path:

```text
merchant programme → catalogue → tracked outbound link → retailer purchase
→ transaction ingest → attribution → commission ledger → approval → payout
```

The proposed vertical strategy changes the products, attributes and editorial layer. It does not change the financial truth that a retailer controls checkout and that affiliate money is delayed and reversible.

## Which CPC does this chapter mean?

Two economically opposite prices are both commonly called CPC:

| Term used in this series | Direction of cash      | Meaning                                                             |
| ------------------------ | ---------------------- | ------------------------------------------------------------------- |
| Search acquisition CPC   | Platform pays Google   | Cost of obtaining one search-ad visit                               |
| Merchant outbound CPC    | Merchant pays platform | Revenue for one valid click from a comparison offer to the merchant |

The historical CPC attached to each keyword in the research ledger is the first kind. It is a market and acquisition-cost signal; it is not a proposed merchant rate. The second kind is a legitimate product-comparison model—idealo currently publishes a £0.35 UK rate for Home & Garden and Leisure & Outdoors—but it requires direct contracts, click-quality controls and enough merchant value to sustain the price. [idealo merchant pricing](https://partner.idealo.com/partner-idealo-com/uk/pricing)

At a 55% site-to-merchant click rate, a £0.35 outbound CPC yields £0.1925 per site visit. Buying that visit at the garden basket's £0.94 Google Ads CPC would lose £0.7475 before any content, platform or operating cost. Merchant CPC can monetise organic, direct and returning comparison traffic; it does not create a paid-search arbitrage business.

The complete payment-model decision—including contract terms, commercial packages and revenue by vertical—is in [Revenue architecture](./13-revenue-architecture-cpa-cpc-cpl-tenancy-and-beyond.md).

## What revenue layers are available?

Current UK evidence says this should be a portfolio with a clear launch spine. The APMA attributes 81% of measured 2025 UK affiliate investment to CPA, 13% to tenancy, 3% to CPL and 2% to a residual category containing assisted commissions, CPC and service or technology fees. Tenancy grew 18% year on year. That supports CPA as the initial retailer mechanism and tenancy as a meaningful later layer; it does not justify forcing an installed-project funnel into CPA. [APMA 2026 report](https://theapma.co.uk/download/9188/?tmstv=1777836706)

### Affiliate commission

This is the first and most measurable layer. The platform earns a percentage or fixed bounty on a validated merchant transaction.

Advantages:

- no inventory or seller checkout;
- direct connection between offer click and commission;
- product feeds can support price and availability display;
- commission scales with order value;
- creator allocation can share a known transaction.

Weaknesses:

- last-click or programme-specific attribution;
- commission exclusions by category, finance or customer type;
- validation delay and reversals;
- merchant programme termination;
- feed and tracking failures;
- restrictions on PPC, vouchers, claims or creative;
- concentration risk.

### Qualified lead revenue

This belongs to installed awnings, garden rooms, some cabins, machinery and dealer-led purchases. The platform should charge only for a precisely defined commercial event.

Possible events:

- accepted qualified enquiry;
- booked survey;
- attended survey;
- finance-qualified buyer;
- completed order;
- exclusive territory lead allowance.

A raw form submission is not equivalent to any of those. Lead billing needs explicit rejection reasons, time limits, duplicate rules, postcode coverage and evidence of contact consent.

### Sponsored placement

Merchants can pay for clearly labelled visibility, newsletter inclusion or a promoted offer. Sponsorship must never silently alter an editorial score or product recommendation.

The ranking system should have separate values for:

- editorial suitability;
- offer price and total cost;
- merchant quality;
- commercial commission;
- paid promotion.

Only the first three should determine an organic recommendation. Paid placement should be visible and independently filterable.

### Creator commission sharing

Specialist creators can publish collections, room plans or studio specifications. The platform allocates a defined share of net validated commission after the underlying merchant transaction is approved and funded.

The payable base should be explicit:

```text
creator payable = funded commission
                  − network adjustments
                  − refunds and reversals
                  − platform share
                  − any contractually defined reserve
```

Do not calculate creator payouts from gross order value or pending commission.

### Dealer subscriptions and listing fees

This is appropriate for land and smallholding equipment, where sellers need inventory distribution and buyers need local, condition-specific stock. The fee can cover an inventory allowance, enhanced seller profile, lead routing and reporting.

Subscriptions should follow evidence of demand. Charging supply before delivering qualified activity creates churn and distrust.

### Deferred revenue layers

- Consumer membership for alerts, planning or concierge.
- Merchant analytics and category intelligence.
- Data licensing.
- Native checkout margin.
- Installation coordination fees.
- Finance or insurance referrals.

Each adds product or compliance obligations. None is required to validate the initial decision engine.

## What is the affiliate revenue equation?

At visitor level:

```text
approved revenue per visit =
  merchant click-through rate
  × merchant purchase conversion
  × validation rate
  × commissionable order value
  × commission rate
```

If commission is a fixed bounty, replace the last two terms with the bounty.

Contribution before fixed overhead is:

```text
contribution per visit = approved revenue per visit
                         − variable acquisition cost per visit
                         − variable platform and creator costs
```

The formula exposes why AOV and CPC alone are insufficient. The platform loses traffic at the merchant click, transaction, attribution and validation stages.

## What do the observed merchant economics imply?

### Robot-mower example

Observed inputs from Navimow:

- AOV: £1,000-plus.
- Commission: 5%-plus.
- Attribution window: 30 days.
- Commercial keyword CPC: approximately £1.06 for the canonical `robotic mower for sale` phrase.

Using the minimum disclosed AOV and rate:

```text
gross commission per approved order = £1,000 × 5% = £50
gross visitor-to-approved-sale break-even = £1.06 ÷ £50 = 2.12%
```

At 60% visitor-to-merchant click-through, the merchant needs a 3.53% approved purchase rate before content, platform and creator cost. The real threshold is higher if the order value is not commissionable in full or validation is below 100%.

### Private-leisure example

Observed Home Leisure Direct inputs:

- AOV: £1,400.
- Commission: 5%.
- Average commission claim: approximately £70.
- Basket weighted CPC: £0.84.

```text
gross visitor-to-approved-sale break-even = £0.84 ÷ £70 = 1.20%
```

At 60% outbound click-through and 90% validation, the required merchant purchase rate is:

```text
1.20% ÷ 60% ÷ 90% = 2.22%
```

The economics are attractive in isolation. Home Leisure Direct's programme restrictions mean paid acquisition cannot be assumed eligible, which is exactly why commercial arithmetic and partner terms must be evaluated together. [Programme](https://ui.awin.com/merchant-profile/22809), [terms](https://ui.awin.com/merchant-profile-terms/22809)

### Maker-studio example

The strongest maker programme does not publish commission. A scenario can still identify the threshold without pretending the rate is observed.

Assume 3% commission:

| Representative order | Gross commission | Break-even approved-sale rate at £0.32 CPC |
| -------------------: | ---------------: | -----------------------------------------: |
|               £1,199 |           £35.97 |                                      0.89% |
|               £2,949 |           £88.47 |                                      0.36% |
|               £4,833 |          £144.99 |                                      0.22% |

The lower CPC creates room for original technical content, but the rate and programme coverage must be confirmed.

## What does revenue per thousand qualified visits look like?

The following table is a sensitivity model, not an observed forecast.

| Scenario                     | Merchant CTR | Merchant purchase | Validation | Commission/order | Approved orders/1,000 visits | Revenue/1,000 visits | Revenue/visit |
| ---------------------------- | -----------: | ----------------: | ---------: | ---------------: | ---------------------------: | -------------------: | ------------: |
| Garden product, conservative |          45% |              1.5% |        85% |              £50 |                         5.74 |                 £287 |         £0.29 |
| Garden product, base         |          55% |              3.0% |        90% |              £50 |                        14.85 |                 £743 |         £0.74 |
| Garden product, strong       |          65% |              5.0% |        92% |              £50 |                        29.90 |               £1,495 |         £1.50 |
| Games room, conservative     |          45% |              1.5% |        85% |              £70 |                         5.74 |                 £402 |         £0.40 |
| Games room, base             |          60% |              2.5% |        90% |              £70 |                        13.50 |                 £945 |         £0.95 |
| Games room, strong           |          70% |              4.0% |        92% |              £70 |                        25.76 |               £1,803 |         £1.80 |
| Maker studio, scenario       |          50% |              1.5% |        90% |              £90 |                         6.75 |                 £608 |         £0.61 |

The table supports three decisions:

1. Paid traffic is fragile unless the decision tool sends highly qualified visitors to merchants.
2. Organic, direct, email and creator traffic materially improve the blended model.
3. Approved revenue per visit is the right commercial metric; raw clicks and pending commission can mislead.

## How should paid acquisition be evaluated?

Use a staged test:

```text
search impression → ad click → engaged comparison → shortlist
→ merchant click → tracked transaction → validated transaction → funded commission
```

Each stage needs a stable identifier and cohort date. A campaign should not be scaled from merchant clicks alone.

The maximum allowable CPC is:

```text
allowable CPC = approved revenue per visit × target acquisition share
```

If the base garden scenario produces £0.74 approved revenue per visit and the business permits acquisition to consume 50% of that revenue, allowable CPC is £0.37—not the observed £0.94 basket CPC. Paid traffic would fail until conversion, commission or order value improves.

If the strong garden scenario produces £1.50 and acquisition can consume 60%, allowable CPC is £0.90. The search auction becomes plausible but still tight.

This is why low CPC is a market filter, not the growth plan.

## How should the lead funnel be modelled?

For installed projects:

```text
revenue per visit = visit-to-lead rate
                    × lead acceptance rate
                    × fee per accepted lead
```

Illustrative awning scenario:

| Input                            | Conservative |  Base | Strong |
| -------------------------------- | -----------: | ----: | -----: |
| Visit-to-completed-specification |           3% |    8% |    15% |
| Specification-to-accepted-lead   |          20% |   35% |    50% |
| Fee per accepted lead            |          £60 |  £120 |   £200 |
| Revenue per visit                |        £0.36 | £3.36 | £15.00 |

The strong case looks extreme because a completed specification is much closer to a booked project than an ordinary page view. The actual event definition must be negotiated before these values mean anything.

Lead economics should also include:

- duplicate and existing-customer exclusions;
- out-of-area rejection;
- unreachable buyer;
- project below minimum value;
- wrong wall, access or service requirement;
- refund and dispute timing;
- exclusivity;
- partner response time;
- buyer consent and data-sharing notice.

## How should creator economics work?

Creator share should be a percentage of **net funded commission**, not gross order value.

Illustrative allocation on a £70 funded commission:

| Allocation                                   | Amount |
| -------------------------------------------- | -----: |
| Creator share, 50%                           | £35.00 |
| Platform gross share, 50%                    | £35.00 |
| Less payment and operating reserve, scenario |  £5.00 |
| Platform contribution before fixed cost      | £30.00 |

If a paid click cost £0.84 and 1.2% of visitors produced approved sales, acquisition alone consumes the entire £70 before the creator is paid. Creator-led distribution therefore works best when the creator supplies audience and expertise rather than receiving a share on traffic the platform purchased at full auction price.

## What should the financial ledger recognise?

The ledger should distinguish:

- tracked but unmatched purchase;
- matched pending commission;
- merchant-approved commission;
- merchant-declined or reversed commission;
- approved but unfunded commission;
- funded and payable commission;
- creator payable;
- creator paid;
- platform revenue recognised;
- correction and clawback.

No payout should occur from a mutable `commission_status` field alone. Every financial state change should have an immutable journal entry, source event and idempotency key.

## What concentration limits should apply?

Suggested operating limits during the first year:

- no merchant above 50% of trailing approved commission after the first three months;
- no product family above 70% of organic entrances after the first six months;
- no creator above 35% of attributed approved commission without a specific continuity plan;
- maintain at least two monetisable merchants in every launched product family;
- suppress a category from paid acquisition if fewer than two eligible offers remain.

These are risk controls, not observed industry standards.

## What should be measured weekly?

- High-intent entrances by category.
- Comparison engagement rate.
- Shortlist creation rate.
- Outbound merchant click-through.
- Tracked purchase rate.
- Match rate.
- Validation rate and median validation days.
- Reversal rate.
- Approved commission per order.
- Approved revenue per visit.
- Revenue concentration by merchant, category and creator.
- Feed staleness and offer mismatch rate.
- Lead completion, acceptance and dispute rate.
- Repeat visit and email-return rate.

Raw traffic, page count and imported SKU count are diagnostic measures. They are not business outcomes.

## What are the first financial stop/go rules?

Proceed from research to MVP only if:

- at least three merchants across the launch categories confirm an eligible commercial path;
- expected commission or accepted-lead value can be written into a real contract or programme term;
- feed and tracking tests resolve product and transaction identity;
- the base-case break-even rate is within a plausible range for a high-intent comparison journey.

Proceed from MVP to scaled acquisition only if:

- approved revenue per visit is measured, not inferred from pending transactions;
- at least two acquisition sources convert;
- merchant concentration is declining;
- paid traffic remains contribution-positive after creator share and validation;
- organic or direct traffic shows compounding behaviour.

Stop paid acquisition when approved revenue per incremental visit remains below variable cost after two meaningful conversion iterations. Stop the vertical when merchant access, feed quality or buyer engagement makes the decision product impossible—not merely because early traffic is small.
