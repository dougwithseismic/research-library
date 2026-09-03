# AI control architecture and evaluation

## What should the system look like?

The system should be built as an evidence and approval architecture with models attached, not as a chatbot with compliance documents attached.

```text
immutable source store
  → typed extraction with provenance
    → premises, asset and responsibility graph
      → deterministic obligation and cadence rules
        → findings, actions and provider workflow
          → model-assisted drafts and recommendations
            → named approvals and immutable audit events
```

Models can be replaced. The source, rule, decision and approval record must survive that replacement.

## What are the core data objects?

### Site

Address, building identity, jurisdiction, use, occupancy, vulnerability context, access, customer and dates. Address resolution must preserve uncertainty and historical names rather than silently merge two premises.

### Party and role

Legal entity or person, contact, relationship to the site, role, effective period and the evidence that supports the role. “Responsible person,” “landlord,” “tenant,” “employer,” “managing agent,” “assessor” and “contractor” are roles, not interchangeable contact labels.

### Asset or area

Stable identity, site, location, type, manufacturer or serial fields where available, current state and source. A lift, pressure vessel, boiler, water system, compartment or asbestos-containing material needs its own identity model.

### Obligation instance

Lane, jurisdiction, applicability state, rule version, required inputs, outcome, dutyholder role, trigger or cadence basis, source and uncertainty. Applicability can be `applies`, `does not apply`, `unknown` or `professional review required`.

### Source record and observation

The original file, message, register response, sensor reading or authoritative guidance remains immutable. A derived field or observation links to source location, extractor version, confidence and reviewer. Generated text is never an original observation.

### Provider and credential

Legal entity, individual, lane, scheme or register, scope, geography, effective dates, insurance evidence, conflict status, verification event and authoritative source. Company identity alone is not professional competence.

### Finding, action and closure

A finding records accepted evidence, severity, uncertainty, assessor and report. An action records owner, requirement or recommendation basis, timescale, state and expected evidence. Closure records the evidence packet, accepting person, authority, time and reopen path.

## Which rules must remain deterministic?

Models may help retrieve and explain rules, but the production system should not let free-form generation control:

- jurisdiction selection;
- credential expiry and scope checks;
- source and evidence requirements;
- workflow permissions;
- due-date calculation once the approved basis is known;
- critical severity escalation;
- closure prerequisites;
- retention and access policy;
- model tool permissions;
- release thresholds and kill switches.

The rules layer itself can still be wrong. Every rule needs owner, source, version, geographical scope, effective date, premises or asset conditions, test cases and next review. A professional reviewer approves lane-specific releases.

## What can each AI workflow do?

| Workflow                | Allowed role                               | Accountable human                        | Hard stop                                    |
| ----------------------- | ------------------------------------------ | ---------------------------------------- | -------------------------------------------- |
| Obligation discovery    | Retrieve sources and ask for missing facts | Technical authority / compliance manager | Wrong jurisdiction on a critical case        |
| Document ingestion      | Propose fields with source spans           | Compliance manager                       | Any unsupported critical field               |
| Credential verification | Shortlist exact register matches           | Provider-operations lead                 | Any critical false approval                  |
| Template generation     | Draft from approved rules                  | Technical authority                      | Missing mandatory control                    |
| Site-note structuring   | Map accepted notes and photos to fields    | Competent assessor                       | Any fabricated critical observation          |
| Image triage            | Flag possible defects for inspection       | Competent assessor                       | Any missed defined critical defect           |
| Report drafting         | Write only from accepted findings          | Competent assessor                       | Critical unsupported sentence or action      |
| Scheduling              | Create reminders from approved rules       | Compliance manager                       | Automation-caused critical overdue work      |
| Provider routing        | Rank qualified options with reasons        | Provider-operations lead                 | Credential breach or excessive reversal      |
| Anomaly detection       | Flag unusual readings or repeated failures | Responsible person                       | Critical recall below 95%                    |
| Portfolio priority      | Recommend a queue                          | Responsible person                       | Expert agreement below 95% on critical cases |
| Record closure          | Assemble evidence only                     | Responsible person                       | Any confirmed false closure                  |
| Professional sign-off   | No AI authority                            | Competent person                         | Any unauthorised sign-off                    |

The full specification is in the [workflow-control matrix](../evidence/ai-workflow-control-matrix.csv).

