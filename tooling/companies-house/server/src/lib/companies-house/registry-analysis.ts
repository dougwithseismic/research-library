import { CompanyOfficer } from "./officers";
import { RegistryIntelligence } from "./registry";

export type RegistrySignal = {
  kind: string;
  severity: "info" | "opportunity" | "watch" | "risk";
  message: string;
  evidence: Record<string, unknown>;
};

function stringField(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string" ? (value[key] as string) : null;
}

function daysBetween(left: string, right: string) {
  return Math.abs(Date.parse(left) - Date.parse(right)) / 86_400_000;
}

export function analyseRegistry(
  intelligence: RegistryIntelligence,
  officers: CompanyOfficer[],
  observedAt = new Date(),
) {
  const outstanding = intelligence.charges.filter(
    (charge) => charge.status === "outstanding",
  );
  const lenders = [
    ...new Set(
      outstanding.flatMap((charge) =>
        charge.personsEntitled
          .map((person) => stringField(person, "name"))
          .filter((name): name is string => Boolean(name)),
      ),
    ),
  ];
  const datedCharges = outstanding
    .filter((charge) => charge.createdOn)
    .sort((left, right) =>
      (right.createdOn ?? "").localeCompare(left.createdOn ?? ""),
    );
  const latestChargeCluster =
    datedCharges.length >= 2 &&
    daysBetween(
      datedCharges[0].createdOn!,
      datedCharges[Math.min(2, datedCharges.length - 1)].createdOn!,
    ) <= 14
      ? datedCharges.filter(
          (charge) =>
            daysBetween(datedCharges[0].createdOn!, charge.createdOn!) <= 14,
        )
      : [];
  const activeControllers = intelligence.controllers.filter(
    (controller) => !controller.ceasedOn,
  );
  const activeOfficers = officers.filter((officer) => !officer.resignedOn);
  const signals: RegistrySignal[] = [];

  if (intelligence.profile.accountsOverdue)
    signals.push({
      kind: "accounts_overdue",
      severity: "risk",
      message: "Accounts are overdue at Companies House.",
      evidence: { nextDue: intelligence.profile.accountsNextDue },
    });
  if (intelligence.profile.confirmationOverdue)
    signals.push({
      kind: "confirmation_overdue",
      severity: "watch",
      message: "The confirmation statement is overdue.",
      evidence: { nextDue: intelligence.profile.confirmationNextDue },
    });
  if (intelligence.insolvencyCases.length)
    signals.push({
      kind: "insolvency",
      severity: "risk",
      message: `${intelligence.insolvencyCases.length} insolvency case(s) are reported.`,
      evidence: {
        cases: intelligence.insolvencyCases.map((item) => ({
          type: item.type,
          status: item.status,
          caseNumber: item.caseNumber,
        })),
      },
    });
  if (outstanding.length)
    signals.push({
      kind: "secured_borrowing",
      severity: "info",
      message: `${outstanding.length} outstanding charge(s) are registered.`,
      evidence: {
        lenders,
        chargeIds: outstanding.map((charge) => charge.chargeId),
      },
    });
  if (latestChargeCluster.length >= 2) {
    const clusterAgeDays =
      (observedAt.getTime() - Date.parse(latestChargeCluster[0].createdOn!)) /
      86_400_000;
    const recent = clusterAgeDays >= 0 && clusterAgeDays <= 730;
    signals.push({
      kind: recent ? "financing_event" : "historical_financing_cluster",
      severity: recent ? "opportunity" : "info",
      message: `${latestChargeCluster.length} charges were created within 14 days${recent ? ", consistent with a recent financing or refinancing event" : "; this is a historical financing cluster"}.`,
      evidence: {
        inference: true,
        latestCreatedOn: latestChargeCluster[0].createdOn,
        ageDays: Math.round(clusterAgeDays),
        createdOn: latestChargeCluster.map((charge) => charge.createdOn),
        lenders,
      },
    });
  }

  const timeline = [
    ...intelligence.filings.map((filing) => ({
      date: filing.filedOn,
      kind: "filing",
      type: filing.type,
      description: filing.description,
      evidenceId: filing.transactionId,
    })),
    ...intelligence.charges.flatMap((charge) =>
      charge.createdOn
        ? [
            {
              date: charge.createdOn,
              kind: "charge",
              type: charge.status ?? "unknown",
              description:
                charge.personsEntitled
                  .map((person) => stringField(person, "name"))
                  .filter(Boolean)
                  .join(", ") || "Registered charge",
              evidenceId: charge.chargeId,
            },
          ]
        : [],
    ),
    ...officers.flatMap((officer) => [
      ...(officer.appointedOn
        ? [
            {
              date: officer.appointedOn,
              kind: "officer_appointed",
              type: officer.role,
              description: officer.name,
              evidenceId: officer.officerId,
            },
          ]
        : []),
      ...(officer.resignedOn
        ? [
            {
              date: officer.resignedOn,
              kind: "officer_resigned",
              type: officer.role,
              description: officer.name,
              evidenceId: officer.officerId,
            },
          ]
        : []),
    ]),
  ].sort((left, right) => right.date.localeCompare(left.date));

  return {
    observedAt: observedAt.toISOString(),
    status: stringField(intelligence.profile.raw, "company_status"),
    type: stringField(intelligence.profile.raw, "type"),
    ownership: activeControllers.map((controller) => ({
      name: controller.name,
      kind: controller.kind,
      naturesOfControl: controller.naturesOfControl,
      notifiedOn: controller.notifiedOn,
    })),
    officers: {
      total: officers.length,
      active: activeOfficers.length,
      activeDirectors: activeOfficers.filter(
        (officer) => officer.role === "director",
      ).length,
    },
    financing: {
      charges: intelligence.charges.length,
      outstandingCharges: outstanding.length,
      lenders,
      latestChargeCluster: latestChargeCluster.map((charge) => charge.chargeId),
    },
    compliance: {
      accountsOverdue: intelligence.profile.accountsOverdue,
      accountsNextDue: intelligence.profile.accountsNextDue,
      confirmationOverdue: intelligence.profile.confirmationOverdue,
      confirmationNextDue: intelligence.profile.confirmationNextDue,
    },
    insolvencyCases: intelligence.insolvencyCases.length,
    signals,
    timeline,
  };
}
