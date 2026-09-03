#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_API_VERSION,
  DEFAULT_GEO_TARGET_IDS,
  DEFAULT_LANGUAGE_ID,
  fetchKeywordHistoricalMetrics,
  loadGoogleAdsEnvironment,
  metricsRows,
  requireEnvironment,
} from "./lib/google-ads.mjs";

const OBSERVED_AT = "2026-09-03";
const PUBLIC_DIRECTORY = join(
  process.cwd(),
  "publications/events-economy-2026/evidence",
);
const PRIVATE_DIRECTORY = join(
  process.cwd(),
  "private-data/events-economy-2026",
);

const cities = [
  {
    city: "Manchester",
    criterionId: "1006912",
    canonicalName: "Manchester, Manchester, England, United Kingdom",
  },
  {
    city: "Birmingham",
    criterionId: "1006524",
    canonicalName: "Birmingham, West Midlands, England, United Kingdom",
  },
  {
    city: "Bristol",
    criterionId: "1006567",
    canonicalName: "Bristol, England, United Kingdom",
  },
];

const formats = [
  {
    format: "Darts",
    intents: {
      discovery: ["darts", "darts near me"],
      event_booking: ["darts events", "darts events near me"],
      repeat_programme: ["darts league", "darts league near me"],
      beginner_or_adult: ["darts club", "darts club near me"],
      group_or_corporate: ["darts team building", "darts team building"],
    },
  },
  {
    format: "Line dancing",
    intents: {
      discovery: ["line dancing", "line dancing near me"],
      event_booking: ["line dancing events", "line dancing events near me"],
      repeat_programme: [
        "line dancing classes",
        "line dancing classes near me",
      ],
      beginner_or_adult: [
        "beginner line dancing",
        "beginner line dancing near me",
      ],
      group_or_corporate: ["line dancing workshop", "line dancing workshop"],
    },
  },
  {
    format: "Salsa",
    intents: {
      discovery: ["salsa dancing", "salsa dancing near me"],
      event_booking: ["salsa events", "salsa events near me"],
      repeat_programme: ["salsa classes", "salsa classes near me"],
      beginner_or_adult: [
        "beginner salsa classes",
        "beginner salsa classes near me",
      ],
      group_or_corporate: ["salsa workshop", "salsa workshop"],
    },
  },
  {
    format: "Board-game events",
    intents: {
      discovery: ["board game cafe", "board game cafe near me"],
      event_booking: ["board game events", "board game events near me"],
      repeat_programme: ["board game club", "board game club near me"],
      beginner_or_adult: ["board game night", "board game night near me"],
      group_or_corporate: [
        "board game team building",
        "board game team building",
      ],
    },
  },
  {
    format: "Pottery painting",
    intents: {
      discovery: ["pottery painting", "pottery painting near me"],
      event_booking: [
        "pottery painting events",
        "pottery painting events near me",
      ],
      repeat_programme: [
        "pottery painting classes",
        "pottery painting classes near me",
      ],
      beginner_or_adult: [
        "adult pottery painting",
        "adult pottery painting near me",
      ],
      group_or_corporate: [
        "corporate pottery painting",
        "corporate pottery painting",
      ],
    },
  },
  {
    format: "Wine tasting",
    intents: {
      discovery: ["wine tasting", "wine tasting near me"],
      event_booking: ["wine tasting events", "wine tasting events near me"],
      repeat_programme: ["wine tasting club", "wine tasting club near me"],
      beginner_or_adult: [
        "wine tasting classes",
        "wine tasting classes near me",
      ],
      group_or_corporate: ["corporate wine tasting", "corporate wine tasting"],
    },
  },
  {
    format: "Sip and paint",
    intents: {
      discovery: ["sip and paint", "sip and paint near me"],
      event_booking: ["sip and paint events", "sip and paint events near me"],
      repeat_programme: [
        "sip and paint classes",
        "sip and paint classes near me",
      ],
      beginner_or_adult: ["sip and paint tickets", "sip and paint tickets"],
      group_or_corporate: [
        "corporate sip and paint",
        "corporate sip and paint",
      ],
    },
  },
  {
    format: "Spa retreats",
    intents: {
      discovery: ["spa retreats", "spa retreat near me"],
      event_booking: ["spa retreat booking", "spa retreat booking"],
      repeat_programme: [
        "wellness retreat weekend",
        "wellness retreat weekend",
      ],
      beginner_or_adult: ["day wellness retreat", "day wellness retreat"],
      group_or_corporate: [
        "corporate wellness retreat",
        "corporate wellness retreat",
      ],
    },
  },
];

const intentKeys = [
  "discovery",
  "event_booking",
  "repeat_programme",
  "beginner_or_adult",
  "group_or_corporate",
];

