#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const DOWNLOAD_PAGE = "https://download.companieshouse.gov.uk/en_output.html";
const DOWNLOAD_ROOT = "https://download.companieshouse.gov.uk";
const ADVANCED_SEARCH_CSV =
  "https://find-and-update.company-information.service.gov.uk/advanced-search/csv";

export const CITIES = {
  bristol: {
    label: "Bristol",
    postTowns: ["BRISTOL"],
    recentQueries: ["Bristol"],
    outwardPostcodes: Array.from(
      { length: 16 },
      (_, index) => `BS${index + 1}`,
    ),
  },
  exeter: {
    label: "Exeter",
    postTowns: ["EXETER"],
    recentQueries: ["Exeter"],
    outwardPostcodes: ["EX1", "EX2", "EX3", "EX4"],
  },
  brighton: {
    label: "Brighton",
    postTowns: ["BRIGHTON", "BRIGHTON AND HOVE", "HOVE"],
    recentQueries: ["Brighton", "Hove"],
    outwardPostcodes: ["BN1", "BN2", "BN3", "BN41"],
  },
};

export const CORE_SIC_CODES = new Set([
  "62011", // Ready-made interactive leisure and entertainment software development
  "62012", // Business and domestic software development
  "62020", // Information technology consultancy activities
  "62030", // Computer facilities management activities
  "62090", // Other information technology service activities
]);

export const ADJACENT_SIC_CODES = new Set([
  "58290", // Other software publishing
  "63110", // Data processing, hosting and related activities
  "63120", // Web portals
  "73110", // Advertising agencies
  "74100", // Specialised design activities
]);

const POSITIVE_NAME_SIGNALS = [
  "APP",
  "CREATIVE",
  "DESIGN",
  "DEVELOPMENT",
  "DIGITAL",
  "INTERACTIVE",
  "LABS",
  "MEDIA",
  "PRODUCT",
  "SOFTWARE",
  "STUDIO",
  "SYSTEMS",
  "TECH",
  "WEB",
];

const NEGATIVE_NAME_SIGNALS = [
  "ACCOUNTANCY",
  "CARE",
  "CONSTRUCTION",
  "FINANCIAL",
  "HOLDINGS",
  "PROPERTY",
  "RECRUITMENT",
  "RETAIL",
  "TRADING",
];

const AGENCY_NAME_SIGNALS = new Set([
  "APP",
  "CREATIVE",
  "DESIGN",
  "DEVELOPMENT",
  "DIGITAL",
  "INTERACTIVE",
  "LABS",
  "PRODUCT",
  "SOFTWARE",
  "STUDIO",
  "WEB",
]);

const SIC_WEIGHTS = new Map([
  ["62012", 60],
  ["62020", 42],
  ["62090", 32],
  ["62011", 28],
  ["63120", 26],
  ["58290", 22],
  ["74100", 16],
  ["63110", 14],
  ["73110", 12],
  ["62030", 8],
]);

