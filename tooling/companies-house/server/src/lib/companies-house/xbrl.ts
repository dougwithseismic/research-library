import { createHash } from "node:crypto";
import Decimal from "decimal.js";
import { XMLParser } from "fast-xml-parser";

type XmlNode = Record<string, unknown>;

export type XbrlContext = {
  id: string;
  entityIdentifier: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  instant: string | null;
  dimensions: Record<string, string>;
};

export type XbrlFact = {
  id: string;
  concept: string;
  canonicalMetric: string | null;
  normalizationConfidence: number | null;
  scope: "company" | "group" | null;
  contextId: string;
  unit: string | null;
  value: string;
  rawValue: string;
  periodStart: string | null;
  periodEnd: string | null;
  instant: string | null;
  dimensions: Record<string, string>;
  decimals: string | null;
  scale: number | null;
};

export type ParsedAccountsDocument = {
  documentId: string;
  companyNumber: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  currency: string | null;
  metadata: Record<string, string>;
  facts: XbrlFact[];
  taxonomyNamespaces: string[];
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: false,
  allowBooleanAttributes: true,
  processEntities: true,
});

const canonicalConcepts: Record<string, string> = {
  turnover: "turnover",
  turnoverrevenue: "turnover",
  revenue: "turnover",
  revenuefromcontractswithcustomers: "turnover",
  costofsales: "cost_of_sales",
  grossprofit: "gross_profit",
  grossprofitloss: "gross_profit",
  administrativeexpenses: "administrative_expenses",
  operatingprofit: "operating_profit",
  operatingprofitloss: "operating_profit",
  profitlossbeforetax: "profit_before_tax",
  profitlossonordinaryactivitiesbeforetax: "profit_before_tax",
  taxation: "tax",
  taxonprofit: "tax",
  profitloss: "profit_after_tax",
  profitlossforthefinancialyear: "profit_after_tax",
  profitlossonordinaryactivitiesaftertax: "profit_after_tax",
  fixedassets: "fixed_assets",
  intangibleassets: "intangible_assets",
  tangibleassets: "tangible_assets",
  currentassets: "current_assets",
  stocks: "stocks",
  inventories: "stocks",
  debtors: "debtors",
  cashatbankandonhand: "cash",
  cashbankonhand: "cash",
  cashandcashequivalents: "cash",
  creditorsduewithinoneyear: "creditors_within_one_year",
  creditorsamountsfallingduewithinoneyear: "creditors_within_one_year",
  creditorsdueafteroneyear: "creditors_after_one_year",
  creditorsamountsfallingdueaftermorethanoneyear: "creditors_after_one_year",
  netcurrentassetsliabilities: "net_current_assets",
  totalassetslesscurrentliabilities: "total_assets_less_current_liabilities",
  provisionsforliabilities: "provisions",
  netassets: "net_assets",
  netassetsliabilities: "net_assets",
  equity: "equity",
  capitalandreserves: "equity",
  shareholdersfunds: "equity",
  averagenumberemployees: "employees",
  averagenumberemployeesduringperiod: "employees",
};

const metadataConcepts: Record<string, string> = {
  accountsstatusauditedorunaudited: "audit_status",
  accountstype: "accounts_type",
  accountstypefullorabbreviated: "accounts_type",
  descriptionprincipalactivities: "principal_activity",
  entitycurrentlegalorregisteredname: "company_name",
  entitydormant: "dormant",
  entitydormanttruefalse: "dormant",
  entitytradingstatus: "trading_status",
  ukcompanieshouseregisterednumber: "company_number",
};

function localName(name: string) {
  return name.split(":").at(-1)?.toLowerCase() ?? name.toLowerCase();
}

function conceptKey(name: string) {
  return localName(name).replace(/[^a-z0-9]/g, "");
}

export function canonicalMetric(concept: string) {
  return canonicalConcepts[conceptKey(concept)] ?? null;
}

function attribute(node: XmlNode, name: string) {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(node)) {
    if (
      key.startsWith("@_") &&
      key.slice(2).toLowerCase() === target &&
      typeof value === "string"
    )
      return value;
  }
  return null;
}

function text(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  if (!node || typeof node !== "object") return "";
  return Object.entries(node as XmlNode)
    .filter(([key]) => !key.startsWith("@_") && !key.startsWith("?"))
    .map(([, value]) => text(value))
    .join("");
}

