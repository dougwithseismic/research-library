import { describe, expect, it } from "vitest";
import { fetchRegistryIntelligence } from "./registry";

describe("Companies House registry intelligence", () => {
  it("normalizes PSC, charge, filing and insolvency records", async () => {
    const client = {
      list: async <T>(path: string): Promise<T[]> => {
        if (path.includes("persons-with-significant-control"))
          return [
            {
              kind: "individual-person-with-significant-control",
              name: "DOE, Jane",
              notified_on: "2025-01-02",
              natures_of_control: ["ownership-of-shares-25-to-50-percent"],
              identity_verification_details: {
                identity_verified_on: "2026-06-01",
              },
              links: {
                self: "/company/01234567/persons-with-significant-control/individual/psc-1",
              },
            },
          ] as T[];
        if (path.includes("charges"))
          return [
            {
              id: "charge-1",
              status: "outstanding",
              created_on: "2024-01-01",
              persons_entitled: [{ name: "EXAMPLE BANK" }],
            },
          ] as T[];
        return [
          {
            transaction_id: "tx-1",
            category: "accounts",
            type: "AA",
            description: "accounts-with-accounts-type-full",
            date: "2026-01-01",
            links: {
              document_metadata: "https://document-api.example/document/1",
            },
          },
        ] as T[];
      },
      get: async <T>(path: string): Promise<T> =>
        (path.endsWith("/insolvency")
          ? {
              status: "liquidation",
              cases: [
                {
                  number: "1",
                  type: "creditors-voluntary-liquidation",
                  dates: [],
                  practitioners: [],
                },
              ],
            }
          : {
              accounts: {
                last_accounts: { period_end_on: "2025-12-31" },
                next_accounts: { due_on: "2026-09-30", overdue: false },
              },
              confirmation_statement: {
                next_due: "2027-01-01",
                overdue: false,
              },
            }) as T,
    };
    const result = await fetchRegistryIntelligence("01234567", client);
    expect(result.profile).toMatchObject({
      accountsLastPeriodEnd: "2025-12-31",
      accountsNextDue: "2026-09-30",
      accountsOverdue: false,
    });
    expect(result.controllers[0]).toMatchObject({
      notificationId: "psc-1",
      name: "DOE, Jane",
      naturesOfControl: ["ownership-of-shares-25-to-50-percent"],
    });
    expect(result.charges[0]).toMatchObject({
      chargeId: "charge-1",
      status: "outstanding",
    });
    expect(result.filings[0]).toMatchObject({
      transactionId: "tx-1",
      type: "AA",
    });
    expect(result.insolvencyCases[0]).toMatchObject({
      status: "liquidation",
      type: "creditors-voluntary-liquidation",
    });
  });
});
