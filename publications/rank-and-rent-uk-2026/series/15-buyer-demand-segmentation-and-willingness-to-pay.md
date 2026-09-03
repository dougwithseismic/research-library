# Buyer demand, segmentation and willingness to pay

## Searchers on both sides of the market

The original keyword work described homeowner and business demand for services. The expansion adds 33 returned rows specifically about acquiring work: buying leads, vertical leads and marketing for trades.

The [buyer-intent screen](../evidence/google-ads-buyer-intent-screen.csv) is historical Google Search auction evidence under a UK target. It found:

| Cluster         | Keyword-basket searches | Weighted CPC | Monthly paid-value proxy |
| --------------- | ----------------------: | -----------: | -----------------------: |
| Lead purchase   |                     520 |       £21.36 |                  £11,106 |
| Vertical leads  |                     680 |       £25.11 |                  £17,072 |
| Trade marketing |                   1,030 |       £11.53 |                  £11,881 |

These baskets overlap. They are not unique buyers and must not be summed into a market size. They show that supplier-acquisition queries participate in expensive auctions.

Individual observations make the commercial intent concrete:

| Query                     | Avg monthly searches | Avg CPC |
| ------------------------- | -------------------: | ------: |
| `seo for plumbers`        |                  390 |  £16.85 |
| `roofing leads`           |                  320 |  £29.45 |
| `local seo for plumbers`  |                  170 |  £16.63 |
| `trade leads`             |                  140 |  £35.15 |
| `boiler leads`            |                  140 |  £22.48 |
| `pay per lead`            |                  110 |  £17.98 |
| `cleaning leads`          |                   70 |  £28.13 |
| `builder leads`           |                   40 |  £55.14 |
| `google ads for plumbers` |                   30 |  £31.60 |

The small rows are noisy and Google can group variants. Fire-risk and asbestos lead phrases returned no measurable rows in this run; zero is not proof that no buyer demand exists. The correct conclusion is narrower: contractors and intermediaries demonstrably pay to reach people seeking acquisition products, and generic seller acquisition can itself be costly.

## Ten distinct buyers

The [buyer-segment model](../evidence/buyer-segments.csv) separates ten archetypes. A lead product cannot serve them all with one promise.

### 1. Single-van urgent trade

The owner answers the phone and fulfils the work. Capacity changes by hour. A useful product is a connected, serviceable call with a tight radius and daily cap. A monthly tenancy can become a burden when the diary is full; a long form is too slow when the drain is overflowing.

### 2. Small planned-work trade

A two-to-five-person boiler, garage-door or roofing company wants surveys and quotes. It can accept a structured lead or appointment, but poor follow-up will make any channel look bad. The buyer needs enough gross contribution to cover unsuccessful quotes.

### 3. Regional compliance specialist

An asbestos surveyor or fire-risk assessor values property type, responsible person, work scope, timing and credential fit. A generic telephone enquiry may be worth less than a complete brief even if the eventual job is valuable.

### 4. Home-improvement sales team

Windows, solar, insulation and high-ticket installers employ or contract field sales capacity. Their purchasing unit is often an attended appointment. They care about homeowner status, decision-makers, property suitability, budget, cancellation and replacement rules.

### 5. Multi-branch service business

A regional HVAC, drainage or facilities group can consume volume, but demands branch routing, service taxonomies, capacity rules and consolidated reporting. It may be a better anchor buyer than several microbusinesses if the contract avoids dependency.

### 6. Commercial facilities supplier

Commercial cleaning, fire safety and maintenance firms pursue recurring contracts. They may want named opportunities, procurement intelligence or meetings rather than consumer forms. The sales cycle is slower and a contract can be worth much more.

### 7. Franchise or network

A central brand buys or coordinates demand while franchisees fulfil. Territory rules, lead fairness and local adoption are central. A national contract can scale quickly and fail quickly if franchisees do not report outcomes.

### 8. Broker or marketplace

Bark's affiliate programme, for example, has advertised up to £80 for a qualifying project. “Up to” is not an average payout. This buyer makes acceptance policy, duplication and programme stability more important than a direct relationship with the fulfiller.

### 9. Trade marketing agency

An agency can aggregate several end buyers and purchase white-label calls or leads. It brings distribution but adds a margin layer and creates client-ownership questions.

### 10. Owned operator

Owning or acquiring fulfilment captures the entire job contribution, but it imports people, vans, licences, customer service, working capital and liability. It is an operating-company strategy, not a monetisation toggle.

## A lead price is a residual, not a CPC multiple

The maximum sustainable price follows buyer economics:

> maximum event price = probability of winning × gross contribution from a win − follow-up cost − required buyer margin − risk allowance

If a boiler installer closes 20% of attended quotes and earns £1,400 gross contribution per installation, the expected gross contribution per attended quote is £280 before sales labour, cancellations, finance failures, warranty cost and overhead. A £200 appointment might be possible; a £300 appointment would be irrational under those assumptions. Change the close rate to 10% and the ceiling halves.

For a £180 emergency drainage job with £100 gross contribution and a 55% connected-call win rate, expected gross contribution is £55 before engineer travel, call handling and overhead. A £90 call is not supported even though the keyword CPC might be high.

This explains the asymmetry between paid CPC and intermediary pricing. The contractor can pay a click and capture the job's full contribution. The lead operator captures only its contracted unit unless it shares downstream revenue.

## Interview the economic buyer, not only the owner

The person who says “we need more work” may not control the numbers. Interviews should include:

- owner-operators who buy and fulfil;
- sales or marketing leaders who manage channel budgets;
- office managers who answer and route enquiries;
- branch managers who know local capacity;
- finance staff who know refund, bad-debt and contribution reality;
- agencies or networks that purchase on behalf of providers.

Ask for ranges and examples, not confident opinions. The minimum evidence is the last 20–50 enquiries by source: contacted, qualified, quoted, won, revenue, cancellation and reason lost. Where a buyer cannot produce this, the first product includes measurement and the price remains provisional.

## Buyer qualification score

Before sending a lead, score the buyer on five axes from zero to two:

| Axis        | 0                         | 1                        | 2                                            |
| ----------- | ------------------------- | ------------------------ | -------------------------------------------- |
| Capacity    | no confirmed capacity     | intermittent             | declared current slots                       |
| Response    | usually missed or delayed | within business day      | live or defined SLA                          |
| Fit         | vague coverage            | category or area partial | exact service-area match                     |
| Trust       | evidence missing          | basic identity           | credentials, insurance and process evidenced |
| Measurement | no outcome reporting      | manual monthly           | event-level status loop                      |

A buyer below seven out of ten should not receive exclusive premium inventory. This protects the consumer experience and prevents false conclusions about lead quality.

## Retention is the real willingness-to-pay test

An interview can validate pain and a pilot can validate initial payment. Neither validates a durable price. Retention requires three things:

1. a stable definition of what is billable;
2. cohort evidence that the buyer earns acceptable contribution;
3. confidence that volume and quality can be controlled.

Price should be reviewed from accepted-event and won-job cohorts after 30, 60 and 90 days. A buyer who retains at a lower price with reliable feedback can be worth more than one who accepts a premium trial and disappears.
