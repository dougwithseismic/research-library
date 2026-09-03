import { describe, expect, it, vi } from "vitest";
import {
  normalisePersonName,
  resolveOfficerIdentity,
} from "./identity-resolution";

describe("officer identity resolution", () => {
  it("normalises Companies House surname-first names", () => {
    expect(normalisePersonName("BUTLER, Christopher Joseph")).toBe(
      "CHRISTOPHER JOSEPH BUTLER",
    );
    expect(normalisePersonName("Christopher Joseph BUTLER")).toBe(
      "CHRISTOPHER JOSEPH BUTLER",
    );
  });

  it("joins fragmented officer IDs only when exact name and birth month/year agree", async () => {
    const get = vi.fn(async () => ({
      total_results: 100,
      items: [
        {
          title: "<em>Christopher</em> Joseph BUTLER",
          description: "Total number of appointments 1 - Born December 1983",
          links: { self: "/officers/current/appointments" },
        },
        {
          title: "Christopher Joseph BUTLER",
          description: "Total number of appointments 1 - Born December 1983",
          links: { self: "/officers/old/appointments" },
        },
        {
          title: "Christopher Joseph BUTLER",
          description: "Total number of appointments 1 - Born January 1970",
          links: { self: "/officers/other/appointments" },
        },
      ],
    }));
    const list = vi.fn(async (path: string) => [
      {
        name: "Christopher BUTLER",
        officer_role: "director",
        appointed_to: {
          company_name: path.includes("old") ? "OLD LTD" : "NEW LTD",
          company_number: path.includes("old") ? "00000001" : "00000002",
        },
      },
    ]);
    const result = await resolveOfficerIdentity(
      {
        officerId: "/officers/current/appointments",
        name: "BUTLER, Christopher Joseph",
        role: "director",
        appointedOn: null,
        resignedOn: null,
        occupation: null,
        nationality: null,
        countryOfResidence: null,
      },
      { get, list },
    );
    expect(result.confidence).toBe(95);
    expect(result.officerIds).toHaveLength(2);
    expect(result.appointments.map((item) => item.companyName).sort()).toEqual([
      "NEW LTD",
      "OLD LTD",
    ]);
    expect(list).not.toHaveBeenCalledWith("/officers/other/appointments");
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining("Christopher%20Joseph%20Butler"),
    );
  });
});
