import {
  numericFactValue,
  ParsedAccountsDocument,
  parseAccountsDocument,
} from "./xbrl";
import { PDFParse } from "pdf-parse";

const COMPANIES_HOUSE_API = "https://api.company-information.service.gov.uk";
const DOCUMENT_API = "https://document-api.company-information.service.gov.uk";
const MAX_STRUCTURED_DOCUMENT_BYTES = 12_000_000;
const MAX_PDF_DOCUMENT_BYTES = 50_000_000;

type FilingHistoryItem = {
  date: string;
  description: string;
  type: string;
  links?: { document_metadata?: string; self?: string };
};

type FilingHistory = { items?: FilingHistoryItem[] };
type DocumentMetadata = {
  resources?: Record<string, { content_length?: number }>;
};

export type AccountsRawResponse = {
  url: string;
  contentType: string;
  body: string | Buffer;
  fetchedAt: Date;
};

export type LatestAccountsDocument = {
  companyNumber: string;
  filingDate: string;
  filingDescription: string;
  documentUrl: string;
  contentType: string;
  format: "structured" | "pdf";
  source: string | Buffer;
  parsed: ParsedAccountsDocument | null;
  extractedText: string | null;
  pages: number | null;
};

export type FinancialMetric = {
  value: number;
  periodEnd: string | null;
  concept: string;
};

export type AccountsFinancials = {
  companyNumber: string;
  filingDate: string;
  filingDescription: string;
  documentUrl: string;
  contentType: string;
  turnover: FinancialMetric | null;
  grossProfit: FinancialMetric | null;
  operatingProfit: FinancialMetric | null;
  profitBeforeTax: FinancialMetric | null;
  profitAfterTax: FinancialMetric | null;
  cash: FinancialMetric | null;
  netAssets: FinancialMetric | null;
  employees: FinancialMetric | null;
};

function authorisation(apiKey: string) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

let nextAccountsRequestAt = 0;
let accountsRequestChain = Promise.resolve();

async function waitForAccountsSlot() {
  const intervalMs = Number(
    process.env.COMPANIES_HOUSE_REQUEST_INTERVAL_MS ?? 700,
  );
  const wait = Math.max(0, nextAccountsRequestAt - Date.now());
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  nextAccountsRequestAt = Date.now() + intervalMs;
}

async function companiesHouseFetch(input: string, init: RequestInit) {
  const maxAttempts = Math.max(
    1,
    Number(process.env.COMPANIES_HOUSE_RETRY_ATTEMPTS ?? 5),
  );
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const turn = accountsRequestChain.then(() => waitForAccountsSlot());
    accountsRequestChain = turn.catch(() => undefined);
    await turn;
    const response = await fetch(input, init);
    if (response.status !== 429 || attempt === maxAttempts) return response;
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter =
      retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);
    const waitMs = Number.isFinite(retryAfter)
      ? Math.max(0, retryAfter * 1_000)
      : Number(process.env.COMPANIES_HOUSE_RETRY_BACKOFF_MS ?? 65_000);
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  throw new Error("Companies House request retry loop exited unexpectedly");
}

export function parseAccountsFacts(source: string) {
  const facts = parseAccountsDocument(source).facts;
  const latest = (metric: string): FinancialMetric | null => {
    const fact =
      facts
        .filter(
          (candidate) =>
            candidate.canonicalMetric === metric &&
            Object.keys(candidate.dimensions).length === 0,
        )
        .sort((left, right) =>
          (right.periodEnd ?? right.instant ?? "").localeCompare(
            left.periodEnd ?? left.instant ?? "",
          ),
        )[0] ??
      facts
        .filter((candidate) => candidate.canonicalMetric === metric)
        .sort((left, right) =>
          (right.periodEnd ?? right.instant ?? "").localeCompare(
            left.periodEnd ?? left.instant ?? "",
          ),
        )[0];
    if (!fact) return null;
    return {
      value: numericFactValue(fact),
      periodEnd: fact.periodEnd ?? fact.instant,
      concept: fact.concept,
    };
  };

  return {
    turnover: latest("turnover"),
    grossProfit: latest("gross_profit"),
    operatingProfit: latest("operating_profit"),
    profitBeforeTax: latest("profit_before_tax"),
    profitAfterTax: latest("profit_after_tax"),
    cash: latest("cash"),
    netAssets: latest("net_assets"),
    employees: latest("employees"),
  };
}

