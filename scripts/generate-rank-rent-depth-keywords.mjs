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

const serviceClusters = [
  {
    id: "manchester_fire_risk_assessment",
    city: "Manchester",
    geoCriterionId: "1006912",
    phrases: [
      "fire risk assessment",
      "fire risk assessor",
      "commercial fire risk assessment",
      "landlord fire risk assessment",
      "hmo fire risk assessment",
      "fire risk assessment cost",
      "fire risk assessment company",
      "fire safety risk assessment",
      "workplace fire risk assessment",
      "office fire risk assessment",
      "fire risk assessment quote",
      "fire safety consultant",
    ],
  },
  {
    id: "manchester_asbestos_survey",
    city: "Manchester",
    geoCriterionId: "1006912",
    phrases: [
      "asbestos survey",
      "asbestos surveyor",
      "asbestos testing",
      "asbestos inspection",
      "asbestos survey cost",
      "management asbestos survey",
      "refurbishment asbestos survey",
      "demolition asbestos survey",
      "commercial asbestos survey",
      "asbestos sampling",
      "asbestos testing company",
      "asbestos survey quote",
    ],
  },
  {
    id: "bristol_drainage",
    city: "Bristol",
    geoCriterionId: "1006567",
    phrases: [
      "drain unblocking",
      "blocked drain",
      "emergency drain unblocking",
      "drain clearance",
      "drain cleaning",
      "drain jetting",
      "cctv drain survey",
      "drain repair",
      "collapsed drain repair",
      "sewer unblocking",
      "drain company",
      "drainage engineer",
      "blocked toilet",
      "blocked sink",
    ],
  },
  {
    id: "edinburgh_boiler_installation",
    city: "Edinburgh",
    geoCriterionId: "1007326",
    phrases: [
      "boiler installation",
      "boiler replacement",
      "new boiler",
      "combi boiler installation",
      "boiler installer",
      "boiler installation cost",
      "new boiler cost",
      "boiler quote",
      "gas boiler replacement",
      "boiler finance",
      "boiler company",
      "boiler fitters",
      "worcester boiler installation",
      "vaillant boiler installation",
    ],
  },
];

const buyerClusters = [
  {
    id: "lead_purchase",
    phrases: [
      "buy leads",
      "buy business leads",
      "exclusive leads",
      "pay per lead",
      "pay per call leads",
      "local service leads",
      "home improvement leads",
      "contractor leads",
      "tradesman leads",
      "trade leads",
    ],
  },
  {
    id: "vertical_leads",
    phrases: [
      "plumber leads",
      "plumbing leads",
      "boiler leads",
      "heating leads",
      "roofing leads",
      "drainage leads",
      "asbestos survey leads",
      "fire risk assessment leads",
      "builder leads",
      "cleaning leads",
      "house clearance leads",
      "garage door leads",
    ],
  },
  {
    id: "trade_marketing",
    phrases: [
      "lead generation for tradesmen",
      "lead generation for plumbers",
      "marketing for tradesmen",
      "marketing for plumbers",
      "seo for tradesmen",
      "seo for plumbers",
      "local seo for tradesmen",
      "local seo for plumbers",
      "google ads for tradesmen",
      "google ads for plumbers",
      "digital marketing for tradesmen",
      "trade marketing agency",
    ],
  },
];

const platformClusters = [
  {
    id: "trade_directories",
    phrases: [
      "checkatrade",
      "trustatrader",
      "rated people",
      "mybuilder",
      "bookabuilder",
      "hamuch",
      "which trusted traders",
      "federation of master builders",
    ],
  },
  {
    id: "broad_marketplaces",
    phrases: [
      "bark.com",
      "bark professionals",
      "airtasker",
      "taskrabbit",
      "houzz pro",
    ],
  },
  {
    id: "search_and_agency",
    phrases: [
      "yell business",
      "google local services ads",
      "local services ads",
      "google guaranteed",
    ],
  },
];

