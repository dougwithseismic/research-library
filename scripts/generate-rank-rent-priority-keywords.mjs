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
  "publications/rank-and-rent-uk-2026/evidence",
);
const PRIVATE_DIRECTORY = join(
  process.cwd(),
  "private-data/rank-and-rent-uk-2026",
);

const clusters = [
  {
    id: "edinburgh_commercial_cleaning",
    city: "Edinburgh",
    geoCriterionId: "1007326",
    phrases: [
      "commercial cleaning",
      "office cleaning",
      "contract cleaning",
      "commercial cleaners",
      "office cleaners",
      "commercial cleaning company",
    ],
  },
  {
    id: "manchester_fire_risk_assessment",
    city: "Manchester",
    geoCriterionId: "1006912",
    phrases: [
      "fire risk assessment",
      "fire risk assessor",
      "commercial fire risk assessment",
      "fire risk assessment cost",
      "fire risk assessment company",
      "fire safety risk assessment",
    ],
  },
  {
    id: "manchester_asbestos_survey",
    city: "Manchester",
    geoCriterionId: "1006912",
    phrases: [
      "asbestos survey",
      "asbestos surveyor",
      "asbestos survey cost",
      "refurbishment asbestos survey",
      "management asbestos survey",
      "asbestos testing",
    ],
  },
  {
    id: "bristol_drain_unblocking",
    city: "Bristol",
    geoCriterionId: "1006567",
    phrases: [
      "drain unblocking",
      "blocked drain",
      "drain clearance",
      "emergency drain unblocking",
      "drain jetting",
      "cctv drain survey",
    ],
  },
  {
    id: "bristol_loft_conversion",
    city: "Bristol",
    geoCriterionId: "1006567",
    phrases: [
      "loft conversion",
      "loft conversion company",
      "loft conversion cost",
      "dormer loft conversion",
      "loft conversion builders",
      "attic conversion",
    ],
  },
  {
    id: "edinburgh_boiler_installation",
    city: "Edinburgh",
    geoCriterionId: "1007326",
    phrases: [
      "boiler installation",
      "new boiler",
      "boiler replacement",
      "boiler installer",
      "combi boiler installation",
      "boiler quote",
    ],
  },
  {
    id: "nottingham_garage_door_repair",
    city: "Nottingham",
    geoCriterionId: "1006965",
    phrases: [
      "garage door repair",
      "garage door repairs",
      "garage door company",
      "garage door replacement",
      "electric garage door repair",
      "garage door installers",
    ],
  },
];

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

function normalized(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

function metadataMap(items) {
  return new Map(items.map((item) => [normalized(item.keyword), item]));
}

function normalizeResponse(response, metadata, geographyMethod) {
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
    const first = matches[0] ?? {
      cluster: "unresolved",
      city: "unresolved",
      keyword: result.keyword,
    };
    return {
      cluster: first.cluster,
      city: first.city,
      submitted_keyword: first.keyword,
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

const explicitItems = clusters.flatMap((cluster) =>
  cluster.phrases.map((phrase) => ({
    cluster: cluster.id,
    city: cluster.city,
    keyword: `${phrase} ${cluster.city}`,
  })),
);
const explicitResponse = await fetchMetrics(
  explicitItems.map((item) => item.keyword),
  DEFAULT_GEO_TARGET_IDS,
);
const explicitRows = normalizeResponse(
  explicitResponse,
  metadataMap(explicitItems),
  "explicit_city_query_under_uk_target",
);

const localRows = [];
const privateLocalResponses = [];
for (const [geoCriterionId, geoClusters] of Map.groupBy(
  clusters,
  (cluster) => cluster.geoCriterionId,
)) {
  const items = geoClusters.flatMap((cluster) =>
    cluster.phrases.map((phrase) => ({
      cluster: cluster.id,
      city: cluster.city,
      keyword: phrase,
    })),
  );
  const response = await fetchMetrics(
    items.map((item) => item.keyword),
    [geoCriterionId],
  );
  const rows = normalizeResponse(
    response,
    metadataMap(items),
    "generic_query_inside_local_geo_target",
  );
  localRows.push(...rows);
  privateLocalResponses.push({ geoCriterionId, rows });
}

const columns = [
  "cluster",
  "city",
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

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-priority-intent-screen.csv"),
  toCsv(columns, explicitRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-priority-local-geo-intent-screen.csv"),
  toCsv(columns, localRows),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-priority-intent-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      apiVersion: explicitResponse.apiVersion,
      languageId: explicitResponse.languageId,
      network: "GOOGLE_SEARCH",
      currency: "GBP",
      explicitGeoTargetIds: explicitResponse.geoTargetIds,
      clusters,
      explicitRows,
      localGeoResponses: privateLocalResponses,
      limitations: [
        "Customer and login-customer identifiers were removed.",
        "Explicit place-name queries and generic queries inside local geo targets overlap and must not be added.",
        "Google can group close variants; grouped submitted phrases are one returned observation.",
        "CPC, competition and bid ranges describe the paid auction rather than organic difficulty, lead value or profit.",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Wrote ${explicitRows.length} explicit priority rows and ${localRows.length} local-geo priority rows without account identifiers.`,
);
