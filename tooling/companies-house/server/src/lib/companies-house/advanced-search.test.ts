import { describe, expect, it } from "vitest";
import { csvInternals } from "./advanced-search";

describe("Companies House CSV parser", () => {
  it("preserves commas and escaped quotes inside quoted cells", () => {
    expect(
      csvInternals.parseCsvLine('"ACME, \"\"GOOD\"\" LTD",123,active'),
    ).toEqual(['ACME, "GOOD" LTD', "123", "active"]);
  });

  it("maps the official export headers", () => {
    const rows = csvInternals.parseCsv(
      "company_name,company_number,company_status,company_type,company_subtype,dissolution_date,incorporation_date,removed_date,registered_date,nature_of_business,registered_office_address\nACME LTD,123,active,ltd,,,2026-08-27,,2026-08-27,[62012],1 High Street London SW1A 1AA\n",
    );
    expect(rows[0].nature_of_business).toBe("[62012]");
    expect(rows[0].registered_office_address).toBe(
      "1 High Street London SW1A 1AA",
    );
  });

  it("handles Companies House multi-SIC lists with unquoted commas", () => {
    const rows = csvInternals.parseCsv(
      "company_name,company_number,company_status,company_type,company_subtype,dissolution_date,incorporation_date,removed_date,registered_date,nature_of_business,registered_office_address\nACME LTD,123,active,ltd,,,2026-08-27,,2026-08-27,[62012, 70229],1 High Street London SW1A 1AA\n",
    );
    expect(rows[0].nature_of_business).toBe("[62012, 70229]");
    expect(rows[0].registered_office_address).toBe(
      "1 High Street London SW1A 1AA",
    );
  });
});
