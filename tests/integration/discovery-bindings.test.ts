import assert from "node:assert/strict";
import { existsSync, mkdtempSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { FixtureModel } from "../../scripts/fixture-model.js";
import { discover } from "../../src/discovery/run.js";

test("matching defaults at review do not publish an artifact without executed account bindings", async (t) => {
  const scripted = new FixtureModel();
  const app = await startSandbox({ port: 0 });
  const outputPath = `${mkdtempSync(".runs/omitted-bindings-")}/candidate.json`;
  try {
    const run = await discover({
      input: {
        memberId: "M-104",
        sourceAccountRef: "CHK-104",
        destinationAccountRef: "SAV-104",
        amountCents: 2500,
      },
      goal: "Prepare supplied transfer to review",
      model: {
        origin: "development-fixture",
        provider: "fixture",
        model: "omitted-selections-fixture",
        usage: () => scripted.usage(),
        decide: async (request) => {
          let decision = await scripted.decide(request);
          while (decision.action === "select") decision = await scripted.decide(request);
          return decision;
        },
      },
      outputPath,
      origin: app.origin,
      actor: "automation",
      operator: false,
      headed: false,
      evidenceRoot: ".runs/tests",
    });
    t.diagnostic(JSON.stringify({ result: run.result, evidenceDirectory: run.evidenceDirectory }));
    assert.equal(run.result.status, "failed");
    assert.equal("code" in run.result ? run.result.code : null, "RECORDING_INCOMPLETE");
    assert.equal(run.artifact, null);
    assert.equal(existsSync(outputPath), false);
    assert.equal(app.stats.reviewRequests, 1);
    assert.equal(app.stats.commits, 0);
  } finally {
    await app.close();
  }
});
