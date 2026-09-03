import { createReadStream, createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const [snapshotZip, recentCsv, outputCsv] = process.argv.slice(2);

if (!snapshotZip || !recentCsv || !outputCsv) {
  console.error(
    "Usage: node scripts/filter-companies-house-address.mjs <snapshot.zip> <recent.csv> <output.csv>",
  );
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function csvCell(value) {
  const stringValue = String(value ?? "");
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replaceAll('"', '""')}"`
    : stringValue;
}

function isoDate(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
}

function normalized(value) {
  return value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "");
}

function isPaulStreetAddress(address, postcode) {
  const normalizedAddress = normalized(address);
  return (
    normalized(postcode) === "EC2A4NE" &&
    normalizedAddress.includes("8690") &&
    normalizedAddress.includes("PAULSTREET")
  );
}

const companies = new Map();
const unzip = spawn("unzip", ["-p", snapshotZip], {
  stdio: ["ignore", "pipe", "inherit"],
});
const snapshotLines = createInterface({
  input: unzip.stdout,
  crlfDelay: Infinity,
});
let snapshotHeader;

for await (const line of snapshotLines) {
  const row = parseCsvLine(line);
  if (!snapshotHeader) {
    snapshotHeader = new Map(
      row.map((column, index) => [column.trim(), index]),
    );
    continue;
  }

  const get = (column) => row[snapshotHeader.get(column)] ?? "";
  const addressParts = [
    get("RegAddress.CareOf"),
    get("RegAddress.AddressLine1"),
    get("RegAddress.AddressLine2"),
    get("RegAddress.PostTown"),
    get("RegAddress.County"),
    get("RegAddress.Country"),
    get("RegAddress.PostCode"),
  ].filter(Boolean);
  const address = addressParts.join(", ");
  const postcode = get("RegAddress.PostCode");

  if (
    get("CompanyStatus").toUpperCase() !== "ACTIVE" ||
    !isPaulStreetAddress(address, postcode)
  ) {
    continue;
  }

  const sicCodes = [1, 2, 3, 4]
    .map((number) => get(`SICCode.SicText_${number}`))
    .filter(Boolean)
    .join(" | ");
  const companyNumber = get("CompanyNumber");
  companies.set(companyNumber, {
    companyName: get("CompanyName"),
    companyNumber,
    companyStatus: get("CompanyStatus"),
    companyType: get("CompanyCategory"),
    incorporationDate: isoDate(get("IncorporationDate")),
    address,
    sicCodes,
    source: "Companies House bulk snapshot 2026-08-01",
  });
}

const recentLines = createInterface({
  input: createReadStream(recentCsv),
  crlfDelay: Infinity,
});
let firstRecentLine = true;

for await (const line of recentLines) {
  if (firstRecentLine) {
    firstRecentLine = false;
    continue;
  }

  // The Companies House advanced-search export leaves the SIC list unquoted,
  // so parse the stable leading columns and recover the address from the end.
  const leading = line.match(
    /^([^,]+),([^,]+),([^,]+),([^,]+),([^,]*),([^,]*),(\d{4}-\d{2}-\d{2}),([^,]*),([^,]*),(.*)$/,
  );
  if (!leading) continue;
  const remainder = leading[10];
  const addressStart = remainder.search(
    /(?:3rd Floor[, ]*)?86-90 Paul Street/i,
  );
  if (addressStart < 0) continue;
  const sicPart = remainder.slice(0, addressStart).replace(/,$/, "").trim();
  const address = remainder.slice(addressStart).trim();
  if (!isPaulStreetAddress(address, "EC2A 4NE")) continue;

  companies.set(leading[2], {
    companyName: leading[1],
    companyNumber: leading[2],
    companyStatus: leading[3],
    companyType: leading[4],
    incorporationDate: leading[7],
    address,
    sicCodes: sicPart,
    source: "Companies House live advanced search 2026-08-27",
  });
}

const sorted = [...companies.values()].sort(
  (left, right) =>
    right.incorporationDate.localeCompare(left.incorporationDate) ||
    right.companyNumber.localeCompare(left.companyNumber),
);

const output = createWriteStream(outputCsv);
output.write(
  "company_name,company_number,company_status,company_type,incorporation_date,registered_office_address,sic_codes,source\n",
);
for (const company of sorted) {
  output.write(
    [
      company.companyName,
      company.companyNumber,
      company.companyStatus,
      company.companyType,
      company.incorporationDate,
      company.address,
      company.sicCodes,
      company.source,
    ]
      .map(csvCell)
      .join(",") + "\n",
  );
}
output.end();

console.log(
  `Wrote ${sorted.length.toLocaleString("en-GB")} companies to ${outputCsv}`,
);