function walk(node: unknown, visit: (name: string, value: XmlNode) => void) {
  if (Array.isArray(node)) {
    for (const value of node) walk(value, visit);
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [name, value] of Object.entries(node as XmlNode)) {
    if (name.startsWith("@_") || name === "#text" || name.startsWith("?"))
      continue;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child && typeof child === "object" && !Array.isArray(child))
        visit(name, child as XmlNode);
      walk(child, visit);
    }
  }
}

function childValue(node: XmlNode, wanted: string) {
  const find = (value: unknown): string | null => {
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = find(item);
        if (result !== null) return result;
      }
      return null;
    }
    if (!value || typeof value !== "object") return null;
    for (const [name, child] of Object.entries(value as XmlNode)) {
      if (localName(name) === wanted.toLowerCase())
        return text(child).trim() || null;
      const result = find(child);
      if (result !== null) return result;
    }
    return null;
  };
  return find(node);
}

function parseContexts(document: unknown) {
  const contexts = new Map<string, XbrlContext>();
  walk(document, (name, node) => {
    if (localName(name) !== "context") return;
    const id = attribute(node, "id");
    if (!id) return;
    const dimensions: Record<string, string> = {};
    walk(node, (childName, child) => {
      if (!["explicitmember", "typedmember"].includes(localName(childName)))
        return;
      const dimension = attribute(child, "dimension");
      if (dimension) dimensions[dimension] = text(child).trim();
    });
    contexts.set(id, {
      id,
      entityIdentifier: childValue(node, "identifier"),
      periodStart: childValue(node, "startdate"),
      periodEnd: childValue(node, "enddate"),
      instant: childValue(node, "instant"),
      dimensions,
    });
  });
  return contexts;
}

function parseUnits(document: unknown) {
  const units = new Map<string, string>();
  walk(document, (name, node) => {
    if (localName(name) !== "unit") return;
    const id = attribute(node, "id");
    const measure = childValue(node, "measure");
    if (id && measure) units.set(id, measure);
  });
  return units;
}

function factScope(
  dimensions: Record<string, string>,
): "company" | "group" | null {
  for (const [dimension, member] of Object.entries(dimensions)) {
    const dimensionKey = conceptKey(dimension);
    if (
      !dimensionKey.includes("consolidation") &&
      !dimensionKey.includes("groupcompany")
    )
      continue;
    const memberKey = conceptKey(member);
    if (memberKey.includes("group") || memberKey.includes("consolidated"))
      return "group";
    if (memberKey.includes("company") || memberKey.includes("entity"))
      return "company";
  }
  return null;
}

export function parseNumericValue(rawValue: string, attributes: XmlNode) {
  if (attribute(attributes, "nil") === "true") return null;
  const format = attribute(attributes, "format")?.toLowerCase() ?? "";
  const raw = rawValue.replace(/\u00a0/g, " ").trim();
  if (
    (format.includes("numdash") || format.includes("zerodash")) &&
    /^[-–—]$/.test(raw)
  )
    return "0";

  let cleaned = raw.replace(/[£$€\s]/g, "");
  if (
    format.includes("commadecimal") ||
    format.includes("dotcomma") ||
    format.includes("spacecomma")
  ) {
    cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
  } else {
    cleaned = cleaned.replace(/,/g, "");
  }
  const parenthesised = /^\(.+\)$/.test(cleaned);
  cleaned = cleaned.replace(/[()]/g, "");
  if (!cleaned || /^[-–—]$/.test(cleaned)) return null;
  try {
    let value = new Decimal(cleaned);
    const scale = Number(attribute(attributes, "scale") ?? 0);
    if (Number.isFinite(scale) && scale !== 0)
      value = value.mul(new Decimal(10).pow(scale));
    if (parenthesised || attribute(attributes, "sign") === "-")
      value = value.abs().negated();
    return value.toFixed();
  } catch {
    return null;
  }
}

export function numericFactValue(fact: XbrlFact) {
  const parsed = Number(fact.value);
  if (
    fact.canonicalMetric === "employees" &&
    fact.scale !== null &&
    fact.scale < 0 &&
    parsed > 0 &&
    parsed < 1
  ) {
    const displayed = Number(fact.rawValue.replace(/[,\s]/g, ""));
    if (Number.isInteger(displayed) && displayed >= 1) return displayed;
  }
  return parsed;
}

