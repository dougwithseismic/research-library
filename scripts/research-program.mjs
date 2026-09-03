import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PROGRAM_PATH = join(ROOT, "research-program", "program.json");
const ALLOWED_STATUSES = new Set([
  "queued",
  "in-progress",
  "blocked-external",
  "complete",
  "parked",
]);
const REQUIRED_ARTIFACTS = [
  "research-state.json",
  "evidence/manifest.json",
  "evidence/sources.csv",
  "evidence/evidence-ledger.csv",
  "evidence/ai-disruption-ledger.csv",
  "evidence/ai-disruption-scorecard.csv",
];
const REQUIRED_DIMENSIONS = [
  "substitution-risk",
  "discovery-disruption",
  "agent-bypass-risk",
  "operating-leverage",
  "proprietary-data-potential",
  "physical-world-moat",
  "trust-liability-moat",
  "relationship-moat",
  "platform-dependency",
  "defensibility-2028",
];
const CSV_HEADERS = new Map([
  [
    "evidence/sources.csv",
    "sourceId,sourceName,sourceType,sourceUrl,publisher,publishedOrUpdatedAt,observedAt,sourceStatus,supportedClaims,limitations",
  ],
  [
    "evidence/evidence-ledger.csv",
    "claimId,subjectType,subjectName,field,value,unit,evidenceClass,sourceType,sourceName,sourceUrl,observedAt,geography,method,limitations",
  ],
  [
    "evidence/ai-disruption-ledger.csv",
    "impactId,workstreamId,actor,valueChainStep,aiDimension,mechanism,timeHorizon,impactDirection,claim,evidenceClass,supportingClaimIds,countervailingForce,leadingIndicator,commercialImplication,confidence,limitations",
  ],
  [
    "evidence/ai-disruption-scorecard.csv",
    "dimension,score,weight,weightedScore,confidence,supportingImpactIds,unknowns,interpretation",
  ],
]);

