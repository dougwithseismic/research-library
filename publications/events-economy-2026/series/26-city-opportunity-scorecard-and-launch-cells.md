# City opportunity scorecard and launch cells

## The decision

If the founder is location-agnostic, **Bristol is the best learning cell, Birmingham is the best regional scale-demand test, and Manchester is the best incumbent stress test**.

London remains the largest demand pool but is not the default bootstrap answer. Leeds and Edinburgh have credible live proof, yet both already contain several strong managed formats. Reading, Nottingham and Southampton are useful counterfactuals rather than first choices.

This is a desk screen, not a final site-selection claim. It compares nine verified Google Ads city targets and a bounded sample of current operators. It does not know the founder's local advantage, venue terms, host supply, acquisition cost, retention or event contribution. Any one of those can reverse the order.

## What changed in the research

The earlier scorecard compared business-model archetypes. That answered _what kind of company?_ but not _where should the first programme cell exist?_

The improved decision unit is:

```text
city × customer job × flagship format × depth format × delivery model
```

The regional screen adds four things:

1. a fresh Google Ads pull using the same keyword construction in nine city targets;
2. a separate UK-targeted screen for explicit city-modified searches;
3. current operator coverage and city-level programme evidence;
4. a weighted launch score with confidence, missing evidence and explicit decisions.

The raw [local-geo rows](../evidence/city-demand-local-geo-screen.csv), [explicit city rows](../evidence/city-demand-explicit-screen.csv), [summary](../evidence/city-demand-summary.csv), [operator sample](../evidence/city-format-evidence.csv) and [city scorecard](../evidence/city-opportunity-scorecard.csv) remain downloadable.

## The two demand lenses

The pull used UK English, Google Search and API v25 on 3 September 2026. The local-geo method placed the same generic phrases inside each verified city target. The explicit method used phrases such as `book club Bristol` under the United Kingdom target.

The relevant comparison basket includes friendship discovery, interest-led activity and dating. Broad `things to do` and `events` terms are reported separately and excluded from the opportunity total.

| City        | Local friendship | Local interest | Local dating | Local relevant basket | Explicit relevant basket |
| ----------- | ---------------: | -------------: | -----------: | --------------------: | -----------------------: |
| London      |              430 |         11,610 |        1,150 |                13,190 |                   33,950 |
| Birmingham  |              110 |          1,980 |          160 |                 2,250 |                    7,100 |
| Manchester  |               60 |          1,200 |           90 |                 1,350 |                    9,370 |
| Bristol     |               60 |            930 |           70 |                 1,060 |                    5,980 |
| Leeds       |               60 |            800 |           70 |                   930 |                    4,400 |
| Edinburgh   |               60 |            520 |           60 |                   640 |                    4,850 |
| Reading     |               60 |            360 |           40 |                   460 |                    1,720 |
| Southampton |               60 |            200 |           40 |                   300 |                    1,590 |
| Nottingham  |               60 |            130 |           30 |                   220 |                    3,510 |

These figures must not be read as market size. Phrases overlap, several have mixed family or tourist intent, and Google can group close variants. The two methods also overlap and must not be added together. Their value is comparative: every city was asked the same question.

## What the keyword rows actually reveal

The interest-led basket is doing most of the work. In Birmingham, `pottery painting` returned 880 local average monthly searches, `board game cafe` 390, and both `book club` and `social sports` 210. Manchester returned 590 for pottery painting, 260 for board-game cafés and 140 each for book clubs and pottery classes. Bristol returned 390, 260 and 110 respectively for pottery painting, board-game cafés and book clubs.

Generic lecture discovery is far smaller. That does not make intellectual events weak. It means an event-house brand, a compelling subject, a speaker and partner distribution can create demand that the phrase `public lectures` does not capture.

Seed Talks' current city pages make that distinction visible. The operator claims the following cumulative activity:

| City       | Claimed events | Claimed attendee floor | Derived attendees per event |
| ---------- | -------------: | ---------------------: | --------------------------: |
| Leeds      |             38 |                 12,000 |                         316 |
| Birmingham |             22 |                  6,500 |                         295 |
| Nottingham |             12 |                  3,500 |                         292 |
| Manchester |             32 |                  9,200 |                         288 |
| Bristol    |             59 |                 15,600 |                         264 |
| Edinburgh  |             32 |                  7,700 |                         241 |
| Reading    |              5 |                  1,150 |                         230 |

