---
name: autonomous-ai-disruption-research
description: Advance Research Library's ordered commercial-paper programme with a consistent AI-disruption analysis, retained evidence, decision gates, and explicit human seams. Use when autonomously researching the queued papers or evaluating how AI changes a market, operating model, marketplace, acquisition, or information business; do not use for a single quick fact check.
---

# Autonomous AI-Disruption Research

Advance the next eligible workstream until it is decision-grade or genuinely blocked. Treat AI as a change to a specific actor, workflow, interface, cost, or scarce asset—not as a generic trend.

## Select and initialise the work

From the Research Library root:

```sh
pnpm research:program check
pnpm research:program next
```

Read `research-program/program.json`, `research-program/EXECUTION_PLAN.md`, the selected workstream or retrofit's declared inputs, and [references/research-contract.md](references/research-contract.md). Existing-series retrofits come first and extend the published source series in place. If a new unpublished working directory does not exist, inspect the dry run and initialise it:

```sh
pnpm research:program init <workstream-id> --dry-run
pnpm research:program init <workstream-id>
```

Initialisation deliberately omits `publication.json`, so a working paper does not enter the generated public site accidentally.

Respect queue dependencies. A blocked later paper does not prevent progress on an earlier independent paper. Do not reorder the programme solely because one topic is easier to research.

## Work through the gates

Use the gates in `program.json` in order:

1. Frame the decision, buyer, geography, counterfactual, exclusions, time horizons, and stopping rule.
2. Establish the present value chain before making claims about AI.
3. Map disruption mechanisms and countervailing forces across the workstream's declared AI dimensions, including generated content as a supply and trust shock where material.
4. Model conservative, base, and upside economics, including who captures savings and what agent bypass removes.
5. Seek disconfirming evidence, credible incumbent responses, failure modes, and kill conditions.
6. Make a build, test, defer, acquire, or reject decision with the next reversible action.
7. Validate artifacts, calculations, important sources, privacy, and secrets.

Continue through all safe gates in one run where feasible. Do not stop merely because one source is blocked or one evidence family remains unknown. Record the gap, pursue bounded alternatives, and stop only at a real authorisation or evidence seam.

## Use the existing research modules

- Use `web-evidence-research` for current companies, products, prices, platforms, regulation, and technical claims.
- Use `market-opportunity-research` for demand, supply, economics, competition, and launch comparison.
- Use `google-ads-search-volume` only for read-only historical keyword planning. Never create or modify campaigns.
- Use `companies-house-research` for registry evidence. A company record does not prove live trading, quality, commercial fit, or buying intent.

Do not query Supabase. Do not send outreach, submit forms, buy data, mutate accounts, contact companies, run paid tests, or publish. Research permission does not imply those actions.

## Prove an AI claim

Every material disruption claim needs:

- affected actor and value-chain step;
- mechanism: `replacement`, `compression`, `augmentation`, `supply-expansion`, `interface-shift`, `new-demand`, or `no-material-impact`;
- time horizon: current, 2028, or 2030;
- evidence class and supporting claim IDs;
- countervailing force or incumbent response;
- leading indicator that could be observed;
- implication for revenue, cost, defensibility, or rejection.

Do not treat model capability as adoption, adoption as willingness to pay, automation as captured margin, or generated prose as proprietary intelligence. Treat generated text, imagery, audio, and video as economic supply whose cost, provenance, trust, and distribution effects must be tested. Distinguish technical feasibility, permitted use, operating reliability, economic adoption, and customer trust.

## Build to human seams

When interviews, confidential information, professional advice, credentials, live customer behaviour, or external commercial action are required:

1. Complete every safe preparatory artifact.
2. Mark the relevant claim or gate as unknown or built-to-seam.
3. State the exact evidence request, respondent role, decision it changes, and minimum sufficient sample.
4. Continue independent workstreams.

Never fabricate a quotation, interview, transaction, test, conversion, or private dataset. Public interviews remain secondary evidence unless conducted for this project.

## Complete and hand off

A paper is complete only when its decision survives the adversarial gate, required artifacts validate, consequential sources have been reopened or status-checked, and missing human evidence is reflected in the verdict.

Keep the paper internal until publication is separately requested. Mark the plan item and programme status complete only for a genuinely decision-grade paper. Do not commit, push, deploy, or publish unless the user separately authorises that action.
