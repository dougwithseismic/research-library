# Method and evidence boundaries

## What decision does this paper support?

The decision unit is:

```text
compliance lane × jurisdiction × premises and asset class × dutyholder
× purchase trigger × provider model × AI authority
```

The research asks whether to generate demand, run a managed compliance workflow, sell vertical software, partner with competent providers, acquire an operator or remain out. It does not ask whether “compliance” is generally large or whether AI can generally write a report.

## What was researched?

The paper combines six evidence layers:

1. Current official guidance for fire safety in England, Wales, Scotland and Northern Ireland.
2. HSE guidance for asbestos, electrical equipment, workplace gas, legionella, lifting equipment and pressure systems.
3. England-and-Wales EPC and minimum-energy-efficiency guidance, including the June 2026 policy response.
4. Official non-domestic property stock and England fire-enforcement statistics.
5. Retained read-only Google Ads historical metrics and selected Companies House records from the existing rank-and-rent publication.
6. Current public product documentation and pricing from horizontal property-workflow, maintenance and vertical fire-assessor software.

The [source registry](../evidence/sources.csv) records 44 sources with publisher, observation date, supported claims and limits. The [evidence ledger](../evidence/evidence-ledger.csv) contains 55 claims. The [AI-disruption ledger](../evidence/ai-disruption-ledger.csv) contains 31 mechanism-based impacts.

## How are evidence classes separated?

Every substantive ledger row uses one of four classes.

- **Observed:** a source or retained dataset directly supports the statement.
- **Derived:** the value follows from visible claim inputs or a stated formula.
- **Inference:** the paper interprets multiple observed or derived claims and identifies uncertainty.
- **Unknown:** the information was not available and remains a condition for fieldwork or diligence.

An official obligation can be observed while its commercial implication remains an inference. A supplier's public price can be observed while achieved revenue, margin and willingness to pay remain unknown. A vendor's statement that its software reduces report-writing time by 62% is an observed claim about what the vendor says, not independent performance evidence.

## Why separate required outcomes from required purchases?

This is the central method. For each lane, the [obligation–procurement matrix](../evidence/obligation-procurement-matrix.csv) records:

- jurisdiction;
- dutyholder or trigger;
- required outcome;
- whether paid external provision is structurally necessary or conditional;
- competence, accreditation or independence boundary;
- cadence or event trigger;
- safe AI role;
- limitation.

