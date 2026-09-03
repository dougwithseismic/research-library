#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";

const DOWNLOAD_PAGE = "https://download.companieshouse.gov.uk/en_output.html";
const DOWNLOAD_ROOT = "https://download.companieshouse.gov.uk";
const ADVANCED_SEARCH_CSV =
  "https://find-and-update.company-information.service.gov.uk/advanced-search/csv";

const HUBS = {
  shelton: {
    label: "71-75 Shelton Street",
    postcode: "WC2H9JQ",
    query: "71-75 Shelton Street London WC2H 9JQ",
    addressTokenSets: [["7175", "SHELTONSTREET"]],
  },
  paul: {
    label: "86-90 Paul Street",
    postcode: "EC2A4NE",
    query: "86-90 Paul Street London EC2A 4NE",
    addressTokenSets: [["8690", "PAULSTREET"]],
  },
  wenlock: {
    label: "20 / 20-22 Wenlock Road",
    postcode: "N17GU",
    query: "Wenlock Road London N1 7GU",
    addressTokenSets: [
      ["20", "WENLOCKROAD"],
      ["2022", "WENLOCKROAD"],
    ],
  },
  city: {
    label: "124 / 128 City Road",
    postcode: "EC1V2NX",
    query: "City Road London EC1V 2NX",
    addressTokenSets: [
      ["124", "CITYROAD"],
      ["128", "CITYROAD"],
      ["124128", "CITYROAD"],
    ],
  },
  "great-portland": {
    label: "85 / 167-169 Great Portland Street",
    postcode: null,
    postcodes: ["W1W7LT", "W1W5PF"],
    query: "Great Portland Street London",
    addressTokenSets: [
      ["85", "GREATPORTLANDSTREET"],
      ["167169", "GREATPORTLANDSTREET"],
    ],
  },
  "old-gloucester": {
    label: "27 Old Gloucester Street",
    postcode: "WC1N3AX",
    query: "27 Old Gloucester Street London WC1N 3AX",
    addressTokenSets: [["27", "OLDGLOUCESTERSTREET"]],
  },
};

