# Business models and unit economics

## Which model should be tested?

Test a partner-led managed-compliance service. Use software and AI to make its evidence and coordination loop efficient, but charge for a managed customer outcome rather than for model access.

The [entry-strategy scorecard](../evidence/entry-strategy-scorecard.csv) uses seven weighted dimensions: demand necessity 20%, AI durability 20%, credible trust path 15%, proprietary-data potential 15%, recurring-revenue potential 15%, time to evidence 10% and capital efficiency 5%.

| Strategy                       | Weighted score | Decision                           |
| ------------------------------ | -------------: | ---------------------------------- |
| Acquire an accredited operator |       4.25 / 5 | Defer until confidential diligence |
| Partner-led managed compliance |       4.00 / 5 | Test first                         |
| Pure vertical SaaS             |       3.00 / 5 | Defer                              |
| Remain out                     |       2.50 / 5 | Use if kill conditions trigger     |
| Generic content and leads      |       2.25 / 5 | Reject as the core                 |

The acquisition score does not override its unknowns. A high trust and data score cannot value insurance exposure, owner dependence or historic report quality from public information.

## Why reject generic content and leads as the core?

The model is simple: publish pages, rank for service terms, collect enquiries and sell them to providers. Retained demand supports the existence of explicit searches, but paid acquisition reveals the fragility.

The Manchester fire-risk cluster had a £9.10 volume-weighted historical CPC. Media-only accepted-lead cost is:

```text
£9.10 ÷ 3%  = £303.33
£9.10 ÷ 7%  = £130.00
£9.10 ÷ 16% = £56.88
```

The 3%, 7% and 16% accepted-lead rates are assumptions, not observed funnel performance. Public guidance places many small and medium commercial fire-risk assessments around £200–£700, but it is a comparison-site estimate rather than transaction data. At the conservative conversion case, media alone can consume much of a simple job's price. [Indicative fire-risk pricing](https://www.fire-risk-assessment-quotes.co.uk/how-much-does-a-fire-risk-assessment-cost/)

Organic acquisition is not free. Generated pages increase competition while answer layers compress informational visits. Agents can route a buyer directly to a provider. The model remains useful as one channel only if original evidence or tools contribute accepted work and the operator monetises beyond the click.

## Why defer pure vertical SaaS?

