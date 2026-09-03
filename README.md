# Research Library

A reusable home for evidence-led commercial research, publication-ready document series and the tools used to produce them.

## Structure

- `publications/` contains one self-contained directory per research project.
- `skills/` contains the research contracts used to gather and interpret evidence.
- `scripts/google-ads-*.mjs` and `scripts/lib/google-ads.mjs` contain the read-only historical keyword-metrics runner.
- `tooling/companies-house/` contains registry discovery, enrichment and validation tools.
- `private-data/` provides local access to large source captures and snapshots and is excluded from Git.
- `docs/` is generated static output for GitHub Pages. Nothing outside it is served by Pages.

## Current publication

`publications/product-aggregator-2026/` contains the UK product-aggregator research series, including the commercial keyword ledger, opportunity scorecard, practitioner evidence and source registry.

## Credentials

The working `.env` is local-only and ignored. `.env.example` documents the variable names required by the Google Ads and Companies House tools without containing values.

Never place a credential in a Markdown publication, CSV, generated HTML file or Git commit.

## Commands

```sh
pnpm google-ads:volume --help
pnpm companies-house:leads --help
pnpm companies-house:city-agencies --help
pnpm companies-house:export --help
pnpm build
pnpm verify
```