function parseArguments(argv) {
  const options = {
    presets: ["shelton", "paul", "wenlock", "city", "great-portland"],
    outputDirectory: null,
    snapshot: null,
    refresh: false,
    recent: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--preset") {
      options.presets = argv[++index].split(",").map((value) => value.trim());
    } else if (argument === "--out") {
      options.outputDirectory = argv[++index];
    } else if (argument === "--snapshot") {
      options.snapshot = argv[++index];
    } else if (argument === "--refresh") {
      options.refresh = true;
    } else if (argument === "--no-recent") {
      options.recent = false;
    } else if (argument === "--list-presets") {
      for (const [key, hub] of Object.entries(HUBS)) {
        console.log(`${key.padEnd(16)} ${hub.label}`);
      }
      process.exit(0);
    } else if (argument === "--help" || argument === "-h") {
      console.log(`
Companies House virtual-office lead finder

Usage:
  node scripts/companies-house-virtual-office-leads.mjs [options]

Options:
  --preset <names>   Comma-separated presets (default: shelton,paul,wenlock,city,great-portland)
  --out <directory>  Output directory (default: data/companies-house/leads-YYYY-MM-DD)
  --snapshot <zip>   Use an existing Companies House bulk snapshot
  --refresh          Redownload the latest snapshot even when cached
  --no-recent        Do not merge post-snapshot live advanced-search results
  --list-presets     Show available virtual-office hubs
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  for (const preset of options.presets) {
    if (!HUBS[preset]) throw new Error(`Unknown preset: ${preset}`);
  }
  return options;
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

function parseLeadingCsvFields(line, count) {
  const fields = [];
  let value = "";
  let quoted = false;
  let index = 0;

  for (; index < line.length && fields.length < count; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  return { fields, remainder: line.slice(index) };
}

function csvCell(value) {
  const stringValue = String(value ?? "");
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replaceAll('"', '""')}"`
    : stringValue;
}

function csv(rows, columns) {
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}

function normalized(value) {
  return String(value ?? "")
    .toUpperCase()
    .replaceAll(/[^A-Z0-9]/g, "");
}

function isoDate(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
}

function matchesHub(hub, address, postcode) {
  const normalizedAddress = normalized(address);
  const normalizedPostcode = normalized(postcode || address);
  const validPostcodes = hub.postcodes ?? [hub.postcode];
  return (
    validPostcodes.some((candidate) =>
      normalizedPostcode.includes(candidate),
    ) &&
    hub.addressTokenSets.some((tokens) =>
      tokens.every((token) => normalizedAddress.includes(token)),
    )
  );
}

function mondayFor(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function extractSicCodes(value) {
  return [...String(value).matchAll(/(?:^|\D)(\d{5})(?=\D|$)/g)].map(
    (match) => match[1],
  );
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function latestSnapshot(options) {
  if (options.snapshot) return resolve(options.snapshot);

  const response = await fetch(DOWNLOAD_PAGE);
  if (!response.ok)
    throw new Error(`Snapshot index failed: ${response.status}`);
  const html = await response.text();
  const filenames = [
    ...html.matchAll(/BasicCompanyDataAsOneFile-(\d{4}-\d{2}-\d{2})\.zip/g),
  ].map((match) => match[0]);
  if (!filenames.length)
    throw new Error("Could not find the latest snapshot filename");
  filenames.sort().reverse();

  const filename = filenames[0];
  const cacheDirectory = join(tmpdir(), "companies-house-virtual-office-leads");
  const destination = join(cacheDirectory, filename);
  await mkdir(cacheDirectory, { recursive: true });
  if (!options.refresh && (await fileExists(destination))) {
    console.log(`Using cached snapshot ${destination}`);
    return destination;
  }

  console.log(`Downloading ${filename} (roughly 500 MB)...`);
  const download = await fetch(`${DOWNLOAD_ROOT}/${filename}`);
  if (!download.ok || !download.body) {
    throw new Error(`Snapshot download failed: ${download.status}`);
  }
  await pipeline(
    Readable.fromWeb(download.body),
    createWriteStream(destination),
  );
  return destination;
}

function snapshotDateFromFilename(path) {
  const match = basename(path).match(/(\d{4}-\d{2}-\d{2})/);
  if (!match) throw new Error(`No snapshot date in filename: ${path}`);
  return match[1];
}

function companyFromSnapshot(get, snapshotDate) {
  const address = [
    get("RegAddress.CareOf"),
    get("RegAddress.AddressLine1"),
    get("RegAddress.AddressLine2"),
    get("RegAddress.PostTown"),
    get("RegAddress.County"),
    get("RegAddress.Country"),
    get("RegAddress.PostCode"),
  ]
    .filter(Boolean)
    .join(", ");
  const companyNumber = get("CompanyNumber");
  return {
    company_name: get("CompanyName"),
    company_number: companyNumber,
    company_status: get("CompanyStatus"),
    company_type: get("CompanyCategory"),
    incorporation_date: isoDate(get("IncorporationDate")),
    registered_office_address: address,
    postcode: get("RegAddress.PostCode"),
    sic_codes: [1, 2, 3, 4]
      .map((number) => get(`SICCode.SicText_${number}`))
      .filter(Boolean)
      .join(" | "),
    companies_house_url: `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`,
    source: `Companies House bulk snapshot ${snapshotDate}`,
  };
}

async function processSnapshot(snapshotPath, selectedHubs, companiesByHub) {
  const snapshotDate = snapshotDateFromFilename(snapshotPath);
  const unzip = spawn("unzip", ["-p", snapshotPath], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  const lines = createInterface({ input: unzip.stdout, crlfDelay: Infinity });
  let header;

  for await (const line of lines) {
    const row = parseCsvLine(line);
    if (!header) {
      header = new Map(row.map((column, index) => [column.trim(), index]));
      continue;
    }
    const get = (column) => row[header.get(column)] ?? "";
    if (get("CompanyStatus").toUpperCase() !== "ACTIVE") continue;

    const company = companyFromSnapshot(get, snapshotDate);
    for (const [key, hub] of selectedHubs) {
      if (
        matchesHub(hub, company.registered_office_address, company.postcode)
      ) {
        companiesByHub.get(key).set(company.company_number, company);
      }
    }
  }

  const exitCode = await new Promise((resolveExit) =>
    unzip.on("close", resolveExit),
  );
  if (exitCode !== 0) throw new Error(`unzip exited with code ${exitCode}`);
  return snapshotDate;
}

async function fetchRecentCompanies(hub, snapshotDate, today) {
  const url = new URL(ADVANCED_SEARCH_CSV);
  const from = snapshotDate.split("-");
  const to = today.split("-");
  const parameters = {
    registeredOfficeAddress: hub.query,
    status: "active",
    incorporationFromDay: Number(from[2]),
    incorporationFromMonth: Number(from[1]),
    incorporationFromYear: Number(from[0]),
    incorporationToDay: Number(to[2]),
    incorporationToMonth: Number(to[1]),
    incorporationToYear: Number(to[0]),
  };
  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `Recent search failed for ${hub.label}: ${response.status}`,
    );
  const lines = (await response.text()).split(/\r?\n/).slice(1).filter(Boolean);
  const companies = [];

  for (const line of lines) {
    const { fields, remainder } = parseLeadingCsvFields(line, 9);
    if (fields.length !== 9) continue;
    const natureMatch = /^(\[[^\]]*\]),(.*)$/.exec(remainder);
    if (!natureMatch) continue;
    const address = natureMatch[2];
    if (!matchesHub(hub, address, address)) continue;

    companies.push({
      company_name: fields[0],
      company_number: fields[1],
      company_status: fields[2],
      company_type: fields[3],
      incorporation_date: fields[6],
      registered_office_address: address,
      postcode: (hub.postcodes ?? [hub.postcode]).find((postcode) =>
        normalized(address).includes(postcode),
      ),
      sic_codes: natureMatch[1],
      companies_house_url: `https://find-and-update.company-information.service.gov.uk/company/${fields[1]}`,
      source: `Companies House live advanced search ${today}`,
    });
  }
  return companies;
}

function createWeeklyRows(companies) {
  const counts = new Map();
  for (const company of companies) {
    const week = mondayFor(company.incorporation_date);
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }
  if (!counts.size) return [];

  const firstWeek = [...counts.keys()].sort()[0];
  const currentWeek = mondayFor(new Date().toISOString().slice(0, 10));
  const rows = [];
  for (let week = firstWeek; week <= currentWeek; week = addDays(week, 7)) {
    rows.push({
      week_start: week,
      week_end: addDays(week, 6),
      active_companies_incorporated: counts.get(week) ?? 0,
      partial_week: week === currentWeek ? "yes" : "no",
    });
  }
  return rows.reverse();
}

function createSicRows(companies) {
  const counts = new Map();
  const descriptions = new Map();
  for (const company of companies) {
    for (const match of String(company.sic_codes).matchAll(
      /(?:^|\|)\s*(\d{5})\s*-\s*([^|]+)/g,
    )) {
      descriptions.set(match[1], match[2].trim());
    }
    for (const code of new Set(extractSicCodes(company.sic_codes))) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([sic_code, active_companies]) => ({
      sic_code,
      sic_description: descriptions.get(sic_code) ?? "",
      active_companies,
    }))
    .sort((left, right) => right.active_companies - left.active_companies);
}

function average(values) {
  return values.length
    ? Math.round(
        (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
      ) / 10
    : 0;
}

async function writeHubOutputs(outputDirectory, key, hub, companies, today) {
  const sorted = [...companies.values()].sort(
    (left, right) =>
      right.incorporation_date.localeCompare(left.incorporation_date) ||
      right.company_number.localeCompare(left.company_number),
  );
  const weekly = createWeeklyRows(sorted);
  const sic = createSicRows(sorted);
  const currentWeek = mondayFor(today);
  const completeWeeks = weekly.filter((row) => row.week_start < currentWeek);
  const lastSevenDays = addDays(today, -6);
  const summary = {
    preset: key,
    address: hub.label,
    generated_at: today,
    active_companies_now: sorted.length,
    incorporated_last_7_days: sorted.filter(
      (company) =>
        company.incorporation_date >= lastSevenDays &&
        company.incorporation_date <= today,
    ).length,
    current_partial_week:
      weekly.find((row) => row.week_start === currentWeek) ?? null,
    last_complete_week: completeWeeks[0] ?? null,
    average_per_week_last_8_complete_weeks: average(
      completeWeeks.slice(0, 8).map((row) => row.active_companies_incorporated),
    ),
    top_sic_codes: sic.slice(0, 10),
    methodology:
      "Counts active companies currently registered at the address, grouped by incorporation date. It does not count dissolved companies or companies that later moved away.",
  };

  const companyColumns = [
    "company_name",
    "company_number",
    "company_status",
    "company_type",
    "incorporation_date",
    "registered_office_address",
    "postcode",
    "sic_codes",
    "companies_house_url",
    "source",
  ];
  await Promise.all([
    writeFile(
      join(outputDirectory, `${key}-companies.csv`),
      csv(sorted, companyColumns),
    ),
    writeFile(
      join(outputDirectory, `${key}-weekly.csv`),
      csv(weekly, [
        "week_start",
        "week_end",
        "active_companies_incorporated",
        "partial_week",
      ]),
    ),
    writeFile(
      join(outputDirectory, `${key}-sic.csv`),
      csv(sic, ["sic_code", "sic_description", "active_companies"]),
    ),
    writeFile(
      join(outputDirectory, `${key}-summary.json`),
      `${JSON.stringify(summary, null, 2)}\n`,
    ),
  ]);
  return summary;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);
  const outputDirectory = resolve(
    options.outputDirectory ?? `data/companies-house/leads-${today}`,
  );
  const selectedHubs = options.presets.map((key) => [key, HUBS[key]]);
  const companiesByHub = new Map(selectedHubs.map(([key]) => [key, new Map()]));
  await mkdir(outputDirectory, { recursive: true });

  const snapshotPath = await latestSnapshot(options);
  console.log(
    `Scanning ${snapshotPath} once for ${selectedHubs.length} hub(s)...`,
  );
  const snapshotDate = await processSnapshot(
    snapshotPath,
    selectedHubs,
    companiesByHub,
  );

  if (options.recent && snapshotDate < today) {
    console.log(
      `Merging live registrations from ${snapshotDate} through ${today}...`,
    );
    for (const [key, hub] of selectedHubs) {
      const recent = await fetchRecentCompanies(hub, snapshotDate, today);
      for (const company of recent) {
        companiesByHub.get(key).set(company.company_number, company);
      }
    }
  }

  const summaries = [];
  for (const [key, hub] of selectedHubs) {
    summaries.push(
      await writeHubOutputs(
        outputDirectory,
        key,
        hub,
        companiesByHub.get(key),
        today,
      ),
    );
  }
  await writeFile(
    join(outputDirectory, "summary.json"),
    `${JSON.stringify({ generated_at: today, snapshot_date: snapshotDate, hubs: summaries }, null, 2)}\n`,
  );

  console.table(
    summaries.map((summary) => ({
      hub: summary.preset,
      active: summary.active_companies_now,
      last_7_days: summary.incorporated_last_7_days,
      last_complete_week:
        summary.last_complete_week?.active_companies_incorporated ?? 0,
      avg_last_8_weeks: summary.average_per_week_last_8_complete_weeks,
    })),
  );
  console.log(`Wrote lead lists and weekly/SIC reports to ${outputDirectory}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
