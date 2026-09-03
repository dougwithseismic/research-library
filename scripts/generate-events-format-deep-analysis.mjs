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
  const rendered = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(rendered)
    ? `"${rendered.replaceAll('"', '""')}"`
    : rendered;
}

function toCsv(columns, rows) {
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}

function round(value, places = 1) {
  return Number(Number(value).toFixed(places));
}

const profiles = {
  Darts: {
    assetControl: 4,
    priceEvidence: 5,
    anchor: "Flight Club Social Darts from £9 per person (S173)",
    pilot: "Six-week beginner ladder in a partner pub",
    decisionCeiling: "priority_paid_pilot",
  },
  "Line dancing": {
    assetControl: 5,
    priceEvidence: 2,
    anchor: "No directly comparable current line-dancing price retained",
    pilot: "Beginner lesson followed by a recurring social",
    decisionCeiling: "priority_paid_pilot",
  },
  "Salsa classes": {
    assetControl: 5,
    priceEvidence: 5,
    anchor:
      "Salsateca £15 one hour; £17 two hours; packs and subscriptions (S181)",
    pilot: "Beginner class, rotating practice and six-session pack",
    decisionCeiling: "priority_paid_pilot",
  },
  "Board-game cafes": {
    assetControl: 4,
    priceEvidence: 5,
    anchor: "Draughts £7.50 off-peak or £9.50 peak admission (S174)",
    pilot: "Hosted game rotation in existing hospitality space",
    decisionCeiling: "priority_paid_pilot",
  },
  "Pottery painting": {
    assetControl: 3,
    priceEvidence: 4,
    anchor:
      "Pottery Cafe current studio, party and private-room pricing (S127)",
    pilot: "Portable taster or studio-capacity partnership",
    decisionCeiling: "priority_paid_pilot",
  },
  "Pottery classes": {
    assetControl: 2,
    priceEvidence: 5,
    anchor:
      "Southwark ten-week adult courses £220–£264 plus £5 registration (S183)",
    pilot: "One taster feeding a prepaid bounded course",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  "Dungeons & Dragons": {
    assetControl: 4,
    priceEvidence: 3,
    anchor:
      "Adjacent professional game-master pricing retained; no UK city benchmark",
    pilot: "Prepaid continuing campaign with a trained game master",
    decisionCeiling: "focused_validation",
  },
  "Sewing classes": {
    assetControl: 3,
    priceEvidence: 2,
    anchor: "No comparable current operator price retained",
    pilot: "Bring-your-machine taster before equipment-heavy provision",
    decisionCeiling: "focused_validation",
  },
  "Wine tasting": {
    assetControl: 5,
    priceEvidence: 5,
    anchor:
      "Wine Society current multi-city tasting calendar and price bands (S182)",
    pilot: "Producer-led tasting series in a partner venue",
    decisionCeiling: "priority_paid_pilot",
  },
  "Acting classes": {
    assetControl: 5,
    priceEvidence: 2,
    anchor: "No comparable current adult acting-course price retained",
    pilot: "Four-session beginner cohort with a sharing night",
    decisionCeiling: "focused_validation",
  },
  "Quiz nights": {
    assetControl: 5,
    priceEvidence: 2,
    anchor: "No directly comparable managed-series price retained",
    pilot: "Team rotation and season table, not a commodity pub quiz",
    decisionCeiling: "focused_validation",
  },
  Volleyball: {
    assetControl: 2,
    priceEvidence: 4,
    anchor: "GO Mammoth adjacent social-sport league price evidence (S175)",
    pilot: "Prepaid season using a recurring rented court slot",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  Netball: {
    assetControl: 2,
    priceEvidence: 4,
    anchor:
      "GO Mammoth city coverage and adjacent league price evidence (S171, S175)",
    pilot: "Prepaid season with individual player matching",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  "Running clubs": {
    assetControl: 5,
    priceEvidence: 1,
    anchor: "No paid-club price retained; free substitutes are material",
    pilot: "Bounded coached cohort rather than an undifferentiated run club",
    decisionCeiling: "focused_validation",
  },
  "Chess clubs": {
    assetControl: 5,
    priceEvidence: 3,
    anchor: "Adjacent hosted chess and games evidence; no broad UK benchmark",
    pilot: "Hosted ladder with teaching table and seasonal final",
    decisionCeiling: "focused_validation",
  },
  "Yoga retreats": {
    assetControl: 3,
    priceEvidence: 5,
    anchor:
      "Emyoga two nights £395 shared or £495 single; Zest from £945 (S176, S177)",
    pilot: "Partner-venue weekend only after audience pre-validation",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  Padel: {
    assetControl: 2,
    priceEvidence: 3,
    anchor:
      "Facility-led category; no directly comparable managed-series price retained",
    pilot: "Managed beginner mixer through an existing court operator",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  "Cooking classes": {
    assetControl: 3,
    priceEvidence: 2,
    anchor: "No comparable current UK operator price retained",
    pilot: "Licensed-kitchen partnership with one repeatable menu",
    decisionCeiling: "focused_validation",
  },
  "Nature walks": {
    assetControl: 4,
    priceEvidence: 1,
    anchor: "No comparable current paid-walk price retained",
    pilot: "Qualified guide, bounded theme and weather fallback",
    decisionCeiling: "focused_validation",
  },
  "Speed dating": {
    assetControl: 5,
    priceEvidence: 4,
    anchor:
      "Original Dating current regional inventory and ticket examples (S169, S170)",
    pilot: "Only with a sharply defined cohort and balanced inventory",
    decisionCeiling: "focused_validation",
  },
  Karaoke: {
    assetControl: 4,
    priceEvidence: 2,
    anchor:
      "No managed social-series price retained; room hire is a strong substitute",
    pilot: "Hosted team format with rotation, not passive booth hire",
    decisionCeiling: "focused_validation",
  },
  "Spa retreats": {
    assetControl: 2,
    priceEvidence: 5,
    anchor:
      "Grange day retreat £199; Macdonald spa days £64–£85+; Stobo four nights from £1,128 (S178–S180)",
    pilot: "Audience-led day retreat through an existing spa",
    decisionCeiling: "partner_only_or_narrow_test",
  },
  "General art workshops": {
    assetControl: 5,
    priceEvidence: 2,
    anchor: "No comparable current general-workshop price retained",
    pilot: "Portable two-hour workshop in a partner venue",
    decisionCeiling: "focused_validation",
  },
  "Sip and paint": {
    assetControl: 5,
    priceEvidence: 3,
    anchor:
      "Brush Party product evidence retained; comparable in-person unit economics unknown",
    pilot: "Venue-partnered evening with materials pre-kitted",
    decisionCeiling: "priority_paid_pilot",
  },
};

const nationalRows = parseCsv(
  readFileSync(
    join(EVIDENCE_DIRECTORY, "event-format-opportunity-scorecard.csv"),
    "utf8",
  ),
);
const cityRows = parseCsv(
  readFileSync(
    join(EVIDENCE_DIRECTORY, "event-format-city-summary.csv"),
    "utf8",
  ),
);
const nationalByFormat = new Map(nationalRows.map((row) => [row.format, row]));
const cityByFormat = Map.groupBy(cityRows, (row) => row.format);

const deepRows = Object.entries(profiles)
  .map(([format, profile]) => {
    const national = nationalByFormat.get(format);
    const cityEvidence = cityByFormat.get(format) ?? [];
    if (!national || cityEvidence.length !== 15) {
      throw new Error(`Incomplete evidence for ${format}`);
    }
    const topCells = [...cityEvidence]
      .sort(
        (left, right) =>
          Number(right.comparative_liquidity_index_100) -
          Number(left.comparative_liquidity_index_100),
      )
      .slice(0, 3);
    const best = topCells[0];
    const topNonLondonCells = [...cityEvidence]
      .filter((row) => row.city !== "London")
      .sort(
        (left, right) =>
          Number(right.comparative_liquidity_index_100) -
          Number(left.comparative_liquidity_index_100),
      )
      .slice(0, 3);
    const bestNonLondon = topNonLondonCells[0];
    const signalCities = cityEvidence.filter(
      (row) =>
        Number(row.explicit_average_monthly_searches) >= 50 ||
        Number(row.local_geo_average_monthly_searches) >= 20,
    ).length;
    const demandPoints = (Number(national.demand_score_20) / 20) * 15;
    const cityLiquidityPoints =
      (Number(best.comparative_liquidity_index_100) / 100) * 20;
    const cityBreadthPoints = (signalCities / 15) * 10;
    const commercialPoints = Number(national.commercial_intent_rating_5) * 2;
    const repeatPoints = Number(national.repeatability_rating_5) * 2;
    const socialPoints = Number(national.social_design_rating_5) * 2;
    const controlPoints = profile.assetControl * 2;
    const priceEvidencePoints = profile.priceEvidence;
    const headroomPoints = Number(national.eventization_headroom_rating_5) * 2;
    const score = Math.round(
      demandPoints +
        cityLiquidityPoints +
        cityBreadthPoints +
        commercialPoints +
        repeatPoints +
        socialPoints +
        controlPoints +
        priceEvidencePoints +
        headroomPoints,
    );
    const scoreDecision =
      score >= 80
        ? "priority_paid_pilot"
        : score >= 72
          ? "focused_validation"
          : score >= 65
            ? "partner_only_or_narrow_test"
            : "watchlist_or_substitute";
    const decisionOrder = [
      "priority_paid_pilot",
      "focused_validation",
      "partner_only_or_narrow_test",
      "watchlist_or_substitute",
    ];
    const decision =
      decisionOrder.indexOf(profile.decisionCeiling) >
      decisionOrder.indexOf(scoreDecision)
        ? profile.decisionCeiling
        : scoreDecision;

    return {
      rank: 0,
      format,
      family: national.family,
      primary_keyword: national.primary_keyword,
      national_average_monthly_searches:
        national.primary_average_monthly_searches,
      national_average_cpc_gbp: national.average_cpc_gbp,
      best_city: best.city,
      best_city_explicit_average_monthly_searches:
        best.explicit_average_monthly_searches,
      best_city_local_geo_average_monthly_searches:
        best.local_geo_average_monthly_searches,
      best_city_liquidity_index_100: best.comparative_liquidity_index_100,
      top_three_city_cells: topCells
        .map(
          (row) =>
            `${row.city}:${row.comparative_liquidity_index_100} ` +
            `(explicit ${row.explicit_average_monthly_searches}; local ${row.local_geo_average_monthly_searches})`,
        )
        .join(" | "),
      best_non_london_city: bestNonLondon.city,
      best_non_london_explicit_average_monthly_searches:
        bestNonLondon.explicit_average_monthly_searches,
      best_non_london_local_geo_average_monthly_searches:
        bestNonLondon.local_geo_average_monthly_searches,
      best_non_london_liquidity_index_100:
        bestNonLondon.comparative_liquidity_index_100,
      top_three_non_london_city_cells: topNonLondonCells
        .map(
          (row) =>
            `${row.city}:${row.comparative_liquidity_index_100} ` +
            `(explicit ${row.explicit_average_monthly_searches}; local ${row.local_geo_average_monthly_searches})`,
        )
        .join(" | "),
      cities_with_reportable_signal_15: signalCities,
      national_demand_points_15: round(demandPoints),
      city_liquidity_points_20: round(cityLiquidityPoints),
      city_breadth_points_10: round(cityBreadthPoints),
      commercial_intent_points_10: commercialPoints,
      repeatability_points_10: repeatPoints,
      social_design_points_10: socialPoints,
      asset_light_control_points_10: controlPoints,
      price_evidence_points_5: priceEvidencePoints,
      eventization_headroom_points_10: headroomPoints,
      deep_opportunity_score_100: score,
      decision,
      decision_gate:
        profile.decisionCeiling === "priority_paid_pilot"
          ? "No manual ceiling beyond the weighted score"
          : `Ceiling: ${profile.decisionCeiling}; applied for facility, free-substitute, fulfilment or evidence risk`,
      recommended_test: profile.pilot,
      current_price_anchor: profile.anchor,
      evidence_coverage:
        profile.priceEvidence >= 4
          ? "national demand; 15-city demand; current adjacent price evidence"
          : "national demand; 15-city demand; incomplete price evidence",
      largest_unknown:
        "adult solo-friendly conversion, fill, second paid booking and direct contribution in the proposed city-format cell",
      score_method:
        "15 national demand + 20 best-city liquidity + 10 city breadth + 10 commercial intent + 10 repeatability + 10 social design + 10 asset-light control + 5 price evidence + 10 eventization headroom",
      observed_at: OBSERVED_AT,
    };
  })
  .sort(
    (left, right) =>
      right.deep_opportunity_score_100 - left.deep_opportunity_score_100 ||
      Number(right.national_average_monthly_searches) -
        Number(left.national_average_monthly_searches),
  )
  .map((row, index) => ({ ...row, rank: index + 1 }));

const economics = [
  {
    format: "Social darts league night",
    sourceAnchor: "Flight Club from £9 per person (S173)",
    capacity: 48,
    ticket: 18,
    fixed: 400,
    variable: 2.5,
    note: "Ticket, pub board bank, host, equipment, staffing and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Beginner social-dance night",
    sourceAnchor: "Salsateca £15 one hour and £17 two hours (S181)",
    capacity: 60,
    ticket: 17,
    fixed: 560,
    variable: 1.5,
    note: "Venue, two facilitators, staff and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Hosted board-game night",
    sourceAnchor: "Draughts £7.50 off-peak and £9.50 peak admission (S174)",
    capacity: 40,
    ticket: 15,
    fixed: 350,
    variable: 1.5,
    note: "Premium hosted ticket, room, host, inventory, staff and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Portable pottery workshop",
    sourceAnchor: "Pottery Cafe and Southwark course anchors (S127, S183)",
    capacity: 16,
    ticket: 45,
    fixed: 360,
    variable: 16,
    note: "Price, venue, facilitator, materials, firing, staff and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Managed social-sport session",
    sourceAnchor:
      "GO Mammoth selected league £12.20 weekly individual price (S175)",
    capacity: 20,
    ticket: 12.2,
    fixed: 155,
    variable: 1.5,
    note: "Facility, official or host, equipment and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Partner-led wine tasting",
    sourceAnchor:
      "Wine Society current multi-city events and price bands (S182)",
    capacity: 30,
    ticket: 40,
    fixed: 420,
    variable: 14,
    note: "Blended ticket, wine, venue, expert, staff and contingency are assumptions; acquisition is excluded",
  },
  {
    format: "Partner-spa day retreat",
    sourceAnchor:
      "Grange £199 day retreat; Macdonald spa days £64–£85+ (S178, S179)",
    capacity: 16,
    ticket: 199,
    fixed: 690,
    variable: 105,
    note: "Partner wholesale rate, facilitators, staff, contingency and reserve are assumptions; acquisition is excluded",
  },
  {
    format: "Two-night yoga retreat",
    sourceAnchor: "Emyoga £395 shared and £495 single (S176)",
    capacity: 18,
    ticket: 395,
    fixed: 1900,
    variable: 232,
    note: "Shared-room yield, venue, food, facilitation, staff, contingency and reserve are assumptions; acquisition is excluded",
  },
];

const fillLevels = [0.5, 0.7, 0.9];
const economicsRows = economics.flatMap((model) => {
  const perAttendeeContribution = model.ticket - model.variable;
  const breakEvenAttendees = model.fixed / perAttendeeContribution;
  return fillLevels.map((fill) => {
    const attendees = Math.floor(model.capacity * fill);
    const revenue = attendees * model.ticket;
    const variableCosts = attendees * model.variable;
    const contribution = revenue - variableCosts - model.fixed;
    return {
      format: model.format,
      scenario: `${Math.round(fill * 100)}% fill`,
      currency: "GBP",
      capacity: model.capacity,
      paid_attendees: attendees,
      ticket_or_blended_yield_per_attendee: model.ticket.toFixed(2),
      gross_revenue: revenue.toFixed(2),
      fixed_direct_costs: model.fixed.toFixed(2),
      variable_direct_cost_per_attendee: model.variable.toFixed(2),
      total_variable_direct_costs: variableCosts.toFixed(2),
      illustrative_direct_contribution: contribution.toFixed(2),
      contribution_margin:
        revenue === 0
          ? "0.0%"
          : `${((contribution / revenue) * 100).toFixed(1)}%`,
      break_even_attendees: Math.ceil(breakEvenAttendees),
      break_even_fill: `${((breakEvenAttendees / model.capacity) * 100).toFixed(1)}%`,
      observed_price_anchor: model.sourceAnchor,
      evidence_class: "scenario_using_observed_anchor_and_assumed_costs",
      assumption_warning: `${model.note}; excludes VAT, central overhead, founder labour, insurance, tax and portfolio failures`,
      observed_at: OBSERVED_AT,
    };
  });
});

const deepColumns = [
  "rank",
  "format",
  "family",
  "primary_keyword",
  "national_average_monthly_searches",
  "national_average_cpc_gbp",
  "best_city",
  "best_city_explicit_average_monthly_searches",
  "best_city_local_geo_average_monthly_searches",
  "best_city_liquidity_index_100",
  "top_three_city_cells",
  "best_non_london_city",
  "best_non_london_explicit_average_monthly_searches",
  "best_non_london_local_geo_average_monthly_searches",
  "best_non_london_liquidity_index_100",
  "top_three_non_london_city_cells",
  "cities_with_reportable_signal_15",
  "national_demand_points_15",
  "city_liquidity_points_20",
  "city_breadth_points_10",
  "commercial_intent_points_10",
  "repeatability_points_10",
  "social_design_points_10",
  "asset_light_control_points_10",
  "price_evidence_points_5",
  "eventization_headroom_points_10",
  "deep_opportunity_score_100",
  "decision",
  "decision_gate",
  "recommended_test",
  "current_price_anchor",
  "evidence_coverage",
  "largest_unknown",
  "score_method",
  "observed_at",
];
const economicsColumns = [
  "format",
  "scenario",
  "currency",
  "capacity",
  "paid_attendees",
  "ticket_or_blended_yield_per_attendee",
  "gross_revenue",
  "fixed_direct_costs",
  "variable_direct_cost_per_attendee",
  "total_variable_direct_costs",
  "illustrative_direct_contribution",
  "contribution_margin",
  "break_even_attendees",
  "break_even_fill",
  "observed_price_anchor",
  "evidence_class",
  "assumption_warning",
  "observed_at",
];

writeFileSync(
  join(EVIDENCE_DIRECTORY, "event-format-deep-scorecard.csv"),
  toCsv(deepColumns, deepRows),
);
writeFileSync(
  join(EVIDENCE_DIRECTORY, "event-format-economics-sensitivity.csv"),
  toCsv(economicsColumns, economicsRows),
);

console.log(
  `Wrote ${deepRows.length} deep format scores and ${economicsRows.length} fill-sensitivity scenarios.`,
);