function normalized(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function csvCell(value) {
  const rendered = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(rendered)
    ? `"${rendered.replaceAll('"', '""')}"`
    : rendered;
}

function toCsv(columns, rows) {
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}

function money(micros) {
  return (Number(micros ?? 0) / 1_000_000).toFixed(4);
}

function monthlySeries(values) {
  return values
    .map(
      ({ year, month, monthlySearches }) =>
        `${year}-${String(month).toLowerCase()}:${Number(monthlySearches ?? 0)}`,
    )
    .join("|");
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

loadGoogleAdsEnvironment();
const environment = requireEnvironment([
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
]);

async function fetchMetrics(keywords, geoTargetIds) {
  await pause(1_500);
  const request = () =>
    fetchKeywordHistoricalMetrics({
      keywords,
      customerId: environment.GOOGLE_ADS_CUSTOMER_ID,
      loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      developerToken: environment.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: environment.GOOGLE_ADS_CLIENT_ID,
      clientSecret: environment.GOOGLE_ADS_CLIENT_SECRET,
      refreshToken: environment.GOOGLE_ADS_REFRESH_TOKEN,
      apiVersion: process.env.GOOGLE_ADS_API_VERSION ?? DEFAULT_API_VERSION,
      languageId: process.env.GOOGLE_ADS_LANGUAGE_ID ?? DEFAULT_LANGUAGE_ID,
      geoTargetIds,
      network: "GOOGLE_SEARCH",
    });

  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/RESOURCE_EXHAUSTED|quota/i.test(message)) throw error;
    await pause(10_000);
    return request();
  }
}

function buildItems(method, city) {
  return formats.flatMap((format) =>
    intentKeys.map((intent) => {
      const [explicitPhrase, localPhrase] = format.intents[intent];
      return {
        city: city.city,
        format: format.format,
        intent,
        keyword:
          method === "explicit"
            ? `${explicitPhrase} ${city.city}`
            : localPhrase,
      };
    }),
  );
}

function normalizeResponse(response, items, geographyMethod, fallbackCity) {
  const itemByKeyword = new Map(
    items.map((item) => [normalized(item.keyword), item]),
  );
  const matchedKeys = new Set();
  const rows = [];

  for (const result of metricsRows(response)) {
    const candidates = [result.keyword, ...result.closeVariants].map(
      normalized,
    );
    const matches = [
      ...new Map(
        candidates
          .map((candidate) => itemByKeyword.get(candidate))
          .filter(Boolean)
          .map((item) => [normalized(item.keyword), item]),
      ).values(),
    ];
    for (const match of matches) {
      matchedKeys.add(normalized(match.keyword));
      rows.push({
        city: match.city ?? fallbackCity,
        format: match.format,
        intent: match.intent,
        submitted_keyword: match.keyword,
        returned_keyword: result.keyword,
        close_variants: result.closeVariants,
        grouped_submitted_keywords: matches.map((item) => item.keyword),
        grouped_by_google: matches.length > 1 ? "yes" : "no",
        average_monthly_searches: result.averageMonthlySearches,
        competition: result.competition,
        competition_index: result.competitionIndex,
        average_cpc_gbp: money(result.averageCpcMicros),
        low_top_of_page_gbp: money(result.lowTopOfPageBidMicros),
        high_top_of_page_gbp: money(result.highTopOfPageBidMicros),
        monthly_search_volumes: monthlySeries(result.monthlySearchVolumes),
        geography_method: geographyMethod,
        interpretation:
          matches.length > 1
            ? "Google grouped submitted phrases; repeat the observation across labels but never sum the grouped rows"
            : "One submitted phrase mapped to this returned observation",
        observed_at: OBSERVED_AT,
      });
    }
  }

  for (const item of items) {
    if (matchedKeys.has(normalized(item.keyword))) continue;
    rows.push({
      city: item.city ?? fallbackCity,
      format: item.format,
      intent: item.intent,
      submitted_keyword: item.keyword,
      returned_keyword: "",
      close_variants: [],
      grouped_submitted_keywords: [],
      grouped_by_google: "no",
      average_monthly_searches: 0,
      competition: "UNSPECIFIED",
      competition_index: 0,
      average_cpc_gbp: "0.0000",
      low_top_of_page_gbp: "0.0000",
      high_top_of_page_gbp: "0.0000",
      monthly_search_volumes: "",
      geography_method: geographyMethod,
      interpretation:
        "No returned Google keyword row; this is not proof of zero demand",
      observed_at: OBSERVED_AT,
    });
  }
  return rows;
}