## What does source-bound generation mean?

Every generated proposition must be one of four types:

1. **Source restatement:** linked to an exact passage in an authoritative rule or customer record.
2. **Deterministic calculation:** linked to inputs and formula.
3. **Recommendation:** linked to accepted facts, policy and uncertainty, with a named approver.
4. **Unknown:** explicitly unresolved and routed for evidence or professional review.

A general fire-safety source can support the rule that an assessment is required. It cannot support the site claim that a particular door was obstructed. A photograph can support what is visibly present under stated capture conditions. It cannot prove a concealed cavity is safe. This dual-provenance model prevents a legitimate citation from laundering an invented premises fact.

## How should documents be ingested?

1. Virus-scan and classify the file before model access.
2. Retain original bytes, checksum, uploader, time, permissions and claimed document type.
3. Render or parse in an isolated environment that treats embedded instructions as untrusted content.
4. Extract proposed fields with page, bounding box or text-span anchors.
5. Validate dates, address, site, asset, provider and report status deterministically.
6. Compare with current records and surface conflicts rather than overwrite them.
7. Require review for critical fields and any low-confidence or conflicting value.
8. Store the accepted derived record separately from the original.

No parsed document should be able to invoke tools, change permissions, close a task or choose a model route.

## How should models be isolated?

Use a model gateway with task-specific schemas, approved providers, data-region and retention configuration, rate and cost controls, safety policies and version pins. Each task receives the minimum necessary record set. Building-security details, tenant information and personal data should be redacted or excluded where not needed.

The model never holds ambient authority. A separate policy service decides whether a user or service account may read a site, create a task or send a message. Tool calls use narrow, typed actions and idempotency keys. High-consequence connectors have a manual kill switch.