export async function fetchLatestAccountsDocument(
  companyNumber: string,
  apiKey = process.env.COMPANIES_HOUSE_API_KEY,
  onRaw?: (response: AccountsRawResponse) => Promise<void> | void,
): Promise<LatestAccountsDocument | null> {
  if (!apiKey)
    throw new Error(
      "COMPANIES_HOUSE_API_KEY is required for accounts enrichment",
    );
  const headers = {
    authorization: authorisation(apiKey),
    "user-agent": "ResearchLibrary/0.1 company-intelligence",
  };
  const historyUrl = `${COMPANIES_HOUSE_API}/company/${encodeURIComponent(companyNumber)}/filing-history?category=accounts&items_per_page=10`;
  const historyResponse = await companiesHouseFetch(historyUrl, { headers });
  if (historyResponse.status === 404) return null;
  if (!historyResponse.ok)
    throw new Error(
      `Companies House accounts history failed for ${companyNumber} with ${historyResponse.status}`,
    );
  const historyBody = await historyResponse.text();
  await onRaw?.({
    url: historyUrl,
    contentType: "application/json",
    body: historyBody,
    fetchedAt: new Date(),
  });
  const history = JSON.parse(historyBody) as FilingHistory;

  for (const filing of (history.items ?? []).slice(0, 3)) {
    const metadataUrl = filing.links?.document_metadata;
    if (!metadataUrl) continue;
    const metadataResponse = await companiesHouseFetch(metadataUrl, {
      headers,
    });
    if (!metadataResponse.ok) continue;
    const metadataBody = await metadataResponse.text();
    await onRaw?.({
      url: metadataUrl,
      contentType: "application/json",
      body: metadataBody,
      fetchedAt: new Date(),
    });
    const metadata = JSON.parse(metadataBody) as DocumentMetadata;
    const structuredType = ["application/xhtml+xml", "application/xml"].find(
      (type) => {
        const length = metadata.resources?.[type]?.content_length ?? 0;
        return length > 0 && length <= MAX_STRUCTURED_DOCUMENT_BYTES;
      },
    );
    const pdfLength =
      metadata.resources?.["application/pdf"]?.content_length ?? 0;
    const contentType =
      structuredType ??
      (pdfLength > 0 && pdfLength <= MAX_PDF_DOCUMENT_BYTES
        ? "application/pdf"
        : null);
    if (!contentType) continue;

    const documentId = new URL(metadataUrl).pathname
      .split("/")
      .filter(Boolean)
      .at(-1);
    if (!documentId) continue;
    const documentUrl = `${DOCUMENT_API}/document/${encodeURIComponent(documentId)}/content`;
    const documentResponse = await companiesHouseFetch(documentUrl, {
      headers: { ...headers, accept: contentType },
    });
    if (!documentResponse.ok) continue;
    const source =
      contentType === "application/pdf"
        ? Buffer.from(await documentResponse.arrayBuffer())
        : await documentResponse.text();
    await onRaw?.({
      url: documentUrl,
      contentType,
      body: source,
      fetchedAt: new Date(),
    });
    if (typeof source === "string") {
      const parsed = parseAccountsDocument(source);
      if (!parsed.facts.some((fact) => fact.canonicalMetric)) continue;
      return {
        companyNumber,
        filingDate: filing.date,
        filingDescription: filing.description,
        documentUrl: metadataUrl,
        contentType,
        format: "structured",
        source,
        parsed,
        extractedText: null,
        pages: null,
      };
    }
    const parser = new PDFParse({ data: source });
    try {
      const text = await parser.getText();
      return {
        companyNumber,
        filingDate: filing.date,
        filingDescription: filing.description,
        documentUrl: metadataUrl,
        contentType,
        format: "pdf",
        source,
        parsed: null,
        extractedText: text.text,
        pages: text.total,
      };
    } finally {
      await parser.destroy();
    }
  }
  return null;
}

export async function fetchLatestAccountsFinancials(
  companyNumber: string,
  apiKey = process.env.COMPANIES_HOUSE_API_KEY,
): Promise<AccountsFinancials | null> {
  const document = await fetchLatestAccountsDocument(companyNumber, apiKey);
  if (
    !document ||
    document.format !== "structured" ||
    typeof document.source !== "string"
  )
    return null;
  const metrics = parseAccountsFacts(document.source);
  return {
    companyNumber,
    filingDate: document.filingDate,
    filingDescription: document.filingDescription,
    documentUrl: document.documentUrl,
    contentType: document.contentType,
    ...metrics,
  };
}
