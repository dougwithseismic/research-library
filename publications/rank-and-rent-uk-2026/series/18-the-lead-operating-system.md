# The lead operating system

## From webpage to auditable event

A durable local-demand company needs an event ledger. Without it, every disagreement becomes “the leads were bad” versus “you did not follow up.”

The system does not need to begin as elaborate software. It does need stable identifiers, timestamps, definitions and raw-source lineage from the first pilot.

## The core objects

### Market cell

Stores service, geography, intent state, operating hours, required credentials, qualification rules and active status. It prevents a generic plumbing lead from being routed under an emergency-drain contract.

### Consumer request

Stores the minimum request facts, privacy notice version, collection source, consent or other lawful-basis record as applicable, contact preferences and identity indicators. It should not store unnecessary sensitive detail.

### Call or form event

Stores source, landing page, campaign where applicable, tracking number or form version, received time, duration, recording state, field completeness and spam signals. Raw call media should have a documented retention policy and controlled access.

### Qualification decision

Stores accepted, rejected or pending; the rule version; reason codes; human or automated reviewer; and timestamp. Changing rules should not silently rewrite history.

### Buyer

Stores legal identity, trading name, service areas, categories, credentials, insurance evidence, capacity, contacts, contract, balance or billing terms and reporting reliability. Companies House identity supports due diligence; it does not prove quality.

### Routing attempt

Stores buyer, attempt order, send time, channel, response, delivery error, cap state and fallback. A lead that disappeared between webhook and inbox is an operating failure, not a marketing metric.

### Commercial event

Stores billable status, unit price, credit request, decision, invoice, collection and adjustment. The financial ledger should be reproducible from event states.

### Outcome

Stores contacted, appointment, attended, quoted, won, lost, revenue band, gross-contribution band where available, reason lost, completion and complaint. The buyer owns much of this information; the contract must require an appropriate feedback loop.

## A minimal event sequence

`request_created → contact_verified → qualification_completed → buyer_selected → delivery_confirmed → buyer_contacted → appointment_or_quote → won_or_lost → invoiced_or_credited`

Every transition has an actor and time. State should be append-only where practical, with corrections recorded rather than history overwritten.

## Qualification taxonomies by cell

Common rejection codes:

- duplicate within agreed period;
- outside service geography;
- wrong service;
- consumer cannot be contacted after agreed attempts;
- existing buyer customer;
- obvious spam or supplier solicitation;
- request outside operating time where live coverage was promised;
- missing authority or property facts required by the cell;
- buyer at capacity before routing;
- professional or regulatory scope outside the buyer's capability.

Avoid “poor quality” as a code. It cannot be audited or improved.

Cell-specific facts belong in versioned schemas. A drainage call needs urgency and blockage context. A boiler appointment needs ownership, current system and property facts. An asbestos request needs reason for survey and work context. The shared system should support these without collapsing them into one notes box.

## Routing rules

The routing function should consider:

1. exact service eligibility;
2. postcode or polygon coverage;
3. credential state;
4. declared live capacity;
5. contract and credit balance;
6. recent response performance;
7. fair allocation where more than one buyer is eligible;
8. consumer preference;
9. conflict and duplicate history.

LeadByte's documentation illustrates contract, budget, price and logic-based distribution. [LeadByte](https://support.leadbyte.co.uk/hc/en-us/articles/360031079851-Standard-and-Advanced-Lead-Distribution) The principle matters more than the vendor: routing is a commercial decision that must be explainable.

## Speed without fake precision

For urgent calls, measure:

- ring-to-answer time;
- connected-call rate;
- abandoned-call rate;
- buyer pickup by hour;
- transfer failure;
- callback time;
- outcome by response delay.

For planned forms, measure:

- form completion;
- contact verification;
- time to first buyer contact;
- appointment booking and attendance;
- quote rate;
- win rate;
- days to decision.

Do not claim that a five-minute response “increases conversion by X%” unless the portfolio observes that effect. Use speed as an operational hypothesis and measure the local cohort.

## The buyer dashboard

A useful monthly view contains:

| Section   | Minimum fields                                                     |
| --------- | ------------------------------------------------------------------ |
| Volume    | captured, accepted, delivered, credited                            |
| Response  | answered, contacted, median response time                          |
| Funnel    | appointments, attended, quoted, won, pending                       |
| Economics | billed, credited, collected, cost per accepted event, cost per win |
| Mix       | postcode, service, urgency, job-value band                         |
| Loss      | reason codes and aging                                             |
| Quality   | complaints, repeat callers, consent or routing incidents           |

The operator dashboard additionally needs acquisition source, landing page, search query where legitimately available, content cohort, call cost, qualification labour and buyer concentration.

## Cohort accounting

Revenue reported for a month should not be divided by whichever wins happened in the same month. A lead captured on 28 August may close in October. Cohort reporting follows requests acquired in a period through a defined maturity window.

Recommended views:

- day 0–7 contact and qualification;
- day 0–30 appointment and quote;
- day 0–90 win, revenue and credits;
- rolling twelve-week acquisition quality;
- buyer retention by start cohort;
- market-cell contribution after direct operating cost.

This is how an organic page becomes an investable asset rather than an anecdote.

## Privacy, calls and review data

The ICO requires transparency about collection, purpose and sharing and expects lead generators to perform appropriate due diligence on buyers. [ICO lead-generation guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/direct-marketing-guidance/collect-information-and-generate-leads/) The system should therefore retain:

- notice and form version shown;
- intended buyer category or named buyer where appropriate;
- evidence of any consent relied upon;
- purpose and permitted contact channel;
- deletion or objection state;
- downstream buyer and delivery record.

Call recording requires a clear purpose, notice, access controls and retention decision. Tracking numbers must not be used to create a misleading local identity.

Reviews need source, relationship, date, moderation state and challenge history. The operator should never copy marketplace reviews without rights or merge ratings from incompatible sources.

## Buy or build

For the first 30–50 events:

- use a reputable call/form attribution product;
- keep a controlled event ledger;
- route manually with documented rules;
- collect outcomes weekly;
- invoice from accepted states;
- record credits with reason codes.

Build custom routing only when manual work creates repeatable delay or when buyer logic is a source of advantage. Do not build a marketplace dashboard before proving a buyer will retain.

## Service levels

An initial agreement should specify:

- operating hours and response target;
- geographic and category definition;
- maximum daily and monthly volume;
- data fields and delivery channel;
- acceptable and creditable events;
- credit request deadline and evidence;
- consumer complaint escalation;
- outcome reporting cadence;
- payment and termination.

The operator then publishes its own service reliability: delivery success, qualification consistency, buyer response and unresolved disputes. That operational evidence is a stronger moat than claiming to be “the number-one local expert.”
