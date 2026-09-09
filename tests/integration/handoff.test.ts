import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { startSandbox } from "../../sandbox/server.js";
import { testOperator } from "../../scripts/test-operator.js";
import { Artifact } from "../../src/domain/artifact.js";
import { Fault } from "../../src/domain/contract.js";
import { replay } from "../../src/replay/run.js";
import { Runtime } from "../../src/session/browser.js";
import { matches } from "../../src/surface/checks.js";
import { execute } from "../../src/surface/executor.js";
import { workspace } from "../../src/surface/observe.js";
import { artifactPath } from "../artifact-path.js";

const input = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3750,
};
const common = {
  input,
  evidenceRoot: ".runs/tests",
  actor: "test_operator",
  operator: true,
  headed: false,
  waitMs: 600,
  interventionMs: 3000,
} as const;
test("A13 same-session expiry handoff and test-operator resumption", async () => {
  // Given expiry mid-replay; When test_operator reauthenticates on the existing page; Then resume.
  const app = await startSandbox({ port: 0, fault: "expired" });
  let operator = Promise.resolve();
  try {
    const run = await replay({
      ...common,
      origin: app.origin,
      artifactBytes: readFileSync(artifactPath, "utf8"),
      onRuntime: (runtime) => {
        operator = testOperator(runtime);
      },
    });
    await operator;
    assert.equal(run.result.status, "success");
    assert.equal(app.stats.commits, 0);
    const events = readFileSync(`${run.evidenceDirectory}/events.jsonl`, "utf8");
    for (const kind of [
      "HUMAN",
      "RESUMING",
      "field-change",
      "activation",
      "navigation",
      "test_operator",
    ])
      assert.ok(events.includes(kind));
    assert.equal(events.includes("demo-only"), false);
  } finally {
    await app.close();
  }
});
test("A15 wrong restored member cannot resume", async () => {
  // Given human ownership after expiry; When restoring another member; Then remain HUMAN.
  const app = await startSandbox({ port: 0, fault: "expired" });
  let operator = Promise.resolve();
  try {
    const run = await replay({
      ...common,
      origin: app.origin,
      artifactBytes: readFileSync(artifactPath, "utf8"),
      onRuntime: (runtime) => {
        operator = (async () => {
          while (runtime.session.owner !== "HUMAN") await pause(5);
          const frame = workspace(runtime.page);
          await frame.getByLabel("Demo password", { exact: true }).fill("demo-only");
          await Promise.all([
            frame
              .getByRole("heading", { name: "Prepare transfer", exact: true })
              .waitFor({ state: "visible" }),
            frame.getByRole("button", { name: "Restore session", exact: true }).click(),
          ]);
          await frame.goto(`${app.origin}/transfer?member=M-104`);
          await assert.rejects(
            runtime.session.resume(),
            (e: unknown) => e instanceof Fault && e.code === "RESUME_STATE_MISMATCH",
          );
          assert.equal(runtime.session.owner, "HUMAN");
          runtime.session.abort();
        })();
      },
    });
    await operator;
    assert.equal(run.result.status, "aborted");
    assert.equal(app.stats.reviewRequests, 0);
  } finally {
    await app.close();
  }
});
test("A15 altered amount fails resume at the declared review anchor", async () => {
  // Given a completed form and human ownership; When changing its amount; Then resume is rejected.
  const app = await startSandbox({ port: 0 });
  const artifact = Artifact.parse(JSON.parse(readFileSync(artifactPath, "utf8")));
  const runtime = await Runtime.create({
    ...common,
    origin: app.origin,
    mode: "replay",
    provenance: artifact.provenance.origin,
    artifactHash: createHash("sha256").update(readFileSync(artifactPath)).digest("hex"),
  });
  try {
    const reviewIndex = artifact.steps.findIndex((step) => {
      const b = artifact.bindings[step.operation.targetRef];
      return (
        b?.strategy === "role" && b.name.kind === "literal" && b.name.text === "Review transfer"
      );
    });
    assert.ok(reviewIndex >= 0);
    for (const step of artifact.steps.slice(0, reviewIndex))
      await execute(runtime, step, artifact.bindings);
    const step = artifact.steps[reviewIndex];
    assert.ok(step);
    runtime.session.anchor(async () =>
      (await matches(runtime, step.preconditions, artifact.bindings)) ? reviewIndex : null,
    );
    await runtime.session.takeover();
    await workspace(runtime.page).locator('input[name="amount"]').fill("999.99");
    await assert.rejects(
      runtime.session.resume(),
      (e: unknown) => e instanceof Fault && e.code === "RESUME_STATE_MISMATCH",
    );
    assert.equal(runtime.session.owner, "HUMAN");
    assert.equal(app.stats.reviewRequests, 0);
  } finally {
    await runtime.close();
    await app.close();
  }
});
