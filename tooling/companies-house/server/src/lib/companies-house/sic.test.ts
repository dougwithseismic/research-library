import { describe, expect, it } from "vitest";
import { describeSicCodes, parseSicCsv } from "./sic";

describe("Companies House SIC descriptions", () => {
  it("parses quoted commas and resolves readable descriptions", () => {
    const map = parseSicCsv(
      'SIC Code,Description\r\n01110,"Growing of cereals, crops and oil seeds"\r\n62012,Business and domestic software development\r\n',
    );
    expect(describeSicCodes(["62012", "01110", "99998"], map)).toEqual([
      "Business and domestic software development",
      "Growing of cereals, crops and oil seeds",
    ]);
  });
});
