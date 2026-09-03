# Commercial model and unit economics

## Start with the event, not the valuation story

The launch business is a managed service with software support. Its first commercial question is whether an occupied seat creates enough contribution to fund hosting, support and reacquisition. Subscription, venue fees and sponsorship matter only after that loop works.

## Revenue architecture

| Layer                   | Buyer                                        | Unit                                | When to introduce                         | Main risk                               |
| ----------------------- | -------------------------------------------- | ----------------------------------- | ----------------------------------------- | --------------------------------------- |
| Reservation             | Attendee                                     | Occupied seat                       | Launch                                    | Thin contribution and refunds           |
| Credit pack             | Attendee                                     | Prepaid future seats                | Launch or month 2                         | Unused-credit liability and discounting |
| Capped membership       | Attendee                                     | Member-month plus included seats    | After repeat proof                        | Utilisation and churn                   |
| Venue service           | Restaurant or group                          | Seated diner, event or month        | After incremental covers are demonstrated | Double charging without value           |
| Brand activation        | Sponsor                                      | Campaign or event series            | After audience and quality proof          | Trust erosion                           |
| Institutional programme | Employer, university or public/charity buyer | Cohort, attended place or programme | Later                                     | Procurement and outcome claims          |
| Host software           | Independent organiser                        | Subscription plus payments          | Separate later product                    | Marketplace support and risk transfer   |

## Per-event sensitivity

The observable Dinners With Friends inputs are £15 for a typical reservation and a £20 meal contribution plus free ticket for the host. The free ticket's restaurant cost is unknown and excluded below.

| Paid attendees | Seat revenue | Host meal contribution | Remainder before other variable costs | Remainder per paid seat |
| -------------: | -----------: | ---------------------: | ------------------------------------: | ----------------------: |
|              6 |          £90 |                    £20 |                                   £70 |                  £11.67 |
|             10 |         £150 |                    £20 |                                  £130 |                  £13.00 |
|             11 |         £165 |                    £20 |                                  £145 |                  £13.18 |

Formula:

```text
pre-overhead event remainder = paid seats × seat price − direct host contribution
```

This is not profit. A decision model should then subtract:

```text
card fees
+ refunds, credits and chargebacks
+ host's free meal where not waived
+ host travel or other compensation
+ customer support
+ event operations
+ insurance allocation
+ software and messaging
+ acquisition and referral rewards
+ taxes
```

If those costs total £5 per occupied seat at ten guests, event contribution is £80. If they total £9, it is £40. That difference determines whether the company can acquire customers or pay for central operations.

## Fill rate is the dominant variable

The fixed host contribution makes low attendance expensive. At six paid guests it costs £3.33 per guest; at ten it costs £2; at eleven it costs £1.82. Venue deposits, host time and support add other event-level fixed costs.

An operator therefore needs four thresholds:

- **publish threshold:** enough likely demand to list the event;
- **go/no-go threshold:** minimum paid attendees by a defined time;
- **quality threshold:** enough compatible attendees to make the room worthwhile;
- **capacity threshold:** the largest group the host and venue can serve well.

Selling one more seat is useful only until it damages conversation or breaks the promise.

## Restaurant value without false economics

At ten diners:

| Assumed diner spend | Venue gross sales |
| ------------------: | ----------------: |
|                 £25 |              £250 |
|                 £35 |              £350 |
|                 £50 |              £500 |

This is a sensitivity table. It is not observed average spend and says nothing about restaurant margin. The operator should ask venues for actual group spend, table duration, service burden, return visits and displacement of normal bookings.

A future venue fee should be linked to measured incremental value. Plausible structures include:

- £1–£3 per attended diner paid by the venue;
- a fixed coordination fee per delivered table;
- a monthly preferred-partner package with guaranteed event volume;
- comped host meal in exchange for recurring covers;
- a revenue share on a fixed group menu.

Every structure needs a counterfactual: would those diners have visited anyway?

## Acquisition economics

At ten paid attendees, the observed price and host contribution leave £13 per seat before other variable cost. Treating that £13 as an acquisition ceiling would already be aggressive because nothing remains for delivery.

Against selected Google Ads observations:

| Keyword            | Historical average CPC | Purchase conversion needed to recover £13 |
| ------------------ | ---------------------: | ----------------------------------------: |
| `make new friends` |                  £1.21 |                                      9.3% |
| `meet new people`  |                  £2.00 |                                     15.4% |
| `friendship app`   |                  £2.13 |                                     16.4% |

