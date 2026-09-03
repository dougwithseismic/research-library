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
const RUN_LOCAL_GEO = process.argv.includes("--local-geo");
const PUBLIC_EVIDENCE_DIRECTORY = join(
  process.cwd(),
  "publications/rank-and-rent-uk-2026/evidence",
);
const PRIVATE_DATA_DIRECTORY = join(
  process.cwd(),
  "private-data/rank-and-rent-uk-2026",
);

const cities = [
  "London",
  "Birmingham",
  "Manchester",
  "Glasgow",
  "Leeds",
  "Liverpool",
  "Bristol",
  "Sheffield",
  "Edinburgh",
  "Cardiff",
  "Nottingham",
  "Newcastle",
  "Leicester",
  "Southampton",
  "Brighton",
  "Coventry",
  "Belfast",
  "Reading",
  "Oxford",
  "Cambridge",
  "Aberdeen",
  "Plymouth",
  "Exeter",
  "Norwich",
  "Swansea",
  "York",
];

const niches = [
  {
    id: "emergency_plumber",
    phrase: "emergency plumber",
    lane: "urgent_trade",
  },
  { id: "drain_unblocking", phrase: "drain unblocking", lane: "urgent_trade" },
  {
    id: "emergency_locksmith",
    phrase: "emergency locksmith",
    lane: "urgent_trade",
  },
  { id: "roof_repair", phrase: "roof repair", lane: "planned_trade" },
  { id: "tree_surgeon", phrase: "tree surgeon", lane: "planned_trade" },
  { id: "pest_control", phrase: "pest control", lane: "urgent_trade" },
  { id: "house_clearance", phrase: "house clearance", lane: "planned_trade" },
  { id: "removal_company", phrase: "removal company", lane: "planned_trade" },
  { id: "skip_hire", phrase: "skip hire", lane: "planned_trade" },
  {
    id: "solar_panel_installers",
    phrase: "solar panel installers",
    lane: "high_ticket_home",
  },
  {
    id: "ev_charger_installation",
    phrase: "ev charger installation",
    lane: "high_ticket_home",
  },
  {
    id: "air_conditioning_installation",
    phrase: "air conditioning installation",
    lane: "high_ticket_home",
  },
  { id: "damp_proofing", phrase: "damp proofing", lane: "high_ticket_home" },
  {
    id: "asbestos_survey",
    phrase: "asbestos survey",
    lane: "specialist_compliance",
  },
  {
    id: "fire_risk_assessment",
    phrase: "fire risk assessment",
    lane: "specialist_compliance",
  },
  {
    id: "commercial_cleaning",
    phrase: "commercial cleaning",
    lane: "b2b_recurring",
  },
  {
    id: "garage_door_repair",
    phrase: "garage door repair",
    lane: "planned_trade",
  },
  {
    id: "emergency_glazier",
    phrase: "emergency glazier",
    lane: "urgent_trade",
  },
  {
    id: "dental_implants",
    phrase: "dental implants",
    lane: "regulated_health",
  },
  {
    id: "private_adhd_assessment",
    phrase: "private adhd assessment",
    lane: "regulated_health",
  },
  {
    id: "mortgage_broker",
    phrase: "mortgage broker",
    lane: "regulated_finance",
  },
  {
    id: "personal_injury_solicitor",
    phrase: "personal injury solicitor",
    lane: "regulated_legal",
  },
  {
    id: "funeral_directors",
    phrase: "funeral directors",
    lane: "sensitive_service",
  },
  { id: "self_storage", phrase: "self storage", lane: "local_inventory" },
  {
    id: "cctv_installation",
    phrase: "cctv installation",
    lane: "specialist_installation",
  },
  { id: "scaffolding", phrase: "scaffolding", lane: "specialist_trade" },
  {
    id: "resin_driveways",
    phrase: "resin driveways",
    lane: "high_ticket_home",
  },
  {
    id: "boiler_installation",
    phrase: "boiler installation",
    lane: "high_ticket_home",
  },
  {
    id: "heat_pump_installer",
    phrase: "heat pump installer",
    lane: "high_ticket_home",
  },
  {
    id: "spray_foam_removal",
    phrase: "spray foam removal",
    lane: "specialist_remediation",
  },
  {
    id: "loft_conversion",
    phrase: "loft conversion",
    lane: "high_ticket_home",
  },
  {
    id: "bathroom_fitters",
    phrase: "bathroom fitters",
    lane: "high_ticket_home",
  },
  {
    id: "water_damage_restoration",
    phrase: "water damage restoration",
    lane: "urgent_remediation",
  },
  { id: "appliance_repair", phrase: "appliance repair", lane: "planned_trade" },
  {
    id: "conservatory_roof_replacement",
    phrase: "conservatory roof replacement",
    lane: "high_ticket_home",
  },
];