function readProgram() {
  if (!existsSync(PROGRAM_PATH)) {
    throw new Error(`Research programme is missing: ${PROGRAM_PATH}`);
  }
  return JSON.parse(readFileSync(PROGRAM_PATH, "utf8"));
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validate(program) {
  const errors = [];

  if (program.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!nonEmptyString(program.thesis)) errors.push("thesis is required");
  if (!nonEmptyString(program.decision)) errors.push("decision is required");
  if (!Array.isArray(program.aiDimensions)) {
    errors.push("aiDimensions must be an array");
  }
  if (!Array.isArray(program.gates) || program.gates.length === 0) {
    errors.push("gates must be a non-empty array");
  }
  if (!Array.isArray(program.workstreams) || program.workstreams.length === 0) {
    errors.push("workstreams must be a non-empty array");
  }

  const dimensionIds = new Set(
    (program.aiDimensions ?? []).map((dimension) => dimension.id),
  );
  for (const dimension of REQUIRED_DIMENSIONS) {
    if (!dimensionIds.has(dimension)) {
      errors.push(`Missing AI dimension: ${dimension}`);
    }
  }

  const gateIds = new Set();
  for (const gate of program.gates ?? []) {
    if (!nonEmptyString(gate.id)) errors.push("Every gate requires an id");
    if (!nonEmptyString(gate.exitCriterion)) {
      errors.push(`Gate ${gate.id ?? "<unknown>"} requires an exitCriterion`);
    }
    if (gateIds.has(gate.id)) errors.push(`Duplicate gate id: ${gate.id}`);
    gateIds.add(gate.id);
  }

  const workstreamIds = new Set();
  const priorities = new Set();
  for (const workstream of program.workstreams ?? []) {
    const label = workstream.id ?? "<unknown>";
    if (!nonEmptyString(workstream.id)) {
      errors.push("Every workstream requires an id");
    } else if (workstreamIds.has(workstream.id)) {
      errors.push(`Duplicate workstream id: ${workstream.id}`);
    }
    workstreamIds.add(workstream.id);

    if (!Number.isInteger(workstream.priority) || workstream.priority < 1) {
      errors.push(`Workstream ${label} requires a positive integer priority`);
    } else if (priorities.has(workstream.priority)) {
      errors.push(`Duplicate workstream priority: ${workstream.priority}`);
    }
    priorities.add(workstream.priority);

    for (const field of [
      "type",
      "title",
      "workingSubtitle",
      "slug",
      "status",
      "decision",
      "stopCondition",
    ]) {
      if (!nonEmptyString(workstream[field])) {
        errors.push(`Workstream ${label} requires ${field}`);
      }
    }
    if (!ALLOWED_STATUSES.has(workstream.status)) {
      errors.push(
        `Workstream ${label} has invalid status: ${workstream.status}`,
      );
    }
    if (
      workstream.status === "blocked-external" &&
      !nonEmptyString(workstream.blockedReason)
    ) {
      errors.push(`Blocked workstream ${label} requires blockedReason`);
    }

    for (const field of [
      "inputs",
      "aiFocus",
      "autonomousScope",
      "humanSeams",
      "requiredArtifacts",
    ]) {
      if (!Array.isArray(workstream[field]) || workstream[field].length === 0) {
        errors.push(`Workstream ${label} requires a non-empty ${field} array`);
      }
    }
    for (const dimension of workstream.aiFocus ?? []) {
      if (!dimensionIds.has(dimension)) {
        errors.push(
          `Workstream ${label} references unknown AI dimension: ${dimension}`,
        );
      }
    }
    for (const artifact of REQUIRED_ARTIFACTS) {
      if (!(workstream.requiredArtifacts ?? []).includes(artifact)) {
        errors.push(
          `Workstream ${label} is missing required artifact: ${artifact}`,
        );
      }
    }
  }

  for (const workstream of program.workstreams ?? []) {
    const directory = join(ROOT, "publications", workstream.slug);
    if (!existsSync(directory)) continue;

    for (const artifact of REQUIRED_ARTIFACTS) {
      if (!existsSync(join(directory, artifact))) {
        errors.push(
          `Initialised workstream ${workstream.id} is missing ${artifact}`,
        );
      }
    }

    const statePath = join(directory, "research-state.json");
    if (existsSync(statePath)) {
      try {
        const state = JSON.parse(readFileSync(statePath, "utf8"));
        if (state.workstreamId !== workstream.id) {
          errors.push(
            `Research state for ${workstream.id} has mismatched workstreamId: ${state.workstreamId}`,
          );
        }
        if (!gateIds.has(state.activeGate)) {
          errors.push(
            `Research state for ${workstream.id} has unknown activeGate: ${state.activeGate}`,
          );
        }
        for (const gate of state.completedGates ?? []) {
          if (!gateIds.has(gate)) {
            errors.push(
              `Research state for ${workstream.id} has unknown completed gate: ${gate}`,
            );
          }
        }
      } catch (error) {
        errors.push(
          `Research state for ${workstream.id} is invalid JSON: ${error.message}`,
        );
      }
    }

    const manifestPath = join(directory, "evidence", "manifest.json");
    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        if (manifest.workstreamId !== workstream.id) {
          errors.push(
            `Manifest for ${workstream.id} has mismatched workstreamId: ${manifest.workstreamId}`,
          );
        }
      } catch (error) {
        errors.push(
          `Manifest for ${workstream.id} is invalid JSON: ${error.message}`,
        );
      }
    }

    for (const [artifact, expectedHeader] of CSV_HEADERS) {
      const path = join(directory, artifact);
      if (!existsSync(path)) continue;
      const [actualHeader] = readFileSync(path, "utf8").split(/\r?\n/);
      if (actualHeader !== expectedHeader) {
        errors.push(
          `Initialised workstream ${workstream.id} has an invalid ${artifact} header`,
        );
      }
    }

    if (
      workstream.status !== "complete" &&
      existsSync(join(directory, "publication.json"))
    ) {
      errors.push(
        `Incomplete workstream ${workstream.id} must not contain publication.json`,
      );
    }
  }

  for (const workstream of program.workstreams ?? []) {
    for (const dependency of workstream.dependsOn ?? []) {
      if (!workstreamIds.has(dependency)) {
        errors.push(
          `Workstream ${workstream.id} depends on unknown workstream: ${dependency}`,
        );
      }
      if (dependency === workstream.id) {
        errors.push(`Workstream ${workstream.id} cannot depend on itself`);
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Research programme validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  return {
    workstreams: program.workstreams.length,
    gates: program.gates.length,
    dimensions: program.aiDimensions.length,
  };
}

function nextWorkstream(program) {
  const complete = new Set(
    program.workstreams
      .filter((workstream) => workstream.status === "complete")
      .map((workstream) => workstream.id),
  );

  return [...program.workstreams]
    .sort((a, b) => a.priority - b.priority)
    .find((workstream) => {
      if (!["queued", "in-progress"].includes(workstream.status)) return false;
      return (workstream.dependsOn ?? []).every((dependency) =>
        complete.has(dependency),
      );
    });
}

function initialFiles(program, workstream) {
  const firstGate = program.gates[0].id;
  const today = new Date().toISOString().slice(0, 10);
  const state = {
    workstreamId: workstream.id,
    status: "framing",
    activeGate: firstGate,
    completedGates: [],
    humanSeams: workstream.humanSeams,
    updatedAt: today,
  };
  const manifest = {
    workstreamId: workstream.id,
    title: workstream.title,
    observedAt: today,
    decision: workstream.decision,
    geography: program.defaults.primaryGeography,
    timeHorizons: program.defaults.timeHorizons,
    aiDimensions: workstream.aiFocus,
    methods: [],
    includedArtifacts: workstream.requiredArtifacts
      .filter((artifact) => artifact !== "research-state.json")
      .map((artifact) => artifact.replace(/^evidence\//, "")),
    exclusions: [],
    limitations: [
      "Research is incomplete until every applicable programme gate is satisfied.",
      "Human evidence seams are not represented as completed interviews, tests, contracts, or professional advice.",
    ],
  };
  const brief = `# ${workstream.title}\n\n**Working subtitle:** ${workstream.workingSubtitle}\n\n**Status:** Internal working paper — framing\n\n## Decision\n\n${workstream.decision}\n\n## Why this follows the existing library\n\n${workstream.inputs.map((input) => `- \`${input}\``).join("\n")}\n\n## AI-disruption focus\n\n${workstream.aiFocus.map((dimension) => `- \`${dimension}\``).join("\n")}\n\n## Autonomous research scope\n\n${workstream.autonomousScope.map((item) => `- ${item}`).join("\n")}\n\n## Human evidence seams\n\n${workstream.humanSeams.map((item) => `- ${item}`).join("\n")}\n\n## Stop condition\n\n${workstream.stopCondition}\n`;

  return new Map([
    ["research-state.json", `${JSON.stringify(state, null, 2)}\n`],
    ["series/README.md", brief],
    ["evidence/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
    ["evidence/sources.csv", `${CSV_HEADERS.get("evidence/sources.csv")}\n`],
    [
      "evidence/evidence-ledger.csv",
      `${CSV_HEADERS.get("evidence/evidence-ledger.csv")}\n`,
    ],
    [
      "evidence/ai-disruption-ledger.csv",
      `${CSV_HEADERS.get("evidence/ai-disruption-ledger.csv")}\n`,
    ],
    [
      "evidence/ai-disruption-scorecard.csv",
      `${CSV_HEADERS.get("evidence/ai-disruption-scorecard.csv")}\n`,
    ],
  ]);
}

function initialise(program, workstream, dryRun) {
  const directory = join(ROOT, "publications", workstream.slug);
  if (existsSync(directory) && !dryRun) {
    throw new Error(`Working directory already exists: ${directory}`);
  }

  const files = initialFiles(program, workstream);
  if (dryRun) {
    console.log(`Would create unpublished working paper for ${workstream.id}:`);
    for (const path of files.keys())
      console.log(`- publications/${workstream.slug}/${path}`);
    return;
  }

  for (const [path, body] of files) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, body, { flag: "wx" });
  }
  console.log(
    `Initialised unpublished working paper: publications/${workstream.slug}`,
  );
}

function usage() {
  console.log(`Usage:
  pnpm research:program check
  pnpm research:program next [--json]
  pnpm research:program init <workstream-id> [--dry-run]`);
}

const [, , command = "check", ...args] = process.argv;
const program = readProgram();
const result = validate(program);

if (command === "check") {
  console.log(
    `Research programme valid: ${result.workstreams} workstreams; ${result.gates} gates; ${result.dimensions} AI dimensions`,
  );
} else if (command === "next") {
  const workstream = nextWorkstream(program);
  if (!workstream) {
    console.log("No eligible queued or in-progress workstream.");
  } else if (args.includes("--json")) {
    console.log(JSON.stringify(workstream, null, 2));
  } else {
    console.log(`${workstream.id}\t${workstream.title}\t${workstream.status}`);
  }
} else if (command === "init") {
  const id = args.find((argument) => !argument.startsWith("--"));
  if (!id) {
    usage();
    process.exitCode = 1;
  } else {
    const workstream = program.workstreams.find(
      (candidate) => candidate.id === id,
    );
    if (!workstream) throw new Error(`Unknown workstream: ${id}`);
    initialise(program, workstream, args.includes("--dry-run"));
  }
} else {
  usage();
  process.exitCode = 1;
}
