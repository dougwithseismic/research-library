# The UK commercial-premises compliance economy

**Research date:** 3 September 2026<br>
**Decision geography:** United Kingdom, with jurisdiction-specific boundaries retained<br>
**Language:** English<br>
**Currency:** GBP<br>
**Status:** Published research series<br>
**Evidence pack:** [`../evidence`](../evidence/)

Commercial-premises compliance is the continuing work of identifying which duties apply to a building, obtaining competent inspections or assessments where needed, preserving the evidence, completing remedial actions and keeping the record current as the premises changes.

This report examines the UK economy around that work. It asks where a customer is genuinely required to achieve an outcome, when that obligation creates an external purchase, how providers and software divide the work, what AI can safely automate and which entry model a founder should test.

## What is commercial-premises compliance?

Commercial-premises compliance is not one certificate or annual checklist. It is a collection of lane-specific systems covering fire risk, asbestos, gas, electrical equipment, water hygiene, lifting equipment, pressure systems, energy performance and other building obligations.

Each lane has its own combination of:

- dutyholder and responsible-person rules;
- premises, asset and jurisdiction scope;
- required outcomes and review triggers;
- competence, accreditation or registration boundaries;
- inspections, samples, examinations or maintenance;
- findings, actions and acceptable completion evidence.

The distinction between a required outcome and a required purchase is fundamental. A simple, low-risk English business may sometimes complete its own fire-risk assessment; covered gas work requires a suitably qualified Gas Safe registered engineer. Routine portable-appliance testing is not a universal annual legal purchase, while certain lifting and pressure equipment requires competent examination. The product cannot safely collapse those differences into a generic compliance calendar.

## What is the commercial-premises compliance economy?

The economy begins with a building, its use and the people responsible for it. It ends only when the right work has been completed, accepted by an accountable person and retained as usable evidence.

| Participant                                      | What they contribute                                                      | How they may earn or benefit                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Owner, employer, occupier or responsible person  | legal responsibility, premises knowledge and approval                     | safer operation, defensible evidence and reduced interruption or enforcement risk |
| Property or facilities manager                   | portfolio records, schedules, budgets and contractor coordination         | control across sites, fewer gaps and faster follow-through                        |
| Assessor, engineer or competent provider         | site observation, testing, professional judgement and reports             | assessment, examination, maintenance or advisory fees                             |
| Remediation contractor                           | physical repair, removal, installation or maintenance                     | project and recurring service revenue                                             |
| Insurer, lender, landlord or transaction adviser | evidence requirements, risk scrutiny or contractual conditions            | improved risk selection and transaction confidence                                |
| Software or managed-compliance operator          | records, workflow, provider routing, exception handling and audit history | subscriptions, managed-service fees, transaction revenue or partner margin        |

This is why the economic product is not a folder of certificates. It is a **controlled evidence-and-action loop**: establish context, find the applicable lane, obtain valid evidence, expose exceptions, route work to competent people and prevent unsupported closure.

## What is the background?

