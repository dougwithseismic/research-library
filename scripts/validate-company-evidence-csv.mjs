#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsvLine } from "./companies-house-city-agency-census.mjs";
import {
  COMPANY_HOUSE_CSV_HEADERS,
  FINANCIAL_METRICS,
  flattenCompanyHouse,
} from "./lib/company-house-csv.mjs";

function argument(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return resolve(index === -1 ? fallback : process.argv[index + 1]);
}

function numericArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : Number(process.argv[index + 1]);
}

const csvPath = argument("--csv");
const financialsPath = argument("--financials");
const expectedAccounts = numericArgument("--expected-accounts", null);

if (!csvPath || !financialsPath) {
  throw new Error(
    "Usage: validate-company-evidence-csv.mjs --csv <enriched.csv> --financials <companies-house-financials.json> [--expected-accounts 19]",
  );
}

const lines = (await readFile(csvPath, "utf8")).trimEnd().split(/\r?\n/);
const headers = parseCsvLine(lines.shift() ?? "").map((header) =>
  header.replace(/^\uFEFF/, ""),
);
const duplicates = headers.filter(
  (header, index) => headers.indexOf(header) !== index,
);
if (duplicates.length) {
  throw new Error(
    `Duplicate CSV headers: ${[...new Set(duplicates)].join(", ")}`,
  );
}
const missingHeaders = COMPANY_HOUSE_CSV_HEADERS.filter(
  (header) => !headers.includes(header),
);
if (missingHeaders.length) {
  throw new Error(
    `Missing Companies House CSV fields: ${missingHeaders.join(", ")}`,
  );
}

const rows = lines.filter(Boolean).map((line) => {
  const values = parseCsvLine(line);
  return Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? ""]),
  );
});
if (expectedAccounts !== null && rows.length !== expectedAccounts) {
  throw new Error(`Expected ${expectedAccounts} rows, found ${rows.length}`);
}
const companyNumbers = rows.map((row) => row.company_number);
if (new Set(companyNumbers).size !== companyNumbers.length) {
  throw new Error("CSV contains duplicate company_number values");
}

const financialData = JSON.parse(await readFile(financialsPath, "utf8"));
const byNumber = new Map(
  (financialData.reports ?? []).map((report) => [
    String(report.companyNumber ?? ""),
    report,
  ]),
);
let matchedReports = 0;
for (const [index, row] of rows.entries()) {
  const report = byNumber.get(String(row.company_number));
  if (report) matchedReports += 1;
  const expected = flattenCompanyHouse(report);
  for (const header of COMPANY_HOUSE_CSV_HEADERS) {
    if (row[header] === "") {
      throw new Error(`Blank ${header} in CSV row ${index + 2}`);
    }
    if (String(row[header]) !== String(expected[header])) {
      throw new Error(
        `CSV row ${index + 2} does not match financial evidence for ${header}`,
      );
    }
  }
  for (const metric of FINANCIAL_METRICS) {
    const value = row[`${metric}_current`];
    if (
      value !== "Not disclosed" &&
      row[`${metric}_current_period`] === "Not disclosed"
    ) {
      throw new Error(
        `Disclosed ${metric} is missing its current period in CSV row ${index + 2}`,
      );
    }
  }
}

const summary = {
  csv: csvPath,
  rows: rows.length,
  columns: headers.length,
  companiesHouseColumns: COMPANY_HOUSE_CSV_HEADERS.length,
  matchedReports,
  structuredAccounts: rows.filter(
    (row) => row.latest_accounts_format === "structured",
  ).length,
  withEmployees: rows.filter((row) => row.employees_current !== "Not disclosed")
    .length,
  withTurnover: rows.filter((row) => row.turnover_current !== "Not disclosed")
    .length,
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
