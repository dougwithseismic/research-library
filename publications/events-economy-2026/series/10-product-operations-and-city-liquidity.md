# Product, operations and city liquidity

## The operating system

A social-events company converts uncertain local demand into a good room at a precise time. The workflow is:

```text
member eligibility
→ availability and intent
→ event inventory
→ payment commitment
→ group composition
→ venue and host confirmation
→ reminders and exceptions
→ arrival and facilitation
→ incident handling
→ attendance and quality feedback
→ reconnection or next booking
```

Software should make this chain observable. It cannot replace the parts performed by guests, hosts and venues.

## The city cell

National registrations are a vanity metric if the local cell cannot fill. Capacity should be planned by:

```text
service area × event date × event format × broad cohort × venue price band
```

For every cell, the operator should know:

- eligible active members;
- members available in the next 28 days;
- booking probability by lead time;
- paid bookings;
- predicted show-ups;
- minimum and ideal group size;
- host and venue capacity;
- fallback events that can absorb a merger;
- member overlap with earlier groups.

An event should not be published simply because a venue has space. Supply is useful only where demand can clear the quality threshold.

## The attendance engine

No-shows damage three parties simultaneously: the operator loses group quality, the venue loses spend and other attendees receive a weaker experience. Attendance deserves its own product system.

### Before booking

- show the real date, area, price band, accessibility and refund rule;
- require an affirmative availability choice rather than passive matching;
- use a small financial commitment;
- make the social promise accurate rather than perfect.

### After booking

- send calendar insertion immediately;
- confirm dietary and access needs once, not in repeated forms;
- remind at a useful cancellation boundary;
- ask for one-tap reconfirmation;
- maintain a qualified waitlist;
- let members transfer or return to credit within the published policy;
- escalate repeated no-shows proportionately.

### On the day

- give the host a reconciled attendee and access list;
- distinguish late from absent;
- protect personal contact details;
- record the actual start, occupied seats and exceptions;
- have a route for a member who feels unsafe before arrival.

The relevant metric is **attended seats divided by expected seats at the final commitment point**, not registrations divided by capacity.

## Group composition

The first engine should be constraint-based and human-reviewed.

### Hard constraints

- event eligibility and age policy;
- availability and travel radius;
- language and accessibility;
- explicit social intent;
- do-not-pair and previous-incident controls;
- capacity and venue restrictions.

### Soft objectives

- reasonable life-stage range;
- mixture of new and repeat members;
- avoid repeating exactly the same group;
- at least two plausible conversational overlaps per attendee;
- do not isolate one person by a sensitive characteristic;
- preserve space for waitlist recovery.

### Inputs to avoid at launch

- inferred ethnicity or religion;
- sexual-orientation inference;
- attractiveness ranking;
- income proxies beyond chosen venue price comfort;
- opaque psychographic scores;
- scraped social graphs;
- criminal-record claims the operator cannot verify lawfully.

The system should store the reasons a person was placed, waitlisted or moved. “The algorithm decided” is not an operational explanation.

## Hosts

The host is a service role, not decoration. A complete host system needs:

- selection criteria and identity verification;
- a written role and compensation model;
- training in welcome, inclusion, de-escalation and boundaries;
- venue-specific run sheets;
- a check-in and escalation channel;
- rules on alcohol, member contact and off-platform groups;
- incident notes with restricted access;
- feedback and observation;
- backup coverage;
- removal and appeal processes.

The company must determine employment, worker, contractor and volunteer status with professional advice rather than choosing a label for convenience. Control, scheduling, substitution and compensation matter more than the heading on the agreement.

Hosts should not be expected to investigate crimes, provide therapy or physically intervene. Emergencies and credible threats need explicit external escalation.

## Venues

The venue record should contain operational truth, not lifestyle copy:

| Field group | Examples                                                            |
| ----------- | ------------------------------------------------------------------- |
| Commercial  | price band, deposit, minimum spend, group-menu terms, host meal     |
| Capacity    | ideal table size, maximum group, private/shared space, table turn   |
| Experience  | noise, lighting, layout, bill handling, alcohol emphasis            |
| Access      | step-free route, toilets, hearing environment, public transport     |
| Food        | dietary capability, allergen process, menu stability                |
| Operations  | contact, confirmation deadline, cancellation route, arrival plan    |
| Quality     | member feedback, host feedback, complaints, rebooking, actual spend |

A venue score should be event-format-specific. A lively bar can be excellent for a 100-person singles mixer and terrible for a ten-person conversation table.

## Minimum data model

```text
Member
  eligibility, locality, availability, access needs, consent, status

Event
  format, cohort, start time, price, capacity, thresholds, status

VenueSlot
  venue, room/table, commercial terms, access, confirmation

Booking
  member, event, payment/credits, cancellation, attendance

GroupAssignment
  event, member, reason codes, review status, prior-overlap count

HostAssignment
  host, event, confirmation, expenses, run-sheet acknowledgement

Incident
  event, reporter, subject, severity, action, access controls, appeal

Feedback
  comfort, welcome, conversation, venue, reconnect/rebook intent

LedgerEntry
  cash, credits, refund, recognised revenue, venue/host cost
```

Sensitive operational notes should not leak into ordinary analytics or host views. Deletion and restriction need to propagate without destroying the minimum audit trail required for safety and finance.

## Measuring room quality

A five-star average is too blunt. Ask a small number of behavioural and comfort questions:

- Did you feel expected when you arrived?
- Did you feel safe and able to leave?
- Was the group close to the description?
- Would you attend another event in the next 30 days?
- Would you attend with this host again?
- Would you like a mediated way to reconnect with anyone?
- Is there anything the safety team should review privately?

Track the gap between stated intent and behaviour. A member who gives five stars and never returns is not a retained customer.

## Expansion gates

Open a neighbouring cell only when the original achieves, for three consecutive event cycles:

- at least 70% of published events above minimum size 72 hours out;
- at least 85% show-up rate after the cancellation window;
- at least 25% first-to-second booking within 60 days;
- positive event contribution after direct host, support, payment and recovery cost;
- two trained active hosts plus one backup;
- at least three proven venue slots;
- incident handling within the published service level;
- no single host or venue above 30% of delivered seats.

These are proposed launch controls. They are intentionally stricter than “we sold some tickets.”

## Build versus buy

Buy generic infrastructure at first:

- payment processing;
- transactional email and SMS;
- ticket/QR or attendance scanning;
- calendar files;
- customer support;
- basic analytics and error monitoring.

Build the differentiating layer:

- city-cell demand and capacity view;
- group-assignment workflow and reason codes;
- prior-meeting and do-not-pair controls;
- host and venue run sheets;
- attendance recovery and waitlist logic;
- event contribution ledger;
- comfort, incident and repeat loop.

Owning checkout is useful when credits or membership demand it. Owning a generic email composer is not.
