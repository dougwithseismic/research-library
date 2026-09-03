# Autonomous AI-disruption research contract

Use this contract for every workstream in `research-program/program.json`.

## Working directory

Each unpublished paper lives under:

```text
publications/<slug>/
  research-state.json
  series/
    README.md
  evidence/
    manifest.json
    sources.csv
    evidence-ledger.csv
    ai-disruption-ledger.csv
    ai-disruption-scorecard.csv
```

Do not add `publication.json` until publication is explicitly authorised. Large captures, raw interviews, private exports, and unnecessary personal data belong in `private-data/<slug>/`, not in the publication or generated site.

## Research state

`research-state.json` records:

```text
workstreamId
status
activeGate
completedGates
humanSeams
updatedAt
```

Allowed working statuses are `framing`, `researching`, `built-to-seam`, `decision-grade`, and `rejected`. A gate is complete only when its exit criterion in `program.json` is satisfied.

## Base evidence ledger

`evidence-ledger.csv` uses:

```text
claimId,subjectType,subjectName,field,value,unit,evidenceClass,sourceType,sourceName,sourceUrl,observedAt,geography,method,limitations
```

`evidenceClass` is `observed`, `derived`, `inference`, `unknown`, or `contradicted`. Derived rows identify input claim IDs or a formula in `method`. Inference rows identify their supporting claims and uncertainty. Unknowns remain rows rather than disappearing from the analysis.

## AI-disruption ledger

`ai-disruption-ledger.csv` uses:

```text
impactId,workstreamId,actor,valueChainStep,aiDimension,mechanism,timeHorizon,impactDirection,claim,evidenceClass,supportingClaimIds,countervailingForce,leadingIndicator,commercialImplication,confidence,limitations
```

Allowed mechanisms:

- `replacement`: AI supplies the customer outcome without the incumbent step;
- `compression`: AI reduces time, labour, or price but does not remove the step;
- `augmentation`: AI improves a human or physical workflow;
- `interface-shift`: discovery or transaction moves to an agent or answer layer;
- `new-demand`: AI creates a new need, workflow, risk, or purchase;
- `no-material-impact`: evidence supports little consequential change.

Allowed `impactDirection` values are `tailwind`, `headwind`, `mixed`, and `neutral`. Confidence is `low`, `medium`, or `high`; it describes the evidence behind the impact, not rhetorical conviction.

An AI claim is incomplete if it names only a capability. It must explain who adopts it, whose behaviour changes, how value moves, what prevents the change, and what evidence would reveal it.

## AI-disruption scorecard

`ai-disruption-scorecard.csv` uses:

```text
dimension,score,weight,weightedScore,confidence,supportingImpactIds,unknowns,interpretation
```

Score each dimension from 0 to 5 using a paper-specific normalization rule stated in the manifest. A high score is favourable only for positively framed dimensions such as operating leverage or proprietary-data potential. For risk dimensions, a high score means greater exposure. Do not collapse opposing risks and advantages into one unexplained total.

The final comparison must show raw evidence, direction, confidence, and unknowns beside any normalized score.

## Required scenario set

Each paper tests at least:

1. **Limited adoption:** tools improve bounded workflows while the customer interface remains familiar.
2. **Agent-mediated market:** discovery, comparison, or scheduling shifts materially to answer and agent interfaces.
3. **Incumbent response:** established operators adopt similar tools and use their distribution, data, credentials, or relationships.

Add sector-specific scenarios where regulation, liability, physical delivery, or network liquidity materially changes the outcome.

For each scenario show:

- actor and changed behaviour;
- affected revenue, cost, conversion, retention, or capital input;
- whether the input is observed, derived, assumed, or unknown;
- leading indicators;
- action and kill condition.

## Adversarial gate

Before synthesis, answer:

- What if the model capability is commoditized across every competitor?
- What if the incumbent owns the customer interface?
- What if customers keep the savings rather than the operator?
- What if trust, regulation, or workflow integration prevents adoption?
- What if the proposed proprietary data never accumulates?
- What if the physical or relationship moat also makes the business expensive to operate?
- Which observation would cause the thesis to be rejected now?

Research for the strongest credible counter-case, not merely the risks already convenient to the recommendation.

## Completion test

A decision-grade paper:

- answers a named commercial decision;
- distinguishes the current market from AI scenarios;
- traces every consequential claim to retained evidence;
- reconciles calculations to retained inputs;
- identifies who captures value rather than assuming automation creates profit;
- makes external evidence seams and unknowns visible in the verdict;
- states a reversible next test and an explicit stopping rule;
- contains no credentials, private exports, unnecessary personal data, invented fieldwork, or unapproved production claims.
