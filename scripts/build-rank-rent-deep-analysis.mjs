#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publication = path.join(root, "publications/rank-and-rent-uk-2026");
const evidence = path.join(publication, "evidence");
const privateDir = path.join(root, "private-data/rank-and-rent-uk-2026");
const observedAt = "2026-09-03";

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...data] = rows.filter((item) =>
    item.some((value) => value !== ""),
  );
  return data.map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const string = String(value);
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function toCsv(rows, columns) {
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")).join("\n")}\n`;
}

function number(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value))
    return null;
  return Number(value.toFixed(digits));
}

function median(values) {
  const sorted = values.filter(Number.isFinite).toSorted((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function currentMetric(report, name) {
  return report.financials?.metrics?.[name]?.current?.value ?? null;
}

function companyUrl(number) {
  return `https://find-and-update.company-information.service.gov.uk/company/${number}`;
}

function filingUrl(number) {
  return `${companyUrl(number)}/filing-history`;
}

const manualAccounts = {
  "04285394": {
    turnover: 105859665,
    operating_profit: 2672750,
    profit_before_tax: 2093987,
    profit_after_tax: 1472449,
    cash: 7809338,
    net_assets: 8408753,
    employees: 518,
    extraction_method:
      "manual transcription from official filed PDF; key figures cross-checked against the signed accounts",
    account_note:
      "Vetted Limited trades as Checkatrade. Turnover includes website directory and printed directory revenue. The filing reports 50,824 total memberships at year end.",
  },
  10614196: {
    turnover: 71603000,
    gross_profit: 26357000,
    operating_profit: -858000,
    profit_before_tax: -961000,
    profit_after_tax: -365000,
    cash: 3784000,
    net_assets: 20388000,
    employees: 172,
    extraction_method:
      "manual transcription from official filed PDF; key figures cross-checked against the signed accounts",
    account_note:
      "Bark's accounting policy states that revenue includes fees paid by professionals for business leads and subscription fees. Lead revenue is recognised when professionals respond.",
  },
  "05272398": {
    turnover: 25015063,
    operating_profit: 5668914,
    profit_before_tax: 6157755,
    profit_after_tax: 4630334,
    cash: 6217716,
    net_assets: 7635801,
    employees: 88,
    extraction_method:
      "structured filing plus manual transcription of turnover and operating profit from the official XHTML accounts",
    account_note:
      "MyBuilder's turnover policy describes UK shortlist-fee revenue.",
  },
};

const identityEvidence = {
  "04285394": [
    "https://www.checkatrade.com/legal",
    "Vetted Limited is identified in Checkatrade's legal terms",
  ],
  10614196: [
    "https://www.bark.com/en/gb/terms/",
    "Bark.com Global Limited is identified in Bark's UK terms",
  ],
  "05272398": [
    "https://www.mybuilder.com/terms",
    "MyBuilder Limited is identified in MyBuilder's terms",
  ],
  SC163138: ["https://www.spotlessclean.co.uk/", "first-party service website"],
  SC451687: [
    "https://www.perfectcleanltd.co.uk/",
    "first-party service website",
  ],
  SC405729: [
    "https://www.edinburghcommercialcleaning.com/contact",
    "first-party contact page",
  ],
  SC657860: [
    "https://www.adcleaningservice.co.uk/",
    "first-party service website",
  ],
  "08429080": [
    "https://manchester.jacksonfire.co.uk/",
    "related Jackson group service site; its footer identifies company 03893399 rather than this entity",
  ],
  "03893399": [
    "https://manchester.jacksonfire.co.uk/",
    "the Manchester site footer identifies this company number",
  ],
  10881187: [
    "https://www.pyrofire.co.uk/manchester/",
    "first-party Manchester service page",
  ],
  12044770: [
    "https://ashtonfire.com/contact/",
    "first-party contact page; legal identity cross-checked in the privacy notice",
  ],
  10736887: [
    "https://firesafetyriskassessmentmanchester.co.uk/about-us/",
    "first-party about page",
  ],
  "05190203": [
    "https://www.bondsutilities.co.uk/",
    "first-party service website",
  ],
  "08566297": [
    "https://www.trentsdrains.co.uk/",
    "first-party service website",
  ],
  "08031495": [
    "https://www.maintainadrain.co.uk/",
    "active trading website found, but its legal-entity connection was not established and the named company files dormant accounts",
  ],
  SC516132: [
    "https://theedinburghboilercompany.com/about-us/",
    "first-party about page",
  ],
  SC287172: [
    "https://citytechnical.co.uk/products/boilers/boiler-installation-edinburgh/",
    "first-party Edinburgh boiler page",
  ],
  SC038547: ["https://www.adamsbros.co.uk/", "first-party service website"],
  SC626257: [
    "https://smartgassolutions.co.uk/boilers/",
    "first-party boiler page",
  ],
  SC230095: ["https://contractheating.co.uk/", "first-party service website"],
  SC651324: [
    "https://www.reliaheat.co.uk/boiler-installation-edinburgh/",
    "first-party Edinburgh boiler page",
  ],
};

const identityFlags = {
  "08429080":
    "related-entity ambiguity: do not count as a separate Jackson buyer without group resolution",
  "03893399":
    "website-identified Jackson entity; group relationship still needs buyer-side confirmation",
  "08031495":
    "identity mismatch: dormant named company and active website; trading entity unknown",
};

const mainInput = parseCsv(
  await readFile(path.join(privateDir, "companies-house-input.csv"), "utf8"),
);
const additionalInput = parseCsv(
  await readFile(
    path.join(privateDir, "companies-house-additional-input.csv"),
    "utf8",
  ),
);
const inputByNumber = new Map(
  [...mainInput, ...additionalInput].map((row) => [row.company_number, row]),
);
const mainCapture = JSON.parse(
  await readFile(
    path.join(privateDir, "companies-house-evidence.json"),
    "utf8",
  ),
);
const additionalCapture = JSON.parse(
  await readFile(
    path.join(privateDir, "companies-house-additional-evidence.json"),
    "utf8",
  ),
);
const reports = [...mainCapture.reports, ...additionalCapture.reports];

const organisationRows = reports.map((report) => {
  const number = report.companyNumber;
  const input = inputByNumber.get(number) ?? {};
  const manual = manualAccounts[number] ?? {};
  const filingFormat = report.accountsDocument?.format ?? "not-retrieved";
  const metric = (name) => manual[name] ?? currentMetric(report, name);
  const identity = identityEvidence[number] ?? [
    "",
    "registry identity only; first-party trading identity not established",
  ];
  const structuredWarning =
    report.quality?.financialWarnings?.join(" | ") ?? "";
  const netAssets =
    manual.net_assets ??
    currentMetric(report, "net_assets") ??
    currentMetric(report, "equity");
  const extractionMethod =
    manual.extraction_method ??
    (report.financials
      ? "repository structured-account parser"
      : "no structured financial metrics available");

  return {
    research_segment: input.research_segment ?? "",
    submitted_identity: input.submitted_identity ?? "",
    company_number: number,
    registered_name: report.companyName,
    company_status: report.profile?.status ?? "",
    sic_codes: report.profile?.sicCodes?.join("|") ?? "",
    accounts_period_end: report.profile?.accountsPeriodEnd ?? "",
    accounts_type: report.profile?.accountsType ?? "",
    latest_accounts_format: filingFormat,
    turnover_gbp: metric("turnover"),
    gross_profit_gbp: metric("gross_profit"),
    operating_profit_gbp: metric("operating_profit"),
    profit_before_tax_gbp: metric("profit_before_tax"),
    profit_after_tax_gbp: metric("profit_after_tax"),
    cash_gbp: metric("cash"),
    net_assets_gbp: netAssets,
    average_employees: metric("employees"),
    accounts_extraction_method: extractionMethod,
    account_note:
      manual.account_note ??
      "Turnover and profit may be absent because many small-company filings do not disclose a profit-and-loss account.",
    identity_state:
      identityFlags[number] ??
      "resolved to registry entity; service-site match is supporting evidence, not proof of current lead-buying intent",
    identity_source_url: identity[0],
    identity_source_note: identity[1],
    companies_house_profile_url: companyUrl(number),
    accounts_filing_url: filingUrl(number),
    parser_warning: structuredWarning,
    evidence_class: "observed registry filing with stated extraction method",
    observed_at: observedAt,
  };
});

const organisationColumns = [
  "research_segment",
  "submitted_identity",
  "company_number",
  "registered_name",
  "company_status",
  "sic_codes",
  "accounts_period_end",
  "accounts_type",
  "latest_accounts_format",
  "turnover_gbp",
  "gross_profit_gbp",
  "operating_profit_gbp",
  "profit_before_tax_gbp",
  "profit_after_tax_gbp",
  "cash_gbp",
  "net_assets_gbp",
  "average_employees",
  "accounts_extraction_method",
  "account_note",
  "identity_state",
  "identity_source_url",
  "identity_source_note",
  "companies_house_profile_url",
  "accounts_filing_url",
  "parser_warning",
  "evidence_class",
  "observed_at",
];

await writeFile(
  path.join(evidence, "companies-house-organisations.csv"),
  toCsv(organisationRows, organisationColumns),
);

const segmentLabels = {
  lead_marketplace: "UK lead marketplaces and directories",
  edinburgh_commercial_cleaning:
    "Edinburgh commercial-cleaning supplier sample",
  manchester_fire_risk: "Manchester fire-risk supplier sample",
  bristol_drainage: "Bristol drainage supplier sample",
  edinburgh_boilers: "Edinburgh boiler supplier sample",
};

const segmentNotes = {
  lead_marketplace:
    "Five deliberately selected incumbents; not a market census. Revenue is disclosed for three and periods differ.",
  edinburgh_commercial_cleaning:
    "Five selected firms with first-party or name evidence; Spotless operates beyond Edinburgh and dominates sample headcount.",
  manchester_fire_risk:
    "Includes two related Jackson entities for identity resolution; do not interpret both as independent buyers.",
  bristol_drainage:
    "Three selected firms. Maintain-A-Drain has a material trading-identity mismatch and is excluded from buyer confidence.",
  edinburgh_boilers:
    "Six selected firms spanning one large facilities operator and small local installers; not a city market census.",
};

const segmentRows = Object.keys(segmentLabels).map((segment) => {
  const rows = organisationRows.filter(
    (row) => row.research_segment === segment,
  );
  const turnovers = rows
    .map((row) => number(row.turnover_gbp))
    .filter(Number.isFinite);
  const employees = rows
    .map((row) => number(row.average_employees))
    .filter(Number.isFinite);
  return {
    research_segment: segment,
    segment_label: segmentLabels[segment],
    selected_entities: rows.length,
    entities_with_turnover_disclosed: turnovers.length,
    disclosed_turnover_total_gbp:
      turnovers.reduce((sum, value) => sum + value, 0) || null,
    entities_with_employee_count: employees.length,
    disclosed_employee_total:
      employees.reduce((sum, value) => sum + value, 0) || null,
    median_disclosed_employees: median(employees),
    largest_disclosed_employee_count: employees.length
      ? Math.max(...employees)
      : null,
    interpretation_limit: segmentNotes[segment],
    evidence_class:
      "derived from selected Companies House filings; not market size or buyer intent",
    observed_at: observedAt,
  };
});

await writeFile(
  path.join(evidence, "companies-house-segment-summary.csv"),
  toCsv(segmentRows, [
    "research_segment",
    "segment_label",
    "selected_entities",
    "entities_with_turnover_disclosed",
    "disclosed_turnover_total_gbp",
    "entities_with_employee_count",
    "disclosed_employee_total",
    "median_disclosed_employees",
    "largest_disclosed_employee_count",
    "interpretation_limit",
    "evidence_class",
    "observed_at",
  ]),
);

const censusCapture = JSON.parse(
  await readFile(
    path.join(privateDir, "companies-house-census-raw.json"),
    "utf8",
  ),
);
const sicLabels = {
  81210: "General cleaning of buildings",
  43220: "Plumbing heat and air-conditioning installation",
  84250: "Fire service activities",
  71200: "Technical testing and analysis",
  37000: "Sewerage",
};
const censusRows = censusCapture.captures.map((capture) => {
  const query = capture.request;
  const isSic = Boolean(query.sic_codes);
  const filter = query.sic_codes ?? query.company_name_includes;
  return {
    screen_type: isSic
      ? "active company + registered-office location + SIC"
      : "active company + registered-office location + company-name token",
    location: query.location,
    filter,
    filter_label: isSic ? sicLabels[filter] : `Company name includes ${filter}`,
    returned_matches: capture.response.hits,
    interpretation: isSic
      ? "broad registered-company discovery bound; may include irrelevant, inactive-trading or multi-location firms and is not a buyer count"
      : "narrow name-based discovery result; omits firms trading under other names and does not prove service coverage or lead-buying intent",
    source_url: capture.source_url,
    observed_at: observedAt,
  };
});

await writeFile(
  path.join(evidence, "companies-house-census-screen.csv"),
  toCsv(censusRows, [
    "screen_type",
    "location",
    "filter",
    "filter_label",
    "returned_matches",
    "interpretation",
    "source_url",
    "observed_at",
  ]),
);

function parseMonthly(source) {
  if (!source) return new Map();
  return new Map(
    source
      .split("|")
      .filter(Boolean)
      .map((entry) => {
        const separator = entry.lastIndexOf(":");
        return [
          entry.slice(0, separator),
          number(entry.slice(separator + 1)) ?? 0,
        ];
      }),
  );
}

function weighted(rows, field, volumeField = "average_monthly_searches") {
  const usable = rows.filter(
    (row) => number(row[volumeField]) > 0 && number(row[field]) !== null,
  );
  const volume = usable.reduce((sum, row) => sum + number(row[volumeField]), 0);
  if (!volume) return null;
  return (
    usable.reduce(
      (sum, row) => sum + number(row[volumeField]) * number(row[field]),
      0,
    ) / volume
  );
}

function monthlyBasket(rows) {
  const totals = new Map();
  for (const row of rows) {
    for (const [month, value] of parseMonthly(row.monthly_search_volumes)) {
      totals.set(month, (totals.get(month) ?? 0) + value);
    }
  }
  return [...totals.entries()].map(([month, value]) => ({ month, value }));
}

const explicitRows = parseCsv(
  await readFile(
    path.join(evidence, "google-ads-priority-intent-screen.csv"),
    "utf8",
  ),
);

const localGeoCityRows = parseCsv(
  await readFile(
    path.join(evidence, "google-ads-local-geo-screen.csv"),
    "utf8",
  ),
);
const localGeoCitySummary = [
  ...new Set(localGeoCityRows.map((row) => row.city)),
]
  .map((city) => {
    const rows = localGeoCityRows.filter((row) => row.city === city);
    const searches = rows.reduce(
      (sum, row) => sum + (number(row.average_monthly_searches) ?? 0),
      0,
    );
    const paidValue = rows.reduce(
      (sum, row) =>
        sum +
        (number(row.average_monthly_searches) ?? 0) *
          (number(row.average_cpc_gbp) ?? 0),
      0,
    );
    return {
      city,
      city_geo_criterion_id: rows[0]?.geo_criterion_id ?? "",
      submitted_service_phrases: rows.length,
      rows_with_reported_searches: rows.filter(
        (row) => number(row.average_monthly_searches) > 0,
      ).length,
      local_geo_keyword_basket_average_searches: searches,
      local_geo_weighted_average_cpc_gbp: searches
        ? round(paidValue / searches, 4)
        : null,
      local_geo_paid_search_value_proxy_gbp: round(paidValue, 2),
      comparison_limit:
        "same 16 generic services measured inside each city; not the 35-phrase explicit-city basket, unique searches or obtainable traffic",
      evidence_class: "derived from Google Ads historical metrics",
      observed_at: observedAt,
    };
  })
  .toSorted(
    (a, b) =>
      b.local_geo_paid_search_value_proxy_gbp -
      a.local_geo_paid_search_value_proxy_gbp,
  );

await writeFile(
  path.join(evidence, "google-ads-local-geo-city-summary.csv"),
  toCsv(localGeoCitySummary, [
    "city",
    "city_geo_criterion_id",
    "submitted_service_phrases",
    "rows_with_reported_searches",
    "local_geo_keyword_basket_average_searches",
    "local_geo_weighted_average_cpc_gbp",
    "local_geo_paid_search_value_proxy_gbp",
    "comparison_limit",
    "evidence_class",
    "observed_at",
  ]),
);
const localRows = parseCsv(
  await readFile(
    path.join(evidence, "google-ads-priority-local-geo-intent-screen.csv"),
    "utf8",
  ),
);
const clusterIds = [
  ...new Set([...explicitRows, ...localRows].map((row) => row.cluster)),
];
const clusterJudgements = {
  edinburgh_commercial_cleaning: [
    "weak",
    "pause for query-quality verification",
    "The explicit basket is dominated by an April 2026 spike while the local-geo basket reports only 90 average monthly searches and no average CPC.",
  ],
  manchester_fire_risk_assessment: [
    "strong",
    "first-wave partner-led test",
    "Explicit and local-geo data both show demand and meaningful advertiser participation; competence verification is the gating control.",
  ],
  manchester_asbestos_survey: [
    "strong",
    "first-wave partner-led test",
    "Explicit and local-geo CPCs converge at a high level, but accredited surveyor supply and conflicts with removal must be controlled.",
  ],
  bristol_drain_unblocking: [
    "strong",
    "first-wave call test",
    "The largest and steadiest local-geo demand basket among the priority clusters, with paid pressure on emergency and CCTV terms.",
  ],
  bristol_loft_conversion: [
    "moderate",
    "second-wave appointment test",
    "High project value and credible demand, but long attribution and survey cycles slow learning.",
  ],
  edinburgh_boiler_installation: [
    "moderate",
    "first-wave buyer-led quote test",
    "Local demand and CPC are credible, though the explicit-city basket is materially larger and seasonal.",
  ],
  nottingham_garage_door_repair: [
    "moderate-low",
    "second-wave recheck",
    "Operationally simple, but small local demand and a September 2025 monthly spike require another historical read.",
  ],
};

const clusterRows = clusterIds.map((clusterId) => {
  const explicit = explicitRows.filter((row) => row.cluster === clusterId);
  const local = localRows.filter((row) => row.cluster === clusterId);
  const explicitMonthly = monthlyBasket(explicit);
  const localMonthly = monthlyBasket(local);
  const explicitValues = explicitMonthly.map((row) => row.value);
  const localValues = localMonthly.map((row) => row.value);
  const explicitPeak =
    explicitMonthly.toSorted((a, b) => b.value - a.value)[0] ?? {};
  const localPeak = localMonthly.toSorted((a, b) => b.value - a.value)[0] ?? {};
  const explicitMean = explicitValues.length
    ? explicitValues.reduce((a, b) => a + b, 0) / explicitValues.length
    : null;
  const localMean = localValues.length
    ? localValues.reduce((a, b) => a + b, 0) / localValues.length
    : null;
  const [agreement, decision, reason] = clusterJudgements[clusterId] ?? [
    "unrated",
    "recheck",
    "No judgement recorded.",
  ];
  return {
    cluster_id: clusterId,
    city: explicit[0]?.city ?? local[0]?.city ?? "",
    explicit_returned_rows: explicit.length,
    explicit_keyword_basket_average_searches: explicit.reduce(
      (sum, row) => sum + (number(row.average_monthly_searches) ?? 0),
      0,
    ),
    explicit_weighted_average_cpc_gbp: round(
      weighted(explicit, "average_cpc_gbp"),
      4,
    ),
    explicit_weighted_competition_index: round(
      weighted(explicit, "competition_index"),
      1,
    ),
    explicit_weighted_high_top_bid_gbp: round(
      weighted(explicit, "high_top_of_page_gbp"),
      4,
    ),
    explicit_monthly_series_mean: round(explicitMean, 1),
    explicit_peak_month: explicitPeak.month ?? "",
    explicit_peak_month_searches: explicitPeak.value ?? null,
    explicit_peak_to_monthly_mean_ratio: explicitMean
      ? round(explicitPeak.value / explicitMean, 2)
      : null,
    local_geo_returned_rows: local.length,
    local_geo_keyword_basket_average_searches: local.reduce(
      (sum, row) => sum + (number(row.average_monthly_searches) ?? 0),
      0,
    ),
    local_geo_weighted_average_cpc_gbp: round(
      weighted(local, "average_cpc_gbp"),
      4,
    ),
    local_geo_weighted_competition_index: round(
      weighted(local, "competition_index"),
      1,
    ),
    local_geo_weighted_high_top_bid_gbp: round(
      weighted(local, "high_top_of_page_gbp"),
      4,
    ),
    local_geo_monthly_series_mean: round(localMean, 1),
    local_geo_peak_month: localPeak.month ?? "",
    local_geo_peak_month_searches: localPeak.value ?? null,
    local_geo_peak_to_monthly_mean_ratio: localMean
      ? round(localPeak.value / localMean, 2)
      : null,
    evidence_agreement: agreement,
    recommendation: decision,
    commercial_read: reason,
    addition_warning:
      "keyword rows and close variants can overlap; basket values compare screens and are not additive market size",
    evidence_class: "derived from Google Ads historical metrics",
    observed_at: observedAt,
  };
});

await writeFile(
  path.join(evidence, "google-ads-priority-cluster-summary.csv"),
  toCsv(clusterRows, [
    "cluster_id",
    "city",
    "explicit_returned_rows",
    "explicit_keyword_basket_average_searches",
    "explicit_weighted_average_cpc_gbp",
    "explicit_weighted_competition_index",
    "explicit_weighted_high_top_bid_gbp",
    "explicit_monthly_series_mean",
    "explicit_peak_month",
    "explicit_peak_month_searches",
    "explicit_peak_to_monthly_mean_ratio",
    "local_geo_returned_rows",
    "local_geo_keyword_basket_average_searches",
    "local_geo_weighted_average_cpc_gbp",
    "local_geo_weighted_competition_index",
    "local_geo_weighted_high_top_bid_gbp",
    "local_geo_monthly_series_mean",
    "local_geo_peak_month",
    "local_geo_peak_month_searches",
    "local_geo_peak_to_monthly_mean_ratio",
    "evidence_agreement",
    "recommendation",
    "commercial_read",
    "addition_warning",
    "evidence_class",
    "observed_at",
  ]),
);

const scenarios = [
  ["weak funnel", 0.05, 0.6, 0.2],
  ["base funnel", 0.1, 0.7, 0.2],
  ["strong funnel", 0.2, 0.8, 0.2],
];
const economicsRows = [];
for (const cluster of clusterRows) {
  const cpc = number(cluster.local_geo_weighted_average_cpc_gbp);
  for (const [
    scenario,
    enquiryRate,
    acceptanceRate,
    buyerCloseRate,
  ] of scenarios) {
    const acceptedRate = enquiryRate * acceptanceRate;
    const calculable = cpc !== null && cpc > 0;
    const acceptedLeadCost = calculable ? cpc / acceptedRate : null;
    economicsRows.push({
      cluster_id: cluster.cluster_id,
      city: cluster.city,
      local_geo_weighted_average_cpc_gbp: cpc,
      scenario,
      assumed_click_to_enquiry_rate: enquiryRate,
      assumed_enquiry_acceptance_rate: acceptanceRate,
      derived_click_to_accepted_lead_rate: round(acceptedRate, 4),
      derived_paid_cost_per_accepted_lead_gbp: round(acceptedLeadCost, 2),
      assumed_buyer_close_rate_from_accepted_lead: buyerCloseRate,
      derived_paid_media_cost_per_won_job_gbp: round(
        calculable ? acceptedLeadCost / buyerCloseRate : null,
        2,
      ),
      interpretation: calculable
        ? "break-even acquisition sensitivity before staff, call handling, credits, overhead, tax and profit; not a forecast"
        : "not calculable because Google Ads reported no average CPC for this sparse local-geo basket; bid ranges still show some auction activity",
      evidence_class:
        "scenario arithmetic using observed CPC and explicit assumptions",
      observed_at: observedAt,
    });
  }
}

await writeFile(
  path.join(evidence, "cpc-economics-sensitivity.csv"),
  toCsv(economicsRows, [
    "cluster_id",
    "city",
    "local_geo_weighted_average_cpc_gbp",
    "scenario",
    "assumed_click_to_enquiry_rate",
    "assumed_enquiry_acceptance_rate",
    "derived_click_to_accepted_lead_rate",
    "derived_paid_cost_per_accepted_lead_gbp",
    "assumed_buyer_close_rate_from_accepted_lead",
    "derived_paid_media_cost_per_won_job_gbp",
    "interpretation",
    "evidence_class",
    "observed_at",
  ]),
);

console.log(`Wrote ${organisationRows.length} organisation rows.`);
console.log(`Wrote ${segmentRows.length} segment summaries.`);
console.log(`Wrote ${censusRows.length} Companies House discovery screens.`);
console.log(`Wrote ${localGeoCitySummary.length} local-geo city summaries.`);
console.log(`Wrote ${clusterRows.length} priority-cluster comparisons.`);
console.log(`Wrote ${economicsRows.length} CPC sensitivity rows.`);
