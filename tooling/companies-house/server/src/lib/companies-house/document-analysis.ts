export type DocumentSignal = {
  kind: string;
  severity: "info" | "watch" | "risk";
  message: string;
  occurrences: number;
  evidenceSnippet: string | null;
};

const terms = [
  {
    kind: "material_uncertainty",
    pattern: /material uncertainty/gi,
    severity: "risk" as const,
  },
  {
    kind: "qualified_opinion",
    pattern: /qualified opinion/gi,
    severity: "risk" as const,
  },
  {
    kind: "going_concern",
    pattern: /going concern/gi,
    severity: "watch" as const,
  },
  { kind: "covenant", pattern: /\bcovenants?\b/gi, severity: "watch" as const },
  {
    kind: "restructuring",
    pattern: /\brestructuring\b/gi,
    severity: "watch" as const,
  },
  {
    kind: "impairment",
    pattern: /\bimpairment\b/gi,
    severity: "watch" as const,
  },
  {
    kind: "cyber_risk",
    pattern: /\bcyber(?:security)?\b/gi,
    severity: "info" as const,
  },
  {
    kind: "principal_risks",
    pattern: /principal risks?/gi,
    severity: "info" as const,
  },
];

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function snippet(text: string, index: number, length: number) {
  return (
    clean(
      text.slice(
        Math.max(0, index - 100),
        Math.min(text.length, index + length + 140),
      ),
    ).slice(0, 280) || null
  );
}

export function analyseAccountsText(text: string, pages?: number | null) {
  const signals: DocumentSignal[] = [];
  const textCharactersPerPage = pages && pages > 0 ? text.length / pages : null;
  if (textCharactersPerPage !== null && textCharactersPerPage < 100) {
    signals.push({
      kind: "ocr_recommended",
      severity: "watch",
      message:
        "The PDF contains very little extractable text per page and is likely image-heavy; OCR is required before relying on document-text analysis.",
      occurrences: 1,
      evidenceSnippet: null,
    });
  }
  for (const term of terms) {
    const matches = [
      ...text.matchAll(new RegExp(term.pattern.source, term.pattern.flags)),
    ];
    if (!matches.length) continue;
    signals.push({
      kind: term.kind,
      severity: term.severity,
      message: `${term.kind.replaceAll("_", " ")} appears ${matches.length} time(s) in the filed document; review the source context before treating it as a conclusion.`,
      occurrences: matches.length,
      evidenceSnippet: snippet(
        text,
        matches[0].index ?? 0,
        matches[0][0].length,
      ),
    });
  }
  return { textCharacters: text.length, textCharactersPerPage, signals };
}
