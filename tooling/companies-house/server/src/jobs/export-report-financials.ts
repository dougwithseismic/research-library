import "../../env-config";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CompaniesHouseClient,
  CompaniesHouseResponse,
} from "../lib/companies-house/client";
import { analyseAccountsDocument } from "../lib/companies-house/financial-analysis";
import {
  AccountsRawResponse,
  fetchLatestAccountsDocument,
} from "../lib/companies-house/accounts";
import { fetchCompanyOfficersWithClient } from "../lib/companies-house/officers";
import { analyseRegistry } from "../lib/companies-house/registry-analysis";
import { fetchRegistryIntelligence } from "../lib/companies-house/registry";
import { parseAccountsDocument } from "../lib/companies-house/xbrl";
import { FilesystemRawArtifactStore } from "../lib/pipeline/raw-artifacts";

type JsonObject = Record<string, unknown>;
type RawArtifact = {
  id: string;
  contentType: string;
  byteLength: number;
  storageUri: string;
  sourceUrl: string;
  fetchedAt: string;
};

const PUBLIC_BASE =
  "https://find-and-update.company-information.service.gov.uk";
const USER_AGENT =
  "Research Library company evidence contact: research@leadmap.co.uk";

function argument(name: string, fallback?: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function parseCsvLine(line: string) {
  const values: string[] = [];
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

async function selectedCompanies(file: string) {
  const lines = (await readFile(path.resolve(file), "utf8"))
    .trim()
    .split(/\r?\n/);
  const headers = parseCsvLine(lines.shift() ?? "");
  const companyNumberIndex = headers.indexOf("company_number");
  if (companyNumberIndex === -1)
    throw new Error(`No company_number column in ${file}`);
  return [
    ...new Set(
      lines
        .filter(Boolean)
        .map((line) => parseCsvLine(line)[companyNumberIndex]?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ];
}

function object(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function string(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function address(value: unknown) {
  const source = object(value);
  if (!source) return null;
  return [
    source.premises,
    source.address_line_1,
    source.address_line_2,
    source.locality,
    source.region,
    source.postal_code,
    source.country,
  ]
    .filter((item): item is string => typeof item === "string" && Boolean(item))
    .join(", ");
}

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(
        code[0]?.toLowerCase() === "x"
          ? Number.parseInt(code.slice(1), 16)
          : Number.parseInt(code, 10),
      ),
    )
    .replace(
      /&([a-z]+);/gi,
      (whole, name: string) => named[name.toLowerCase()] ?? whole,
    );
}

function plainText(value: string) {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textById(html: string, id: string) {
  const match = html.match(
    new RegExp(
      `<([a-z0-9]+)\\b[^>]*\\bid=["']${escapeRegex(id)}["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
      "i",
    ),
  );
  return match ? plainText(match[2]) || null : null;
}

function firstMatch(html: string, expression: RegExp) {
  const match = html.match(expression);
  return match?.[1] ? plainText(match[1]) || null : null;
}

function ids(html: string, prefix: string) {
  return [
    ...new Set(
      [
        ...html.matchAll(
          new RegExp(`id=["']${escapeRegex(prefix)}-(\\d+)["']`, "gi"),
        ),
      ].map((match) => Number(match[1])),
    ),
  ].sort((left, right) => left - right);
}

function absolutePublicUrl(value: string) {
  return new URL(decodeHtml(value), PUBLIC_BASE).href;
}

function dateFromText(value: string | null) {
  const match = value?.match(/(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/);
  if (!match) return null;
  const date = new Date(`${match[1]} 00:00:00 UTC`);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}

async function pause(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchPublic(
  url: string,
  store: FilesystemRawArtifactStore,
  rawArtifacts: RawArtifact[],
) {
  const fetchedAt = new Date();
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT,
    },
    redirect: "follow",
  });
  let body: Buffer;
  let contentType: string;
  if (response.ok) {
    body = Buffer.from(await response.arrayBuffer());
    contentType =
      response.headers.get("content-type")?.split(";")[0] ??
      "application/octet-stream";
  } else if (response.status === 403) {
    body = execFileSync(
      "curl",
      ["-LsS", "--max-time", "35", "--retry", "2", "--retry-delay", "1", url],
      { encoding: "buffer", maxBuffer: 60 * 1024 * 1024 },
    );
    contentType =
      body.subarray(0, 4).toString() === "%PDF"
        ? "application/pdf"
        : "text/html";
  } else {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  const artifact = await store.putBuffer(body, contentType);
  rawArtifacts.push({
    id: artifact.id,
    contentType: artifact.contentType,
    byteLength: artifact.byteLength,
    storageUri: artifact.storageUri,
    // Keep the stable request URL. A followed document response can be a
    // short-lived signed object-storage URL and must not enter provenance data.
    sourceUrl: url,
    fetchedAt: fetchedAt.toISOString(),
  });
  return { html: body.toString("utf8"), url, contentType, fetchedAt };
}

function publicProfile(html: string) {
  const whole = plainText(html);
  const sicCodes = [...html.matchAll(/id=["']sic\d+["'][^>]*>([\s\S]*?)<\//gi)]
    .map((match) => plainText(match[1]))
    .filter(Boolean);
  const nextAccounts = html.match(
    /Next accounts made up to\s*<strong>([\s\S]*?)<\/strong>[\s\S]*?due by\s*<strong>([\s\S]*?)<\/strong>/i,
  );
  const lastAccounts = html.match(
    /Last accounts made up to\s*<strong>([\s\S]*?)<\/strong>/i,
  );
  const confirmation = html.match(
    /Next statement date\s*<strong>([\s\S]*?)<\/strong>[\s\S]*?due by\s*<strong>([\s\S]*?)<\/strong>/i,
  );
  return {
    status: textById(html, "company-status"),
    type: textById(html, "company-type-value"),
    incorporatedOn: dateFromText(textById(html, "company-creation-date")),
    registeredOffice: textById(html, "roa-address"),
    sicCodes,
    accountsPeriodEnd: dateFromText(
      lastAccounts?.[1] ? plainText(lastAccounts[1]) : null,
    ),
    accountsNextDue: dateFromText(
      nextAccounts?.[2] ? plainText(nextAccounts[2]) : null,
    ),
    accountsOverdue: /accounts overdue/i.test(whole),
    confirmationNextDue: dateFromText(
      confirmation?.[2] ? plainText(confirmation[2]) : null,
    ),
    confirmationOverdue: /confirmation statement overdue/i.test(whole),
  };
}

function publicOfficers(html: string) {
  return ids(html, "officer-name").map((index) => ({
    name: textById(html, `officer-name-${index}`),
    role: textById(html, `officer-role-${index}`),
    appointedOn: dateFromText(textById(html, `officer-appointed-on-${index}`)),
    resignedOn: dateFromText(textById(html, `officer-resigned-on-${index}`)),
    status: textById(html, `officer-status-tag-${index}`),
  }));
}

function publicControllers(html: string) {
  return ids(html, "psc-name").map((index) => {
    const natures = [
      ...html.matchAll(
        new RegExp(
          `id=["']psc-noc-${index}-[^"']+["'][^>]*>([\\s\\S]*?)<\\/`,
          "gi",
        ),
      ),
    ]
      .map((match) => plainText(match[1]))
      .filter(Boolean);
    return {
      name: textById(html, `psc-name-${index}`),
      status: textById(html, `psc-status-tag-${index}`),
      notifiedOn: dateFromText(textById(html, `psc-notified-on-${index}`)),
      ceasedOn: dateFromText(textById(html, `psc-ceased-on-${index}`)),
      naturesOfControl: [...new Set(natures)],
    };
  });
}

function publicCharges(html: string) {
  return {
    summary:
      textById(html, "company-mortgages-breakdown") ??
      textById(html, "company-mortgages"),
    items: ids(html, "mortgage-heading").map((index) => ({
      description: textById(html, `mortgage-heading-${index}`),
      createdOn: dateFromText(textById(html, `mortgage-created-on-${index}`)),
      status: textById(html, `mortgage-status-${index}`),
    })),
  };
}

function latestAccountsFiling(html: string) {
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const row = match[1];
    if (!/<strong>[^<]*accounts/i.test(row)) continue;
    const rowText = plainText(row);
    const xhtml = row.match(
      /href=["']([^"']*\/document\?format=xhtml(?:&amp;|&)download=1)["']/i,
    )?.[1];
    const pdf = row.match(
      /href=["']([^"']*\/document\?format=pdf(?:&amp;|&)download=[01])["']/i,
    )?.[1];
    const description = rowText.match(
      /(?:\d{1,2}\s+[A-Z][a-z]+\s+\d{4}\s+)?(?:AA\s+)?(.+?accounts[^\n]*?made up to \d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i,
    )?.[1];
    return {
      filingDate: dateFromText(rowText),
      filingDescription:
        description ??
        firstMatch(row, /<strong>([^<]*accounts[^<]*)<\/strong>/i),
      periodEnd: dateFromText(
        rowText.match(/made up to ([^\n]+)/i)?.[1] ?? null,
      ),
      documentUrl: xhtml
        ? absolutePublicUrl(xhtml)
        : pdf
          ? absolutePublicUrl(pdf)
          : null,
      format: xhtml ? "structured" : pdf ? "pdf" : "unavailable",
      pages: Number(rowText.match(/\((\d+) pages?\)/i)?.[1] ?? 0) || null,
    };
  }
  return null;
}

async function publicReport(
  companyNumber: string,
  store: FilesystemRawArtifactStore,
  rawArtifacts: RawArtifact[],
) {
  const sourceUrl = `${PUBLIC_BASE}/company/${companyNumber}`;
  const pages = await Promise.all([
    fetchPublic(sourceUrl, store, rawArtifacts),
    fetchPublic(`${sourceUrl}/officers`, store, rawArtifacts),
    fetchPublic(
      `${sourceUrl}/persons-with-significant-control`,
      store,
      rawArtifacts,
    ),
    fetchPublic(`${sourceUrl}/charges`, store, rawArtifacts),
    fetchPublic(
      `${sourceUrl}/filing-history?category=accounts`,
      store,
      rawArtifacts,
    ),
  ]);
  const [profilePage, officersPage, controllersPage, chargesPage, filingsPage] =
    pages;
  const profile = publicProfile(profilePage.html);
  const companyName =
    firstMatch(
      profilePage.html,
      /<h1\b[^>]*class=["'][^"']*heading-xlarge[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
    ) ??
    firstMatch(
      profilePage.html,
      /<title>([\s\S]*?)\s+-\s+Free company information/i,
    );
  if (!companyName || !profile.status) {
    throw new Error(
      `Companies House public profile identity could not be parsed for ${companyNumber}`,
    );
  }
  const filing = latestAccountsFiling(filingsPage.html);
  let financials = null;
  let document: JsonObject | null = filing
    ? {
        filingDate: filing.filingDate,
        filingDescription: filing.filingDescription,
        documentUrl: filing.documentUrl,
        contentType: filing.format === "pdf" ? "application/pdf" : null,
        format: filing.format,
        pages: filing.pages,
      }
    : null;
  let documentWarning: string | null = null;

  if (filing?.documentUrl && filing.format === "structured") {
    try {
      await pause(250);
      const accountsPage = await fetchPublic(
        filing.documentUrl,
        store,
        rawArtifacts,
      );
      const parsed = parseAccountsDocument(accountsPage.html);
      financials = analyseAccountsDocument(parsed);
      document = {
        filingDate: filing.filingDate,
        filingDescription: filing.filingDescription,
        documentUrl: filing.documentUrl,
        contentType: accountsPage.contentType,
        format: "structured",
        pages: filing.pages,
      };
    } catch (error) {
      documentWarning = `Latest structured accounts could not be parsed: ${error instanceof Error ? error.message : String(error)}`;
    }
  } else if (filing?.format === "pdf") {
    documentWarning =
      "The latest accounts are available as PDF only, so structured financial metrics were not extracted.";
  } else {
    documentWarning =
      "No public accounts document was linked from the filing history.";
  }

  return {
    companyNumber,
    companyName,
    sourceUrl,
    observedAt: new Date().toISOString(),
    profile: {
      ...profile,
      accountsType: financials?.disclosure.accountsType ?? null,
      accountsPeriodEnd:
        financials?.periodEnd ?? filing?.periodEnd ?? profile.accountsPeriodEnd,
    },
    officers: publicOfficers(officersPage.html),
    registry: {
      controllers: publicControllers(controllersPage.html),
      charges: publicCharges(chargesPage.html),
    },
    financials,
    accountsDocument: document,
    quality: {
      financialWarnings: financials?.warnings ?? [
        documentWarning ?? "No structured accounts metrics were available.",
      ],
      rawArtifactCount: rawArtifacts.length,
    },
    rawArtifacts,
  };
}

async function apiReport(
  companyNumber: string,
  apiKey: string,
  store: FilesystemRawArtifactStore,
  rawArtifacts: RawArtifact[],
) {
  const capture = async (
    response: CompaniesHouseResponse | AccountsRawResponse,
  ) => {
    const artifact = await store.putBuffer(response.body, response.contentType);
    rawArtifacts.push({
      id: artifact.id,
      contentType: artifact.contentType,
      byteLength: artifact.byteLength,
      storageUri: artifact.storageUri,
      sourceUrl: response.url,
      fetchedAt: response.fetchedAt.toISOString(),
    });
  };
  const client = new CompaniesHouseClient(
    apiKey,
    fetch,
    Number(process.env.COMPANIES_HOUSE_REQUEST_INTERVAL_MS ?? 700),
    capture,
  );
  const registry = await fetchRegistryIntelligence(companyNumber, client);
  const officers = await fetchCompanyOfficersWithClient(companyNumber, client);
  const registryAnalysis = analyseRegistry(registry, officers);
  const accountsDocument = await fetchLatestAccountsDocument(
    companyNumber,
    apiKey,
    capture,
  );
  const financials = accountsDocument?.parsed
    ? analyseAccountsDocument(accountsDocument.parsed)
    : null;
  const rawProfile = registry.profile.raw;
  const accounts = object(rawProfile.accounts);
  const lastAccounts = object(accounts?.last_accounts);
  return {
    companyNumber,
    companyName: string(rawProfile.company_name),
    sourceUrl: `${PUBLIC_BASE}/company/${companyNumber}`,
    observedAt: new Date().toISOString(),
    profile: {
      status: string(rawProfile.company_status),
      type: string(rawProfile.type),
      incorporatedOn: string(rawProfile.date_of_creation),
      registeredOffice: address(rawProfile.registered_office_address),
      sicCodes: strings(rawProfile.sic_codes),
      accountsType: string(lastAccounts?.type),
      accountsPeriodEnd:
        string(lastAccounts?.period_end_on) ?? string(lastAccounts?.made_up_to),
      accountsNextDue: registry.profile.accountsNextDue,
      accountsOverdue: registry.profile.accountsOverdue,
      confirmationNextDue: registry.profile.confirmationNextDue,
      confirmationOverdue: registry.profile.confirmationOverdue,
    },
    officers,
    registry: registryAnalysis,
    financials,
    accountsDocument: accountsDocument
      ? {
          filingDate: accountsDocument.filingDate,
          filingDescription: accountsDocument.filingDescription,
          documentUrl: accountsDocument.documentUrl,
          contentType: accountsDocument.contentType,
          format: accountsDocument.format,
          pages: accountsDocument.pages,
        }
      : null,
    quality: {
      financialWarnings: financials?.warnings ?? [
        accountsDocument
          ? "The latest retrieved accounts were not available as structured XBRL/iXBRL metrics."
          : "No accounts document was retrieved.",
      ],
      rawArtifactCount: rawArtifacts.length,
    },
    rawArtifacts,
  };
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write(
      "Usage: pnpm companies-house:export --companies-file <csv> --output <json>\n",
    );
    return;
  }
  const companiesFile = argument("--companies-file");
  const outputPath = argument("--output");
  if (!companiesFile || !outputPath) {
    throw new Error(
      "Usage: tsx src/jobs/export-report-financials.ts --companies-file <csv> --output <json>",
    );
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  const mode = apiKey ? "api" : "public-web";
  const companies = await selectedCompanies(companiesFile);
  const store = new FilesystemRawArtifactStore();
  const reports: JsonObject[] = [];
  const totals = {
    companies: companies.length,
    completed: 0,
    failed: 0,
    accountsDocuments: 0,
    structuredAccounts: 0,
    metricsWithTurnover: 0,
    metricsWithEmployees: 0,
    rawArtifacts: 0,
  };

  process.stderr.write(`Companies House source mode: ${mode}\n`);
  for (const [index, companyNumber] of companies.entries()) {
    const rawArtifacts: RawArtifact[] = [];
    try {
      const report = apiKey
        ? await apiReport(companyNumber, apiKey, store, rawArtifacts)
        : await publicReport(companyNumber, store, rawArtifacts);
      const financials = object(report.financials);
      const metrics = object(financials?.metrics);
      const accountsDocument = object(report.accountsDocument);
      if (accountsDocument) totals.accountsDocuments += 1;
      if (accountsDocument?.format === "structured")
        totals.structuredAccounts += 1;
      if (metrics?.turnover) totals.metricsWithTurnover += 1;
      if (metrics?.employees) totals.metricsWithEmployees += 1;
      totals.rawArtifacts += rawArtifacts.length;
      reports.push(report);
      totals.completed += 1;
      process.stderr.write(
        `[${index + 1}/${companies.length}] ${companyNumber} complete\n`,
      );
    } catch (error) {
      totals.failed += 1;
      totals.rawArtifacts += rawArtifacts.length;
      reports.push({
        companyNumber,
        error: error instanceof Error ? error.message : String(error),
        rawArtifacts,
      });
      process.stderr.write(
        `[${index + 1}/${companies.length}] ${companyNumber} failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
    if (!apiKey && index < companies.length - 1) await pause(400);
  }

  const destination = path.resolve(outputPath);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp`;
  await writeFile(
    temporary,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        methodology: {
          source:
            mode === "api"
              ? "Companies House live registry API and latest public accounts documents, captured with content-addressed raw artifacts."
              : "Companies House public company pages and latest linked iXBRL accounts documents, captured with content-addressed raw artifacts.",
          mode,
          boundary:
            "Companies House filings are company-submitted public records. Missing turnover or employee metrics means not disclosed or not parsed, not zero.",
          databaseWrites: false,
        },
        totals,
        reports,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await rename(temporary, destination);
  process.stdout.write(`${destination}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