Formula:

```text
break-even first-seat purchase rate = CPC ÷ first-seat contribution
```

Those rates ignore no-shows, repeat support and fixed overhead. Search acquisition is unlikely to work on a one-and-done customer. Paid media becomes plausible if the customer attends repeatedly, brings a referral or prepays a pack.

## Lifetime value must be behavioural

At a £15 reservation price, gross seat revenue is:

| Attendance pattern | Annual seat revenue |
| ------------------ | ------------------: |
| One event          |                 £15 |
| Quarterly          |                 £60 |
| Monthly            |                £180 |
| Twice monthly      |                £360 |

These are revenues, not contribution or lifetime value. The business should not apply a software gross margin or assume every month repeats indefinitely.

Useful cohort metrics are:

```text
first booking → first attendance → second booking within 60 days
→ attended seats in 180 days → contribution in 180 days
```

Use contribution-based payback, not gross booking value.

## Credit packs

Credits can improve cash flow and reduce repeated checkout friction. They can also conceal weak usage and create liabilities.

The ledger should record:

- cash paid;
- credits issued, spent, transferred, expired or refunded;
- promotional versus purchased credits;
- event-level recognised revenue;
- outstanding credit liability;
- breakage policy and consumer-law treatment.

“Credits never expire” is generous to the customer but leaves a long-lived operating obligation. A company should not count unredeemed cash as clean event revenue without accounting advice.

## Membership

The recommended membership is capped initially:

```text
£24–£32 per month
includes up to two standard reservations
early booking and free transfer
additional seats at member price
food and drink excluded
```

This is a proposed test, not a market price. It preserves a relationship between revenue and delivered seats. Unlimited access should be tested only after the company knows attended events per active member, direct event cost, availability and churn.

## Brand and institutional revenue

Brand partnerships can fund a full series rather than one table. A credible package would specify:

- number and location of delivered events;
- attended seats, not merely registrations;
- opt-in content and measurement;
- clear sponsor disclosure;
- fixed fee plus a performance component where appropriate;
- no sale of sensitive matching data;
- member feedback and a cancellation rule.

Institutional buyers may pay for newcomer integration, relocation support or community connection. The operator must not claim health improvement from attendance without appropriate evidence. Social prescribing in particular changes referral, safeguarding, accessibility and outcome obligations.

## Commercial pitfalls

1. Counting restaurant spend as company revenue.
2. Calling pre-sold credit cash profit before delivery.
3. Launching unlimited membership before measuring utilisation.
4. Discounting to fill rooms and training customers to wait.
5. Charging venues before proving incremental covers.
6. Hiding host and founder labour outside event costs.
7. Using registrations rather than attended seats in sponsor reports.
8. Acquiring nationally when fulfilment is hyperlocal.
9. Treating “good conversation” as unmeasurable and relying only on star ratings.
10. Reporting gross ticket sales next to software-company revenue as if margins were comparable.

## Cross-format economics

The dinner model above remains useful but does not represent the recommended front door by itself. The [format-economics scenario file](../evidence/format-economics-scenarios.csv) also models public lectures, reading parties, social games, professional D&D, pickup sport, portable pottery, corporate workshops and two platform cases.

The scenarios demonstrate different constraints rather than a universal winner:

- a public lecture can spread speaker and venue cost across 100–150 tickets but carries concentrated programming and fill risk;
- a reading party can be operationally light but may have weaker willingness to pay;
- pottery supports a higher ticket and material upsell but adds firing, storage and labour;
- sport has natural weekly repeat but exact player and facility liquidity;
- D&D produces strong cohorts but remains limited by game-master hours;
- a corporate workshop can lift order value if it reuses a standard format;
- a marketplace can show high gross margin on commission only after it has paid to create two-sided liquidity.

The complete sequencing across 43 mechanisms is in [The Forty-Three-Part Revenue Playbook](./22-the-forty-three-part-revenue-playbook.md).

## The commercial verdict

The company can be a sound local business if public formats produce contribution and smaller formats produce repeat attendance without continuous paid reacquisition. A venture-scale outcome requires more than adding cities. It needs transferable programmes, membership or cohort retention, reliable facilitator and venue systems, and higher-margin revenue such as media, brand programmes, employer distribution or software—without losing the trust that made participation worth buying.
