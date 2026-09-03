import { describe, expect, it } from "vitest";
import { parseAccountsDocument } from "./xbrl";
import { analyseAccountsDocument } from "./financial-analysis";

describe("accounts intelligence", () => {
  it("builds comparisons, ratios, and explainable signals", () => {
    const source = `
      <xbrli:context id="current"><xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <xbrli:context id="prior"><xbrli:period><xbrli:startDate>2024-01-01</xbrli:startDate><xbrli:endDate>2024-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <ix:nonFraction name="uk-core:TurnoverRevenue" contextRef="current">1,500,000</ix:nonFraction>
      <ix:nonFraction name="uk-core:TurnoverRevenue" contextRef="prior">1,000,000</ix:nonFraction>
      <ix:nonFraction name="uk-core:OperatingProfitLoss" contextRef="current">150,000</ix:nonFraction>
      <ix:nonFraction name="uk-core:AverageNumberEmployeesDuringPeriod" contextRef="current">10</ix:nonFraction>
      <ix:nonFraction name="uk-core:AverageNumberEmployeesDuringPeriod" contextRef="prior">8</ix:nonFraction>
    `;
    const result = analyseAccountsDocument(parseAccountsDocument(source));
    expect(result.metrics.turnover.percentageChange).toBe(0.5);
    expect(result.ratios.operatingMargin).toBe(0.1);
    expect(result.ratios.revenuePerEmployee).toBe(150_000);
    expect(result.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "revenue_growth",
          severity: "opportunity",
        }),
        expect.objectContaining({
          kind: "headcount_change",
          severity: "opportunity",
        }),
      ]),
    );
  });

  it("labels missing turnover and negative net assets", () => {
    const source = `
      <xbrli:context id="current"><xbrli:period><xbrli:instant>2025-12-31</xbrli:instant></xbrli:period></xbrli:context>
      <uk-core:NetAssetsLiabilities contextRef="current">(250000)</uk-core:NetAssetsLiabilities>
    `;
    const result = analyseAccountsDocument(parseAccountsDocument(source));
    expect(result.warnings).toContain(
      "Turnover was not disclosed in the structured accounts.",
    );
    expect(result.signals).toContainEqual(
      expect.objectContaining({
        kind: "negative_net_assets",
        severity: "risk",
      }),
    );
  });

  it("recovers a displayed employee count from a broken negative iXBRL scale", () => {
    const source = `
      <xbrli:context id="current"><xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>
      <ix:nonFraction name="uk-core:AverageNumberEmployeesDuringPeriod" contextRef="current" unitRef="Pure" decimals="2" scale="-2">19</ix:nonFraction>
    `;
    const result = analyseAccountsDocument(parseAccountsDocument(source));
    expect(result.metrics.employees.current.value).toBe(19);
    expect(result.warnings).toContain(
      "Employee count used the displayed integral value because the filing supplied an inconsistent negative iXBRL scale.",
    );
  });
});