A business may need to manage a risk without buying an annual certificate. HSE explicitly says the law does not require annual portable-appliance testing in every low-risk office. Ordinary landlord legionella guidance does not impose a universal test certificate or fixed annual or biennial assessment. Simple, low-risk fire assessments can sometimes be completed internally. [HSE electrical guidance](https://www.hse.gov.uk/pubns/indg236.htm) [HSE legionella landlord guidance](https://www.hse.gov.uk/legionnaires/legionella-landlords-responsibilities.htm) [Fire guidance for small businesses](https://www.gov.uk/government/collections/fire-safety-for-small-businesses-operating-from-commercial-premises)

The paper therefore rejects total-addressable-market calculations that multiply all premises by an invented annual certificate price.

## What does the property-stock figure mean?

The Valuation Office Agency data reports 2.14 million non-domestic rateable properties in England and Wales at 31 March 2026: 512,500 retail, 428,270 office, 566,240 industrial and 631,250 other. Sixty-three per cent had a rateable value at or below £12,000. [Official statistical commentary](https://www.gov.uk/government/statistics/non-domestic-rating-stock-of-properties-march-2026/non-domestic-rating-stock-of-properties-statistical-commentary)

These are hereditaments—rating units. They are not necessarily unique buildings, occupied businesses, dutyholders, contracts or paying buyers. Rateable value is not turnover or willingness to pay. Scotland and Northern Ireland are absent from this stock source. The figure establishes a broad installed environment only.

## How are enforcement data interpreted?

Official England data for the year ending March 2026 reports:

| Measure                         |  Count |
| ------------------------------- | -----: |
| Fire-safety audits              | 50,195 |
| Satisfactory                    | 29,909 |
| Unsatisfactory / further action | 20,286 |
| Formal notifications            |  3,355 |
| Enforcement notices             |  1,896 |
| Prohibition notices             |  1,224 |
| Prosecutions                    |     33 |

The derived unsatisfactory share is 20,286 ÷ 50,195 = 40.4%. Because fire and rescue services target risk, it is not a random sample and cannot estimate the national non-compliance rate. It is evidence of active inspection, enforcement and follow-up work. [Official statistics](https://www.gov.uk/government/statistics/fire-prevention-and-protection-england-year-ending-march-2026/fire-prevention-and-protection-statistics-england-april-2025-to-march-2026)

## How were search-demand observations reused?

This paper reuses the published historical metrics from the rank-and-rent research:

- `fire risk assessment`: 8,100 UK average monthly searches;
- `fire risk assessment near me`: 1,300;
- `asbestos survey`: 6,600;
- `asbestos survey near me`: 1,000;
- a deduplicated Manchester explicit fire-risk basket: 550;
- Manchester local-geo volume-weighted historical CPC: £9.10.

Close variants may overlap, so generic and `near me` rows are not added. Search volume is not unique people, jobs, buyer budgets or serviceable market. CPC is not provider margin, lead value or organic difficulty.

## How were company records used?

The paper reuses a purposive Manchester fire-provider sample from Companies House. The selected resolved entities show a filed employee range from one to 76; most did not disclose turnover in the retained fields.

Companies House is registry and filing evidence. It can support legal-entity identity, filing status, accounts fields and selected structural observations. It cannot establish current competence, service quality, capacity, insurance, customer satisfaction, margin, partnership interest or buying intent. No Companies House claim is used to infer those qualities.

## How were software incumbents compared?

The [software-incumbent matrix](../evidence/software-incumbent-matrix.csv) is purposive rather than exhaustive. It includes:

- PlanRadar for property and construction workflow;
- SafetyCulture for inspections and frontline operations;
- MaintainX for maintenance and asset history;
- FireCheckr and Assura Safety for vertical fire-assessor workflows;
- the generic content-publisher model;
- the proposed partner-led managed operator.

Public product pages establish visible features, pricing and positioning. Vendor claims do not prove reliability, adoption, savings or suitability for safety-critical decisions. Absence from the matrix is not evidence that a capability or competitor does not exist.

## How were AI effects analysed?

Each AI claim names:

```text
actor → workflow → mechanism → current effect → 2028 effect
→ 2030 effect → counterforce → indicator → commercial implication
```

The 11 dimensions are substitution risk, generated-content supply, discovery disruption, agent bypass, operating leverage, proprietary-data potential, physical-world moat, trust and liability, relationship moat, platform dependency and defensibility in 2028.

The [scorecard](../evidence/ai-disruption-scorecard.csv) deliberately does not produce a net AI score. A high generated-content score means greater exposure; a high physical-world score means greater advantage. Adding the two would hide the mechanism.

## How were economics modelled?

The [economics scenarios](../evidence/economics-scenarios.csv) use transparent stress cases rather than a forecast.

Paid-fire-lead cost divides the observed £9.10 historical CPC by assumed accepted-lead conversion of 3%, 7% and 16%. Managed-service revenue multiplies assumed sites by assumed monthly fee. Provider capacity holds four illustrative site hours constant and applies 20%, 40% and 62% report-time reductions to four illustrative report hours. The 62% input is a vendor claim; the rest are assumptions.

The scenarios exclude important costs and uncertainty, including sales, travel, call handling, credits, insurance, review, support, integrations, churn and remediation. They exist to reveal what must be measured.

## What evidence is still required?

The public evidence establishes duties, market structure and testable commercial mechanisms; it does not establish conditions at any premises, professional conclusions, buyer demand, job-level margin or model performance on real compliance reports.

The [human-validation plan](../evidence/human-validation-plan.csv) defines the next evidence set: eight property managers, eight responsible persons or facilities leads, six fire providers, four asbestos providers, one qualified reviewer per launched lane and jurisdiction, 100 authorised reports containing at least 500 critical fields, three portfolio design partners covering at least 50 sites, and two qualified providers per live lane and region.

Until those seams are completed, the recommendation is a bounded test rather than a conclusion about achieved demand, margin, safety or acquisition value.
