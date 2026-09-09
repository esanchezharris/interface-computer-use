import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { FixtureModel } from "../../scripts/fixture-model.js";
import { discover } from "../../src/discovery/run.js";
import { Artifact } from "../../src/domain/artifact.js";
import { Fault } from "../../src/domain/contract.js";
import { Event, Snapshot } from "../../src/evidence/store.js";
import { Runtime } from "../../src/session/browser.js";
import { workspace } from "../../src/surface/observe.js";
import { snapshot } from "../../src/surface/snapshot.js";

const marker = "SYNTHETIC_PRIVATE_SENTINEL_42";
const input = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3750,
};
const options = {
  input,
  evidenceRoot: ".runs/tests",
  actor: "test_operator",
  operator: true,
  headed: false,
} as const;
function persisted(directory: string): string {
  return readdirSync(directory)
    .map((file) => readFileSync(`${directory}/${file}`, "utf8"))
    .join("\n");
}
test("A16 sensitive field text URL and human changes never reach restricted persistence", async () => {
  // Given sentinels in live DOM/URL and human field changes; When capturing evidence; Then redact.
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({
    ...options,
    origin: app.origin,
    mode: "replay",
    provenance: "development-fixture",
    artifactHash: null,
  });
  try {
    await runtime.session.takeover();
    const frame = workspace(runtime.page);
    await frame.goto(`${app.origin}/search?private=${marker}`);
    await frame.getByLabel("Member ID", { exact: true }).fill(marker);
    await frame.getByLabel("Member ID", { exact: true }).blur();
    await frame.locator("body").evaluate((body, sentinel) => {
      const text = document.createElement("p");
      text.textContent = sentinel;
      body.append(text);
      const input = document.createElement("input");
      input.type = "password";
      input.value = sentinel;
      body.append(input);
    }, marker);
    runtime.evidence.snapshot(await snapshot(runtime.page));
    runtime.evidence.finish({
      status: "failed",
      runId: runtime.evidence.runId,
      code: "APP_ERROR",
      stepId: null,
      expected: { screen: "unknown", check: "runtime", redacted: true },
      observed: { screen: "unknown", check: "runtime", redacted: true },
      evidenceRefs: ["snapshot.safe.json"],
    });
    assert.equal(persisted(runtime.evidence.directory).includes(marker), false);
    assert.equal(
      Snapshot.safeParse(
        JSON.parse(readFileSync(`${runtime.evidence.directory}/snapshot.safe.json`, "utf8")),
      ).success,
      true,
    );
  } finally {
    await runtime.close();
    await app.close();
  }
});
test("A16 model explanations and exception messages cannot enter logs or artifacts", async () => {
  // Given private model prose and a raw provider-style error; When boundary handling runs; Then persist only codes.
  assert.equal(
    Event.safeParse({ kind: "exception", actor: "system", message: marker }).success,
    false,
  );
  const a = Artifact.parse(JSON.parse(readFileSync("artifacts/development-fixture.json", "utf8")));
  assert.equal(Artifact.safeParse({ ...a, description: marker }).success, false);
  const app = await startSandbox({ port: 0 });
  const model = new FixtureModel();
  model.decide = async () => {
    throw new Error(marker);
  };
  try {
    const run = await discover({ ...options, origin: app.origin, model, goal: "Prepare transfer" });
    assert.equal(run.result.status, "failed");
    assert.equal(run.artifact, null);
    assert.equal(persisted(run.evidenceDirectory).includes(marker), false);
    assert.equal(JSON.stringify(run.result).includes(marker), false);
  } finally {
    await app.close();
  }
});
test("A19 evidence serializer rejects unknown properties before writing", () => {
  // Given a raw error string; When validating its diagnostic event; Then it cannot be serialized.
  assert.throws(() =>
    Event.parse({ kind: "exception", actor: "system", code: new Fault("APP_ERROR"), raw: marker }),
  );
});