function parseArguments(argv) {
  const today = new Date().toISOString().slice(0, 10);
  const options = {
    cities: Object.keys(CITIES),
    outputDirectory: resolve(
      `data/companies-house/city-agency-census-${today}`,
    ),
    snapshot: null,
    refresh: false,
    recent: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--cities") {
      options.cities = argv[++index].split(",").map((value) => value.trim());
    } else if (argument === "--out") {
      options.outputDirectory = resolve(argv[++index]);
    } else if (argument === "--snapshot") {
      options.snapshot = resolve(argv[++index]);
    } else if (argument === "--refresh") {
      options.refresh = true;
    } else if (argument === "--no-recent") {
      options.recent = false;
    } else if (argument === "--help" || argument === "-h") {
      console.log(`
Companies House city software-agency census

Usage:
  node scripts/companies-house-city-agency-census.mjs [options]

Options:
  --cities <names>   Comma-separated city keys (default: bristol,exeter,brighton)
  --out <directory>  Output directory
  --snapshot <zip>   Use an existing Companies House bulk snapshot
  --refresh          Redownload the current monthly snapshot
  --no-recent        Do not merge post-snapshot live registrations
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  for (const city of options.cities) {
    if (!CITIES[city]) throw new Error(`Unknown city: ${city}`);
  }
  return options;
}

export function parseCsvLine(line) {
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
  const stringValue = Array.isArray(value)
    ? value.join("|")
    : String(value ?? "");
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
    .trim()
    .toUpperCase()
    .replaceAll(/\s+/g, " ");
}

function isoDate(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date || "";
}

function yesNo(value) {
  const upper = normalized(value);
  if (["TRUE", "YES", "Y"].includes(upper)) return "yes";
  if (["FALSE", "NO", "N"].includes(upper)) return "no";
  return "";
}

function overdueFromDueDate(value, asOfDate) {
  const dueDate = isoDate(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ? dueDate < asOfDate
      ? "yes"
      : "no"
    : "";
}

function extractSicCodes(values) {
  const strings = Array.isArray(values) ? values : [values];
  return [
    ...new Set(
      strings.flatMap((value) =>
        [...String(value ?? "").matchAll(/(?:^|\D)(\d{5})(?=\D|$)/g)].map(
          (match) => match[1],
        ),
      ),
    ),
  ];
}

export function cityForPostTown(postTown) {
  const value = normalized(postTown);
  return (
    Object.entries(CITIES).find(([, city]) =>
      city.postTowns.includes(value),
    )?.[0] ?? null
  );
}

function outwardPostcode(postcode) {
  return normalized(postcode).match(/^[A-Z]{1,2}\d{1,2}[A-Z]?/)?.[0] ?? "";
}

export function matchesCityGeography(cityKey, postTown, postcode) {
  return (
    cityForPostTown(postTown) === cityKey &&
    CITIES[cityKey].outwardPostcodes.includes(outwardPostcode(postcode))
  );
}

export function qualifyAgencyCandidate(companyName, sicCodes) {
  const name = normalized(companyName);
  const coreSicCodes = sicCodes.filter((code) => CORE_SIC_CODES.has(code));
  const adjacentSicCodes = sicCodes.filter((code) =>
    ADJACENT_SIC_CODES.has(code),
  );
  const positiveNameSignals = POSITIVE_NAME_SIGNALS.filter((signal) =>
    new RegExp(`(?:^|[^A-Z])${signal}(?:[^A-Z]|$)`).test(name),
  );
  const negativeNameSignals = NEGATIVE_NAME_SIGNALS.filter((signal) =>
    new RegExp(`(?:^|[^A-Z])${signal}(?:[^A-Z]|$)`).test(name),
  );

  if (
    !coreSicCodes.length &&
    !(adjacentSicCodes.length && positiveNameSignals.length)
  ) {
    return null;
  }

  const sicScore = Math.max(
    ...[...coreSicCodes, ...adjacentSicCodes].map(
      (code) => SIC_WEIGHTS.get(code) ?? 0,
    ),
  );
  const score = Math.max(
    0,
    Math.min(
      100,
      sicScore +
        Math.min(24, positiveNameSignals.length * 8) -
        negativeNameSignals.length * 18,
    ),
  );
  const band =
    score >= 60
      ? "strong_registry_match"
      : score >= 40
        ? "probable_registry_match"
        : "review_registry_match";
  const matchBasis = coreSicCodes.length
    ? "core_software_or_it_sic"
    : "adjacent_sic_and_agency_name_signal";

  return {
    coreSicCodes,
    adjacentSicCodes,
    positiveNameSignals,
    negativeNameSignals,
    score,
    band,
    matchBasis,
  };
}

export function isPriorityCandidate(
  candidate,
  asOfDate = new Date().toISOString().slice(0, 10),
) {
  const ageCutoff = new Date(`${asOfDate}T00:00:00Z`);
  ageCutoff.setUTCFullYear(ageCutoff.getUTCFullYear() - 2);
  const strongNameSignals = candidate.positive_name_signals.filter((signal) =>
    AGENCY_NAME_SIGNALS.has(signal),
  );
  const hasSoftwareDevelopmentSic = candidate.core_sic_codes.includes("62012");
  const looksDormant = /DORMANT/i.test(candidate.accounts_category);
  return (
    candidate.incorporation_date <= ageCutoff.toISOString().slice(0, 10) &&
    candidate.accounts_overdue !== "yes" &&
    !looksDormant &&
    candidate.negative_name_signals.length === 0 &&
    strongNameSignals.length > 0 &&
    (hasSoftwareDevelopmentSic || strongNameSignals.length >= 2)
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
  if (options.snapshot) {
    return {
      path: options.snapshot,
      url: `${DOWNLOAD_ROOT}/${basename(options.snapshot)}`,
    };
  }

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
    return { path: destination, url: `${DOWNLOAD_ROOT}/${filename}` };
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
  return { path: destination, url: `${DOWNLOAD_ROOT}/${filename}` };
}

function snapshotDateFromFilename(path) {
  const match = basename(path).match(/(\d{4}-\d{2}-\d{2})/);
  if (!match) throw new Error(`No snapshot date in filename: ${path}`);
  return match[1];
}

async function hashFile(path) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  return { sha256: hash.digest("hex"), bytes };
}

function candidateFromSnapshot(get, cityKey, snapshotDate) {
  const sicText = [1, 2, 3, 4]
    .map((number) => get(`SICCode.SicText_${number}`))
    .filter(Boolean);
  const sicCodes = extractSicCodes(sicText);
  const qualification = qualifyAgencyCandidate(get("CompanyName"), sicCodes);
  if (!qualification) return null;

  const address = [
    get("RegAddress.CareOf"),
    get("RegAddress.POBox"),
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
    city: CITIES[cityKey].label,
    company_name: get("CompanyName"),
    company_number: companyNumber,
    company_status: get("CompanyStatus"),
    company_type: get("CompanyCategory"),
    incorporation_date: isoDate(get("IncorporationDate")),
    registered_office_address: address,
    post_town: get("RegAddress.PostTown"),
    postcode: get("RegAddress.PostCode"),
    sic_codes: sicCodes,
    sic_text: sicText,
    core_sic_codes: qualification.coreSicCodes,
    adjacent_sic_codes: qualification.adjacentSicCodes,
    match_basis: qualification.matchBasis,
    registry_likelihood_score: qualification.score,
    registry_likelihood_band: qualification.band,
    positive_name_signals: qualification.positiveNameSignals,
    negative_name_signals: qualification.negativeNameSignals,
    accounts_category: get("Accounts.AccountCategory"),
    accounts_last_made_up_date: isoDate(get("Accounts.LastMadeUpDate")),
    accounts_next_due_date: isoDate(get("Accounts.NextDueDate")),
    accounts_overdue: yesNo(get("Accounts.AccountsOverdue")),
    confirmation_last_made_up_date: isoDate(get("ConfStmtLastMadeUpDate")),
    confirmation_next_due_date: isoDate(get("ConfStmtNextDueDate")),
    confirmation_overdue: overdueFromDueDate(
      get("ConfStmtNextDueDate"),
      snapshotDate,
    ),
    companies_house_url: `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`,
    source: `Companies House bulk snapshot ${snapshotDate}`,
  };
}

async function processSnapshot(
  snapshotPath,
  selectedCityKeys,
  companiesByNumber,
) {
  const snapshotDate = snapshotDateFromFilename(snapshotPath);
  const unzip = spawn("unzip", ["-p", snapshotPath], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  const lines = createInterface({ input: unzip.stdout, crlfDelay: Infinity });
  let header;
  let scanned = 0;
  let active = 0;
  const activeInCities = new Map(selectedCityKeys.map((key) => [key, 0]));

  for await (const line of lines) {
    const row = parseCsvLine(line);
    if (!header) {
      header = new Map(row.map((column, index) => [column.trim(), index]));
      continue;
    }
    scanned += 1;
    const get = (column) => row[header.get(column)] ?? "";
    if (normalized(get("CompanyStatus")) !== "ACTIVE") continue;
    active += 1;
    const cityKey = cityForPostTown(get("RegAddress.PostTown"));
    if (!cityKey || !selectedCityKeys.includes(cityKey)) continue;
    if (
      !matchesCityGeography(
        cityKey,
        get("RegAddress.PostTown"),
        get("RegAddress.PostCode"),
      )
    )
      continue;
    activeInCities.set(cityKey, activeInCities.get(cityKey) + 1);
    const candidate = candidateFromSnapshot(get, cityKey, snapshotDate);
    if (candidate) companiesByNumber.set(candidate.company_number, candidate);
  }

  const exitCode = await new Promise((resolveExit) =>
    unzip.on("close", resolveExit),
  );
  if (exitCode !== 0) throw new Error(`unzip exited with code ${exitCode}`);
  return {
    snapshotDate,
    scanned,
    active,
    activeInCities: Object.fromEntries(activeInCities),
  };
}

async function fetchRecentCompanies(cityKey, snapshotDate, today) {
  const city = CITIES[cityKey];
  const from = snapshotDate.split("-");
  const to = today.split("-");
  const companies = new Map();

  for (const recentQuery of city.recentQueries) {
    const url = new URL(ADVANCED_SEARCH_CSV);
    const parameters = {
      registeredOfficeAddress: recentQuery,
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
        `Recent search failed for ${city.label}: ${response.status}`,
      );
    const lines = (await response.text())
      .split(/\r?\n/)
      .slice(1)
      .filter(Boolean);
    for (const line of lines) {
      const { fields, remainder } = parseLeadingCsvFields(line, 9);
      if (fields.length !== 9) continue;
      const natureMatch = /^(\[[^\]]*\]),(.*)$/.exec(remainder);
      if (!natureMatch) continue;
      const address = natureMatch[2];
      const sicCodes = extractSicCodes(natureMatch[1]);
      const qualification = qualifyAgencyCandidate(fields[0], sicCodes);
      if (!qualification) continue;
      const compactPostcode =
        address
          .toUpperCase()
          .match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/)?.[0] ?? "";
      if (!city.outwardPostcodes.includes(outwardPostcode(compactPostcode)))
        continue;
      companies.set(fields[1], {
        city: city.label,
        company_name: fields[0],
        company_number: fields[1],
        company_status: fields[2],
        company_type: fields[3],
        incorporation_date: isoDate(fields[6]),
        registered_office_address: address,
        post_town: city.label,
        postcode: compactPostcode,
        sic_codes: sicCodes,
        sic_text: [],
        core_sic_codes: qualification.coreSicCodes,
        adjacent_sic_codes: qualification.adjacentSicCodes,
        match_basis: qualification.matchBasis,
        registry_likelihood_score: qualification.score,
        registry_likelihood_band: qualification.band,
        positive_name_signals: qualification.positiveNameSignals,
        negative_name_signals: qualification.negativeNameSignals,
        accounts_category: "",
        accounts_last_made_up_date: "",
        accounts_next_due_date: "",
        accounts_overdue: "",
        confirmation_last_made_up_date: "",
        confirmation_next_due_date: "",
        confirmation_overdue: "",
        companies_house_url: `https://find-and-update.company-information.service.gov.uk/company/${fields[1]}`,
        source: `Companies House live advanced search ${today}`,
      });
    }
  }
  return [...companies.values()];
}

