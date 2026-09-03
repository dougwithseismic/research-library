import { describe, expect, it } from "vitest";
import { analyseRegistry } from "./registry-analysis";

describe("registry intelligence", () => {
  it("detects overdue, insolvency, and clustered finance events without presenting inference as fact", () => {
    const result = analyseRegistry(
      {
        profile: {
          companyNumber: "01234567",
          accountsLastPeriodEnd: null,
          accountsNextDue: "2026-01-01",
          accountsOverdue: true,
          confirmationLastMadeUpTo: null,
          confirmationNextDue: null,
          confirmationOverdue: false,
          raw: { company_status: "liquidation" },
        },
        controllers: [],
        charges: ["2026-02-01", "2026-02-05"].map((createdOn, index) => ({
          companyNumber: "01234567",
          chargeId: String(index),
          chargeCode: null,
          status: "outstanding",
          createdOn,
          deliveredOn: null,
          satisfiedOn: null,
          personsEntitled: [{ name: "Example Bank" }],
          particulars: [],
          securedDetails: [],
          raw: {},
        })),
        filings: [],
        insolvencyCases: [
          {
            id: "case",
            companyNumber: "01234567",
            caseNumber: "1",
            type: "creditors-voluntary-liquidation",
            status: "liquidation",
            dates: [],
            practitioners: [],
            raw: {},
          },
        ],
      },
      [],
      new Date("2026-03-01T00:00:00.000Z"),
    );
    expect(result.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "accounts_overdue", severity: "risk" }),
        expect.objectContaining({ kind: "insolvency", severity: "risk" }),
        expect.objectContaining({
          kind: "financing_event",
          evidence: expect.objectContaining({ inference: true }),
        }),
      ]),
    );
  });

  it("does not present an old charge cluster as a current opportunity", () => {
    const charges = ["2009-11-04", "2009-11-04"].map((createdOn, index) => ({
      companyNumber: "01234567",
      chargeId: String(index),
      chargeCode: null,
      status: "outstanding",
      createdOn,
      deliveredOn: null,
      satisfiedOn: null,
      personsEntitled: [],
      particulars: [],
      securedDetails: [],
      raw: {},
    }));
    const profile = {
      companyNumber: "01234567",
      accountsLastPeriodEnd: null,
      accountsNextDue: null,
      accountsOverdue: false,
      confirmationLastMadeUpTo: null,
      confirmationNextDue: null,
      confirmationOverdue: false,
      raw: {},
    };
    const result = analyseRegistry(
      { profile, controllers: [], charges, filings: [], insolvencyCases: [] },
      [],
      new Date("2026-08-28T00:00:00.000Z"),
    );
    expect(result.signals).toContainEqual(
      expect.objectContaining({
        kind: "historical_financing_cluster",
        severity: "info",
      }),
    );
    expect(result.signals).not.toContainEqual(
      expect.objectContaining({
        kind: "financing_event",
        severity: "opportunity",
      }),
    );
  });
});
