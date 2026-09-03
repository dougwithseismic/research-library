import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { extname } from "node:path";
import unzipper from "unzipper";
import { ParsedAccountsDocument, parseAccountsDocument } from "./xbrl";

const MAX_ACCOUNT_DOCUMENT_BYTES = 25_000_000;

export type BulkAccountsDocument = ParsedAccountsDocument & {
  sourceName: string;
  format: "html" | "xml";
};

export type AccountsArchiveStats = {
  entries: number;
  documents: number;
  parsed: number;
  failed: number;
  missingCompanyNumber: number;
  facts: number;
  canonicalFacts: number;
  metrics: Record<string, number>;
  regimes: Record<string, number>;
  errors: Array<{ sourceName: string; message: string }>;
};

function filenameCompanyNumber(name: string) {
  return (
    /_([A-Z0-9]{8})_\d{8}(?:[_.]|$)/i.exec(name)?.[1]?.toUpperCase() ?? null
  );
}

async function readableFor(source: string) {
  if (!/^https?:\/\//i.test(source)) return createReadStream(source);
  const response = await fetch(source, {
    headers: { "user-agent": "ResearchLibrary/0.1 bulk-accounts-ingestion" },
  });
  if (!response.ok || !response.body)
    throw new Error(`Accounts archive download failed with ${response.status}`);
  return Readable.fromWeb(response.body as never);
}

async function boundedBuffer(
  stream: NodeJS.ReadableStream,
  maximum = MAX_ACCOUNT_DOCUMENT_BYTES,
) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maximum)
      throw new Error(`Account document exceeds ${maximum} bytes`);
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function supported(name: string) {
  const extension = extname(name).toLowerCase();
  return (
    extension === ".html" || extension === ".xhtml" || extension === ".xml"
  );
}

function parseBulkDocument(
  sourceName: string,
  source: Buffer,
): BulkAccountsDocument {
  const parsed = parseAccountsDocument(source.toString("utf8"));
  const fallbackCompanyNumber = filenameCompanyNumber(sourceName);
  const companyNumber = /^[A-Z0-9]{8}$/i.test(parsed.companyNumber ?? "")
    ? (parsed.companyNumber?.toUpperCase() ?? null)
    : fallbackCompanyNumber;
  const extension = extname(sourceName).toLowerCase();
  return {
    ...parsed,
    companyNumber,
    sourceName,
    format: extension === ".xml" ? "xml" : "html",
  };
}

export async function scanAccountsArchive(
  source: string,
  onDocument: (document: BulkAccountsDocument) => Promise<void> | void,
  options: { limit?: number; maxDocumentBytes?: number } = {},
) {
  const stats: AccountsArchiveStats = {
    entries: 0,
    documents: 0,
    parsed: 0,
    failed: 0,
    missingCompanyNumber: 0,
    facts: 0,
    canonicalFacts: 0,
    metrics: {},
    regimes: {},
    errors: [],
  };
  const input = await readableFor(source);
  const archive = input.pipe(unzipper.Parse({ forceStream: true }));

  const accept = async (sourceName: string, buffer: Buffer) => {
    if (options.limit !== undefined && stats.documents >= options.limit)
      return false;
    stats.documents += 1;
    try {
      const document = parseBulkDocument(sourceName, buffer);
      stats.parsed += 1;
      if (!document.companyNumber) stats.missingCompanyNumber += 1;
      stats.facts += document.facts.length;
      const regime =
        [
          document.metadata.accounting_standard,
          document.metadata.legislation,
          document.metadata.accounts_type,
        ]
          .filter(Boolean)
          .join(" | ") ||
        document.metadata.audit_status ||
        document.metadata.trading_status ||
        (document.metadata.dormant === "true" ? "dormant" : "unclassified");
      stats.regimes[regime] = (stats.regimes[regime] ?? 0) + 1;
      for (const fact of document.facts) {
        if (!fact.canonicalMetric) continue;
        stats.canonicalFacts += 1;
        stats.metrics[fact.canonicalMetric] =
          (stats.metrics[fact.canonicalMetric] ?? 0) + 1;
      }
      await onDocument(document);
    } catch (error) {
      stats.failed += 1;
      if (stats.errors.length < 20)
        stats.errors.push({
          sourceName,
          message: error instanceof Error ? error.message : String(error),
        });
    }
    return true;
  };

  for await (const entry of archive) {
    stats.entries += 1;
    const entryName = String(entry.path ?? "unknown");
    if (entry.type !== "File") {
      entry.autodrain();
      continue;
    }
    if (supported(entryName)) {
      const keepGoing = await accept(
        entryName,
        await boundedBuffer(entry, options.maxDocumentBytes),
      );
      if (!keepGoing) {
        entry.autodrain();
        break;
      }
      continue;
    }
    if (extname(entryName).toLowerCase() === ".zip") {
      try {
        const nested = await unzipper.Open.buffer(
          await boundedBuffer(entry, options.maxDocumentBytes),
        );
        for (const file of nested.files) {
          if (!supported(file.path)) continue;
          const keepGoing = await accept(
            `${entryName}/${file.path}`,
            await boundedBuffer(file.stream(), options.maxDocumentBytes),
          );
          if (!keepGoing) break;
        }
      } catch (error) {
        stats.failed += 1;
        if (stats.errors.length < 20)
          stats.errors.push({
            sourceName: entryName,
            message: error instanceof Error ? error.message : String(error),
          });
      }
      if (options.limit !== undefined && stats.documents >= options.limit)
        break;
      continue;
    }
    entry.autodrain();
  }
  input.destroy();
  return stats;
}

export const archiveInternals = {
  boundedBuffer,
  filenameCompanyNumber,
  parseBulkDocument,
  supported,
};
