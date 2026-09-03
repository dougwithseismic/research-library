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
const GEO_DATASET_DATE = "2026-08-12";
const PUBLIC_DIRECTORY = join(
  process.cwd(),
  "publications/events-economy-2026/evidence",
);
const PRIVATE_DIRECTORY = join(
  process.cwd(),
  "private-data/events-economy-2026",
);

const cities = [
  ["London", "1006886", "London, England, United Kingdom"],
  [
    "Birmingham",
    "1006524",
    "Birmingham, West Midlands, England, United Kingdom",
  ],
  ["Manchester", "1006912", "Manchester, Manchester, England, United Kingdom"],
  ["Leeds", "1006864", "Leeds, West Yorkshire, England, United Kingdom"],
  ["Bristol", "1006567", "Bristol, England, United Kingdom"],
  ["Nottingham", "1006965", "Nottingham, Nottingham, England, United Kingdom"],
  [
    "Southampton",
    "1007089",
    "Southampton, Southampton, England, United Kingdom",
  ],
  ["Reading", "1007009", "Reading, Reading, England, United Kingdom"],
  ["Edinburgh", "1007326", "Edinburgh, Scotland, United Kingdom"],
  ["Glasgow", "1007336", "Glasgow, Scotland, United Kingdom"],
  ["Liverpool", "1006884", "Liverpool, England, United Kingdom"],
  [
    "Sheffield",
    "1007064",
    "Sheffield, South Yorkshire, England, United Kingdom",
  ],
  ["Newcastle", "9258525", "Newcastle, England, United Kingdom"],
  ["Cardiff", "1007416", "Cardiff, Wales, United Kingdom"],
  ["Belfast", "1007274", "Belfast, Northern Ireland, United Kingdom"],
].map(([city, criterionId, canonicalName]) => ({
  city,
  criterionId,
  canonicalName,
  countryCode: "GB",
  targetType: "City",
  status: "Active",
  verifiedAgainst: `Google Ads geo-target CSV ${GEO_DATASET_DATE}`,
}));

const formats = [
  ["Competitive experiences", "Darts", "darts", "darts near me"],
  [
    "Performance and dance",
    "Line dancing",
    "line dancing",
    "line dancing near me",
  ],
  [
    "Performance and dance",
    "Salsa classes",
    "salsa classes",
    "salsa classes near me",
  ],
  [
    "Tabletop and games",
    "Board-game cafes",
    "board game cafe",
    "board game cafe near me",
  ],
  [
    "Craft and making",
    "Pottery painting",
    "pottery painting",
    "pottery painting near me",
  ],
  [
    "Craft and making",
    "Pottery classes",
    "pottery classes",
    "pottery classes near me",
  ],
  [
    "Tabletop and games",
    "Dungeons & Dragons",
    "dungeons and dragons",
    "dungeons and dragons near me",
  ],
  [
    "Craft and making",
    "Sewing classes",
    "sewing classes",
    "sewing classes near me",
  ],
  ["Food and drink", "Wine tasting", "wine tasting", "wine tasting near me"],
  [
    "Performance and dance",
    "Acting classes",
    "acting classes",
    "acting classes near me",
  ],
  ["Tabletop and games", "Quiz nights", "quiz night", "quiz night near me"],
  [
    "Racket and team sport",
    "Volleyball",
    "volleyball clubs",
    "volleyball clubs near me",
  ],
  [
    "Racket and team sport",
    "Netball",
    "netball clubs",
    "netball clubs near me",
  ],
  [
    "Outdoor and endurance",
    "Running clubs",
    "running clubs",
    "running clubs near me",
  ],
  ["Tabletop and games", "Chess clubs", "chess club", "chess club near me"],
  [
    "Wellness, spa and retreats",
    "Yoga retreats",
    "yoga retreats",
    "yoga retreat near me",
  ],
  ["Racket and team sport", "Padel", "padel", "padel near me"],
  [
    "Food and drink",
    "Cooking classes",
    "cooking classes",
    "cooking classes near me",
  ],
  [
    "Nature and animals",
    "Nature walks",
    "nature walks",
    "nature walks near me",
  ],
  [
    "Social and relationship",
    "Speed dating",
    "speed dating",
    "speed dating near me",
  ],
  ["Performance and dance", "Karaoke", "karaoke", "karaoke near me"],
  [
    "Wellness, spa and retreats",
    "Spa retreats",
    "spa retreats",
    "spa retreat near me",
  ],
  [
    "Craft and making",
    "General art workshops",
    "art workshops",
    "art workshops near me",
  ],
  [
    "Craft and making",
    "Sip and paint",
    "sip and paint",
    "sip and paint near me",
  ],
].map(([family, format, explicitPhrase, localPhrase]) => ({
  family,
  format,
  explicitPhrase,
  localPhrase,
}));

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

function itemMap(items) {
  return new Map(items.map((item) => [normalized(item.keyword), item]));
}

