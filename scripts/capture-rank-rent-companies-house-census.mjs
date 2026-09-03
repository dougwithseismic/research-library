#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const candidate of [
  path.join(root, ".env.local"),
  path.join(root, ".env"),
]) {
  if (existsSync(candidate)) loadEnvFile(candidate);
}

const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
if (!apiKey) throw new Error("COMPANIES_HOUSE_API_KEY is required");

const output = path.join(
  root,
  "private-data/rank-and-rent-uk-2026/companies-house-census-raw.json",
);
const base =
  "https://api.company-information.service.gov.uk/advanced-search/companies";
const queries = [
  { id: "edinburgh_sic_81210", location: "Edinburgh", sic_codes: "81210" },
  { id: "edinburgh_sic_43220", location: "Edinburgh", sic_codes: "43220" },
  { id: "manchester_sic_84250", location: "Manchester", sic_codes: "84250" },
  { id: "manchester_sic_71200", location: "Manchester", sic_codes: "71200" },
  { id: "bristol_sic_37000", location: "Bristol", sic_codes: "37000" },
  { id: "bristol_sic_43220", location: "Bristol", sic_codes: "43220" },
  {
    id: "edinburgh_name_clean",
    location: "Edinburgh",
    company_name_includes: "CLEAN",
  },
  {
    id: "edinburgh_name_boiler",
    location: "Edinburgh",
    company_name_includes: "BOILER",
  },
  {
    id: "edinburgh_name_heating",
    location: "Edinburgh",
    company_name_includes: "HEATING",
  },
  {
    id: "manchester_name_fire",
    location: "Manchester",
    company_name_includes: "FIRE",
  },
  {
    id: "manchester_name_asbestos",
    location: "Manchester",
    company_name_includes: "ASBESTOS",
  },
  {
    id: "bristol_name_drain",
    location: "Bristol",
    company_name_includes: "DRAIN",
  },
  {
    id: "bristol_name_drainage",
    location: "Bristol",
    company_name_includes: "DRAINAGE",
  },
];

const captures = [];
for (const [index, query] of queries.entries()) {
  if (index) await new Promise((resolve) => setTimeout(resolve, 700));
  const url = new URL(base);
  url.searchParams.set("company_status", "active");
  url.searchParams.set("size", "20");
  for (const [key, value] of Object.entries(query)) {
    if (key !== "id") url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    headers: {
      authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "user-agent": "ResearchLibrary/0.1 company-census-evidence",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`Companies House ${response.status} for ${query.id}`);
  captures.push({
    id: query.id,
    requested_at: new Date().toISOString(),
    request: Object.fromEntries(url.searchParams),
    source_url: url.toString(),
    response: await response.json(),
  });
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify({ schema_version: 1, captures }, null, 2)}\n`,
);
console.log(
  `Captured ${captures.length} read-only Companies House discovery queries.`,
);