function summarize(rows) {
  const index = new Map(
    rows.map((row) => [
      `${row.geography_method}|${row.city}|${row.format}|${row.intent}`,
      row,
    ]),
  );
  return [
    "explicit_city_query_under_uk_target",
    "generic_query_inside_local_geo_target",
  ]
    .flatMap((method) =>
      cities.flatMap((city) =>
        formats.map((format) => {
          const intentRows = Object.fromEntries(
            intentKeys.map((intent) => [
              intent,
              index.get(`${method}|${city.city}|${format.format}|${intent}`),
            ]),
          );
          const commercialRows = intentKeys
            .filter((intent) => intent !== "discovery")
            .map((intent) => intentRows[intent]);
          const reportableCommercial = commercialRows.filter(
            (row) => Number(row?.average_monthly_searches ?? 0) > 0,
          );
          const strongestCommercial = [...commercialRows].sort(
            (left, right) =>
              Number(right?.average_monthly_searches ?? 0) -
              Number(left?.average_monthly_searches ?? 0),
          )[0];
          const grouped = intentKeys.some(
            (intent) => intentRows[intent]?.grouped_by_google === "yes",
          );
          return {
            geography_method: method,
            city: city.city,
            format: format.format,
            discovery_searches:
              intentRows.discovery?.average_monthly_searches ?? 0,
            event_booking_searches:
              intentRows.event_booking?.average_monthly_searches ?? 0,
            repeat_programme_searches:
              intentRows.repeat_programme?.average_monthly_searches ?? 0,
            beginner_or_adult_searches:
              intentRows.beginner_or_adult?.average_monthly_searches ?? 0,
            group_or_corporate_searches:
              intentRows.group_or_corporate?.average_monthly_searches ?? 0,
            reportable_commercial_intent_rows_4: reportableCommercial.length,
            strongest_commercial_intent:
              strongestCommercial?.intent ?? "unresolved",
            strongest_commercial_average_monthly_searches:
              strongestCommercial?.average_monthly_searches ?? 0,
            strongest_commercial_average_cpc_gbp:
              strongestCommercial?.average_cpc_gbp ?? "0.0000",
            intent_depth:
              reportableCommercial.length >= 3
                ? "broad_reportable_intent"
                : reportableCommercial.length >= 1
                  ? "thin_reportable_intent"
                  : "no_reportable_commercial_row",
            grouped_observation_warning: grouped
              ? "At least one Google row groups submitted phrases; columns must not be added"
              : "No cross-intent grouping detected",
            evidence_note:
              "Intent columns are separate overlapping observations and must not be added",
            observed_at: OBSERVED_AT,
          };
        }),
      ),
    )
    .sort(
      (left, right) =>
        left.geography_method.localeCompare(right.geography_method) ||
        left.city.localeCompare(right.city) ||
        left.format.localeCompare(right.format),
    );
}

const explicitItems = cities.flatMap((city) => buildItems("explicit", city));
const explicitResponse = await fetchMetrics(
  explicitItems.map((item) => item.keyword),
  DEFAULT_GEO_TARGET_IDS,
);
const explicitRows = normalizeResponse(
  explicitResponse,
  explicitItems,
  "explicit_city_query_under_uk_target",
  "unresolved",
);

const localRows = [];
const sanitizedLocalResponses = [];
for (const city of cities) {
  const items = buildItems("local", city);
  const response = await fetchMetrics(
    items.map((item) => item.keyword),
    [city.criterionId],
  );
  localRows.push(
    ...normalizeResponse(
      response,
      items,
      "generic_query_inside_local_geo_target",
      city.city,
    ),
  );
  sanitizedLocalResponses.push({
    city: city.city,
    criterionId: city.criterionId,
    apiVersion: response.apiVersion,
    languageId: response.languageId,
    geoTargetIds: response.geoTargetIds,
    results: metricsRows(response),
  });
}

const detailColumns = [
  "city",
  "format",
  "intent",
  "submitted_keyword",
  "returned_keyword",
  "close_variants",
  "grouped_submitted_keywords",
  "grouped_by_google",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "monthly_search_volumes",
  "geography_method",
  "interpretation",
  "observed_at",
];
const summaryColumns = [
  "geography_method",
  "city",
  "format",
  "discovery_searches",
  "event_booking_searches",
  "repeat_programme_searches",
  "beginner_or_adult_searches",
  "group_or_corporate_searches",
  "reportable_commercial_intent_rows_4",
  "strongest_commercial_intent",
  "strongest_commercial_average_monthly_searches",
  "strongest_commercial_average_cpc_gbp",
  "intent_depth",
  "grouped_observation_warning",
  "evidence_note",
  "observed_at",
];
const summaryRows = summarize([...explicitRows, ...localRows]);

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "launch-cell-intent-explicit-screen.csv"),
  toCsv(detailColumns, explicitRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "launch-cell-intent-local-geo-screen.csv"),
  toCsv(detailColumns, localRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "launch-cell-intent-summary.csv"),
  toCsv(summaryColumns, summaryRows),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-launch-cell-intent-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      methods: [
        "explicit_city_query_under_uk_target",
        "generic_query_inside_local_geo_target",
      ],
      cities,
      formats,
      explicit: {
        apiVersion: explicitResponse.apiVersion,
        languageId: explicitResponse.languageId,
        geoTargetIds: explicitResponse.geoTargetIds,
        results: metricsRows(explicitResponse),
      },
      local: sanitizedLocalResponses,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Wrote ${explicitRows.length} explicit rows, ${localRows.length} local-geo rows and ${summaryRows.length} intent summaries.`,
);
