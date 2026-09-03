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
    city: "London",
    criterionId: "1006886",
    canonicalName: "London, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Birmingham",
    criterionId: "1006524",
    canonicalName: "Birmingham, West Midlands, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Manchester",
    criterionId: "1006912",
    canonicalName: "Manchester, Manchester, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Leeds",
    criterionId: "1006864",
    canonicalName: "Leeds, West Yorkshire, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Bristol",
    criterionId: "1006567",
    canonicalName: "Bristol, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Nottingham",
    criterionId: "1006965",
    canonicalName: "Nottingham, Nottingham, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Southampton",
    criterionId: "1007089",
    canonicalName: "Southampton, Southampton, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Reading",
    criterionId: "1007009",
    canonicalName: "Reading, Reading, England, United Kingdom",
    targetType: "City",
    status: "Active",
  },
  {
    city: "Edinburgh",
    criterionId: "1007326",
    canonicalName: "Edinburgh, Scotland, United Kingdom",
    targetType: "City",
    status: "Active",
  },
];

const localPhrases = [
  { category: "friendship_discovery", phrase: "social events" },
  { category: "friendship_discovery", phrase: "social events near me" },
  { category: "friendship_discovery", phrase: "meet new people" },
  { category: "friendship_discovery", phrase: "make new friends" },
  { category: "friendship_discovery", phrase: "social groups near me" },
  { category: "friendship_discovery", phrase: "dinner with strangers" },
  { category: "interest_led", phrase: "public lectures" },
  { category: "interest_led", phrase: "live talks" },
  { category: "interest_led", phrase: "book club" },
  { category: "interest_led", phrase: "reading club" },
  { category: "interest_led", phrase: "board game cafe" },
  { category: "interest_led", phrase: "chess club" },
  { category: "interest_led", phrase: "pottery classes" },
  { category: "interest_led", phrase: "pottery painting" },
  { category: "interest_led", phrase: "social sports" },
  { category: "dating", phrase: "speed dating" },
  { category: "dating", phrase: "singles events" },
  { category: "dating", phrase: "singles nights" },
  { category: "broad_discovery", phrase: "things to do" },
  { category: "broad_discovery", phrase: "events near me" },
];

const explicitPhrases = [
  { category: "friendship_discovery", phrase: "social events" },
  { category: "friendship_discovery", phrase: "meet new people" },
  { category: "friendship_discovery", phrase: "make new friends" },
  { category: "friendship_discovery", phrase: "social groups" },
  { category: "friendship_discovery", phrase: "dinner with strangers" },
  { category: "interest_led", phrase: "public lectures" },
  { category: "interest_led", phrase: "live talks" },
  { category: "interest_led", phrase: "book club" },
  { category: "interest_led", phrase: "board game cafe" },
  { category: "interest_led", phrase: "chess club" },
  { category: "interest_led", phrase: "pottery classes" },
  { category: "interest_led", phrase: "pottery painting" },
  { category: "interest_led", phrase: "social sports" },
  { category: "dating", phrase: "speed dating" },
  { category: "dating", phrase: "singles events" },
  { category: "dating", phrase: "singles nights" },
  { category: "broad_discovery", phrase: "things to do" },
  { category: "broad_discovery", phrase: "events" },
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
    const categories = [...new Set(matches.map((item) => item.category))];
    const citiesForRow = [
      ...new Set(matches.map((item) => item.city).filter(Boolean)),
    ];
    const first = matches[0] ?? {};

    return {
      city: citiesForRow.length === 1 ? citiesForRow[0] : fallbackCity,
      category:
        categories.length === 1
          ? categories[0]
          : categories.length > 1
            ? "cross_category_grouping"
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

function summarize(rows) {
  const groups = Map.groupBy(
    rows.filter(
      (row) =>
        row.category !== "unresolved" &&
        row.category !== "cross_category_grouping",
    ),
    (row) => `${row.geography_method}|${row.city}|${row.category}`,
  );

  return [...groups.values()]
    .map((group) => {
      const first = group[0];
      const searches = group.reduce(
        (total, row) => total + row.average_monthly_searches,
        0,
      );
      const cpcValue = group.reduce(
        (total, row) =>
          total + row.average_monthly_searches * Number(row.average_cpc_gbp),
        0,
      );
      return {
        geography_method: first.geography_method,
        city: first.city,
        category: first.category,
        returned_rows: group.length,
        zero_volume_rows: group.filter(
          (row) => row.average_monthly_searches === 0,
        ).length,
        average_monthly_searches: searches,
        weighted_average_cpc_gbp: searches
          ? (cpcValue / searches).toFixed(4)
          : "0.0000",
        interpretation:
          first.category === "broad_discovery"
            ? "Context only; excluded from the commercial opportunity score"
            : "Directional comparison basket; overlapping and mixed-intent terms are not a market-size total",
        observed_at: OBSERVED_AT,
      };
    })
    .sort(
      (left, right) =>
        left.geography_method.localeCompare(right.geography_method) ||
        left.city.localeCompare(right.city) ||
        left.category.localeCompare(right.category),
    );
}

const explicitItems = cities.flatMap((city) =>
  explicitPhrases.map((item) => ({
    ...item,
    city: city.city,
    keyword: `${item.phrase} ${city.city}`,
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
  const items = localPhrases.map((item) => ({
    ...item,
    city: city.city,
    keyword: item.phrase,
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
  "category",
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
  "geography_method",
  "city",
  "category",
  "returned_rows",
  "zero_volume_rows",
  "average_monthly_searches",
  "weighted_average_cpc_gbp",
  "interpretation",
  "observed_at",
];
const geographyColumns = [
  "city",
  "criterionId",
  "canonicalName",
  "targetType",
  "status",
];

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "city-demand-explicit-screen.csv"),
  toCsv(detailColumns, explicitRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "city-demand-local-geo-screen.csv"),
  toCsv(detailColumns, localRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "city-demand-summary.csv"),
  toCsv(summaryColumns, summarize([...explicitRows, ...localRows])),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "city-geo-targets.csv"),
  toCsv(geographyColumns, cities),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-city-demand-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      methods: [
        "explicit_city_query_under_uk_target",
        "generic_query_inside_local_geo_target",
      ],
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
  `Wrote ${explicitRows.length} explicit rows, ${localRows.length} local-geo rows and ${summarize([...explicitRows, ...localRows]).length} summary rows.`,
);
