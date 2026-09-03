import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ENV_PATH = join(ROOT, ".env");

const candidateFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: ROOT },
)
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

const configuredSecrets = existsSync(ENV_PATH)
  ? readFileSync(ENV_PATH, "utf8")
      .split(/\r?\n/)
      .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
      .map((line) => {
        const separator = line.indexOf("=");
        return {
          key: line.slice(0, separator),
          value: line.slice(separator + 1).trim(),
        };
      })
      .filter(({ key }) =>
        /(?:API_KEY|CLIENT_SECRET|DEVELOPER_TOKEN|REFRESH_TOKEN|PASSWORD|PRIVATE_KEY|SECRET)$/i.test(
          key,
        ),
      )
      .map(({ value }) => value)
      .map((value) => value.replace(/^(['"])(.*)\1$/, "$2"))
      .filter((value) => value.length >= 8)
  : [];

const credentialPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[opsu]_[A-Za-z0-9_]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  /\bsk-(?:live|test|proj)-[A-Za-z0-9_-]{16,}\b/,
  /\brk_(?:live|test)_[A-Za-z0-9]{16,}\b/,
];

const leaks = [];

for (const filename of candidateFiles) {
  const path = join(ROOT, filename);
  const body = readFileSync(path);
  if (body.includes(0)) continue;

  const text = body.toString("utf8");
  const hasConfiguredSecret = configuredSecrets.some((secret) =>
    text.includes(secret),
  );
  const hasCredentialPattern = credentialPatterns.some((pattern) =>
    pattern.test(text),
  );

  if (hasConfiguredSecret || hasCredentialPattern) {
    leaks.push(relative(ROOT, path));
  }
}

if (leaks.length) {
  throw new Error(
    `Potential credential material found in publishable files:\n${leaks.join("\n")}`,
  );
}

console.log(
  `Secret verification passed: ${candidateFiles.length} publishable files checked; no configured credential values or private-key patterns found`,
);
