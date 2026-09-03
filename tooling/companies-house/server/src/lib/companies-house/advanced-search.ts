const ADVANCED_SEARCH_CSV =
  "https://find-and-update.company-information.service.gov.uk/advanced-search/csv";

export type CompaniesHouseSearchRow = {
  companyName: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  incorporationDate: string;
  sicCodes: string[];
  registeredOfficeAddress: string;
  raw: Record<string, string>;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else value += character;
  }
  values.push(value);
  return values;
}

function parseLeadingCsvFields(line: string, count: number) {
  const fields: string[] = [];
  let value = "";
  let quoted = false;
  let index = 0;
  for (; index < line.length && fields.length < count; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(value);
      value = "";
    } else value += character;
  }
  return { fields, remainder: line.slice(index) };
}

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).flatMap((line) => {
    const { fields, remainder } = parseLeadingCsvFields(line, 9);
    const trailing = /^(\[[^\]]*\]),(.*)$/.exec(remainder);
    if (fields.length !== 9 || !trailing) return [];
    const values = [...fields, trailing[1], trailing[2]];
    return [
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ),
    ];
  });
}

function dateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) throw new Error(`Invalid ISO date: ${date}`);
  return { year, month, day };
}

export async function fetchCompaniesIncorporatedOn(
  date: string,
): Promise<CompaniesHouseSearchRow[]> {
  const parts = dateParts(date);
  const url = new URL(ADVANCED_SEARCH_CSV);
  const parameters = {
    status: "active",
    incorporationFromDay: parts.day,
    incorporationFromMonth: parts.month,
    incorporationFromYear: parts.year,
    incorporationToDay: parts.day,
    incorporationToMonth: parts.month,
    incorporationToYear: parts.year,
  };
  for (const [key, value] of Object.entries(parameters))
    url.searchParams.set(key, String(value));

  const response = await fetch(url, {
    headers: { "user-agent": "ResearchLibrary/0.1 company-intelligence" },
  });
  if (!response.ok)
    throw new Error(
      `Companies House advanced search failed with ${response.status}`,
    );
  const records = parseCsv(await response.text());
  return records.map((record) => ({
    companyName: record.company_name,
    companyNumber: record.company_number,
    companyStatus: record.company_status,
    companyType: record.company_type,
    incorporationDate: record.incorporation_date,
    sicCodes: [...record.nature_of_business.matchAll(/\d{5}/g)].map(
      (match) => match[0],
    ),
    registeredOfficeAddress: record.registered_office_address,
    raw: record,
  }));
}

export const csvInternals = { parseCsvLine, parseLeadingCsvFields, parseCsv };
