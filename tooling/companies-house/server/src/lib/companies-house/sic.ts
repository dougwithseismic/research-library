const CONDENSED_SIC_CSV =
  "https://assets.publishing.service.gov.uk/media/5a7f8639e5274a2e87db65e1/SIC07_CH_condensed_list_en.csv";

function parseCsvRow(row: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"') {
      if (quoted && row[index + 1] === '"') {
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

export function parseSicCsv(csv: string) {
  return new Map(
    csv
      .split(/\r?\n/)
      .slice(1)
      .filter(Boolean)
      .flatMap((row) => {
        const [code, description] = parseCsvRow(row);
        return code && description
          ? [[code.padStart(5, "0"), description] as const]
          : [];
      }),
  );
}

export async function fetchSicDescriptions() {
  const response = await fetch(CONDENSED_SIC_CSV, {
    headers: { "user-agent": "ResearchLibrary/0.1 company-intelligence" },
  });
  if (!response.ok)
    throw new Error(`Companies House SIC list failed with ${response.status}`);
  return parseSicCsv(await response.text());
}

export function describeSicCodes(
  codes: string[],
  descriptions: Map<string, string>,
) {
  return codes
    .map((code) => descriptions.get(code))
    .filter((description): description is string => Boolean(description));
}

export const sicInternals = { parseCsvRow };