const localGeographies = [
  {
    city: "London",
    criterion_id: "1006886",
    canonical_name: "London, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Birmingham",
    criterion_id: "1006524",
    canonical_name: "Birmingham, West Midlands, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Manchester",
    criterion_id: "1006912",
    canonical_name: "Manchester, Manchester, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Leeds",
    criterion_id: "1006864",
    canonical_name: "Leeds, West Yorkshire, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Bristol",
    criterion_id: "1006567",
    canonical_name: "Bristol, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Nottingham",
    criterion_id: "1006965",
    canonical_name: "Nottingham, Nottingham, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Southampton",
    criterion_id: "1007089",
    canonical_name: "Southampton, Southampton, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Reading",
    criterion_id: "1007009",
    canonical_name: "Reading, Reading, England, United Kingdom",
    target_type: "City",
    status: "Active",
  },
  {
    city: "Edinburgh",
    criterion_id: "1007326",
    canonical_name: "Edinburgh, Scotland, United Kingdom",
    target_type: "City",
    status: "Active",
  },
];

const localGeoNicheIds = new Set([
  "emergency_plumber",
  "drain_unblocking",
  "emergency_locksmith",
  "roof_repair",
  "tree_surgeon",
  "pest_control",
  "house_clearance",
  "commercial_cleaning",
  "garage_door_repair",
  "asbestos_survey",
  "fire_risk_assessment",
  "boiler_installation",
  "spray_foam_removal",
  "loft_conversion",
  "resin_driveways",
  "bathroom_fitters",
]);

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

function weightedAverage(rows, valueField) {
  const volume = rows.reduce(
    (total, row) => total + row.average_monthly_searches,
    0,
  );
  if (!volume) return 0;
  return (
    rows.reduce(
      (total, row) =>
        total + row.average_monthly_searches * Number(row[valueField]),
      0,
    ) / volume
  );
}

function normalized(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchLocalMetrics(keywords, geoTargetIds) {
  // Historical-metrics calls have a low short-window operation allowance on
  // this account. Space local markets apart and retry a transient quota hit
  // once instead of discarding an otherwise reproducible market screen.
  await pause(1_500);
  try {
    return await fetchMetrics(keywords, geoTargetIds);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/RESOURCE_EXHAUSTED|quota/i.test(message)) throw error;
    await pause(10_000);
    return fetchMetrics(keywords, geoTargetIds);
  }
}

function matchedMetadata(result, metadataByKeyword) {
  const candidates = [result.keyword, ...result.closeVariants].map(normalized);
  const matches = candidates
    .map((candidate) => metadataByKeyword.get(candidate))
    .filter(Boolean);
  return [
    ...new Map(
      matches.map((match) => [normalized(match.keyword), match]),
    ).values(),
  ];
}

function metricRecord(result, metadata) {
  return {
    returned_keyword: result.keyword,
    close_variants: result.closeVariants,
    average_monthly_searches: result.averageMonthlySearches,
    competition: result.competition,
    competition_index: result.competitionIndex,
    average_cpc_gbp: money(result.averageCpcMicros),
    low_top_of_page_gbp: money(result.lowTopOfPageBidMicros),
    high_top_of_page_gbp: money(result.highTopOfPageBidMicros),
    observed_at: OBSERVED_AT,
    ...metadata,
  };
}

