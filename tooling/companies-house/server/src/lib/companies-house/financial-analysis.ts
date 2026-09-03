import { numericFactValue, ParsedAccountsDocument, XbrlFact } from "./xbrl";

export type MetricObservation = {
  value: number;
  date: string;
  periodStart: string | null;
  concept: string;
  scope: XbrlFact["scope"];
};

export type MetricComparison = {
  metric: string;
  current: MetricObservation;
  previous: MetricObservation | null;
  absoluteChange: number | null;
  percentageChange: number | null;
};

export type FinancialSignal = {
  kind: string;
  severity: "info" | "opportunity" | "watch" | "risk";
  message: string;
  evidence: Record<string, number | string | null>;
};

const preferredMetrics = [
  "turnover",
  "gross_profit",
  "operating_profit",
  "profit_before_tax",
  "profit_after_tax",
  "fixed_assets",
  "current_assets",
  "stocks",
  "debtors",
  "cash",
  "creditors_within_one_year",
  "creditors_after_one_year",
  "net_current_assets",
  "total_assets_less_current_liabilities",
  "provisions",
  "net_assets",
  "equity",
  "employees",
];

function factDate(fact: XbrlFact) {
  return fact.periodEnd ?? fact.instant;
}

function factPriority(fact: XbrlFact) {
  const dimensions = Object.keys(fact.dimensions).length;
  const scope = fact.scope === "group" ? 0 : fact.scope === null ? 1 : 2;
  return dimensions * 10 + scope;
}