function normalized(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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
  await pause(1_750);
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
    await pause(12_000);
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
      city: "United Kingdom",
      keyword: result.keyword,
    };
    return {
      cluster: first.cluster,
      city: first.city ?? "United Kingdom",
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

function itemsFor(clusters, transform = (phrase) => phrase) {
  return clusters.flatMap((cluster) =>
    cluster.phrases.map((phrase) => ({
      cluster: cluster.id,
      city: cluster.city ?? "United Kingdom",
      keyword: transform(phrase, cluster),
    })),
  );
}

async function nationalRows(clusters, method) {
  const items = itemsFor(clusters);
  const response = await fetchMetrics(
    items.map((item) => item.keyword),
    DEFAULT_GEO_TARGET_IDS,
  );
  return {
    response,
    rows: normalizeResponse(response, metadataMap(items), method),
  };
}

function summarize(rows, method) {
  return [...Map.groupBy(rows, (row) => row.cluster)].map(
    ([cluster, clusterRows]) => {
      const searches = clusterRows.reduce(
        (sum, row) => sum + Number(row.average_monthly_searches ?? 0),
        0,
      );
      const paidValue = clusterRows.reduce(
        (sum, row) =>
          sum +
          Number(row.average_monthly_searches ?? 0) *
            Number(row.average_cpc_gbp ?? 0),
        0,
      );
      return {
        cluster,
        geography_method: method,
        returned_rows: clusterRows.length,
        average_monthly_searches: searches,
        volume_weighted_cpc_gbp: searches
          ? (paidValue / searches).toFixed(4)
          : "0.0000",
        monthly_paid_search_value_proxy_gbp: paidValue.toFixed(2),
        evidence_class: "derived",
        limitation:
          "Close variants are deduplicated within this returned cluster. Search volume and CPC are auction observations, not traffic, lead demand, price or profit.",
      };
    },
  );
}

const explicitItems = itemsFor(
  serviceClusters,
  (phrase, cluster) => `${phrase} ${cluster.city}`,
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
for (const [geoCriterionId, clusters] of Map.groupBy(
  serviceClusters,
  (cluster) => cluster.geoCriterionId,
)) {
  const items = itemsFor(clusters);
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

const buyer = await nationalRows(
  buyerClusters,
  "buyer_intent_query_under_uk_target",
);
const platforms = await nationalRows(
  platformClusters,
  "platform_brand_query_under_uk_target",
);

const rowColumns = [
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
const summaryColumns = [
  "cluster",
  "geography_method",
  "returned_rows",
  "average_monthly_searches",
  "volume_weighted_cpc_gbp",
  "monthly_paid_search_value_proxy_gbp",
  "evidence_class",
  "limitation",
];

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-priority-depth-explicit.csv"),
  toCsv(rowColumns, explicitRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-priority-depth-local-geo.csv"),
  toCsv(rowColumns, localRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-buyer-intent-screen.csv"),
  toCsv(rowColumns, buyer.rows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-platform-brand-demand.csv"),
  toCsv(rowColumns, platforms.rows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "google-ads-depth-cluster-summary.csv"),
  toCsv(summaryColumns, [
    ...summarize(explicitRows, "explicit_city_query_under_uk_target"),
    ...summarize(localRows, "generic_query_inside_local_geo_target"),
    ...summarize(buyer.rows, "buyer_intent_query_under_uk_target"),
    ...summarize(platforms.rows, "platform_brand_query_under_uk_target"),
  ]),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-depth-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      apiVersion: explicitResponse.apiVersion,
      languageId: explicitResponse.languageId,
      network: "GOOGLE_SEARCH",
      currency: "GBP",
      explicitGeoTargetIds: explicitResponse.geoTargetIds,
      serviceClusters,
      buyerClusters,
      platformClusters,
      explicitRows,
      localGeoResponses: privateLocalResponses,
      buyerRows: buyer.rows,
      platformRows: platforms.rows,
      limitations: [
        "Customer and login-customer identifiers were removed.",
        "Explicit city phrases and generic phrases inside local geos overlap and must not be added.",
        "Brand demand is attention to a named platform, not proof of professional sign-up intent.",
        "Buyer-intent queries are search observations, not a count of businesses willing to buy leads.",
        "Google can group close variants; grouped submitted phrases form one returned observation.",
        "CPC, competition and bid ranges describe the paid auction rather than organic difficulty, lead value or profit.",
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      explicitRows: explicitRows.length,
      localRows: localRows.length,
      buyerRows: buyer.rows.length,
      platformRows: platforms.rows.length,
    },
    null,
    2,
  ),
);
