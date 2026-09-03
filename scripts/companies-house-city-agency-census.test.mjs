import assert from "node:assert/strict";
import test from "node:test";
import {
  cityForPostTown,
  isPriorityCandidate,
  matchesCityGeography,
  qualifyAgencyCandidate,
} from "./companies-house-city-agency-census.mjs";

test("maps the legal post towns used by the three city census", () => {
  assert.equal(cityForPostTown("Bristol"), "bristol");
  assert.equal(cityForPostTown("Exeter"), "exeter");
  assert.equal(cityForPostTown("Hove"), "brighton");
  assert.equal(cityForPostTown("Brighton and Hove"), "brighton");
  assert.equal(cityForPostTown("Bath"), null);
});

test("limits post towns to the urban postcode districts in scope", () => {
  assert.equal(matchesCityGeography("bristol", "Bristol", "BS1 4DJ"), true);
  assert.equal(matchesCityGeography("bristol", "Bristol", "BS48 1AW"), false);
  assert.equal(matchesCityGeography("exeter", "Exeter", "EX4 3LS"), true);
  assert.equal(matchesCityGeography("exeter", "Exeter", "EX15 1AA"), false);
  assert.equal(matchesCityGeography("brighton", "Hove", "BN3 3BQ"), true);
  assert.equal(matchesCityGeography("brighton", "Brighton", "BN42 4HL"), false);
});

test("keeps core software SICs broad but gates adjacent SICs on an agency name", () => {
  assert.ok(qualifyAgencyCandidate("Example Limited", ["62012"]));
  assert.equal(qualifyAgencyCandidate("Example Limited", ["74100"]), null);
  assert.ok(
    qualifyAgencyCandidate("Example Digital Studio Limited", ["74100"]),
  );
});

test("priority gate requires maturity, an agency name, and current accounts", () => {
  const candidate = {
    incorporation_date: "2020-01-01",
    positive_name_signals: ["DIGITAL"],
    negative_name_signals: [],
    core_sic_codes: ["62012"],
    accounts_category: "MICRO ENTITY",
    accounts_overdue: "no",
  };
  assert.equal(isPriorityCandidate(candidate, "2026-08-29"), true);
  assert.equal(
    isPriorityCandidate(
      { ...candidate, incorporation_date: "2026-01-01" },
      "2026-08-29",
    ),
    false,
  );
  assert.equal(
    isPriorityCandidate(
      { ...candidate, accounts_category: "DORMANT" },
      "2026-08-29",
    ),
    false,
  );
  assert.equal(
    isPriorityCandidate(
      { ...candidate, negative_name_signals: ["HOLDINGS"] },
      "2026-08-29",
    ),
    false,
  );
});
