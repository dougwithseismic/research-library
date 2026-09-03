import { describe, expect, it } from "vitest";
import { analyseAccountsText } from "./document-analysis";

describe("accounts document text intelligence", () => {
  it("returns bounded, reviewable evidence instead of asserting keyword hits as facts", () => {
    const result = analyseAccountsText(
      `The directors considered going concern. There is no material uncertainty related to going concern. Cyber security is a principal risk.`,
    );
    expect(result.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "material_uncertainty",
          severity: "risk",
          occurrences: 1,
        }),
        expect.objectContaining({ kind: "going_concern", occurrences: 2 }),
        expect.objectContaining({ kind: "cyber_risk" }),
      ]),
    );
    expect(
      Math.max(
        ...result.signals.map((signal) => signal.evidenceSnippet?.length ?? 0),
      ),
    ).toBeLessThanOrEqual(280);
  });

  it("flags image-heavy PDFs for OCR instead of pretending extraction is complete", () => {
    const result = analyseAccountsText("short extracted footer", 200);
    expect(result.textCharactersPerPage).toBeLessThan(1);
    expect(result.signals).toContainEqual(
      expect.objectContaining({ kind: "ocr_recommended", severity: "watch" }),
    );
  });
});
