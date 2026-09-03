import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, "docs");

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

if (!existsSync(join(OUTPUT, "index.html"))) {
  throw new Error("docs/index.html is missing; run pnpm build first");
}

const outputFiles = files(OUTPUT);
const htmlFiles = outputFiles.filter((file) => file.endsWith(".html"));
const broken = [];
const editorialLeaks = [
  ["Supabase implementation note", /\bsupabase\b/i],
  ["API incident log", /\bRESOURCE_EXHAUSTED\b/],
  [
    "local-publication note",
    /\b(?:generated update remains local|separate publication request)\b/i,
  ],
  [
    "system-mutation note",
    /\b(?:production[- ]system|database|account) mutation\b/i,
  ],
  ["repository credential note", /\b(?:repository|Leadmap)'s authenticated\b/i],
  ["private repository path", /\bprivate-data\//i],
  ["credential-cleanliness note", /\bThese files contain no OAuth tokens\b/i],
  [
    "campaign non-action note",
    /\bNo (?:paid )?campaign (?:was|has been|operation)\b/i,
  ],
  ["event non-action note", /\bNo event was (?:attended|purchased)\b/i],
];
const editorialLeakFiles = outputFiles.filter((file) =>
  /\.(?:csv|html|json|md|txt|xml)$/i.test(file),
);

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(target)) continue;
    const withoutHash = target.split("#")[0].split("?")[0];
    if (!withoutHash) continue;
    const destination = resolve(dirname(file), withoutHash);
    if (!existsSync(destination)) broken.push(`${file}: ${target}`);
  }
}

if (broken.length) {
  throw new Error(`Broken generated links:\n${broken.join("\n")}`);
}

for (const file of editorialLeakFiles) {
  const body = readFileSync(file, "utf8");
  for (const [label, pattern] of editorialLeaks) {
    if (pattern.test(body)) {
      throw new Error(`Internal editorial note leaked into ${file}: ${label}`);
    }
  }
}

const envPath = join(ROOT, ".env");
const secretValues = existsSync(envPath)
  ? readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
      .map((line) => line.slice(line.indexOf("=") + 1).trim())
      .filter((value) => value.length >= 8)
  : [];

for (const file of outputFiles) {
  const body = readFileSync(file);
  if (
    body.includes("GOOGLE_ADS_CLIENT_SECRET") ||
    body.includes("COMPANIES_HOUSE_API_KEY")
  ) {
    throw new Error(
      `Credential variable name leaked into generated site: ${file}`,
    );
  }
  for (const value of secretValues) {
    if (body.includes(value)) {
      throw new Error(
        `A configured credential value leaked into generated site: ${file}`,
      );
    }
  }
}

if (htmlFiles.length < 17) {
  throw new Error(`Expected at least 17 HTML pages; found ${htmlFiles.length}`);
}

console.log(
  `Site verification passed: ${htmlFiles.length} HTML pages; ${outputFiles.length} files; no broken local links, internal editorial notes or configured secrets`,
);
