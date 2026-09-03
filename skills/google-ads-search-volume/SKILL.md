---
name: google-ads-search-volume
description: Research keyword demand, CPC, seasonality, and local-market opportunities with Research Library's authenticated Google Ads historical-metrics script. Use for keyword-volume checks, niche comparisons, city or regional demand studies, and rank-and-rent market screening; it does not estimate organic ranking difficulty or operate advertising campaigns.
---

# Google Ads Search Volume

Use the configured Google Ads account to produce a reproducible demand screen. Preserve the distinction between Google Ads observations and commercial inference.

## Locate and inspect the runner

From the Research Library root, confirm the interface before running it:

```sh
pnpm google-ads:volume --help
```

The implementation is:

- `scripts/google-ads-search-volume.mjs` for the command-line interface;
- `scripts/lib/google-ads.mjs` for OAuth refresh, request construction, metric normalization, and CSV rendering;
- `scripts/google-ads-oauth.mjs` for interactive authorization when a refresh token is missing or invalid.

If these files are not present, locate the Research Library root before continuing. Do not recreate the client or duplicate credentials inside a publication merely to run a query.

## Protect the credentials

The runner loads the ignored root `.env.local` or `.env`. It requires:

```text
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_REFRESH_TOKEN
GOOGLE_ADS_CUSTOMER_ID
```

It may also use `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_API_VERSION`, `GOOGLE_ADS_LANGUAGE_ID`, and `GOOGLE_ADS_GEO_TARGET_IDS`.

Never print, paste, commit, copy into a report, or return any credential value. Check only whether required names are populated. Run `pnpm google-ads:auth` only when authorization is genuinely missing or rejected; it requires the user to complete Google's consent flow.

The volume command is read-only. Do not create campaigns, mutate the account, or infer permission for paid advertising operations.

## Choose the right geographic method

Use one or both of these methods, and label them separately in the result:

1. **Explicit local query under a broad geography** — query phrases such as `emergency plumber bristol` while targeting the United Kingdom. This measures explicit city-modified demand visible in the selected country.
2. **Generic query inside a local geo target** — query `emergency plumber` while targeting Bristol's geo criterion. This measures searches associated with the local target and may include presence or interest according to Google's historical-metrics system.

Do not add the two figures together. They overlap and answer different questions.

The default geo criterion is `2826` for the United Kingdom and the default language criterion is `1000` for English. Known project examples include `1003803` for Prague and `1021` for Czech. For any other place, retrieve the current criterion with `GeoTargetConstantService.SuggestGeoTargetConstants` or Google's current geo-target dataset. Never guess a geo ID from memory. Confirm the returned name, canonical name, country, target type, and enabled status before using it.

Google accepts no more than ten geo targets and 10,000 keywords in one historical-metrics request. Use separate requests when the geographies represent markets that need separate conclusions.

## Build a useful keyword cluster

Start from the user's commercial question, then include only variants that can change the decision:

- core service and common synonym;
- urgent or problem-led form when relevant;
- high-value service subtype;
- `near me` form;
- city-modified form;
- the real purchase mode, such as `quote`, `installer`, `agency`, `events`, or `consultation`.

Keep distinct intent buckets separate. For example, a matchmaking study should not silently combine professional matchmakers, dating apps, speed dating, singles events, and dating coaching. Report each bucket and then explain which one matches the offer.

Prefer a compact first pass, inspect the results, and expand weak or ambiguous clusters. Large speculative keyword dumps create false precision.

## Run the query

For UK city-modified demand:

```sh
pnpm google-ads:volume --format csv \
  "double glazing birmingham" \
  "replacement windows birmingham" \
  "window installer birmingham"
```

For generic demand inside a verified local geo target:

```sh
pnpm google-ads:volume --geo <criterion-id> --format csv \
  "double glazing" \
  "replacement windows" \
  "window installer"
```

For Prague in Czech:

```sh
pnpm google-ads:volume --geo 1003803 --language 1021 --format csv \
  "zámečník" \
  "instalatér" \
  "stěhovací firma"
```

Use CSV for comparison tables. Use the default JSON output when monthly search volumes or raw normalized fields are needed for seasonality and reproducibility.

## Interpret the response correctly

The normalized output includes:

```text
keyword
closeVariants
averageMonthlySearches
competition
competitionIndex
averageCpcMicros
lowTopOfPageBidMicros
highTopOfPageBidMicros
monthlySearchVolumes
```

Apply these rules:

- Treat `averageMonthlySearches` as a rounded trailing historical average, not current-month traffic or traffic the user will obtain.
- Inspect `closeVariants`. Google may consolidate several submitted phrases into one returned keyword. Do not sum a canonical row and its close variants again.
- Treat a returned `0` as no reportable volume in this response, not proof that nobody searched. Low-volume terms may be rounded, grouped, or omitted.
- Convert micros by dividing by 1,000,000. State the Google Ads account currency; do not assume every account uses GBP.
- CPC, competition, and top-of-page bids describe the paid auction. They are useful commercial-intent signals, not projected lead price, revenue, profit, or organic SEO difficulty.
- Preserve monthly values when seasonality could change capacity or launch timing.
- Flag mixed intent explicitly, especially employment, education, product research, directories, and consumer-information queries.

When comparing a cluster across cities, use one consistent keyword construction and language. A useful city total is the sum of deduplicated explicit `<service> <city>` rows. A useful paid-search value proxy is:

```text
average monthly searches × volume-weighted average CPC
```

Label it as a comparison proxy only. Never call it obtainable revenue.

## Report the decision, not only the table

Include:

- observation date, API version, network, language, geography, and account currency;
- the submitted cluster and any close-variant consolidation;
- volume, CPC, competition, high-bid signal, and meaningful seasonality;
- an intent-quality caveat;
- what the data supports and what remains untested.

For lead generation or rank-and-rent research, Google Ads data proves only the demand side. Before recommending a build, separately assess buyer density and capacity, job economics, organic and map-pack feasibility, operational lead quality, and compliance. Companies House or trade-register evidence can help qualify buyers, but cannot prove current service coverage or buying intent.

If the user requests a retained artifact, save a dated raw JSON response and a derived CSV or report under the project's established research directory. Keep the original response and derivation method so later analysis can be reproduced.

## Troubleshooting

- If OAuth refresh fails, verify that the configured refresh token belongs to the client and has the Google Ads scope; then rerun the interactive authorization flow if needed.
- If the API rejects a customer or login-customer ID, normalize it to ten digits and verify the manager/client relationship without printing either credential set.
- If every local phrase is zero, test the broader service term, nearby phrasing, plural/singular variants, and the location-targeted method before concluding demand is absent.
- If results look implausibly duplicated, inspect `closeVariants` before rerunning or summing them.
- If a geo result looks wrong, stop and re-resolve its criterion ID; similarly named cities and obsolete targets are common sources of bad studies.

Authoritative references:

- [Generate historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)
- [Location targeting and geo-target lookup](https://developers.google.com/google-ads/api/docs/targeting/location-targeting)
- [Geo-target dataset](https://developers.google.com/google-ads/api/data/geotargets)
