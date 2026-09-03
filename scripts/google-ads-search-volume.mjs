#!/usr/bin/env node

import {
  DEFAULT_API_VERSION,
  DEFAULT_GEO_TARGET_IDS,
  DEFAULT_LANGUAGE_ID,
  fetchKeywordHistoricalMetrics,
  loadGoogleAdsEnvironment,
  metricsCsv,
  metricsRows,
  requireEnvironment,
} from "./lib/google-ads.mjs";

function usage() {
  console.log(`
Google Ads keyword search volume

Usage:
  pnpm google-ads:volume [options] "keyword one" "keyword two"

Options:
  --customer <id>         Target customer ID (default: GOOGLE_ADS_CUSTOMER_ID)
  --login-customer <id>   Manager customer ID (default: GOOGLE_ADS_LOGIN_CUSTOMER_ID)
  --geo <ids>             Comma-separated geo criterion IDs (default: 2826, United Kingdom)
  --language <id>         Language criterion ID (default: 1000, English)
  --network <google|all>  Google Search only or Search + partners (default: google)
  --include-adult         Include adult keywords
  --format <json|csv>     Output format (default: json)
  --help                  Show this help

Examples:
  pnpm google-ads:volume "accounting software" "payroll software"
  pnpm google-ads:volume --geo 2036 --language 1021 "účetní software"
  pnpm google-ads:volume --format csv "software agency bristol"
`);
}

function parseArguments(argv) {
  const options = {
    customerId: null,
    loginCustomerId: null,
    geoTargetIds: null,
    languageId: null,
    network: "GOOGLE_SEARCH",
    includeAdultKeywords: false,
    format: "json",
    keywords: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--customer") options.customerId = argv[++index];
    else if (argument === "--login-customer")
      options.loginCustomerId = argv[++index];
    else if (argument === "--geo")
      options.geoTargetIds = argv[++index]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    else if (argument === "--language") options.languageId = argv[++index];
    else if (argument === "--network") {
      const value = argv[++index];
      if (value === "google") options.network = "GOOGLE_SEARCH";
      else if (value === "all") options.network = "GOOGLE_SEARCH_AND_PARTNERS";
      else throw new Error("--network must be google or all.");
    } else if (argument === "--include-adult")
      options.includeAdultKeywords = true;
    else if (argument === "--format") {
      options.format = argv[++index];
      if (!new Set(["json", "csv"]).has(options.format))
        throw new Error("--format must be json or csv.");
    } else if (argument === "--help" || argument === "-h") {
      usage();
      process.exit(0);
    } else if (argument.startsWith("-"))
      throw new Error(`Unknown option: ${argument}`);
    else options.keywords.push(argument);
  }

  return options;
}

function configuredGeoTargetIds(value) {
  const ids = value
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids?.length ? ids : DEFAULT_GEO_TARGET_IDS;
}

try {
  loadGoogleAdsEnvironment();
  const options = parseArguments(process.argv.slice(2));
  if (!options.keywords.length) {
    usage();
    throw new Error("Provide at least one keyword.");
  }

  const environment = requireEnvironment([
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
  ]);
  const response = await fetchKeywordHistoricalMetrics({
    keywords: options.keywords,
    customerId: options.customerId ?? environment.GOOGLE_ADS_CUSTOMER_ID,
    loginCustomerId:
      options.loginCustomerId ?? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    developerToken: environment.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: environment.GOOGLE_ADS_CLIENT_ID,
    clientSecret: environment.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: environment.GOOGLE_ADS_REFRESH_TOKEN,
    apiVersion: process.env.GOOGLE_ADS_API_VERSION ?? DEFAULT_API_VERSION,
    languageId:
      options.languageId ??
      process.env.GOOGLE_ADS_LANGUAGE_ID ??
      DEFAULT_LANGUAGE_ID,
    geoTargetIds:
      options.geoTargetIds ??
      configuredGeoTargetIds(process.env.GOOGLE_ADS_GEO_TARGET_IDS),
    includeAdultKeywords: options.includeAdultKeywords,
    network: options.network,
  });

  if (options.format === "csv") process.stdout.write(metricsCsv(response));
  else
    process.stdout.write(
      `${JSON.stringify({ ...response, results: metricsRows(response) }, null, 2)}\n`,
    );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
