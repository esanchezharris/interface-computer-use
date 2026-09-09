import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { FixtureModel } from "../../scripts/fixture-model.js";
import { testOperator } from "../../scripts/test-operator.js";
import { discover } from "../../src/discovery/run.js";
import { Fault } from "../../src/domain/contract.js";
import { replay } from "../../src/replay/run.js";
import type { Runtime } from "../../src/session/browser.js";

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
  waitMs: 500,
  interventionMs: 3000,
} as const;
test("A13 discovery expiry resumes the existing UI and records only executed actions", async () => {
  // Given discovery interrupted by expiry; When a test operator restores it; Then complete faithfully.
  const app = await startSandbox({ port: 0, fault: "expired" });
  let operator = Promise.resolve();
  try {
    const run = await discover({
      ...options,
      origin: app.origin,
      model: new FixtureModel(),
      goal: "Prepare supplied transfer",
      onRuntime: (runtime) => {
        operator = testOperator(runtime);
        void operator.catch(() => {});
      },
    });
    await operator;
    assert.equal(run.result.status, "success");
    assert.equal(run.artifact?.steps.length, 8);
    const manifest = JSON.parse(readFileSync(`${run.evidenceDirectory}/manifest.json`, "utf8"));
    assert.equal(manifest.modelCalls, 9);
    assert.match(manifest.artifactHash, /^[a-f0-9]{64}$/);
    assert.equal(app.stats.commits, 0);
  } finally {
    await app.close();
  }
});
test("A14 takeover during final completion cannot finalize or close the human-owned page", async () => {
  // Given takeover at the last action-complete event.
  const app = await startSandbox({ port: 0 });
  let operator = Promise.resolve();
  let finished = false;
  try {
    const run = await replay({
      ...options,
      origin: app.origin,
      artifactBytes: readFileSync("artifacts/development-fixture.json", "utf8"),
      onRuntime: (runtime) => {
        const emit = runtime.evidence.event.bind(runtime.evidence);
        runtime.evidence.event = (event) => {
          emit(event);
          if (event.kind === "action-complete" && event.stepId === "step-008") {
            operator = (async () => {
              await runtime.session.takeover();
              assert.equal(finished, false);
              assert.equal(runtime.page.isClosed(), false);
              await runtime.session.resume();
            })();
            void operator.catch(() => {});
          }
        };
      },
    }).then((result) => {
      finished = true;
      return result;
    });
    await operator;
    assert.equal(run.result.status, "success");
  } finally {
    await app.close();
  }
});
test("A19 mandatory evidence failure still closes the browser and stops actions", async () => {
  // Given an unwritable evidence sink after runtime creation; When action logging fails; Then close.
  const app = await startSandbox({ port: 0 });
  let captured: Runtime | undefined;
  try {
    await assert.rejects(
      replay({
        ...options,
        origin: app.origin,
        artifactBytes: readFileSync("artifacts/development-fixture.json", "utf8"),
        onRuntime: (runtime) => {
          captured = runtime;
          runtime.evidence.event = () => {
            throw new Fault("EVIDENCE_WRITE_FAILED");
          };
        },
      }),
      (e) => e instanceof Fault && e.code === "EVIDENCE_WRITE_FAILED",
    );
    assert.ok(captured);
    assert.equal(captured.page.isClosed(), true);
    assert.equal(app.stats.searchRequests, 0);
  } finally {
    await app.close();
  }
});
test("A14 a real timed-out Playwright click cannot fire after HUMAN is granted", async () => {
  // Given a live click waiting behind an overlay; When takeover settles it; Then removal cannot fire it late.
  const app = await startSandbox({ port: 0 });
  const { Runtime } = await import("../../src/session/browser.js");
  const { Artifact } = await import("../../src/domain/artifact.js");
  const { execute } = await import("../../src/surface/executor.js");
  const { workspace } = await import("../../src/surface/observe.js");
  const runtime = await Runtime.create({
    ...options,
    origin: app.origin,
    mode: "replay",
    provenance: "development-fixture",
    artifactHash: null,
    actionMs: 150,
  });
  try {
    const artifact = Artifact.parse(
      JSON.parse(readFileSync("artifacts/development-fixture.json", "utf8")),
    );
    const fill = artifact.steps[0];
    const click = artifact.steps[1];
    assert.ok(fill);
    assert.ok(click);
    await execute(runtime, fill, artifact.bindings);
    const frame = workspace(runtime.page);
    await frame.locator("body").evaluate((body) => {
      const overlay = document.createElement("aside");
      overlay.style.cssText = "position:fixed;inset:0;background:white;z-index:999";
      body.append(overlay);
    });
    let started = () => {};
    const start = new Promise<void>((resolve) => {
      started = resolve;
    });
    const emit = runtime.evidence.event.bind(runtime.evidence);
    runtime.evidence.event = (event) => {
      emit(event);
      if (event.kind === "action-start" && event.stepId === click.id) started();
    };
    const action = execute(runtime, click, artifact.bindings).then(
      () => null,
      (error) => (error instanceof Fault ? error.code : "BROWSER_ERROR"),
    );
    await start;
    await runtime.session.takeover();
    assert.equal(runtime.session.owner, "HUMAN");
    assert.equal(runtime.session.status().inFlight, 0);
    await frame.locator("aside").evaluate((element) => element.remove());
    assert.equal(await action, "OWNERSHIP_LOST");
    assert.equal(app.stats.searchRequests, 0);
  } finally {
    await runtime.close();
    await app.close();
  }
});
test("A15 ambiguous click resume anchors remain human-owned", async () => {
  // Given overlapping before/after anchors for a click; When resuming; Then no unique continuation exists.
  const app = await startSandbox({ port: 0 });
  const { Runtime } = await import("../../src/session/browser.js");
  const { stepAnchor } = await import("../../src/session/resume.js");
  const runtime = await Runtime.create({
    ...options,
    origin: app.origin,
    mode: "replay",
    provenance: "development-fixture",
    artifactHash: null,
  });
  try {
    stepAnchor(
      runtime,
      {
        id: "step-001",
        operation: { action: "click", targetRef: "target-001" },
        preconditions: [{ kind: "screen", screen: "search" }],
        postconditions: [{ kind: "screen", screen: "search" }],
      },
      {},
      0,
    );
    await runtime.session.takeover();
    await assert.rejects(
      runtime.session.resume(),
      (e) => e instanceof Fault && e.code === "RESUME_STATE_MISMATCH",
    );
    assert.equal(runtime.session.owner, "HUMAN");
  } finally {
    await runtime.close();
    await app.close();
  }
});
