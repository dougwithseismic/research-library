import { CompaniesHouseClient, companiesHouseClient } from "./client";

type OfficerItem = {
  name: string;
  officer_role: string;
  appointed_on?: string;
  resigned_on?: string;
  occupation?: string;
  nationality?: string;
  country_of_residence?: string;
  links?: { officer?: { appointments?: string } };
};

type AppointmentItem = {
  name: string;
  officer_role: string;
  appointed_on?: string;
  resigned_on?: string;
  appointed_to: {
    company_name: string;
    company_number: string;
    company_status?: string;
  };
};

type OfficerClient = Pick<CompaniesHouseClient, "list">;

export type CompanyOfficer = {
  officerId: string;
  name: string;
  role: string;
  appointedOn: string | null;
  resignedOn: string | null;
  occupation: string | null;
  nationality: string | null;
  countryOfResidence: string | null;
};

export type OfficerAppointment = {
  companyName: string;
  companyNumber: string;
  companyStatus: string | null;
  officerName: string;
  role: string;
  appointedOn: string | null;
  resignedOn: string | null;
};

export function normaliseOfficer(item: OfficerItem): CompanyOfficer {
  const appointmentPath = item.links?.officer?.appointments;
  return {
    officerId:
      appointmentPath ??
      `${item.name}:${item.officer_role}:${item.appointed_on ?? "unknown"}`,
    name: item.name,
    role: item.officer_role,
    appointedOn: item.appointed_on ?? null,
    resignedOn: item.resigned_on ?? null,
    occupation: item.occupation ?? null,
    nationality: item.nationality ?? null,
    countryOfResidence: item.country_of_residence ?? null,
  };
}

export function normaliseAppointment(
  item: AppointmentItem,
): OfficerAppointment {
  return {
    companyName: item.appointed_to.company_name,
    companyNumber: item.appointed_to.company_number,
    companyStatus: item.appointed_to.company_status ?? null,
    officerName: item.name,
    role: item.officer_role,
    appointedOn: item.appointed_on ?? null,
    resignedOn: item.resigned_on ?? null,
  };
}

export async function fetchCompanyOfficers(
  companyNumber: string,
  apiKey = process.env.COMPANIES_HOUSE_API_KEY,
) {
  if (!apiKey)
    throw new Error(
      "COMPANIES_HOUSE_API_KEY is required for officer enrichment",
    );
  const client =
    apiKey === process.env.COMPANIES_HOUSE_API_KEY
      ? companiesHouseClient()
      : new CompaniesHouseClient(apiKey);
  const items = await client.list<OfficerItem>(
    `/company/${encodeURIComponent(companyNumber)}/officers`,
  );
  return items.map(normaliseOfficer);
}

export async function fetchCompanyOfficersWithClient(
  companyNumber: string,
  client: OfficerClient,
) {
  const items = await client.list<OfficerItem>(
    `/company/${encodeURIComponent(companyNumber)}/officers`,
  );
  return items.map(normaliseOfficer);
}

export async function fetchOfficerAppointments(
  appointmentsPath: string,
  apiKey = process.env.COMPANIES_HOUSE_API_KEY,
) {
  if (!apiKey)
    throw new Error(
      "COMPANIES_HOUSE_API_KEY is required for appointment enrichment",
    );
  if (
    !appointmentsPath.startsWith("/officers/") ||
    !appointmentsPath.endsWith("/appointments")
  ) {
    throw new Error("Invalid Companies House officer appointments path");
  }
  const client =
    apiKey === process.env.COMPANIES_HOUSE_API_KEY
      ? companiesHouseClient()
      : new CompaniesHouseClient(apiKey);
  const items = await client.list<AppointmentItem>(appointmentsPath);
  return {
    totalAppointments: items.length,
    appointments: items.map(normaliseAppointment),
  };
}
