import { describe, expect, it } from "vitest";
import { normaliseAppointment, normaliseOfficer } from "./officers";

describe("Companies House officers", () => {
  it("normalises a public officer record and keeps its stable appointments link", () => {
    expect(
      normaliseOfficer({
        name: "DOE, Jane",
        officer_role: "director",
        appointed_on: "2026-08-28",
        occupation: "Designer",
        links: { officer: { appointments: "/officers/abc/appointments" } },
      }),
    ).toEqual({
      officerId: "/officers/abc/appointments",
      name: "DOE, Jane",
      role: "director",
      appointedOn: "2026-08-28",
      resignedOn: null,
      occupation: "Designer",
      nationality: null,
      countryOfResidence: null,
    });
  });

  it("normalises linked company appointments", () => {
    expect(
      normaliseAppointment({
        name: "Jane EXAMPLE",
        officer_role: "director",
        appointed_on: "2018-01-02",
        appointed_to: {
          company_name: "EXAMPLE STUDIO LTD",
          company_number: "01234567",
          company_status: "active",
        },
      }),
    ).toEqual({
      companyName: "EXAMPLE STUDIO LTD",
      companyNumber: "01234567",
      companyStatus: "active",
      officerName: "Jane EXAMPLE",
      role: "director",
      appointedOn: "2018-01-02",
      resignedOn: null,
    });
  });
});
