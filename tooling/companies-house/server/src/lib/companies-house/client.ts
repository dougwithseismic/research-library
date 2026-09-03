const API_ORIGIN = "https://api.company-information.service.gov.uk";

type Fetcher = typeof fetch;

export type CompaniesHouseResponse = {
  url: string;
  status: number;
  fetchedAt: Date;
  contentType: string;
  body: string;
  payload: unknown;
};

export class CompaniesHouseClient {
  private nextRequestAt = 0;
  private requestChain = Promise.resolve();

  constructor(
    private readonly apiKey = process.env.COMPANIES_HOUSE_API_KEY,
    private readonly fetcher: Fetcher = fetch,
    private readonly intervalMs = Number(
      process.env.COMPANIES_HOUSE_REQUEST_INTERVAL_MS ?? 700,
    ),
    private readonly onResponse?: (
      response: CompaniesHouseResponse,
    ) => Promise<void> | void,
  ) {}

  private async waitForSlot() {
    const wait = Math.max(0, this.nextRequestAt - Date.now());
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    this.nextRequestAt = Date.now() + this.intervalMs;
  }

  async get<T>(path: string, options: { notFound?: T } = {}): Promise<T> {
    if (!this.apiKey)
      throw new Error(
        "COMPANIES_HOUSE_API_KEY is required for registry enrichment",
      );
    const turn = this.requestChain.then(() => this.waitForSlot());
    this.requestChain = turn.catch(() => undefined);
    await turn;

    const url = path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
    const maxAttempts = Math.max(
      1,
      Number(process.env.COMPANIES_HOUSE_RETRY_ATTEMPTS ?? 5),
    );
    // A request with no timeout can wedge the whole run: a stalled connection
    // never rejects, so the process sits at zero CPU holding a socket that will
    // never answer. Long captures hit this eventually. Every attempt is bounded,
    // and a network failure is retried the same way a 429 is rather than
    // aborting the batch.
    const timeoutMs = Number(
      process.env.COMPANIES_HOUSE_REQUEST_TIMEOUT_MS ?? 30_000,
    );
    let response: Response | null = null;
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        response = await this.fetcher(url, {
          headers: {
            authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`,
            "user-agent": "ResearchLibrary/0.1 company-intelligence",
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
        lastError = null;
      } catch (error) {
        lastError = error;
        response = null;
        if (attempt === maxAttempts) break;
        // Linear backoff: a transient network fault clears in seconds, and a
        // longer wait is what the 429 path is for.
        await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
        continue;
      }
      if (response.status !== 429 || attempt === maxAttempts) break;
      const retryAfterHeader = response.headers.get("retry-after");
      const retryAfter =
        retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);
      const waitMs = Number.isFinite(retryAfter)
        ? Math.max(0, retryAfter * 1_000)
        : Number(process.env.COMPANIES_HOUSE_RETRY_BACKOFF_MS ?? 65_000);
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      await this.waitForSlot();
    }
    if (lastError) {
      throw new Error(
        `Companies House request failed after ${maxAttempts} attempts: ${new URL(url).pathname}: ${
          lastError instanceof Error ? lastError.message : String(lastError)
        }`,
      );
    }
    if (!response)
      throw new Error(
        `Companies House request did not run: ${new URL(url).pathname}`,
      );
    if (response.status === 404 && "notFound" in options)
      return options.notFound as T;
    if (!response.ok)
      throw new Error(
        `Companies House request failed with ${response.status}: ${new URL(url).pathname}`,
      );
    const body = await response.text();
    const payload = JSON.parse(body) as T;
    await this.onResponse?.({
      url,
      status: response.status,
      fetchedAt: new Date(),
      contentType: response.headers.get("content-type") ?? "application/json",
      body,
      payload,
    });
    return payload;
  }

  async list<T>(path: string, pageSize = 100): Promise<T[]> {
    const results: T[] = [];
    let startIndex = 0;
    while (true) {
      const url = new URL(path, API_ORIGIN);
      url.searchParams.set("items_per_page", String(pageSize));
      url.searchParams.set("start_index", String(startIndex));
      const page = await this.get<{
        items?: T[];
        total_results?: number;
        total_count?: number;
      }>(url.toString(), {
        notFound: { items: [], total_results: 0 },
      });
      const items = page.items ?? [];
      results.push(...items);
      const total = page.total_results ?? page.total_count;
      startIndex += items.length;
      if (
        !items.length ||
        (total !== undefined && startIndex >= total) ||
        (total === undefined && items.length < pageSize)
      )
        break;
    }
    return results;
  }
}

let sharedClient: CompaniesHouseClient | undefined;

export function companiesHouseClient() {
  sharedClient ??= new CompaniesHouseClient();
  return sharedClient;
}
