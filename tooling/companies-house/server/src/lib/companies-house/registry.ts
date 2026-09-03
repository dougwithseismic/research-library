import { createHash } from "node:crypto";
import { CompaniesHouseClient, companiesHouseClient } from "./client";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function string(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function objects(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is JsonObject => Boolean(object(item)))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function stableId(prefix: string, item: JsonObject) {
  const links = object(item.links);
  const self = string(links?.self);
  const pathId = self?.split("/").filter(Boolean).at(-1);
  if (pathId) return pathId;
  return `${prefix}-${createHash("sha256").update(JSON.stringify(item)).digest("hex").slice(0, 28)}`;
}

export type RegistryIntelligence = Awaited<
  ReturnType<typeof fetchRegistryIntelligence>
>;
type RegistryClient = Pick<CompaniesHouseClient, "get" | "list">;

export async function fetchRegistryIntelligence(
  companyNumber: string,
  client: RegistryClient = companiesHouseClient(),
) {
  const encoded = encodeURIComponent(companyNumber);
  const [profileRaw, controllersRaw, chargesRaw, filingsRaw, insolvency] =
    await Promise.all([
      client.get<JsonObject>(`/company/${encoded}`),
      client.list<JsonObject>(
        `/company/${encoded}/persons-with-significant-control?register_view=false`,
      ),
      client.list<JsonObject>(`/company/${encoded}/charges`),
      client.list<JsonObject>(`/company/${encoded}/filing-history`),
      client.get<JsonObject | null>(`/company/${encoded}/insolvency`, {
        notFound: null,
      }),
    ]);

  const accounts = object(profileRaw.accounts);
  const lastAccounts = object(accounts?.last_accounts);
  const nextAccounts = object(accounts?.next_accounts);
  const confirmation = object(profileRaw.confirmation_statement);
  const profile = {
    companyNumber,
    accountsLastPeriodEnd:
      string(lastAccounts?.period_end_on) ?? string(lastAccounts?.made_up_to),
    accountsNextDue: string(nextAccounts?.due_on) ?? string(accounts?.next_due),
    accountsOverdue:
      typeof nextAccounts?.overdue === "boolean"
        ? nextAccounts.overdue
        : typeof accounts?.overdue === "boolean"
          ? accounts.overdue
          : null,
    confirmationLastMadeUpTo: string(confirmation?.last_made_up_to),
    confirmationNextDue: string(confirmation?.next_due),
    confirmationOverdue:
      typeof confirmation?.overdue === "boolean" ? confirmation.overdue : null,
    raw: profileRaw,
  };

  const controllers = controllersRaw.map((item) => ({
    companyNumber,
    notificationId: stableId("psc", item),
    kind: string(item.kind) ?? "unknown",
    name: string(item.name),
    notifiedOn: string(item.notified_on),
    ceasedOn: string(item.ceased_on),
    nationality: string(item.nationality),
    countryOfResidence: string(item.country_of_residence),
    naturesOfControl: strings(item.natures_of_control),
    serviceAddress: object(item.address),
    identification: object(item.identification),
    identityVerification: object(item.identity_verification_details),
    raw: item,
  }));

  const charges = chargesRaw.map((item) => ({
    companyNumber,
    chargeId: string(item.id) ?? stableId("charge", item),
    chargeCode: string(item.charge_code),
    status: string(item.status),
    createdOn: string(item.created_on),
    deliveredOn: string(item.delivered_on),
    satisfiedOn: string(item.satisfied_on),
    personsEntitled: objects(item.persons_entitled),
    particulars: objects(item.particulars),
    securedDetails: objects(item.secured_details),
    raw: item,
  }));

  const filings = filingsRaw.flatMap((item) => {
    const filedOn = string(item.date);
    if (!filedOn) return [];
    return [
      {
        companyNumber,
        transactionId: string(item.transaction_id) ?? stableId("filing", item),
        category: string(item.category),
        type: string(item.type) ?? "unknown",
        description: string(item.description) ?? "unknown",
        filedOn,
        actionDate: string(item.action_date),
        documentMetadataUrl: string(object(item.links)?.document_metadata),
        raw: item,
      },
    ];
  });

  const cases = objects(insolvency?.cases).map((item, index) => ({
    id: `${companyNumber}:${string(item.number) ?? index}:${string(item.type) ?? "unknown"}`,
    companyNumber,
    caseNumber: string(item.number),
    type: string(item.type) ?? "unknown",
    status: string(insolvency?.status),
    dates: objects(item.dates),
    practitioners: objects(item.practitioners),
    raw: item,
  }));

  return { profile, controllers, charges, filings, insolvencyCases: cases };
}

export const registryInternals = { object, objects, stableId, string, strings };
