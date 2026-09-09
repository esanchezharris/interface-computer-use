import assert from "node:assert/strict";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { FixtureModel } from "../../scripts/fixture-model.js";
import { discover } from "../../src/discovery/run.js";
import { replay } from "../../src/replay/run.js";

const a = {
  memberId: "M-104",
  sourceAccountRef: "CHK-104",
  destinationAccountRef: "SAV-104",
  amountCents: 2500,
};
const b = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3750,
};
test("A02 A05 A17 A18 development fixture records real UI actions and replays changed inputs", async () => {
  // Given a live synthetic UI and explicitly scripted model fixture.
  const app = await startSandbox({ port: 0 });
  const options = {
    origin: app.origin,
    actor: "automation",
    operator: false,
    headed: false,
    evidenceRoot: ".runs/tests",
  } as const;
  try {
    // When completing fixture discovery then fresh-context replay of the exact serialized artifact.
    const learned = await discover({
      ...options,
      input: a,
      model: new FixtureModel(),
      goal: "Prepare supplied transfer to review",
    });
    assert.equal(learned.result.status, "success", JSON.stringify(learned.result));
    assert.ok(learned.artifact);
    const bytes = `${JSON.stringify(learned.artifact, null, 2)}\n`;
    const replayed = await replay({ ...options, input: b, artifactBytes: bytes });
    // Then extracted business values reflect member B and the commit oracle remains zero.
    assert.equal(replayed.result.status, "success", JSON.stringify(replayed.result));
    if (replayed.result.status === "success")
      assert.deepEqual(replayed.result.outputs, {
        ...b,
        feeCents: 0,
        currency: "USD",
        reviewStatus: "AWAITING_CONFIRMATION",
      });
    assert.equal(app.stats.commits, 0);
    assert.equal(app.stats.reviewRequests, 2);
    assert.equal(learned.artifact.provenance.origin, "development-fixture");
    assert.ok(Object.values(learned.artifact.bindings).some((v) => v.strategy === "table-label"));
    assert.equal(bytes.includes("M-104"), false);
    assert.equal(bytes.includes("CHK-104"), false);
  } finally {
    await app.close();
  }
});
