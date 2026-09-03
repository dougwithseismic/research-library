export const FINANCIAL_METRICS = [
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

export const RATIO_KEYS = [
  "grossMargin",
  "operatingMargin",
  "preTaxMargin",
  "netMargin",
  "currentRatio",
  "cashRatio",
  "revenuePerEmployee",
];

export const COMPANY_HOUSE_CSV_HEADERS = [
  "companies_house_observed_at",
  "companies_house_source_url",
  "company_status",
  "company_type",
  "registered_office",
  "sic_codes",
  "accounts_type",
  "accounts_period_end",
  "accounts_next_due",
  "accounts_overdue",
  "confirmation_next_due",
  "confirmation_overdue",
  "active_officers",
  "active_controllers",
  "charges_summary",
  "outstanding_charge_count",
  "latest_accounts_filing_date",
  "latest_accounts_description",
  "latest_accounts_format",
  "latest_accounts_pages",
  "latest_accounts_document_url",
  "financial_period_start",
  "financial_period_end",
  "financial_currency",
  "accounting_standard",
  "audit_status",
  "accounts_legislation",
  "dormant_accounts",
  "financial_growth_signals",
  "financial_warnings",
  "raw_artifact_count",
  ...FINANCIAL_METRICS.flatMap((key) => [
    `${key}_current`,
    `${key}_current_period`,
    `${key}_previous`,
    `${key}_previous_period`,
    `${key}_absolute_change`,
    `${key}_yoy_pct`,
    `${key}_source_concept`,
  ]),
  ...RATIO_KEYS.map((key) => `ratio_${key}`),
];

export function csvCell(value) {
  const string = String(value ?? "");
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function disclosed(value) {
  return Number.isFinite(value) ? value : "Not disclosed";
}

function disclosedText(value) {
  const text = String(value ?? "").trim();
  return text || "Not disclosed";
}

function joinedPeople(values, roleKey = "role") {
  if (!Array.isArray(values) || values.length === 0) return "Not disclosed";
  const people = values
    .filter(
      (value) =>
        !value.status || String(value.status).toLowerCase() === "active",
    )
    .map((value) => {
      const details = [
        value[roleKey],
        value.appointedOn ? `appointed ${value.appointedOn}` : "",
        value.notifiedOn ? `notified ${value.notifiedOn}` : "",
      ].filter(Boolean);
      return `${value.name}${details.length ? ` [${details.join("; ")}]` : ""}`;
    });
  return people.length ? people.join(" | ") : "Not disclosed";
}

export function flattenCompanyHouse(report) {
  const profile = report?.profile ?? {};
  const accounts = report?.accountsDocument ?? {};
  const financials = report?.financials ?? {};
  const disclosure = financials.disclosure ?? {};
  const ratios = financials.ratios ?? {};
  const charges = report?.registry?.charges ?? {};
  const fields = {
    companies_house_observed_at: disclosedText(report?.observedAt),
    companies_house_source_url: disclosedText(report?.sourceUrl),
    company_status: disclosedText(profile.status),
    company_type: disclosedText(profile.type),
    registered_office: disclosedText(profile.registeredOffice),
    sic_codes:
      Array.isArray(profile.sicCodes) && profile.sicCodes.length
        ? profile.sicCodes.join(" | ")
        : "Not disclosed",
    accounts_type: disclosedText(profile.accountsType),
    accounts_period_end: disclosedText(profile.accountsPeriodEnd),
    accounts_next_due: disclosedText(profile.accountsNextDue),
    accounts_overdue:
      typeof profile.accountsOverdue === "boolean"
        ? profile.accountsOverdue
        : "Not disclosed",
    confirmation_next_due: disclosedText(profile.confirmationNextDue),
    confirmation_overdue:
      typeof profile.confirmationOverdue === "boolean"
        ? profile.confirmationOverdue
        : "Not disclosed",
    active_officers: joinedPeople(
      Array.isArray(report?.officers)
        ? report.officers
        : report?.officers?.items,
    ),
    active_controllers: joinedPeople(report?.registry?.controllers, "status"),
    charges_summary: disclosedText(charges.summary),
    outstanding_charge_count: Array.isArray(charges.items)
      ? charges.items.filter((item) => !/satisfied/i.test(item.status ?? ""))
          .length
      : "Not disclosed",
    latest_accounts_filing_date: disclosedText(accounts.filingDate),
    latest_accounts_description: disclosedText(accounts.filingDescription),
    latest_accounts_format: disclosedText(accounts.format),
    latest_accounts_pages: disclosed(accounts.pages),
    latest_accounts_document_url: disclosedText(accounts.documentUrl),
    financial_period_start: disclosedText(financials.periodStart),
    financial_period_end: disclosedText(financials.periodEnd),
    financial_currency: disclosedText(financials.currency),
    accounting_standard: disclosedText(disclosure.accountingStandard),
    audit_status: disclosedText(disclosure.auditStatus),
    accounts_legislation: disclosedText(disclosure.legislation),
    dormant_accounts:
      typeof disclosure.dormant === "boolean"
        ? disclosure.dormant
        : "Not disclosed",
    financial_growth_signals:
      Array.isArray(financials.signals) && financials.signals.length
        ? financials.signals.map((signal) => signal.message).join(" | ")
        : "No derived financial growth signal",
    financial_warnings:
      [
        ...(financials.warnings ?? []),
        ...(report?.quality?.financialWarnings ?? []),
      ]
        .filter(Boolean)
        .join(" | ") || "None",
    raw_artifact_count:
      report?.quality?.rawArtifactCount ?? report?.rawArtifacts?.length ?? 0,
  };
  for (const key of FINANCIAL_METRICS) {
    const comparison = financials.metrics?.[key];
    fields[`${key}_current`] = disclosed(comparison?.current?.value);
    fields[`${key}_current_period`] = disclosedText(comparison?.current?.date);
    fields[`${key}_previous`] = disclosed(comparison?.previous?.value);
    fields[`${key}_previous_period`] = disclosedText(
      comparison?.previous?.date,
    );
    fields[`${key}_absolute_change`] = disclosed(comparison?.absoluteChange);
    fields[`${key}_yoy_pct`] = Number.isFinite(comparison?.percentageChange)
      ? Math.round(comparison.percentageChange * 10_000) / 100
      : "Not disclosed";
    fields[`${key}_source_concept`] = disclosedText(
      comparison?.current?.concept,
    );
  }
  for (const key of RATIO_KEYS) {
    fields[`ratio_${key}`] = disclosed(ratios[key]);
  }
  return fields;
}
