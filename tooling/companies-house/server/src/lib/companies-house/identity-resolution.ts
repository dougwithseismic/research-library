import { companiesHouseClient } from "./client";
import {
  CompanyOfficer,
  OfficerAppointment,
  normaliseAppointment,
} from "./officers";

type DateOfBirth = { month?: number; year?: number };
type SearchOfficer = {
  name?: string;
  title?: string;
  description?: string;
  date_of_birth?: DateOfBirth;
  address?: Record<string, unknown>;
  links?: { self?: string; appointments?: string };
};
type SearchResponse = { items?: SearchOfficer[]; total_results?: number };
type AppointmentItem = Parameters<typeof normaliseAppointment>[0];
type IdentityClient = {
  get(path: string): Promise<SearchResponse>;
  list(path: string): Promise<AppointmentItem[]>;
};

export type ResolvedOfficerIdentity = {
  searchedName: string;
  normalisedName: string;
  confidence: number;
  rationale: string[];
  birthMonth: number | null;
  birthYear: number | null;
  officerIds: string[];
  appointments: OfficerAppointment[];
  searchCandidates: number;
  exactNameCandidates: number;
};

export function normalisePersonName(name: string) {
  const parts = name.includes(",")
    ? (() => {
        const [surname, ...given] = name.split(",");
        return [...given.join(" ").split(/\s+/), ...surname.split(/\s+/)];
      })()
    : name.split(/\s+/);
  return parts
    .map((part) =>
      part
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/gi, "")
        .toUpperCase(),
    )
    .filter(Boolean)
    .join(" ");
}

function searchName(item: SearchOfficer) {
  return (item.name ?? item.title ?? "").replace(/<[^>]+>/g, "");
}

function publicBirth(item: SearchOfficer): DateOfBirth | undefined {
  if (item.date_of_birth?.month && item.date_of_birth.year)
    return item.date_of_birth;
  const match =
    /\bBorn\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i.exec(
      item.description ?? "",
    );
  if (!match) return undefined;
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return {
    month: months.indexOf(match[1].toLowerCase()) + 1,
    year: Number(match[2]),
  };
}

function appointmentsPath(item: SearchOfficer) {
  const candidate = item.links?.appointments ?? item.links?.self;
  if (!candidate) return null;
  const path = candidate.startsWith("http")
    ? new URL(candidate).pathname
    : candidate;
  if (/^\/officers\/[^/]+\/appointments$/.test(path)) return path;
  const match = /^\/officers\/([^/]+)$/.exec(path);
  return match ? `/officers/${match[1]}/appointments` : null;
}

function sameBirth(left?: DateOfBirth, right?: DateOfBirth) {
  return Boolean(
    left?.month &&
    left.year &&
    left.month === right?.month &&
    left.year === right?.year,
  );
}

export async function resolveOfficerIdentity(
  officer: CompanyOfficer,
  client: IdentityClient = companiesHouseClient(),
): Promise<ResolvedOfficerIdentity> {
  const query = normalisePersonName(officer.name)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const response = await client.get(
    `/search/officers?q=${encodeURIComponent(query)}&items_per_page=100`,
  );
  const items = response.items ?? [];
  const normalisedName = normalisePersonName(officer.name);
  const exact = items.filter(
    (item) =>
      normalisePersonName(searchName(item)) === normalisedName &&
      appointmentsPath(item),
  );
  const seed = exact.find(
    (item) => appointmentsPath(item) === officer.officerId,
  );
  let matches: SearchOfficer[];
  let confidence: number;
  const rationale = ["Exact normalized full-name match"];

  const seedBirth = seed ? publicBirth(seed) : undefined;
  if (seedBirth?.month && seedBirth.year) {
    matches = exact.filter((item) => sameBirth(publicBirth(item), seedBirth));
    confidence = 95;
    rationale.push(
      "Same public birth month and year",
      "Includes the officer ID attached to the source company",
    );
  } else if (exact.length === 1) {
    matches = exact;
    confidence = 70;
    rationale.push(
      "Only one exact-name search result; date of birth was unavailable",
    );
  } else {
    matches = seed ? [seed] : [];
    confidence = seed ? 60 : 0;
    rationale.push(
      seed
        ? "Ambiguous exact-name results; retained only the known officer ID"
        : "No unambiguous identity match",
    );
  }

  const paths = [
    ...new Set(matches.flatMap((item) => appointmentsPath(item) ?? [])),
  ];
  const appointmentGroups = await Promise.all(
    paths.map((path) => client.list(path)),
  );
  const appointments = [
    ...new Map(
      appointmentGroups
        .flat()
        .map(normaliseAppointment)
        .map((appointment) => [
          `${appointment.companyNumber}:${appointment.role}:${appointment.appointedOn ?? ""}:${appointment.resignedOn ?? ""}`,
          appointment,
        ]),
    ).values(),
  ];

  return {
    searchedName: officer.name,
    normalisedName,
    confidence,
    rationale,
    birthMonth: seedBirth?.month ?? null,
    birthYear: seedBirth?.year ?? null,
    officerIds: paths,
    appointments,
    searchCandidates: response.total_results ?? items.length,
    exactNameCandidates: exact.length,
  };
}

export const identityInternals = {
  appointmentsPath,
  publicBirth,
  sameBirth,
  searchName,
};