async function fetchMetrics(keywords, geoTargetIds = DEFAULT_GEO_TARGET_IDS) {
  const environment = requireEnvironment([
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
  ]);
  return fetchKeywordHistoricalMetrics({
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
}

loadGoogleAdsEnvironment();
mkdirSync(PUBLIC_EVIDENCE_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DATA_DIRECTORY, { recursive: true });

const cityQueries = niches.flatMap((niche) =>
  cities.map((city) => ({
    keyword: `${niche.phrase} ${city}`,
    niche: niche.id,
    niche_phrase: niche.phrase,
    lane: niche.lane,
    city,
    geography_method: "explicit_city_query_under_uk_target",
  })),
);
const cityMetadata = new Map(
  cityQueries.map((query) => [normalized(query.keyword), query]),
);
const cityResponse = await fetchMetrics(
  cityQueries.map(({ keyword }) => keyword),
);
const cityMetrics = metricsRows(cityResponse);
const cityRows = cityMetrics.map((result) => {
  const matches = matchedMetadata(result, cityMetadata);
  const metadata = matches[0] ?? {
    keyword: result.keyword,
    niche: "unresolved",
    niche_phrase: "unresolved",
    lane: "unresolved",
    city: "unresolved",
    geography_method: "explicit_city_query_under_uk_target",
  };
  return metricRecord(result, {
    submitted_keyword: metadata.keyword,
    grouped_submitted_keywords: matches.map(({ keyword }) => keyword),
    niche: metadata.niche,
    niche_phrase: metadata.niche_phrase,
    lane: metadata.lane,
    city: metadata.city,
    geography_method: metadata.geography_method,
  });
});

const nationalQueries = niches.flatMap((niche) => [
  {
    keyword: niche.phrase,
    niche: niche.id,
    niche_phrase: niche.phrase,
    lane: niche.lane,
    intent_variant: "generic_uk",
    geography_method: "generic_query_under_uk_target",
  },
  {
    keyword: `${niche.phrase} near me`,
    niche: niche.id,
    niche_phrase: niche.phrase,
    lane: niche.lane,
    intent_variant: "near_me_uk",
    geography_method: "near_me_query_under_uk_target",
  },
]);
const nationalMetadata = new Map(
  nationalQueries.map((query) => [normalized(query.keyword), query]),
);
const nationalResponse = await fetchMetrics(
  nationalQueries.map(({ keyword }) => keyword),
);
const nationalMetrics = metricsRows(nationalResponse);
const nationalRows = nationalMetrics.map((result) => {
  const matches = matchedMetadata(result, nationalMetadata);
  const metadata = matches[0] ?? {
    keyword: result.keyword,
    niche: "unresolved",
    niche_phrase: "unresolved",
    lane: "unresolved",
    intent_variant: "unresolved",
    geography_method: "uk_target_unresolved_variant",
  };
  return metricRecord(result, {
    submitted_keyword: metadata.keyword,
    grouped_submitted_keywords: matches.map(({ keyword }) => keyword),
    niche: metadata.niche,
    niche_phrase: metadata.niche_phrase,
    lane: metadata.lane,
    intent_variant: metadata.intent_variant,
    geography_method: metadata.geography_method,
  });
});

const localGeoNiches = niches.filter((niche) => localGeoNicheIds.has(niche.id));
const localGeoRows = [];
const localGeoPrivateResults = [];
for (const geography of RUN_LOCAL_GEO ? localGeographies : []) {
  const metadataByKeyword = new Map(
    localGeoNiches.map((niche) => [
      normalized(niche.phrase),
      { ...niche, keyword: niche.phrase },
    ]),
  );
  const response = await fetchLocalMetrics(
    localGeoNiches.map(({ phrase }) => phrase),
    [geography.criterion_id],
  );
  const results = metricsRows(response);
  results.forEach((result) => {
    const matches = matchedMetadata(result, metadataByKeyword);
    const niche = matches[0] ?? {
      id: "unresolved",
      phrase: result.keyword,
      lane: "unresolved",
    };
    const row = metricRecord(result, {
      submitted_keyword: niche.phrase,
      grouped_submitted_keywords: matches.map(({ phrase }) => phrase),
      niche: niche.id,
      niche_phrase: niche.phrase,
      lane: niche.lane,
      city: geography.city,
      geo_criterion_id: geography.criterion_id,
      geo_canonical_name: geography.canonical_name,
      geo_target_type: geography.target_type,
      geo_status: geography.status,
      geography_method: "generic_query_inside_local_geo_target",
    });
    localGeoRows.push(row);
    localGeoPrivateResults.push({
      ...row,
      monthly_search_volumes: result.monthlySearchVolumes,
    });
  });
}

const cityColumns = [
  "submitted_keyword",
  "returned_keyword",
  "grouped_submitted_keywords",
  "close_variants",
  "niche",
  "niche_phrase",
  "lane",
  "city",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "geography_method",
  "observed_at",
];
const nationalColumns = [
  "submitted_keyword",
  "returned_keyword",
  "grouped_submitted_keywords",
  "close_variants",
  "niche",
  "niche_phrase",
  "lane",
  "intent_variant",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "geography_method",
  "observed_at",
];
const localGeoColumns = [
  "submitted_keyword",
  "returned_keyword",
  "grouped_submitted_keywords",
  "close_variants",
  "niche",
  "niche_phrase",
  "lane",
  "city",
  "geo_criterion_id",
  "geo_canonical_name",
  "geo_target_type",
  "geo_status",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "geography_method",
  "observed_at",
];

const nicheSummary = niches.map((niche) => {
  const rows = cityRows.filter((row) => row.niche === niche.id);
  const ordered = [...rows].sort((a, b) => {
    const aProxy = a.average_monthly_searches * Number(a.average_cpc_gbp);
    const bProxy = b.average_monthly_searches * Number(b.average_cpc_gbp);
    return bProxy - aProxy;
  });
  const volume = rows.reduce(
    (total, row) => total + row.average_monthly_searches,
    0,
  );
  return {
    niche: niche.id,
    niche_phrase: niche.phrase,
    lane: niche.lane,
    sampled_city_searches: volume,
    cities_with_reportable_volume: rows.filter(
      (row) => row.average_monthly_searches > 0,
    ).length,
    weighted_average_cpc_gbp: weightedAverage(rows, "average_cpc_gbp").toFixed(
      4,
    ),
    weighted_high_top_of_page_gbp: weightedAverage(
      rows,
      "high_top_of_page_gbp",
    ).toFixed(4),
    paid_search_value_proxy_gbp: rows
      .reduce(
        (total, row) =>
          total + row.average_monthly_searches * Number(row.average_cpc_gbp),
        0,
      )
      .toFixed(2),
    top_city_by_proxy: ordered[0]?.city ?? "",
    top_city_volume: ordered[0]?.average_monthly_searches ?? 0,
    top_city_average_cpc_gbp: ordered[0]?.average_cpc_gbp ?? "0.0000",
    top_five_cities_by_proxy: ordered
      .slice(0, 5)
      .map((row) => row.city)
      .join("|"),
    observed_at: OBSERVED_AT,
  };
});

const citySummary = cities.map((city) => {
  const rows = cityRows.filter((row) => row.city === city);
  const ordered = [...rows].sort((a, b) => {
    const aProxy = a.average_monthly_searches * Number(a.average_cpc_gbp);
    const bProxy = b.average_monthly_searches * Number(b.average_cpc_gbp);
    return bProxy - aProxy;
  });
  return {
    city,
    sampled_basket_searches: rows.reduce(
      (total, row) => total + row.average_monthly_searches,
      0,
    ),
    niches_with_reportable_volume: rows.filter(
      (row) => row.average_monthly_searches > 0,
    ).length,
    weighted_average_cpc_gbp: weightedAverage(rows, "average_cpc_gbp").toFixed(
      4,
    ),
    paid_search_value_proxy_gbp: rows
      .reduce(
        (total, row) =>
          total + row.average_monthly_searches * Number(row.average_cpc_gbp),
        0,
      )
      .toFixed(2),
    top_five_niches_by_proxy: ordered
      .slice(0, 5)
      .map((row) => row.niche)
      .join("|"),
    observed_at: OBSERVED_AT,
  };
});

writeFileSync(
  join(PUBLIC_EVIDENCE_DIRECTORY, "google-ads-explicit-city-screen.csv"),
  toCsv(cityColumns, cityRows),
);
writeFileSync(
  join(PUBLIC_EVIDENCE_DIRECTORY, "google-ads-national-intent-screen.csv"),
  toCsv(nationalColumns, nationalRows),
);
if (RUN_LOCAL_GEO) {
  writeFileSync(
    join(PUBLIC_EVIDENCE_DIRECTORY, "google-ads-local-geo-screen.csv"),
    toCsv(localGeoColumns, localGeoRows),
  );
}
writeFileSync(
  join(PUBLIC_EVIDENCE_DIRECTORY, "google-ads-niche-summary.csv"),
  toCsv(Object.keys(nicheSummary[0]), nicheSummary),
);
writeFileSync(
  join(PUBLIC_EVIDENCE_DIRECTORY, "google-ads-city-summary.csv"),
  toCsv(Object.keys(citySummary[0]), citySummary),
);

const sanitizedSnapshot = {
  observedAt: OBSERVED_AT,
  apiVersion: cityResponse.apiVersion,
  languageId: cityResponse.languageId,
  geoTargetIds: cityResponse.geoTargetIds,
  network: "GOOGLE_SEARCH",
  currency: "GBP",
  cityQueries,
  nationalQueries,
  localGeographies,
  localGeoNicheIds: [...localGeoNicheIds],
  cityResults: cityRows.map((row, index) => ({
    ...row,
    monthly_search_volumes: cityMetrics[index]?.monthlySearchVolumes ?? [],
  })),
  nationalResults: nationalRows.map((row, index) => ({
    ...row,
    monthly_search_volumes: nationalMetrics[index]?.monthlySearchVolumes ?? [],
  })),
  localGeoResults: localGeoPrivateResults,
  limitations: [
    "Customer and login-customer identifiers were removed from this retained snapshot.",
    "Average monthly searches are rounded historical averages, not traffic forecasts.",
    "Explicit city queries under the UK target and generic UK queries overlap and must not be added together.",
    "Paid competition and CPC do not measure organic ranking difficulty or lead profitability.",
  ],
};
writeFileSync(
  join(PRIVATE_DATA_DIRECTORY, "google-ads-rank-rent-screen-sanitized.json"),
  `${JSON.stringify(sanitizedSnapshot, null, 2)}\n`,
);

console.log(
  `Wrote ${cityRows.length} explicit-city rows, ${nationalRows.length} national-intent rows, ${localGeoRows.length} local-geo rows, ${nicheSummary.length} niche summaries, and ${citySummary.length} city summaries without account identifiers.`,
);
