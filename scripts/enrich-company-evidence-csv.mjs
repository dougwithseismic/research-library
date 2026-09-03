#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseCsvLine } from "./companies-house-city-agency-census.mjs";
import {
  COMPANY_HOUSE_CSV_HEADERS,
  csvCell,
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

const inputPath = argument("--input");
const financialsPath = argument("--financials");
const outputPath = argument("--output", inputPath);
const expectedAccounts = numericArgument("--expected-accounts", null);

if (!inputPath || !financialsPath) {
  throw new Error(
    "Usage: enrich-company-evidence-csv.mjs --input <hitlist.csv> --financials <companies-house-financials.json> [--output <enriched.csv>] [--expected-accounts 19]",
  );
}

function readRows(csv) {
  const lines = csv.trimEnd().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift() ?? "").map((header) =>
    header.replace(/^\uFEFF/, ""),
  );
  const rows = lines.filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
  return { headers, rows };
}

const source = readRows(await readFile(inputPath, "utf8"));
const financialData = JSON.parse(await readFile(financialsPath, "utf8"));
const reports = Array.isArray(financialData.reports)
  ? financialData.reports
  : [];
const byNumber = new Map(
  reports.map((report) => [String(report.companyNumber ?? ""), report]),
);

if (expectedAccounts !== null && source.rows.length !== expectedAccounts) {
  throw new Error(
    `Expected ${expectedAccounts} account rows, found ${source.rows.length}`,
  );
}

const sourceHeaders = source.headers.filter(
  (header) => !COMPANY_HOUSE_CSV_HEADERS.includes(header),
);
const headers = [...sourceHeaders, ...COMPANY_HOUSE_CSV_HEADERS];
const enriched = source.rows.map((row) => {
  if (!row.company_number) {
    throw new Error(
      `Account row is missing company_number: ${row.company || "unknown"}`,
    );
  }
  return {
    ...row,
    ...flattenCompanyHouse(byNumber.get(String(row.company_number))),
  };
});

for (const [index, row] of enriched.entries()) {
  for (const header of COMPANY_HOUSE_CSV_HEADERS) {
    if (
      row[header] === "" ||
      row[header] === null ||
      row[header] === undefined
    ) {
      throw new Error(`Blank ${header} in CSV row ${index + 2}`);
    }
  }
}

const output = `${headers.join(",")}\n${enriched
  .map((row) => headers.map((header) => csvCell(row[header])).join(","))
  .join("\n")}\n`;
await mkdir(dirname(outputPath), { recursive: true });
const temporary = `${outputPath}.tmp`;
await writeFile(temporary, output, "utf8");
await rename(temporary, outputPath);

const matched = enriched.filter((row) =>
  byNumber.has(String(row.company_number)),
).length;
const structured = enriched.filter(
  (row) => row.latest_accounts_format === "structured",
).length;
const withEmployees = enriched.filter(
  (row) => row.employees_current !== "Not disclosed",
).length;
const withTurnover = enriched.filter(
  (row) => row.turnover_current !== "Not disclosed",
).length;

process.stdout.write(
  `${JSON.stringify(
    {
      output: outputPath,
      rows: enriched.length,
      columns: headers.length,
      companiesHouseColumns: COMPANY_HOUSE_CSV_HEADERS.length,
      matchedReports: matched,
      structuredAccounts: structured,
      withEmployees,
      withTurnover,
    },
    null,
    2,
  )}\n`,
);