A compliance SaaS product could charge assessors or property teams for forms, reports, reminders and records. The market already offers horizontal software at low per-seat prices and fire-specific AI tools around a public £125-plus-VAT starting analogue. [Assura Safety](https://assurasafety.com/) [PlanRadar pricing](https://www.planradar.com/gb/pricing/) [SafetyCulture pricing](https://safetyculture.com/pricing/)

The [economic scenarios](../evidence/economics-scenarios.csv) apply the £125 analogue to assumed user counts:

| Case         | Paid users | Monthly price | Annual recurring revenue |
| ------------ | ---------: | ------------: | -----------------------: |
| Conservative |         20 |          £125 |                  £30,000 |
| Base         |         75 |          £125 |                 £112,500 |
| Upside       |        250 |          £125 |                 £375,000 |

This is gross revenue, not contribution or profit. Price is a competitor analogue, not willingness to pay for this product. The model omits sales cost, churn, support, security, integrations, insurance, model cost and expert content maintenance.

Pure SaaS is deferred because distribution and workflow ownership are unknown. Operating the workflow manually first reveals which fields, exceptions and approvals matter and whether a customer will pay.

## What does the managed service sell?

The service has a recurring platform-and-operations fee per managed site, while competent third-party assessments and remediation are scoped separately. A fee can include:

- premises, dutyholder and asset register;
- evidence ingestion and conflict resolution;
- obligation and review calendar with visible basis;
- provider verification and coordination;
- one action queue across launched lanes;
- reminder and evidence-request service;
- controlled closure and export;
- periodic portfolio exception review.

Illustrative revenue cases are:

| Case         | Managed sites | Fee per site / month | Annual platform revenue |
| ------------ | ------------: | -------------------: | ----------------------: |
| Conservative |            50 |                  £49 |                 £29,400 |
| Base         |           150 |                  £79 |                £142,200 |
| Upside       |           500 |                  £99 |                £594,000 |

These are hypotheses, not forecasts. Third-party service revenue and referral fees are excluded, as are customer acquisition, operator labour, implementation, integrations, support and churn. The pricing test must show that customers value the layer separately from assessments.

## What would site-level contribution look like?

The operative formula is:

```text
site contribution
= recurring site fee
+ assessment coordination contribution
+ permitted remediation coordination contribution
- human exception time
- software and model cost
- provider acquisition and quality cost
- customer success and allocated overhead
```

The first 50 sites should log operator minutes by activity. If human exception work consumes the recurring fee, either narrow the supported premises, increase price, improve the rules and input quality, or stop. Model cost is likely to be smaller than human correction and support, so optimising token price before measuring exceptions would be false precision.

## How can provider partnerships make money?

Possible commercial arrangements include:

- a fixed coordination fee paid by the customer;
- a disclosed provider referral or booking fee;
- a contracted wholesale price with a separately priced managed service;
- revenue share on accepted, completed and paid work;
- a provider subscription for qualified briefs and evidence delivery;
- no provider payment, where independence or conflict requires customer-only pricing.

Every arrangement needs a definition of the billable event. Enquiry, accepted brief, booked visit, completed assessment, paid invoice and accepted report are different. Credits and disputes need evidence. Remediation referrals need special conflict controls so the product does not create unnecessary work.

Provider redundancy matters economically. A single provider can dictate price, reject difficult sites or leave the region, while the operator still owns the customer promise. The live gate requires two qualified providers per lane and region.

## How much can AI improve provider capacity?

The illustrative baseline holds field time at four hours and report time at four hours.

| Report-time reduction | Total job time | Theoretical capacity uplift |
| --------------------: | -------------: | --------------------------: |
|           20% assumed |     7.20 hours |                       11.1% |
|           40% assumed |     6.40 hours |                       25.0% |
|      62% vendor claim |     5.52 hours |                       44.9% |

The 62% figure is FireCheckr's stated report-writing reduction, not independent evidence and not a total-job saving. [FireCheckr](https://firecheckr.co.uk/)

Capacity uplift becomes commercial only when:

- report writing is the bottleneck;
- competent review does not put the time back;
- demand and scheduling fill the saved capacity;
- field time, travel and cancellations permit more work;
- price does not fall by the full productivity gain;
- quality and claim exposure do not worsen.

The pilot must record active site, travel, draft, review, correction and customer-query time before and after the workflow. Median reviewer time must improve by at least 20% without any safety threshold regression.

## Who should pay?

The best opening buyer is a property manager or facilities lead with a multi-site evidence problem and authority to coordinate suppliers. A one-site low-risk office may have too little complexity and budget. A large institution may already have enterprise software and national facilities contracts. The initial segment is likely to sit between them, but interviews must prove it.

Pricing can combine:

- a portfolio onboarding and evidence-cleanup fee;
- per-site monthly management;
- separately quoted provider work;
- paid handling for major change, transaction or backlog projects;
- an enterprise integration or reporting fee only after scale.

Avoid per-document AI pricing. It rewards volume rather than correctness and becomes hard to defend as extraction is bundled elsewhere.

## When could acquisition be superior?

Owning an accredited or competent operator can capture:

- the assessment contribution;
- direct customer relationships;
- practitioner knowledge and review authority;
- authorised historical reports and outcome data;
- report-time and scheduling productivity;
- cross-sell into managed portfolios.

It can also import:

- inadequate historic reports and open actions;
- insurance claims and uninsurable practices;
- credentials concentrated in the owner;
- customer relationships that do not transfer;
- underpriced work and unrecorded review time;
- staff resistance or departure;
- software and data rights that do not permit AI use.

A diligence pack needs three years of accounts, job-level contribution, customer and provider concentration, claims, insurance, staff credentials, report samples, review records, complaints, open actions, software contracts and data permissions. Normalised earnings must survive owner replacement. Any acquisition thesis that adds unmeasured AI savings to the valuation should be rejected.

## What capital sequence is justified?

1. **Desk research and manual design:** already complete within public evidence limits.
2. **Interview and professional-review budget:** validate buyer, provider and rule assumptions.
3. **Paid 50-site design partnerships:** operate a manual evidence and coordination service.
4. **Narrow product build:** automate only repeated, measured work.
5. **Shadow AI evaluation:** use authorised reports and zero-tolerance critical thresholds.
6. **Regional and lane expansion:** only after provider redundancy and retained site contribution.
7. **Acquisition search:** only when partner economics make the value of owned delivery measurable.

No large catalogue, national paid campaign or acquisition deposit belongs before step three.

## The economic decision

The managed service is the only model that can test customer pain, provider economics, recurring evidence value and AI leverage in one reversible operation. It should reach two paid design partners and 50 sites before a pure software thesis is accepted. If recurring fees cannot carry human exceptions or providers cannot retain contribution after acquisition and coordination, stop rather than disguise service labour as SaaS margin.
