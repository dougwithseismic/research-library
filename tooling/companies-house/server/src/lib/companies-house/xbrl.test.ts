import { describe, expect, it } from "vitest";
import { parseAccountsDocument, parseNumericValue } from "./xbrl";

describe("normalized XBRL accounts", () => {
  it("extracts facts and filing regime metadata from a micro-entity iXBRL document", () => {
    const source = `
      <html xmlns:ix="http://www.xbrl.org/2013/inlineXBRL" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xbrldi="http://xbrl.org/2006/xbrldi">
        <xbrli:context id="FY">
          <xbrli:entity><xbrli:identifier scheme="http://www.companieshouse.gov.uk/">01234567</xbrli:identifier><xbrli:segment>
            <xbrldi:explicitMember dimension="uk-core:AccountingStandardsDimension">uk-core:Micro-entities</xbrldi:explicitMember>
            <xbrldi:explicitMember dimension="uk-core:ApplicableLegislationDimension">uk-core:SmallCompaniesRegimeForAccounts</xbrldi:explicitMember>
            <xbrldi:explicitMember dimension="uk-core:AccountsTypeDimension">uk-core:FilletedAccounts</xbrldi:explicitMember>
          </xbrli:segment></xbrli:entity>
          <xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period>
        </xbrli:context>
        <xbrli:unit id="GBP"><xbrli:measure>iso4217:GBP</xbrli:measure></xbrli:unit>
        <ix:nonNumeric name="uk-core:EntityDormantTruefalse" contextRef="FY">false</ix:nonNumeric>
        <ix:nonFraction name="uk-core:TurnoverRevenue" contextRef="FY" unitRef="GBP" scale="3">1,234.5</ix:nonFraction>
        <ix:nonFraction name="uk-core:NetAssetsLiabilities" contextRef="FY" unitRef="GBP" sign="-">2500</ix:nonFraction>
      </html>
    `;
    const result = parseAccountsDocument(source);
    expect(result).toMatchObject({
      companyNumber: "01234567",
      periodStart: "2025-01-01",
      periodEnd: "2025-12-31",
      currency: "GBP",
      metadata: {
        accounting_standard: "Micro-entities",
        legislation: "SmallCompaniesRegimeForAccounts",
        accounts_type: "FilletedAccounts",
        dormant: "false",
      },
    });
    expect(
      result.facts.find((fact) => fact.canonicalMetric === "turnover")?.value,
    ).toBe("1234500");
    expect(
      result.facts.find((fact) => fact.canonicalMetric === "net_assets")?.value,
    ).toBe("-2500");
  });

  it("handles European decimal and dash transformation formats", () => {
    expect(
      parseNumericValue("1.234,50", { "@_format": "ixt:numcommadecimal" }),
    ).toBe("1234.5");
    expect(parseNumericValue("—", { "@_format": "ixt:numdash" })).toBe("0");
  });
});
