import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import type { Model } from "../../src/discovery/model.js";
import { discover } from "../../src/discovery/run.js";
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
  interventionMs: 2000,
} as const;
for (const [name, proposal, expected, calls] of [
  ["malformed", null, "MODEL_INVALID", 2],
  [
    "stale candidate",
    { action: "click", candidate: "stale-observation:1", reason: "advance" },
    "STALE_CANDIDATE",
    1,
  ],
  ["no progress", { action: "wait", reason: "observe-change" }, "NO_PROGRESS", 3],
] as const)
  test(`discovery ${name} terminates within bounded calls`, async () => {
    // Given an invalid/dead-end model; When discovering; Then no successful artifact or browser effects.
    const app = await startSandbox({ port: 0 });
    let count = 0;
    const model: Model = {
      origin: "development-fixture",
      provider: "fixture",
      model: "negative-model-fixture",
      usage: () => ({ calls: count, tokens: 0 }),
      decide: async () => {
        count++;
        return proposal;
      },
    };
    try {
      const run = await discover({
        ...options,
        origin: app.origin,
        model,
        goal: "Prepare transfer",
      });
      assert.equal("code" in run.result ? run.result.code : null, expected);
      assert.equal(count, calls);
      assert.equal(run.artifact, null);
      assert.equal(app.stats.searchRequests, 0);
    } finally {
      await app.close();
    }
  });
test("A14 late model response is discarded after takeover with no human-owned mutation", async () => {
  // Given a pending model decision; When ownership changes; Then the response is dropped.
  const app = await startSandbox({ port: 0 });
  let runtime: Runtime | undefined;
  let calls = 0;
  const model: Model = {
    origin: "development-fixture",
    provider: "fixture",
    model: "late-model-fixture",
    usage: () => ({ calls, tokens: 0 }),
    decide: async (request) => {
      calls++;
      assert.ok(runtime);
      await runtime.session.takeover();
      assert.equal(runtime.session.owner, "HUMAN");
      const candidate = request.observation.candidates.find((c) => c.control.name === "Search");
      assert.ok(candidate);
      return { action: "click", candidate: candidate.id, reason: "advance" };
    },
  };
  try {
    const run = await discover({
      ...options,
      origin: app.origin,
      model,
      goal: "Prepare transfer",
      onRuntime: (active) => {
        runtime = active;
        const emit = active.evidence.event.bind(active.evidence);
        active.evidence.event = (event) => {
          emit(event);
          if (event.kind === "late-response-dropped") active.session.abort();
        };
      },
    });
    assert.equal(run.result.status, "aborted");
    assert.equal(app.stats.searchRequests, 0);
    assert.ok(
      readFileSync(`${run.evidenceDirectory}/events.jsonl`, "utf8").includes(
        "late-response-dropped",
      ),
    );
  } finally {
    await app.close();
  }
});