NCSC secure-AI guidance calls for threat modelling, supply-chain security, documentation and secure operation. The UK AI Cyber Security Code provides a broader baseline for developers and deployers. These inform the architecture but do not establish sector compliance or model correctness. [NCSC secure-AI guidance](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development) [AI Cyber Security Code](https://www.gov.uk/government/publications/ai-cyber-security-code-of-practice)

## What evaluation corpus is required?

Synthetic and public examples can test schema and obvious edge cases. They cannot release a safety-relevant production workflow. The first authorised corpus should include at least 100 redacted historical reports and 500 critical fields across launched lanes, premises classes, providers and document quality.

Gold labels need two independent qualities:

- the fact or decision is correct;
- the source evidence and responsibility for it are correctly identified.

Disagreements become adjudicated cases rather than deleted noise. The set should deliberately include name collisions, expired credentials, mixed addresses, superseded reports, missing pages, poor scans, Welsh and Scottish cases, changed premises use, conflicting recommendations, draft documents and false completion evidence.

## What are the release thresholds?

The [AI evaluation plan](../evidence/ai-evaluation-plan.csv) defines 12 operational metrics.

### Jurisdiction

Evaluate 200 obligation questions balanced across England, Wales, Scotland and Northern Ireland. Release requires zero critical wrong-jurisdiction answers and less than 1% non-critical error. Any critical miss blocks the assistant.

### Extraction

Evaluate at least 500 critical fields against source-span gold labels. Release requires zero unsupported critical fields. Affected document classes fall back to manual entry if they fail.

### Template coverage

Every launched lane and premises class must represent 100% of approved mandatory controls. The technical authority rejects incomplete template versions.

### Site observations

Use at least 300 note-and-photo packets with blinded assessor labels. No safety-critical observation may be added without source; other unsupported observations must remain below 0.5%. Any fabricated critical observation disables free-text generation from site evidence.

### Actions

Use 150 confirmed defects with an expert remedial-action panel. There is zero tolerance for unsafe, unlawful or materially under-prioritised critical actions. Failed generation falls back to an approved deterministic action library and competent authoring.

### Credentials

Use at least 200 provider entities including similar names, expiries and scope restrictions. There is zero tolerance for an incorrectly approved provider. Register refresh is daily where an authoritative interface permits it, with a monthly human audit.

### Anomalies

For a defined critical anomaly set, recall must be at least 95% and every miss reviewed. The model remains advisory until the site-specific baseline and alert burden are understood.

### Time and quality

Across at least 100 comparable reports, median active review-and-writing time must improve at least 20% without regression on safety metrics. Edit distance is diagnostic, not a safety threshold: few edits can mean a good draft or automation bias.

### Closure and leakage

There is zero tolerance for confirmed false closure, unauthorised disclosure of tenant, employee, asset or security-sensitive data, or unauthorised professional sign-off.

### Drift

The frozen benchmark reruns after any model, source, rule, prompt, parser or connector change. No safety-threshold regression is accepted without a signed exception and a defined expiry. The prior version remains available.

## How should release progress?

### Stage 0: offline

No customer data leaves the controlled test environment. Build schemas, redaction, gold labels and failure taxonomy. Compare deterministic baselines before using generation.

### Stage 1: shadow

The system processes authorised live work but its output cannot affect the customer record. Compare proposals with normal human work. Measure unsupported fields, corrections, review time and missed exceptions.

### Stage 2: assisted draft

A named user can accept individual fields or a draft. The interface displays source beside output and records material edits. The model cannot send or schedule.

### Stage 3: bounded workflow

Approved tasks may create reminders, request evidence or open actions under deterministic rules. Start with one lane, one customer cohort and a daily review. Closure and sign-off remain unavailable.

### Stage 4: monitored scale

Expand only after stable quality, review-time improvement, incident response and provider capacity. Maintain canary traffic, regular manual samples and per-customer kill switches.

There is no stage in which the model becomes the responsible person or competent signer.

## How should human review work?

“Human review” must name an event and authority.

- **Compliance manager:** accepts extracted site, asset and document fields.
- **Technical authority:** approves rules, templates and escalation logic.
- **Competent assessor or engineer:** accepts observations, judgement, actions and final professional output.
- **Provider-operations lead:** verifies provider identity, credential scope and routing.
- **Responsible person or delegated risk owner:** approves priority and accepts completion evidence.
- **Security owner:** approves model and connector configuration and leads leakage response.

Review interfaces should show differences, provenance, uncertainty and missing evidence before fluent narrative. Random audit and blinded double review should test whether reviewers are simply accepting model output.

## What should never be automated?

The following capabilities should be absent, not merely hidden behind a prompt:

- generate or alter evidence and present it as a site observation;
- create a professional signature or accreditation claim;
- approve a provider from a fuzzy name match;
- infer that absence of a visible defect proves safety;
- convert an invoice, calendar event or email into completed remediation;
- suppress a critical unknown to improve a portfolio score;
- use customer records to train a model without explicit authority;
- let an uploaded document grant tool instructions;
- close, delete or materially change records without an attributable human event.

PlanRadar's public agent design provides one useful product precedent: AI-created work is labelled and attributable, and the documented agents create but do not change or delete records. That does not prove suitability for this use, but it shows that bounded creation is a realistic design choice. [PlanRadar agent documentation](https://helpcenter-prd.planradar.com/en/recognise-work-done-by-ai-agents/)

## How should incidents be handled?

Every customer must have a route to report a wrong field, recommendation, provider match, action or closure. The incident record should contain source, affected sites, model and rule versions, prompts and outputs where lawfully retained, tool events, reviewer actions and customer impact.

Severity-one events include fabricated safety-critical observations, wrong critical jurisdiction, false provider approval, false closure, unauthorised sign-off and sensitive-data leakage. Response is immediate workflow disablement, preservation of evidence, affected-record query, customer and contractual notification as required, human correction and benchmark expansion before release.

The goal is not to claim that the model never fails. It is to prevent a model failure from becoming untraceable operating reality.

## What does good performance mean?

The product should report:

- percentage of critical fields with accepted provenance;
- unresolved jurisdiction and responsibility questions;
- time from evidence request to valid record;
- provider-routing reversals and credential failures;
- assessment cycle and assessor review time;
- critical actions overdue;
- action recurrence after closure;
- false-closure and reopen rate;
- AI suggestions accepted, materially edited or rejected;
- incident and data-leakage count;
- customer retention and human service cost per site.

Tokens, documents processed and drafts produced are internal utilisation measures. They do not prove safety, customer value or margin.

## The architecture decision

Build the provenance graph, deterministic policy layer, permission service and audit trail before introducing autonomous actions. Start AI in offline and shadow evaluation. Release retrieval and extraction first, drafting second and bounded communication last. Keep record closure, certification and professional sign-off technically unavailable to the model.
