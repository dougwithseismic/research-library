import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";

export const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";
export const DEFAULT_API_VERSION = "v25";
export const DEFAULT_LANGUAGE_ID = "1000";
export const DEFAULT_GEO_TARGET_IDS = ["2826"];

export function loadGoogleAdsEnvironment(root = process.cwd()) {
  const candidates = [resolve(root, ".env.local"), resolve(root, ".env")];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      loadEnvFile(candidate);
      return candidate;
    }
  }

  throw new Error(
    "Could not find .env.local or .env from the research-library root.",
  );
}

export function requireEnvironment(names, environment = process.env) {
  return Object.fromEntries(
    names.map((name) => {
      const value = environment[name]?.trim();
      if (!value)
        throw new Error(`Missing required environment variable: ${name}`);
      return [name, value];
    }),
  );
}

export function normalizeCustomerId(value, label = "customer ID") {
  const normalized = String(value ?? "")
    .replaceAll("-", "")
    .trim();
  if (!/^\d{10}$/.test(normalized)) {
    throw new Error(`${label} must contain exactly 10 digits.`);
  }
  return normalized;
}

export async function fetchAccessToken({
  clientId,
  clientSecret,
  refreshToken,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    const message =
      payload.error_description ?? payload.error ?? `HTTP ${response.status}`;
    throw new Error(`Google OAuth token refresh failed: ${message}`);
  }

  return payload.access_token;
}

export function buildHistoricalMetricsRequest({
  keywords,
  languageId = DEFAULT_LANGUAGE_ID,
  geoTargetIds = DEFAULT_GEO_TARGET_IDS,
  includeAdultKeywords = false,
  network = "GOOGLE_SEARCH",
}) {
  const normalizedKeywords = [
    ...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)),
  ];
  if (!normalizedKeywords.length)
    throw new Error("Provide at least one keyword.");
  if (normalizedKeywords.length > 10_000)
    throw new Error("Google accepts at most 10,000 keywords per request.");
  if (geoTargetIds.length > 10)
    throw new Error("Google accepts at most 10 geo targets per request.");

  return {
    keywords: normalizedKeywords,
    language: `languageConstants/${languageId}`,
    geoTargetConstants: geoTargetIds.map((id) => `geoTargetConstants/${id}`),
    includeAdultKeywords,
    keywordPlanNetwork: network,
    historicalMetricsOptions: { includeAverageCpc: true },
  };
}

export async function fetchKeywordHistoricalMetrics({
  keywords,
  customerId,
  loginCustomerId,
  developerToken,
  clientId,
  clientSecret,
  refreshToken,
  apiVersion = DEFAULT_API_VERSION,
  languageId = DEFAULT_LANGUAGE_ID,
  geoTargetIds = DEFAULT_GEO_TARGET_IDS,
  includeAdultKeywords = false,
  network = "GOOGLE_SEARCH",
  fetchImpl = fetch,
}) {
  const normalizedCustomerId = normalizeCustomerId(customerId);
  const normalizedLoginCustomerId = loginCustomerId
    ? normalizeCustomerId(loginCustomerId, "login customer ID")
    : null;
  const accessToken = await fetchAccessToken({
    clientId,
    clientSecret,
    refreshToken,
    fetchImpl,
  });
  const body = buildHistoricalMetricsRequest({
    keywords,
    languageId,
    geoTargetIds,
    includeAdultKeywords,
    network,
  });
  const headers = {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    "developer-token": developerToken,
  };
  if (normalizedLoginCustomerId)
    headers["login-customer-id"] = normalizedLoginCustomerId;

  const endpoint = `https://googleads.googleapis.com/${apiVersion}/customers/${normalizedCustomerId}:generateKeywordHistoricalMetrics`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    const requestId =
      response.headers.get("request-id") ??
      response.headers.get("google-ads-request-id");
    const message =
      payload.error?.message ??
      payload.error_description ??
      `HTTP ${response.status}`;
    const suffix = requestId ? ` (request ID: ${requestId})` : "";
    throw new Error(
      `Google Ads historical metrics request failed: ${message}${suffix}`,
    );
  }

  return {
    apiVersion,
    customerId: normalizedCustomerId,
    loginCustomerId: normalizedLoginCustomerId,
    languageId,
    geoTargetIds,
    results: payload.results ?? [],
    aggregateMetricResults: payload.aggregateMetricResults ?? null,
  };
}

export function metricsRows(response) {
  return response.results.map((result) => {
    const metrics = result.keywordMetrics ?? {};
    return {
      keyword: result.text ?? "",
      closeVariants: result.closeVariants ?? [],
      averageMonthlySearches: Number(metrics.avgMonthlySearches ?? 0),
      competition: metrics.competition ?? "UNSPECIFIED",
      competitionIndex: Number(metrics.competitionIndex ?? 0),
      averageCpcMicros: Number(metrics.averageCpcMicros ?? 0),
      lowTopOfPageBidMicros: Number(metrics.lowTopOfPageBidMicros ?? 0),
      highTopOfPageBidMicros: Number(metrics.highTopOfPageBidMicros ?? 0),
      monthlySearchVolumes: metrics.monthlySearchVolumes ?? [],
    };
  });
}

function csvCell(value) {
  const rendered = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(rendered)
    ? `"${rendered.replaceAll('"', '""')}"`
    : rendered;
}

export function metricsCsv(response) {
  const columns = [
    "keyword",
    "closeVariants",
    "averageMonthlySearches",
    "competition",
    "competitionIndex",
    "averageCpcMicros",
    "lowTopOfPageBidMicros",
    "highTopOfPageBidMicros",
  ];
  const rows = metricsRows(response);
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}