The last column divides the stated attendee floor by the stated event count. It is not observed average attendance. The totals are first-party, may use different time windows and do not disclose paid share, capacity, refunds, repeat behaviour or contribution. They nevertheless show that regional large-room programming is not merely a London theory. [Bristol](https://www.seedtalks.co.uk/in/bristol), [Birmingham](https://www.seedtalks.co.uk/in/birmingham), [Manchester](https://www.seedtalks.co.uk/in/manchester), [Leeds](https://www.seedtalks.co.uk/in/leeds), [Edinburgh](https://www.seedtalks.co.uk/in/edinburgh), [Nottingham](https://www.seedtalks.co.uk/in/nottingham), [Reading](https://www.seedtalks.co.uk/in/reading)

## The competitive signal became stronger

Timeleft currently lists Birmingham, Edinburgh, Leeds, London and Manchester in the UK. Bristol, Nottingham, Reading and Southampton are not on that current list. Absence is a point-in-time observation, not proof that a city cannot support managed friendship. [Timeleft](https://timeleft.com/)

More importantly, Original Dating now lists **FriendDating** events in Manchester and Leeds. The £20 format uses a host, a welcome drink, up to thirty people, four-minute conversations and mutual post-event friend matching. This is a dating-event operator reusing its operating system for platonic connection. It makes a generic friendship mixer easier to copy and less attractive as a standalone wedge. [Manchester](https://www.originaldating.com/manchester/), [Leeds FriendDating](https://www.originaldating.com/leeds/frienddating-in-leeds-18-nov-2026/10902/)

The venue pattern matters too. Original Dating repeats several formats in Manahatta venues across cities. GO Mammoth publishes social-sport supply across London, Bristol, Birmingham, Edinburgh, Manchester and Reading. The Offline Club currently lists Bristol as well as London. These examples suggest that a proven format can travel through venue groups, local leaders and existing facilities before a company owns property. They do not prove that those partners are available to a new entrant. [GO Mammoth cities](https://www.gomammoth.co.uk/netball-cities/), [Offline Club Bristol](https://www.theoffline-club.com/city-chapters/bristol-chapter)

## How the city score works

Each city is scored from one to five across six criteria. The points shown in the retained file are already multiplied by the weight.

| Criterion                 | Weight | What it asks                                                        |
| ------------------------- | -----: | ------------------------------------------------------------------- |
| Local-geo relevant demand |     30 | Does the same generic basket appear inside the city target?         |
| Explicit city demand      |     15 | Do people use the city name with relevant formats?                  |
| Visible format proof      |     15 | Are several distinct managed formats currently observable?          |
| Competitive headroom      |     15 | Is there room beyond the selected visible incumbents?               |
| Cluster optionality       |     15 | Could one operating base reach adjacent cities or repeat partners?  |
| Founder-stage testability |     10 | Can the thesis be tested without national inventory or owned space? |

The first two scores are normalized comparisons from the retained keyword rows. The remaining four are research judgement based on the selected operator sample. Evidence coverage is only four of six dimensions: no city has direct venue economics or founder-specific operating evidence.

| Rank | City        | Score / 100 | Confidence | Decision                      |
| ---: | ----------- | ----------: | ---------- | ----------------------------- |
|    1 | Bristol     |          83 | Medium     | Recommended learning cell     |
|    2 | Birmingham  |          81 | Medium     | Recommended scale-demand test |
|    3 | London      |          80 | Medium     | Comparator or funded route    |
|    4 | Manchester  |          78 | Medium     | Incumbent stress test         |
|    5 | Leeds       |          63 | Medium     | Second-city or partner test   |
|    6 | Edinburgh   |          61 | Medium     | Seasonality test only         |
|    7 | Reading     |          53 | Low–medium | Small-cell hold               |
|    8 | Nottingham  |          50 | Low–medium | Low-cost counterfactual       |
|    9 | Southampton |          48 | Low        | Hold for better evidence      |

The score is not a forecast of revenue or a claim that Bristol is an objectively better city than London. It ranks places for this specific founder-stage model. A founder with a trusted Birmingham venue, a Manchester audience or a Leeds host network should update the testability score before acting.

## Launch cell one: Bristol

### Why it leads

Bristol combines a credible local and explicit demand signal with unusually strong first-party event-house evidence. Seed Talks claims 59 events and more than 15,600 attendees. GO Mammoth, Original Dating and The Offline Club expose sport, dating and phone-free community supply. Timeleft does not currently list the city.

That is the best learning shape in the sample: enough proof that people buy structured evenings, but no dominant managed-friendship subscription in the reviewed set.

### What to test

Do not copy a generic psychology lecture. Test a participatory cultural night in a 60–100-person room—reading, social games, a guided idea salon or a low-equipment making format—with solo arrival designed into the first twenty minutes. Invite purchasers into one eight-to-twelve-person dinner or short cohort linked to the same subject.

### What would disconfirm it

- venue quotes require more than 75% paid fill before direct break-even;
- the event sells only through the speaker's audience and creates no reusable local list;
- fewer than 20% of first attendees place a second paid booking or deposit within sixty days;
- customers like the activity but reject the related small-group offer;
- available hosts or venues cannot support a consistent weekday slot.

## Launch cell two: Birmingham

### Why it matters

Birmingham has the largest non-London local-geo relevant basket: 2,250 average monthly searches across the comparison terms. Its activity signal is broad rather than dependent on one phrase. Seed Talks claims more than 6,500 attendees across 22 events, while Timeleft, Original Dating and GO Mammoth all expose current supply.

This is the strongest scale-demand test and a poor place for an undifferentiated friendship mixer.

### What to test

Lead with a format that has clear standalone value and can later become a season: a social-game league, a recurring reading ritual or a portable maker programme. Use one repeat venue and one consistent weekday. The commercial question is whether activity-led buyers cross into a depth product, not whether another event can sell once.

### What would disconfirm it

- acquisition depends on continuous discounts in a market with several known operators;
- broad activity searches convert to child, tourist or retail intent rather than adult paid participation;
- the programme cannot build a direct list independent of Eventbrite or a venue partner;
- attendance is healthy but second booking remains below the early 20% threshold.

## Launch cell three: Manchester

### Why it is a stress test

Manchester has the strongest non-London explicit city basket at 9,370. It also has the densest visible managed set in this screen: Timeleft, Seed Talks, Original Dating, FriendDating and GO Mammoth.

This is attractive if the aim is to prove differentiated demand under pressure. It is unattractive if the product is “meet people in a bar.”

### What to test

Choose a narrow editorial or participation identity that the existing operators do not own. A bounded four-to-six-session cohort is more defensible than another general mixer. Publish a clear life-stage, skill or subject promise and measure whether customers arrive from that promise rather than from generic loneliness language.

### What would disconfirm it

- participants compare the product directly with a cheaper or better-known incumbent;
- paid acquisition cannot recover inside three attended events;
- the narrow subject creates an excellent room but not enough cadence for repeat;
- a partner venue owns the customer relationship and limits follow-up.

## Launch cell four: Leeds

### Why it remains interesting

The search basket is smaller than Birmingham, Manchester or Bristol, but Seed Talks claims the largest attendee floor per stated event in the comparable set. Timeleft is current, and Original Dating has scheduled both dating and FriendDating formats.

That contradiction is useful: operator-led, speaker-led and partner-led demand may be stronger than generic category search. Leeds is therefore a good second-city or partnership test after the format has worked elsewhere.

### What to test

Transfer one proven programme without changing its price, host standard and core content. The question is portability. If Leeds requires a new brand, new format and founder-led distribution, it has not reproduced the first cell.

## The portfolio rule

Do not launch four cities. Buy the evidence in sequence:

1. obtain comparable venue quotes and identify two host candidates in Bristol, Birmingham and Manchester;
2. run customer reconstruction interviews in each city using the same screener;
3. present one concrete flagship and one depth offer at real prices;
4. select one city on paid intent, venue contribution and operator access—not the spreadsheet alone;
5. deliver six paid events in that city before opening a second;
6. use Leeds or Manchester as the transfer test only after the first cell repeats without founder heroics.

The city scorecard should be recalculated after venue quotes and twenty interviews. At that point, replace testability and headroom judgement with actual data rather than adding decimals to the current scores.

## What remains unknown

The decisive fields are still absent:

- first-to-second paid booking by city and format;
- paid acquisition cost per attended new customer;
- venue minimum, hire, food-and-drink share and cancellation terms;
- host availability, pay and quality variance;
- weekday catchment and safe late-evening travel;
- price response for a public event and a depth cohort;
- the proportion of demand that is adult, solo-friendly and locally repeatable;
- whether an employer, venue or property buyer will underwrite weekday capacity;
- founder access to a trusted audience, room or facilitator.

Those are not reasons to keep researching indefinitely. They are the fields the first £12,000 evidence sprint should purchase.
