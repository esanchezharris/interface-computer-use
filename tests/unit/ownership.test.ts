import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Fault } from "../../src/domain/contract.js";
import { Evidence } from "../../src/evidence/store.js";
import { Session } from "../../src/session/controller.js";

function session(settleMs = 500) {
  return new Session(
    new Evidence(mkdtempSync(join(tmpdir(), "cua-session-")), {
      mode: "replay",
      actor: "test_operator",
      origin: "development-fixture",
      artifactHash: null,
      browserVersion: "unit-fixture",
    }),
    { actor: "test_operator", operator: true, interventionMs: 500, settleMs },
  );
}
test("A14 human ownership waits for the actual underlying action and rejects queued stale work", async () => {
  // Given one pending mutation and its captured ownership generation.
  const owner = session();
  const epoch = owner.epoch;
  let settle = () => {};
  let mutations = 0;
  const underlying = new Promise<void>((resolve) => {
    settle = resolve;
  });
  const action = owner.dispatch(async () => {
    await underlying;
    mutations++;
    assert.equal(owner.owner, "PAUSING");
  }, epoch);
  // When takeover races the operation; Then HUMAN is granted only after settlement.
  const transfer = owner.takeover();
  assert.equal(owner.owner, "PAUSING");
  assert.equal(owner.status().inFlight, 1);
  settle();
  await action;
  await transfer;
  assert.equal(owner.owner, "HUMAN");
  assert.equal(owner.status().inFlight, 0);
  await assert.rejects(
    owner.dispatch(async () => {
      mutations++;
    }, epoch),
    (e) => e instanceof Fault && e.code === "OWNERSHIP_LOST",
  );
  assert.equal(mutations, 1);
  owner.close();
});
test("A14 an unsettled operation cannot produce false successful takeover", async () => {
  // Given an operation beyond the settlement deadline; When takeover expires; Then never HUMAN.
  const owner = session(20);
  let settle = () => {};
  const action = owner.dispatch(
    () =>
      new Promise<void>((r) => {
        settle = r;
      }),
    owner.epoch,
  );
  await assert.rejects(
    owner.takeover(),
    (e) => e instanceof Fault && e.code === "HANDOFF_NOT_QUIESCENT",
  );
  assert.equal(owner.owner, "TERMINAL");
  settle();
  await action;
  owner.close();
});
test("duplicate and out-of-order operator commands fail closed", async () => {
  // Given automation ownership; When commands are out of order; Then ownership does not accidentally change.
  const owner = session();
  await assert.rejects(owner.resume(), (e) => e instanceof Fault && e.code === "COMMAND_INVALID");
  await owner.takeover();
  await assert.rejects(owner.takeover(), (e) => e instanceof Fault && e.code === "COMMAND_INVALID");
  assert.equal(owner.owner, "HUMAN");
  owner.close();
});
