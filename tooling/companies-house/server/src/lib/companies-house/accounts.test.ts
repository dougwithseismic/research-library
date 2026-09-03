import { describe, expect, it } from "vitest";
import { parseAccountsFacts } from "./accounts";

describe("Companies House accounts facts", () => {
  it("extracts the latest scaled iXBRL financial values", () => {
    const source = `
      <xbrli:context id="current"><xbrli:period><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <xbrli:context id="prior"><xbrli:period><xbrli:endDate>2024-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <ix:nonFraction name="uk-core:TurnoverRevenue" contextRef="prior" scale="3">900</ix:nonFraction>
      <ix:nonFraction name="uk-core:TurnoverRevenue" contextRef="current" scale="3">1,250</ix:nonFraction>
      <ix:nonFraction name="uk-core:ProfitLossBeforeTax" contextRef="current" sign="-">42,500</ix:nonFraction>
      <ix:nonFraction name="uk-core:AverageNumberEmployeesDuringPeriod" contextRef="current">18</ix:nonFraction>
    `;
    const result = parseAccountsFacts(source);
    expect(result.turnover).toMatchObject({
      value: 1_250_000,
      periodEnd: "2025-12-31",
      concept: "uk-core:TurnoverRevenue",
    });
    expect(result.profitBeforeTax?.value).toBe(-42_500);
    expect(result.employees?.value).toBe(18);
  });

  it("extracts ordinary XBRL facts", () => {
    const source = `
      <xbrli:context id="y1"><xbrli:period><xbrli:instant>2025-03-31</xbrli:instant></xbrli:period></xbrli:context>
      <uk-gaap:NetAssetsLiabilities contextRef="y1">(12500)</uk-gaap:NetAssetsLiabilities>
    `;
    expect(parseAccountsFacts(source).netAssets).toMatchObject({
      value: -12_500,
      periodEnd: "2025-03-31",
    });
  });

  it("uses the displayed integral headcount when a filer supplies a broken negative scale", () => {
    const source = `
      <xbrli:context id="current"><xbrli:period><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <ix:nonFraction name="uk-core:AverageNumberEmployeesDuringPeriod" contextRef="current" unitRef="Pure" scale="-2">19</ix:nonFraction>
    `;
    expect(parseAccountsFacts(source).employees?.value).toBe(19);
  });
});