function mostFrequent(values: Array<string | null>) {
  const counts = new Map<string, number>();
  for (const value of values)
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return (
    [...counts.entries()].sort(
      (left, right) => right[1] - left[1] || right[0].localeCompare(left[0]),
    )[0]?.[0] ?? null
  );
}

export function parseAccountsDocument(source: string): ParsedAccountsDocument {
  const document = parser.parse(source) as unknown;
  const documentId = createHash("sha256").update(source).digest("hex");
  const contexts = parseContexts(document);
  const units = parseUnits(document);
  const facts: XbrlFact[] = [];
  const metadata: Record<string, string> = {};
  const namespaces = new Set<string>();
  let factIndex = 0;

  for (const context of contexts.values()) {
    for (const [dimension, member] of Object.entries(context.dimensions)) {
      const key = conceptKey(dimension);
      const value = member.split(":").at(-1) ?? member;
      if (key === "accountingstandardsdimension")
        metadata.accounting_standard ??= value;
      if (key === "accountsstatusdimension") metadata.audit_status ??= value;
      if (key === "applicablelegislationdimension")
        metadata.legislation ??= value;
      if (key === "accountstypedimension") metadata.accounts_type ??= value;
    }
  }

  walk(document, (elementName, node) => {
    for (const [key, value] of Object.entries(node)) {
      if (key.toLowerCase().startsWith("@_xmlns") && typeof value === "string")
        namespaces.add(value);
    }
    const elementLocalName = localName(elementName);
    const inline = elementLocalName === "nonfraction";
    if (elementLocalName === "nonnumeric") {
      const concept = attribute(node, "name");
      const metadataName = concept
        ? metadataConcepts[conceptKey(concept)]
        : null;
      const value = text(node).trim();
      if (metadataName && value && metadata[metadataName] === undefined)
        metadata[metadataName] = value.slice(0, 2_000);
      return;
    }
    const contextId = attribute(node, "contextref");
    if (!contextId) return;
    const concept = inline ? attribute(node, "name") : elementName;
    if (!concept) return;
    const rawValue = text(node).trim();
    const value = parseNumericValue(rawValue, node);
    if (value === null) return;
    const context = contexts.get(contextId);
    const unitRef = attribute(node, "unitref");
    const scaleText = attribute(node, "scale");
    const scale = scaleText === null ? null : Number(scaleText);
    const id = createHash("sha256")
      .update(
        `${documentId}:${concept}:${contextId}:${unitRef ?? ""}:${factIndex}:${rawValue}`,
      )
      .digest("hex");
    factIndex += 1;
    const normalized = canonicalMetric(concept);
    facts.push({
      id,
      concept,
      canonicalMetric: normalized,
      normalizationConfidence: normalized ? 100 : null,
      scope: factScope(context?.dimensions ?? {}),
      contextId,
      unit: unitRef ? (units.get(unitRef) ?? unitRef) : null,
      value,
      rawValue,
      periodStart: context?.periodStart ?? null,
      periodEnd: context?.periodEnd ?? null,
      instant: context?.instant ?? null,
      dimensions: context?.dimensions ?? {},
      decimals: attribute(node, "decimals"),
      scale: scale !== null && Number.isFinite(scale) ? scale : null,
    });
  });

  const companyNumber = mostFrequent(
    [...contexts.values()].map(
      (context) => context.entityIdentifier?.replace(/\s/g, "") ?? null,
    ),
  );
  const periodEnd = mostFrequent(
    facts.map((fact) => fact.periodEnd ?? fact.instant),
  );
  const periodStart = mostFrequent(
    facts
      .filter((fact) => fact.periodEnd === periodEnd)
      .map((fact) => fact.periodStart),
  );
  const currencyMeasure = mostFrequent(
    facts
      .map((fact) => fact.unit)
      .filter((unit) => unit?.toLowerCase().includes("iso4217")),
  );

  return {
    documentId,
    companyNumber,
    periodStart,
    periodEnd,
    currency: currencyMeasure?.split(":").at(-1) ?? null,
    metadata,
    facts,
    taxonomyNamespaces: [...namespaces].sort(),
  };
}

export const xbrlInternals = {
  attribute,
  childValue,
  conceptKey,
  localName,
  mostFrequent,
  text,
};
