# Companies House financial extraction

## Source choices

Use the Companies House API when `COMPANIES_HOUSE_API_KEY` is already available. Otherwise read the public pages at:

```text
/company/<number>
/company/<number>/officers
/company/<number>/persons-with-significant-control
/company/<number>/charges
/company/<number>/filing-history
```

Send a descriptive user agent, throttle requests, retain the final URL and observation time, and store the exact response body before parsing.

Useful public-page IDs include:

- profile: `company-status`, `company-type-value`, `company-creation-date`, `roa-address`, and `sic0...`;
- officers: `officer-name-N`, `officer-role-N`, `officer-appointed-on-N`, `officer-resigned-on-N`, `officer-status-tag-N`;
- control: `psc-name-N`, `psc-status-tag-N`, `psc-notified-on-N`, `psc-ceased-on-N`, and `psc-noc-N-*`;
- charges: `company-mortgages-breakdown`, `mortgage-heading-N`, `mortgage-created-on-N`, and `mortgage-status-N`.

Treat selectors as implementation details that can change. Save raw pages and fail visibly if a parser suddenly returns empty identity fields.

## Select the latest accounts correctly

The filing-history page can include non-account rows even when an accounts category is requested. Iterate rows in page order and select the first row whose description is an accounts filing.

Within that same row:

1. capture filing date, description, period end, page count, and document link;
2. prefer its XHTML link when present;
3. otherwise retain its PDF link and mark `format: pdf`;
4. never scan farther down the page for an older XHTML link.

This prevents a common and serious error: showing an older machine-readable year as if it were the latest filing.

## Structured metrics

Parse XBRL or iXBRL contexts, units, periods, dimensions, scales, signs, and nil values before selecting metrics. Retain the source concept.

Useful canonical metrics include:

- turnover;
- gross profit, operating profit, profit before tax, profit after tax;
- fixed assets, current assets, stocks, debtors, cash;
- creditors within one year and after one year;
- net current assets, total assets less current liabilities;
- provisions, net assets, equity;
- average employees.

For each metric select a coherent current fact and, when available, the comparable previous fact. Prefer dimensionless group facts over company-only facts for group accounts, but retain the selected scope. Warn when conflicting facts exist for the same metric and period.

## Interpretation boundaries

- Filings are company-submitted public records.
- `Not disclosed` is not zero.
- Small, micro, dormant, and filleted accounts often omit turnover or profit.
- A zero employee fact may be real; preserve it only when the filing actually states zero.
- Do not estimate turnover from balance-sheet values.
- If using a size-threshold assessment, label it as an eligibility inference rather than reported turnover.
- Do not describe unaudited or audit-exempt accounts as audited.
- Put the period beside every current number and show YoY only when a comparable prior period exists.
- Negative net assets and weak current ratios are filing signals, not a credit decision.

## Proven no-database path in Research Library

`tooling/companies-house/server/src/jobs/export-report-financials.ts` supports an authenticated API mode and a public-page fallback. It stores raw artifacts locally and writes JSON only. It must remain independent of any application database and must not be replaced with a Supabase query for report generation.
