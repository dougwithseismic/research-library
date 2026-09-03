#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function count(source, expression) {
  return [...source.matchAll(expression)].length;
}

function classCount(source, className) {
  return [...source.matchAll(/class=["']([^"']*)["']/gi)].filter((match) =>
    match[1].split(/\s+/).includes(className),
  ).length;
}

const htmlPath = argument("--html");
if (!htmlPath) {
  console.error(
    "Usage: node validate_report.mjs --html <report.html> [--expected-accounts N] [--expected-financials N]",
  );
  process.exit(2);
}

const html = await readFile(resolve(htmlPath), "utf8");
const expectedAccounts = Number(argument("--expected-accounts", "0"));
const expectedFinancials = Number(
  argument("--expected-financials", String(expectedAccounts)),
);
const accountProfiles = classCount(html, "profile");
const companyStats = classCount(html, "profile-financials");
const headlineFinancialMetrics = classCount(html, "financial-metric");
const embeddedImages = count(html, /<img\b[^>]*\bsrc=["']data:image\//gi);
const externalImages = count(html, /<img\b[^>]*\bsrc=["']https?:\/\//gi);
const linkedInImages = count(
  html,
  /<img\b[^>]*(?:linkedin|linked-in)|(?:linkedin|linked-in)[^<]*<img\b/gi,
);
const companiesHouseLinks = count(
  html,
  /href=["']https:\/\/find-and-update\.company-information\.service\.gov\.uk\/company\//gi,
);
const linkedInActions = count(
  html,
  /<a\b[^>]*class=["'][^"']*\blinkedin-search--icon\b[^"']*["'][^>]*href=["']https:\/\/www\.linkedin\.com\/(?:in\/|search\/results\/)/gi,
);
const mapActions = count(
  html,
  /<a\b[^>]*class=["'][^"']*\bmap-link\b[^"']*["'][^>]*href=["']https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=/gi,
);
const profileBlocks = [
  ...html.matchAll(
    /<article\b[^>]*class=["']profile(?:\s[^"']*)?["'][^>]*>([\s\S]*?)<\/article>/gi,
  ),
].map((match) => match[1]);
const commercialBeforeFinancials =
  profileBlocks.length === accountProfiles &&
  profileBlocks.every((block) => {
    const commercial = block.indexOf('class="profile-grid"');
    const financials = block.indexOf('class="profile-financials"');
    return commercial !== -1 && financials > commercial;
  });

const checks = [
  {
    name: "account profile count",
    ok: expectedAccounts === 0 || accountProfiles === expectedAccounts,
    actual: accountProfiles,
    expected: expectedAccounts || null,
  },
  {
    name: "company statistics count",
    ok: expectedFinancials === 0 || companyStats === expectedFinancials,
    actual: companyStats,
    expected: expectedFinancials || null,
  },
  {
    name: "six headline financial metrics per company",
    ok:
      expectedFinancials === 0 ||
      headlineFinancialMetrics >= expectedFinancials * 6,
    actual: headlineFinancialMetrics,
    expected: `>= ${expectedFinancials * 6}`,
  },
  {
    name: "standalone images",
    ok: externalImages === 0,
    actual: externalImages,
    expected: 0,
  },
  {
    name: "no LinkedIn screenshots",
    ok: linkedInImages === 0,
    actual: linkedInImages,
    expected: 0,
  },
  {
    name: "Companies House sources",
    ok: companiesHouseLinks >= Math.max(expectedFinancials, 1),
    actual: companiesHouseLinks,
    expected: `>= ${Math.max(expectedFinancials, 1)}`,
  },
  {
    name: "commercial content before financials",
    ok: commercialBeforeFinancials,
    actual: commercialBeforeFinancials,
    expected: true,
  },
  {
    name: "LinkedIn name actions",
    ok: expectedAccounts === 0 || linkedInActions >= expectedAccounts,
    actual: linkedInActions,
    expected: `>= ${expectedAccounts}`,
  },
  {
    name: "Google Maps address actions",
    ok: expectedAccounts === 0 || mapActions >= expectedAccounts,
    actual: mapActions,
    expected: `>= ${expectedAccounts}`,
  },
  {
    name: "Utopia fluid tokens",
    ok: /--step-0:\s*clamp\(/i.test(html) && /--space-s:\s*clamp\(/i.test(html),
    actual: true,
    expected: true,
  },
  {
    name: "explicit missing-value language",
    ok: /Not disclosed|No accounts filed|PDF-only/i.test(html),
    actual: true,
    expected: true,
  },
  {
    name: "responsive viewport",
    ok: /<meta\b[^>]*name=["']viewport["']/i.test(html),
    actual: true,
    expected: true,
  },
  {
    name: "print styles",
    ok: /@media\s+print/i.test(html),
    actual: true,
    expected: true,
  },
];

const failed = checks.filter((check) => !check.ok);
console.log(
  JSON.stringify(
    {
      html: resolve(htmlPath),
      accountProfiles,
      companyStats,
      headlineFinancialMetrics,
      embeddedImages,
      checks,
    },
    null,
    2,
  ),
);
if (failed.length) {
  console.error(
    `Report validation failed: ${failed.map((check) => check.name).join(", ")}`,
  );
  process.exit(1);
}
