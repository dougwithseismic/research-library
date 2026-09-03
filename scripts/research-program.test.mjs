import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPT = join(ROOT, "scripts", "research-program.mjs");
const PROGRAM = JSON.parse(
  readFileSync(join(ROOT, "research-program", "program.json"), "utf8"),
);

function run(...args) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

test("validates the research programme and initialized workstreams", () => {
  assert.match(run("check"), /Research programme valid: \d+ workstreams/);
});

test("selects the highest-priority eligible workstream", () => {
  const complete = new Set(
    PROGRAM.workstreams
      .filter((workstream) => workstream.status === "complete")
      .map((workstream) => workstream.id),
  );
  const expected = [...PROGRAM.workstreams]
    .sort((a, b) => a.priority - b.priority)
    .find(
      (workstream) =>
        ["queued", "in-progress"].includes(workstream.status) &&
        (workstream.dependsOn ?? []).every((dependency) =>
          complete.has(dependency),
        ),
    );
  const actual = JSON.parse(run("next", "--json"));

  assert.equal(actual.id, expected.id);
});

test("dry-run initialization reports files without creating a publication", () => {
  const candidate = PROGRAM.workstreams.find(
    (workstream) =>
      !existsSync(join(ROOT, "publications", workstream.slug)) &&
      workstream.status !== "complete",
  );
  assert.ok(candidate, "expected an uninitialized workstream in the programme");

  const directory = join(ROOT, "publications", candidate.slug);
  const output = run("init", candidate.id, "--dry-run");

  assert.match(output, /Would create unpublished working paper/);
  assert.match(output, /research-state\.json/);
  assert.equal(existsSync(directory), false);
});

test("rejects an unknown workstream", () => {
  const result = spawnSync(
    process.execPath,
    [SCRIPT, "init", "not-a-real-workstream", "--dry-run"],
    { cwd: ROOT, encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown workstream/);
});