const COLUMNS = [
  "city",
  "company_name",
  "company_number",
  "company_status",
  "company_type",
  "incorporation_date",
  "registered_office_address",
  "post_town",
  "postcode",
  "sic_codes",
  "sic_text",
  "core_sic_codes",
  "adjacent_sic_codes",
  "match_basis",
  "registry_likelihood_score",
  "registry_likelihood_band",
  "positive_name_signals",
  "negative_name_signals",
  "accounts_category",
  "accounts_last_made_up_date",
  "accounts_next_due_date",
  "accounts_overdue",
  "confirmation_last_made_up_date",
  "confirmation_next_due_date",
  "confirmation_overdue",
  "companies_house_url",
  "source",
];

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);
  await mkdir(options.outputDirectory, { recursive: true });
  const snapshot = await latestSnapshot(options);
  const snapshotHash = await hashFile(snapshot.path);
  const companiesByNumber = new Map();

  console.log(
    `Scanning ${snapshot.path} once for ${options.cities.join(", ")}...`,
  );
  const scan = await processSnapshot(
    snapshot.path,
    options.cities,
    companiesByNumber,
  );
  const recentCounts = {};
  if (options.recent && scan.snapshotDate < today) {
    console.log(
      `Merging live registrations from ${scan.snapshotDate} through ${today}...`,
    );
    for (const cityKey of options.cities) {
      const recent = await fetchRecentCompanies(
        cityKey,
        scan.snapshotDate,
        today,
      );
      recentCounts[cityKey] = recent.length;
      for (const company of recent)
        companiesByNumber.set(company.company_number, company);
    }
  }

  const companies = [...companiesByNumber.values()].sort(
    (left, right) =>
      left.city.localeCompare(right.city) ||
      right.registry_likelihood_score - left.registry_likelihood_score ||
      left.company_name.localeCompare(right.company_name),
  );
  const cityCounts = Object.fromEntries(
    options.cities.map((key) => [
      key,
      {
        activeRegisteredCompanies: scan.activeInCities[key],
        agencyCandidates: companies.filter(
          (company) => company.city === CITIES[key].label,
        ).length,
        strongMatches: companies.filter(
          (company) =>
            company.city === CITIES[key].label &&
            company.registry_likelihood_band === "strong_registry_match",
        ).length,
        probableMatches: companies.filter(
          (company) =>
            company.city === CITIES[key].label &&
            company.registry_likelihood_band === "probable_registry_match",
        ).length,
        reviewMatches: companies.filter(
          (company) =>
            company.city === CITIES[key].label &&
            company.registry_likelihood_band === "review_registry_match",
        ).length,
        recentCandidatesMerged: recentCounts[key] ?? 0,
      },
    ]),
  );
  const summary = {
    generatedAt: new Date().toISOString(),
    snapshotDate: scan.snapshotDate,
    snapshotUrl: snapshot.url,
    snapshotSha256: snapshotHash.sha256,
    snapshotBytes: snapshotHash.bytes,
    totalRegistryRowsScanned: scan.scanned,
    totalActiveRegistryCompanies: scan.active,
    candidateCount: companies.length,
    cities: cityCounts,
    coreSicCodes: [...CORE_SIC_CODES],
    adjacentSicCodes: [...ADJACENT_SIC_CODES],
    methodology:
      "Official Companies House monthly bulk-register scan of active companies whose registered post town and urban postcode district match the selected city. Bristol uses BS1-BS16; Exeter uses EX1-EX4; Brighton and Hove uses BN1-BN3 and BN41. Core software/IT SICs are included; adjacent digital/design SICs require an agency-like company-name signal. Post-snapshot incorporations are merged from Companies House live advanced-search CSV and marked by source. This is a legal-entity candidate census, not proof of current trading location, agency quality, turnover, or purchase intent.",
  };

  const priorityCompanies = companies.filter((company) =>
    isPriorityCandidate(company, today),
  );
  summary.priorityCandidateCount = priorityCompanies.length;

  const censusPath = join(options.outputDirectory, "registry-census.csv");
  const priorityPath = join(options.outputDirectory, "registry-priority.csv");
  const summaryPath = join(
    options.outputDirectory,
    "registry-census-summary.json",
  );
  await Promise.all([
    writeFile(censusPath, csv(companies, COLUMNS)),
    writeFile(priorityPath, csv(priorityCompanies, COLUMNS)),
    writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`),
  ]);
  console.table(
    Object.entries(cityCounts).map(([city, counts]) => ({ city, ...counts })),
  );
  console.log(
    JSON.stringify({
      censusPath,
      priorityPath,
      summaryPath,
      candidateCount: companies.length,
      priorityCandidateCount: priorityCompanies.length,
    }),
  );
}

const isMain =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
}