export function metricSeries(
  document: ParsedAccountsDocument,
  metric: string,
): MetricObservation[] {
  const byDate = new Map<string, XbrlFact[]>();
  for (const fact of document.facts) {
    const date = factDate(fact);
    if (fact.canonicalMetric !== metric || !date) continue;
    const facts = byDate.get(date) ?? [];
    facts.push(fact);
    byDate.set(date, facts);
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .flatMap(([date, facts]) => {
      const fact = facts.sort(
        (left, right) => factPriority(left) - factPriority(right),
      )[0];
      const value = numericFactValue(fact);
      return Number.isFinite(value)
        ? [
            {
              value,
              date,
              periodStart: fact.periodStart,
              concept: fact.concept,
              scope: fact.scope,
            },
          ]
        : [];
    });
}

function comparison(
  document: ParsedAccountsDocument,
  metric: string,
): MetricComparison | null {
  const series = metricSeries(document, metric);
  const current = series[0];
  if (!current) return null;
  const previous = series[1] ?? null;
  const absoluteChange = previous ? current.value - previous.value : null;
  const percentageChange =
    previous && previous.value !== 0
      ? absoluteChange! / Math.abs(previous.value)
      : null;
  return { metric, current, previous, absoluteChange, percentageChange };
}

function ratio(
  numerator: MetricComparison | null,
  denominator: MetricComparison | null,
) {
  if (!numerator || !denominator || denominator.current.value === 0)
    return null;
  return numerator.current.value / Math.abs(denominator.current.value);
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function analyseAccountsDocument(document: ParsedAccountsDocument) {
  const metrics = Object.fromEntries(
    preferredMetrics.flatMap((metric) => {
      const value = comparison(document, metric);
      return value ? [[metric, value]] : [];
    }),
  ) as Record<string, MetricComparison>;
  const turnover = metrics.turnover ?? null;
  const employees = metrics.employees ?? null;
  const netAssets = metrics.net_assets ?? null;
  const cash = metrics.cash ?? null;
  const currentAssets = metrics.current_assets ?? null;
  const shortCreditors = metrics.creditors_within_one_year ?? null;
  const ratios = {
    grossMargin: ratio(metrics.gross_profit ?? null, turnover),
    operatingMargin: ratio(metrics.operating_profit ?? null, turnover),
    preTaxMargin: ratio(metrics.profit_before_tax ?? null, turnover),
    netMargin: ratio(metrics.profit_after_tax ?? null, turnover),
    currentRatio: ratio(currentAssets, shortCreditors),
    cashRatio: ratio(cash, shortCreditors),
    revenuePerEmployee:
      turnover && employees && employees.current.value > 0
        ? turnover.current.value / employees.current.value
        : null,
  };
  const signals: FinancialSignal[] = [];

  if (
    turnover?.percentageChange !== null &&
    turnover?.percentageChange !== undefined
  ) {
    const growth = turnover.percentageChange;
    signals.push({
      kind: "revenue_growth",
      severity:
        growth >= 0.2 ? "opportunity" : growth <= -0.2 ? "watch" : "info",
      message: `Revenue ${growth >= 0 ? "increased" : "decreased"} ${percent(Math.abs(growth))} year on year.`,
      evidence: {
        current: turnover.current.value,
        previous: turnover.previous?.value ?? null,
        change: growth,
      },
    });
  }
  if (
    employees?.percentageChange !== null &&
    employees?.percentageChange !== undefined
  ) {
    const growth = employees.percentageChange;
    signals.push({
      kind: "headcount_change",
      severity:
        growth >= 0.2 ? "opportunity" : growth <= -0.2 ? "watch" : "info",
      message: `Average employee count ${growth >= 0 ? "increased" : "decreased"} ${percent(Math.abs(growth))}.`,
      evidence: {
        current: employees.current.value,
        previous: employees.previous?.value ?? null,
        change: growth,
      },
    });
  }
  if (netAssets && netAssets.current.value < 0) {
    signals.push({
      kind: "negative_net_assets",
      severity: "risk",
      message: "The accounts report negative net assets.",
      evidence: {
        netAssets: netAssets.current.value,
        date: netAssets.current.date,
      },
    });
  }
  if (ratios.currentRatio !== null && ratios.currentRatio < 1) {
    signals.push({
      kind: "working_capital_pressure",
      severity: "watch",
      message: `Current assets are ${ratios.currentRatio.toFixed(2)}x creditors due within one year.`,
      evidence: { currentRatio: ratios.currentRatio },
    });
  }
  if (ratios.operatingMargin !== null) {
    signals.push({
      kind: "operating_margin",
      severity: ratios.operatingMargin < 0 ? "risk" : "info",
      message: `Operating margin is ${percent(ratios.operatingMargin)}.`,
      evidence: { operatingMargin: ratios.operatingMargin },
    });
  }

  const warnings: string[] = [];
  if (!turnover)
    warnings.push("Turnover was not disclosed in the structured accounts.");
  if (employees && !Number.isInteger(employees.current.value))
    warnings.push(
      "Employee count is non-integral and should be checked against the source document.",
    );
  if (
    document.facts.some(
      (fact) =>
        fact.canonicalMetric === "employees" &&
        Number(fact.value) !== numericFactValue(fact),
    )
  ) {
    warnings.push(
      "Employee count used the displayed integral value because the filing supplied an inconsistent negative iXBRL scale.",
    );
  }
  for (const [metric, value] of Object.entries(metrics)) {
    const sameDate = document.facts.filter(
      (fact) =>
        fact.canonicalMetric === metric &&
        factDate(fact) === value.current.date &&
        Object.keys(fact.dimensions).length === 0,
    );
    if (new Set(sameDate.map((fact) => fact.value)).size > 1)
      warnings.push(
        `${metric} has conflicting dimensionless facts for ${value.current.date}; the preferred scope was selected.`,
      );
  }

  return {
    companyNumber: document.companyNumber,
    periodStart: document.periodStart,
    periodEnd: document.periodEnd,
    currency: document.currency,
    disclosure: {
      accountingStandard: document.metadata.accounting_standard ?? null,
      accountsType: document.metadata.accounts_type ?? null,
      auditStatus: document.metadata.audit_status ?? null,
      legislation: document.metadata.legislation ?? null,
      dormant: document.metadata.dormant === "true",
    },
    metrics,
    ratios,
    signals,
    warnings,
  };
}
