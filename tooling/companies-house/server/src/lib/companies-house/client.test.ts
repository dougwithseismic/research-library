import { describe, expect, it, vi } from "vitest";
import { CompaniesHouseClient } from "./client";

describe("Companies House client", () => {
  it("paginates complete collections instead of truncating large companies", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const start = new URL(String(input)).searchParams.get("start_index");
      return Response.json(
        start === "0"
          ? {
              items: Array.from({ length: 100 }, (_, id) => ({ id })),
              total_results: 101,
            }
          : { items: [{ id: 100 }], total_results: 101 },
      );
    });
    const client = new CompaniesHouseClient(
      "test-key",
      fetcher as typeof fetch,
      0,
    );
    const result = await client.list<{ id: number }>(
      "/company/01234567/officers",
    );
    expect(result).toHaveLength(101);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("exposes every raw page to an awaited response observer", async () => {
    const observed: unknown[] = [];
    const fetcher = vi.fn(async () =>
      Response.json({ company_name: "Example Ltd" }),
    );
    const client = new CompaniesHouseClient(
      "key",
      fetcher as typeof fetch,
      0,
      async (response) => {
        observed.push(response.payload);
      },
    );
    await client.get("/company/01234567");
    expect(observed).toEqual([{ company_name: "Example Ltd" }]);
  });

  it("retries a rate-limited request using Retry-After", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("rate limited", {
          status: 429,
          headers: { "retry-after": "0" },
        }),
      )
      .mockResolvedValueOnce(Response.json({ company_name: "Example Ltd" }));
    const client = new CompaniesHouseClient("key", fetcher as typeof fetch, 0);
    await expect(client.get("/company/01234567")).resolves.toEqual({
      company_name: "Example Ltd",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