England and Wales had 2.14 million non-domestic rateable properties at 31 March 2026. Those are rating units rather than unique buildings, businesses or buyers, so they indicate the scale of the operating surface but cannot be multiplied by a subscription price to produce a market size. [Official property-stock commentary](https://www.gov.uk/government/statistics/non-domestic-rating-stock-of-properties-march-2026/non-domestic-rating-stock-of-properties-statistical-commentary)

England recorded 50,195 fire-safety audits in the year to March 2026, of which 20,286 required further action. The derived 40.4% share is commercially relevant but not representative of every premises because inspections are risk targeted. [Official fire-prevention statistics](https://www.gov.uk/government/statistics/fire-prevention-and-protection-england-year-ending-march-2026/fire-prevention-and-protection-statistics-england-april-2025-to-march-2026)

Historical search evidence also shows active purchase intent: `fire risk assessment` returned 8,100 average monthly UK searches and `asbestos survey` returned 6,600. Search volume is not a buyer count, required purchase rate or revenue forecast. It shows that dutyholders and intermediaries are already trying to resolve these jobs.

The commercial gap appears between the official rule and the completed work. Duties are fragmented across jurisdictions and assets; customers often hold inconsistent records; competent providers remain lane specific; remediation can disappear between a report and an inbox. The opportunity is coordination and evidence integrity, not manufacturing more generic compliance information.

## What is being built now?

The [software and provider comparison](./05-providers-software-and-incumbent-response.md) shows five overlapping directions:

1. **Property workflow platforms add AI.** PlanRadar and similar systems are adding document search, summaries, ticket creation, form generation and agents to existing property workflows.
2. **Maintenance systems turn records into operating queues.** SafetyCulture and MaintainX combine templates, procedures, assets, work orders and AI assistance inside broader operational products.
3. **Vertical assessor tools compress report production.** FireCheckr and Assura Safety use voice, photographs, structured capture and cited drafting to reduce assessor administration while leaving professional responsibility with people.
4. **Service providers retain the physical and professional boundary.** Assessors, surveyors, engineers and remediation firms still create the site observations, samples, examinations and completion work that software cannot truthfully invent.
5. **Customers assemble their own compliance stack.** Property managers combine spreadsheets, shared drives, calendar reminders, contractor portals and specialist software because no generic platform resolves every lane and responsibility boundary.

AI increases the supply of advice, templates, summaries and location pages. It can also let search or workplace agents shortlist providers and coordinate tasks. Those changes weaken content-first and thin-broker models. They strengthen operators that own permissioned premises history, competent supply, exception resolution and accepted outcomes.

## Where would I focus?

I would build a **partner-led managed-compliance operation for small and mid-sized commercial-property portfolios**, beginning with fire-risk and asbestos workflows.

The first product would maintain the premises-and-responsibility register, ingest original reports and certificates, expose missing or conflicting evidence, coordinate verified external providers and keep every material action open until a named accountable person accepts valid completion evidence.

```text
EVIDENCE ENGINE
premises context → original records → obligation map → exceptions

DELIVERY ENGINE
competent provider → finding → action → accepted completion evidence
```

Fire and asbestos provide visible demand, meaningful evidence problems and credible partner routes. They must remain separate lanes: the system should retain jurisdiction, dutyholder, competence, source and closure rules rather than market a universal certificate.

I would not start with generic content, an open certificate marketplace or pure compliance SaaS. Content is abundant, an unmanaged marketplace inherits competence and liability problems, and software has little authority before the operating workflow is understood. Acquisition of an accredited operator may eventually be attractive, but only after confidential diligence establishes people, credentials, insurance, claims, margins and owner dependence.

## What does AI change?

AI should sit inside the operation, not above its accountable people.

| AI can assist with                                         | AI must not be allowed to do                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| extract fields with document and page provenance           | invent a site observation or hidden condition                 |
| reconcile dates, addresses, assets and conflicting records | silently choose a jurisdiction or dutyholder                  |
| draft reports from accepted observations                   | approve provider competence, registration or insurance        |
| identify missing evidence and propose follow-up questions  | declare an assessment sufficient or certify compliance        |
| prioritise an exception queue under explicit rules         | close a material risk without accepted completion evidence    |
| prepare reminders and communications                       | provide professional sign-off or inherit legal responsibility |

The durable AI architecture is therefore:

```text
immutable sources → field provenance → typed premises graph → deterministic rules
→ AI drafts and recommendations → named human approvals → audit history
```

The model is released by workflow and consequence, not by a generic accuracy score. Critical jurisdiction routing, credential resolution, evidence provenance and closure tests use zero-tolerance thresholds in the [AI control and evaluation plan](./07-ai-control-architecture-and-evaluation.md).

## The thesis in one line

```text
premises truth → applicable duty → competent work → valid evidence → controlled closure → current record
```

The weak version sells information or generated paperwork. The stronger version owns the difficult middle: turning fragmented property evidence into correctly routed work and defensible follow-through while keeping legal and professional authority with the right people.

## The series

| Document                                                                                                          | Purpose                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [01 — How I would enter commercial-premises compliance](./01-how-i-would-enter-commercial-premises-compliance.md) | The complete thesis, product boundary and recommendation                                       |
| [02 — Research method and evidence boundaries](./02-method-and-evidence-boundaries.md)                            | Definitions, source hierarchy, calculations, exclusions and unresolved facts                   |
| [03 — Market, duties and the procurement boundary](./03-market-duties-and-the-procurement-boundary.md)            | Property stock, value chain and the difference between an obligation and a purchase            |
| [04 — Compliance-lane dossiers](./04-compliance-lane-dossiers.md)                                                 | Fire, asbestos, legionella, lifting, pressure, gas, EPC and electrical entry decisions         |
| [05 — Providers, software and incumbent response](./05-providers-software-and-incumbent-response.md)              | Horizontal platforms, vertical tools, service incumbents and the build-partner-buy boundary    |
| [06 — AI disruption, autonomy and the 2028 moat](./06-ai-disruption-autonomy-and-the-2028-moat.md)                | Generated supply, discovery compression, agent bypass, operating leverage and durable scarcity |
| [07 — AI control architecture and evaluation](./07-ai-control-architecture-and-evaluation.md)                     | Provenance, deterministic rules, autonomy levels, release thresholds and incident controls     |
| [08 — Business models and unit economics](./08-business-models-and-unit-economics.md)                             | Managed-service, provider-productivity, SaaS, paid-lead and acquisition scenarios              |
| [09 — Adversarial scenarios and kill conditions](./09-adversarial-scenarios-and-kill-conditions.md)               | Incumbent response, customer capture, data failure, liability and explicit stop conditions     |
| [10 — Twelve-month validation programme](./10-twelve-month-validation-programme.md)                               | Interviews, professional review, design partners, provider coverage and the 50-site test       |

## How should the evidence be read?

The report keeps four evidence classes separate:

- **Observed:** directly stated by an opened source or returned by a retained research dataset on the research date.
- **Derived:** arithmetic from observed or explicitly assumed inputs, with the formula or inputs retained.
- **Inference:** a commercial judgement supported by evidence but not itself proven.
- **Unknown:** a fact that requires professional review, direct confirmation or live operating evidence before capital is committed.

The public pack contains [44 sources](../evidence/sources.csv), [55 market and operating claims](../evidence/evidence-ledger.csv), [31 AI-impact claims](../evidence/ai-disruption-ledger.csv), an [obligation–procurement matrix](../evidence/obligation-procurement-matrix.csv), [software comparison](../evidence/software-incumbent-matrix.csv), [workflow-control matrix](../evidence/ai-workflow-control-matrix.csv), [AI release-evaluation plan](../evidence/ai-evaluation-plan.csv), [economic scenarios](../evidence/economics-scenarios.csv), [entry-strategy scorecard](../evidence/entry-strategy-scorecard.csv), [human-validation plan](../evidence/human-validation-plan.csv) and [research manifest](../evidence/manifest.json).

This is commercial research, not legal or professional safety advice. Operational use still requires site and professional review, direct evidence from buyers and providers, and validation against real reports and job economics.
