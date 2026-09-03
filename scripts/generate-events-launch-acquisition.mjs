#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OBSERVED_AT = "2026-09-03";
const EVIDENCE_DIRECTORY = join(
  process.cwd(),
  "publications/events-economy-2026/evidence",
);

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...values] = rows;
  return values.map((fields) =>
    Object.fromEntries(headers.map((header, index) => [header, fields[index]])),
  );
}

function csvCell(value) {
  const rendered = String(value ?? "");
  return /[",\n]/.test(rendered)
    ? `"${rendered.replaceAll('"', '""')}"`
    : rendered;
}

function toCsv(columns, rows) {
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}

const explicitRows = parseCsv(
  readFileSync(
    join(EVIDENCE_DIRECTORY, "launch-cell-intent-explicit-screen.csv"),
    "utf8",
  ),
);
const localRows = parseCsv(
  readFileSync(
    join(EVIDENCE_DIRECTORY, "launch-cell-intent-local-geo-screen.csv"),
    "utf8",
  ),
);
const economicsRows = parseCsv(
  readFileSync(
    join(EVIDENCE_DIRECTORY, "event-format-economics-sensitivity.csv"),
    "utf8",
  ),
);

const selections = [
  {
    cell: "Manchester — darts",
    city: "Manchester",
    format: "Darts",
    intent: "event_booking",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Social darts league night",
    assumedAttendedEvents: 4,
    rationale:
      "Closest phrase to a dated paid event; the season model assumes four attended sessions from one acquired customer",
  },
  {
    cell: "Manchester — darts",
    city: "Manchester",
    format: "Darts",
    intent: "beginner_or_adult",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Social darts league night",
    assumedAttendedEvents: 4,
    rationale:
      "Larger club-intent row tests the repeat/community acquisition route rather than one-off venue discovery",
  },
  {
    cell: "Birmingham — salsa",
    city: "Birmingham",
    format: "Salsa",
    intent: "repeat_programme",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Beginner social-dance night",
    assumedAttendedEvents: 6,
    rationale:
      "The strongest explicit commercial row; economics depend on a six-session pack rather than one drop-in",
  },
  {
    cell: "Manchester — wine tasting",
    city: "Manchester",
    format: "Wine tasting",
    intent: "event_booking",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Partner-led wine tasting",
    assumedAttendedEvents: 2,
    rationale:
      "Direct event intent; the model assumes a second themed tasting during the measured relationship",
  },
  {
    cell: "Manchester — wine tasting",
    city: "Manchester",
    format: "Wine tasting",
    intent: "group_or_corporate",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Partner-led wine tasting",
    assumedAttendedEvents: 2,
    rationale:
      "Tests whether consumer-seat contribution could support corporate search; it does not model contract-level B2B value",
  },
  {
    cell: "Birmingham — board-game events",
    city: "Birmingham",
    format: "Board-game events",
    intent: "event_booking",
    geographyMethod: "generic_query_inside_local_geo_target",
    economicsFormat: "Hosted board-game night",
    assumedAttendedEvents: 4,
    rationale:
      "No reportable explicit city event row; local-geo observation is retained but cannot be treated as incremental demand",
  },
  {
    cell: "Birmingham — pottery painting",
    city: "Birmingham",
    format: "Pottery painting",
    intent: "beginner_or_adult",
    geographyMethod: "generic_query_inside_local_geo_target",
    economicsFormat: "Portable pottery workshop",
    assumedAttendedEvents: 2,
    rationale:
      "Only a tiny local adult-specific row carries a non-zero CPC; it is too thin for a dependable acquisition forecast",
  },
  {
    cell: "Birmingham — sip and paint",
    city: "Birmingham",
    format: "Sip and paint",
    intent: "event_booking",
    geographyMethod: "generic_query_inside_local_geo_target",
    economicsFormat: null,
    assumedAttendedEvents: null,
    rationale:
      "The retained event-intent row has no reportable CPC and the prior economics set has no directly comparable delivery model",
  },
  {
    cell: "Bristol — spa retreats",
    city: "Bristol",
    format: "Spa retreats",
    intent: "event_booking",
    geographyMethod: "explicit_city_query_under_uk_target",
    economicsFormat: "Partner-spa day retreat",
    assumedAttendedEvents: 1,
    rationale:
      "The explicit booking phrase returned no reportable demand or CPC; destination and practitioner-led routes need separate validation",
  },
];

const allIntentRows = [...explicitRows, ...localRows];

function selectedIntentRow(selection) {
  return allIntentRows.find(
    (row) =>
      row.city === selection.city &&
      row.format === selection.format &&
      row.intent === selection.intent &&
      row.geography_method === selection.geographyMethod,
  );
}

function selectedEconomicsRow(selection) {
  if (!selection.economicsFormat) return null;
  return economicsRows.find(
    (row) =>
      row.format === selection.economicsFormat && row.scenario === "90% fill",
  );
}

const acquisitionRows = selections.map((selection) => {
  const intent = selectedIntentRow(selection);
  if (!intent) throw new Error(`Missing intent row for ${selection.cell}`);

  const economics = selectedEconomicsRow(selection);
  const cpc = Number(intent.average_cpc_gbp);
  const searches = Number(intent.average_monthly_searches);
  const attendees = Number(economics?.paid_attendees ?? 0);
  const contribution = Number(economics?.illustrative_direct_contribution ?? 0);
  const contributionPerAttendance =
    attendees > 0 ? contribution / attendees : null;
  const lifetimeDirectContribution =
    contributionPerAttendance !== null && selection.assumedAttendedEvents
      ? contributionPerAttendance * selection.assumedAttendedEvents
      : null;
  const acquisitionShare = 0.5;
  const maximumCac =
    lifetimeDirectContribution !== null
      ? lifetimeDirectContribution * acquisitionShare
      : null;
  const hasUsableAuctionSignal = cpc > 0 && searches >= 20;
  const requiredConversion =
    hasUsableAuctionSignal && maximumCac > 0 ? cpc / maximumCac : null;

  let verdict;
  if (!economics) {
    verdict = "Not estimable: no comparable delivery-economics model";
  } else if (cpc === 0 || searches === 0) {
    verdict =
      "Not estimable: zero or suppressed CPC/demand is not evidence of free acquisition";
  } else if (searches < 20) {
    verdict =
      "Too thin for a dependable forecast: use only as a directional phrase test";
  } else if (requiredConversion <= 0.05) {
    verdict =
      "Plausible at 5% click-to-booking only if the assumed repeat attendance is achieved";
  } else if (requiredConversion <= 0.1) {
    verdict =
      "Requires unusually strong 5–10% click-to-booking and the assumed repeat attendance";
  } else {
    verdict =
      "Consumer-seat economics do not support this paid-search route without higher value or organic demand";
  }

  return {
    launch_cell: selection.cell,
    geography_method: selection.geographyMethod,
    selected_intent: selection.intent,
    selected_keyword: intent.returned_keyword,
    average_monthly_searches: searches,
    average_cpc_gbp: cpc.toFixed(4),
    economics_model: economics?.format ?? "not_available",
    model_fill_basis: economics ? "90%" : "not_available",
    direct_contribution_per_attendance_gbp:
      contributionPerAttendance === null
        ? ""
        : contributionPerAttendance.toFixed(2),
    assumed_attended_events_per_acquired_customer:
      selection.assumedAttendedEvents ?? "",
    illustrative_lifetime_direct_contribution_gbp:
      lifetimeDirectContribution === null
        ? ""
        : lifetimeDirectContribution.toFixed(2),
    acquisition_share_of_lifetime_direct_contribution: economics ? "50%" : "",
    illustrative_max_cac_gbp: maximumCac === null ? "" : maximumCac.toFixed(2),
    required_click_to_booking_rate:
      requiredConversion === null
        ? "not_estimable"
        : `${(requiredConversion * 100).toFixed(1)}%`,
    cpa_at_2_percent_conversion_gbp: hasUsableAuctionSignal
      ? (cpc / 0.02).toFixed(2)
      : "not_estimable",
    cpa_at_5_percent_conversion_gbp: hasUsableAuctionSignal
      ? (cpc / 0.05).toFixed(2)
      : "not_estimable",
    cpa_at_10_percent_conversion_gbp: hasUsableAuctionSignal
      ? (cpc / 0.1).toFixed(2)
      : "not_estimable",
    verdict,
    selection_rationale: selection.rationale,
    evidence_class:
      "Google Ads historical metric combined with an illustrative retained-purchase scenario",
    assumption_warning:
      "CPC is a historical auction metric, not a bid or traffic forecast; contribution uses an assumed 90%-fill event and excludes VAT, central overhead, founder labour, insurance, tax and failed events; repeat attendance and 50% acquisition allocation are assumptions",
    observed_at: OBSERVED_AT,
  };
});

const columns = [
  "launch_cell",
  "geography_method",
  "selected_intent",
  "selected_keyword",
  "average_monthly_searches",
  "average_cpc_gbp",
  "economics_model",
  "model_fill_basis",
  "direct_contribution_per_attendance_gbp",
  "assumed_attended_events_per_acquired_customer",
  "illustrative_lifetime_direct_contribution_gbp",
  "acquisition_share_of_lifetime_direct_contribution",
  "illustrative_max_cac_gbp",
  "required_click_to_booking_rate",
  "cpa_at_2_percent_conversion_gbp",
  "cpa_at_5_percent_conversion_gbp",
  "cpa_at_10_percent_conversion_gbp",
  "verdict",
  "selection_rationale",
  "evidence_class",
  "assumption_warning",
  "observed_at",
];

writeFileSync(
  join(EVIDENCE_DIRECTORY, "launch-cell-acquisition-sensitivity.csv"),
  toCsv(columns, acquisitionRows),
);

console.log(
  `Wrote ${acquisitionRows.length} launch-cell acquisition rows to ${EVIDENCE_DIRECTORY}`,
);
