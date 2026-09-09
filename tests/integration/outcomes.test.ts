import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Fault } from "../../sandbox/data.js";
import { startSandbox } from "../../sandbox/server.js";
import { replay } from "../../src/replay/run.js";
import { artifactPath } from "../artifact-path.js";

const input = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3750,
};
const cases: readonly (readonly [Fault, string, string])[] = [
  ["not-found", "business_outcome", "MEMBER_NOT_FOUND"],
  ["insufficient", "business_outcome", "INSUFFICIENT_FUNDS"],
  ["validation", "business_outcome", "VALIDATION_REJECTED"],
  ["permission", "failed", "PERMISSION_DENIED"],
  ["app-error", "failed", "APP_ERROR"],
  ["ambiguous", "failed", "TARGET_AMBIGUOUS"],
  ["duplicate-frame", "failed", "TARGET_AMBIGUOUS"],
  ["wrong-member", "failed", "CHECKPOINT_MISMATCH"],
  ["wrong-source", "failed", "CHECKPOINT_MISMATCH"],
  ["wrong-destination", "failed", "CHECKPOINT_MISMATCH"],
  ["wrong-amount", "failed", "CHECKPOINT_MISMATCH"],
  ["bad-fee", "failed", "OUTPUT_INVALID"],
  ["conflicting", "failed", "STATE_AMBIGUOUS"],
  ["misdirected", "failed", "POLICY_DENIED"],
  ["modal", "failed", "UNEXPECTED_MODAL"],
  ["expired", "failed", "HUMAN_REQUIRED"],
];
for (const [fault, status, code] of cases)
  test(`A06-A12 ${fault} is deliberately classified`, async () => {
    // Given a fault visible only through the running application.
    const app = await startSandbox({ port: 0, fault });
    try {
      // When replaying an unchanged recorded artifact.
      const run = await replay({
        artifactBytes: readFileSync(artifactPath, "utf8"),
        input,
        origin: app.origin,
        evidenceRoot: ".runs/tests",
        actor: "automation",
        operator: false,
        headed: false,
        waitMs: 400,
      });
      // Then classification is typed and no transfer was committed.
      assert.equal(run.result.status, status);
      assert.equal("code" in run.result ? run.result.code : null, code);
      assert.equal(app.stats.commits, 0);
      if (fault === "ambiguous" || fault === "duplicate-frame")
        assert.equal(app.stats.searchRequests, 0);
      if (fault === "misdirected" || fault === "modal") assert.equal(app.stats.reviewRequests, 0);
      if (run.result.status === "failed")
        assert.ok(run.result.evidenceRefs.includes("snapshot.safe.json"));
    } finally {
      await app.close();
    }
  });
for (const delayMs of [125, 200])
  test(`A07 delayed review ${delayMs}ms recovers without repeating the click`, async () => {
    // Given a loading screen; When waiting; Then recover with one review request.
    const app = await startSandbox({ port: 0, fault: "slow", delayMs });
    try {
      const run = await replay({
        artifactBytes: readFileSync(artifactPath, "utf8"),
        input,
        origin: app.origin,
        evidenceRoot: ".runs/tests",
        actor: "automation",
        operator: false,
        headed: false,
        waitMs: 1500,
      });
      assert.equal(run.result.status, "success");
      assert.equal(app.stats.reviewRequests, 1);
      assert.ok(
        readFileSync(`${run.evidenceDirectory}/events.jsonl`, "utf8").includes('"recovery"'),
      );
    } finally {
      await app.close();
    }
  });
test("A07 exhausted loading deadline stops with one effect", async () => {
  // Given loading beyond budget; When replaying; Then fail with no second click.
  const app = await startSandbox({ port: 0, fault: "slow", delayMs: 2000 });
  try {
    const run = await replay({
      artifactBytes: readFileSync(artifactPath, "utf8"),
      input,
      origin: app.origin,
      evidenceRoot: ".runs/tests",
      actor: "automation",
      operator: false,
      headed: false,
      waitMs: 200,
    });
    assert.equal("code" in run.result ? run.result.code : null, "LOAD_TIMEOUT");
    assert.equal(app.stats.reviewRequests, 1);
  } finally {
    await app.close();
  }
});
