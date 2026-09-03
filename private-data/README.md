# Private data

This directory is intentionally excluded from Git except for this note.

The local checkout links `private-data/companies-house` to Leadmap's existing Companies House store so the 470 MB bulk snapshot and approximately 1 GB raw-artifact cache are not duplicated. The source remains:

```text
/Users/godzillaaa/Documents/WEB_PROJECTS/clients/leadmap/data/companies-house
```

Set `COMPANIES_HOUSE_RAW_DIR` in the ignored root `.env` when a different raw-artifact location is required.

