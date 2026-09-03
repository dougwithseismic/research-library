import assert from "node:assert/strict";
import test from "node:test";

import {
  buildHistoricalMetricsRequest,
  fetchKeywordHistoricalMetrics,
  metricsCsv,
  normalizeCustomerId,
} from "./lib/google-ads.mjs";

test("normalizes customer IDs", () => {
  assert.equal(normalizeCustomerId("348-197-3411"), "3481973411");
  assert.throws(() => normalizeCustomerId("123"), /10 digits/);
});

test("builds a deduplicated UK English historical metrics request", () => {
  assert.deepEqual(
    buildHistoricalMetricsRequest({
      keywords: ["lead generation", "lead generation", " seo "],
    }),
    {
      keywords: ["lead generation", "seo"],
      language: "languageConstants/1000",
      geoTargetConstants: ["geoTargetConstants/2826"],
      includeAdultKeywords: false,
      keywordPlanNetwork: "GOOGLE_SEARCH",
      historicalMetricsOptions: { includeAverageCpc: true },
    },
  );
});

test("refreshes OAuth and sends the documented v25 request", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "access-token" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        results: [
          {
            text: "lead generation",
            keywordMetrics: { avgMonthlySearches: "1000" },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const response = await fetchKeywordHistoricalMetrics({
    keywords: ["lead generation"],
    customerId: "348-197-3411",
    loginCustomerId: "348-197-3411",
    developerToken: "developer-token",
    clientId: "client-id",
    clientSecret: "client-secret",
    refreshToken: "refresh-token",
    fetchImpl,
  });

  assert.equal(calls.length, 2);
  assert.equal(
    calls[1].url,
    "https://googleads.googleapis.com/v25/customers/3481973411:generateKeywordHistoricalMetrics",
  );
  assert.equal(calls[1].options.headers["developer-token"], "developer-token");
  assert.equal(calls[1].options.headers["login-customer-id"], "3481973411");
  assert.equal(calls[1].options.headers.authorization, "Bearer access-token");
  assert.equal(response.results[0].text, "lead generation");
});

test("renders metrics as CSV", () => {
  const output = metricsCsv({
    results: [
      {
        text: "agency, bristol",
        closeVariants: ["agencies bristol"],
        keywordMetrics: {
          avgMonthlySearches: "90",
          competition: "HIGH",
          competitionIndex: "87",
          averageCpcMicros: "1200000",
          lowTopOfPageBidMicros: "900000",
          highTopOfPageBidMicros: "2300000",
        },
      },
    ],
  });

  assert.match(output, /^keyword,closeVariants,/);
  assert.match(
    output,
    /"agency, bristol",agencies bristol,90,HIGH,87,1200000,900000,2300000/,
  );
});