function normalizeResponse(response, items, geographyMethod, fallbackCity) {
  const metadata = itemMap(items);

  return metricsRows(response).map((result) => {
    const candidates = [result.keyword, ...result.closeVariants].map(
      normalized,
    );
    const matches = [
      ...new Map(
        candidates
          .map((candidate) => metadata.get(candidate))
          .filter(Boolean)
          .map((item) => [normalized(item.keyword), item]),
      ).values(),
    ];
    const formatsForRow = [...new Set(matches.map((item) => item.format))];
    const citiesForRow = [
      ...new Set(matches.map((item) => item.city).filter(Boolean)),
    ];
    const first = matches[0] ?? {};

    return {
      city: citiesForRow.length === 1 ? citiesForRow[0] : fallbackCity,
      family: first.family ?? "unresolved",
      format:
        formatsForRow.length === 1
          ? formatsForRow[0]
          : formatsForRow.length > 1
            ? "cross_format_grouping"
            : "unresolved",
      submitted_keyword: first.keyword ?? result.keyword,
      grouped_submitted_keywords: matches.map((item) => item.keyword),
      returned_keyword: result.keyword,
      close_variants: result.closeVariants,
      average_monthly_searches: result.averageMonthlySearches,
      competition: result.competition,
      competition_index: result.competitionIndex,
      average_cpc_gbp: money(result.averageCpcMicros),
      low_top_of_page_gbp: money(result.lowTopOfPageBidMicros),
      high_top_of_page_gbp: money(result.highTopOfPageBidMicros),
      monthly_search_volumes: monthlySeries(result.monthlySearchVolumes),
      geography_method: geographyMethod,
      observed_at: OBSERVED_AT,
    };
  });
}

function summarize(detailRows) {
  const index = new Map(
    detailRows
      .filter(
        (row) =>
          row.format !== "unresolved" && row.format !== "cross_format_grouping",
      )
      .map((row) => [`${row.geography_method}|${row.city}|${row.format}`, row]),
  );

  const rows = cities.flatMap((city) =>
    formats.map((format) => {
      const explicit = index.get(
        `explicit_city_query_under_uk_target|${city.city}|${format.format}`,
      );
      const local = index.get(
        `generic_query_inside_local_geo_target|${city.city}|${format.format}`,
      );
      return {
        city: city.city,
        family: format.family,
        format: format.format,
        explicit_keyword: `${format.explicitPhrase} ${city.city}`,
        explicit_average_monthly_searches:
          explicit?.average_monthly_searches ?? 0,
        explicit_average_cpc_gbp: explicit?.average_cpc_gbp ?? "0.0000",
        explicit_competition_index: explicit?.competition_index ?? 0,
        local_geo_keyword: format.localPhrase,
        local_geo_average_monthly_searches:
          local?.average_monthly_searches ?? 0,
        local_geo_average_cpc_gbp: local?.average_cpc_gbp ?? "0.0000",
        local_geo_competition_index: local?.competition_index ?? 0,
        evidence_note:
          "Separate overlapping signals; do not add explicit and local-geo searches",
        observed_at: OBSERVED_AT,
      };
    }),
  );

  const explicitValues = rows
    .map((row) => row.explicit_average_monthly_searches)
    .sort((left, right) => right - left);
  const localValues = rows
    .map((row) => row.local_geo_average_monthly_searches)
    .sort((left, right) => right - left);
  const explicitMax = explicitValues[0] || 1;
  const localMax = localValues[0] || 1;

  return rows
    .map((row) => ({
      ...row,
      comparative_liquidity_index_100: Math.round(
        50 *
          (Math.log1p(row.explicit_average_monthly_searches) /
            Math.log1p(explicitMax)) +
          50 *
            (Math.log1p(row.local_geo_average_monthly_searches) /
              Math.log1p(localMax)),
      ),
      index_method:
        "50% log-normalized explicit-city volume plus 50% log-normalized local-geo volume; comparison only",
    }))
    .sort(
      (left, right) =>
        right.comparative_liquidity_index_100 -
          left.comparative_liquidity_index_100 ||
        left.city.localeCompare(right.city) ||
        left.format.localeCompare(right.format),
    )
    .map((row, index) => ({ rank: index + 1, ...row }));
}

const explicitItems = cities.flatMap((city) =>
  formats.map((format) => ({
    ...format,
    city: city.city,
    keyword: `${format.explicitPhrase} ${city.city}`,
  })),
);
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
  const items = formats.map((format) => ({
    ...format,
    city: city.city,
    keyword: format.localPhrase,
  }));
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
  "family",
  "format",
  "submitted_keyword",
  "grouped_submitted_keywords",
  "returned_keyword",
  "close_variants",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "monthly_search_volumes",
  "geography_method",
  "observed_at",
];
const summaryColumns = [
  "rank",
  "city",
  "family",
  "format",
  "explicit_keyword",
  "explicit_average_monthly_searches",
  "explicit_average_cpc_gbp",
  "explicit_competition_index",
  "local_geo_keyword",
  "local_geo_average_monthly_searches",
  "local_geo_average_cpc_gbp",
  "local_geo_competition_index",
  "comparative_liquidity_index_100",
  "index_method",
  "evidence_note",
  "observed_at",
];
const geographyColumns = [
  "city",
  "criterionId",
  "canonicalName",
  "countryCode",
  "targetType",
  "status",
  "verifiedAgainst",
];
const summaryRows = summarize([...explicitRows, ...localRows]);

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-city-explicit-screen.csv"),
  toCsv(detailColumns, explicitRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-city-local-geo-screen.csv"),
  toCsv(detailColumns, localRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-city-summary.csv"),
  toCsv(summaryColumns, summaryRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-city-geo-targets.csv"),
  toCsv(geographyColumns, cities),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-event-format-city-depth-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      geoDatasetDate: GEO_DATASET_DATE,
      methods: [
        "explicit_city_query_under_uk_target",
        "generic_query_inside_local_geo_target",
      ],
      formats,
      cities,
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
  `Wrote ${explicitRows.length} explicit rows, ${localRows.length} local-geo rows and ${summaryRows.length} city-format comparisons.`,
);
