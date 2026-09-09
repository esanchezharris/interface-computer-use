import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { PhaseBudget } from "../../src/discovery/phase-budget.js";
import { Fault } from "../../src/domain/contract.js";

const exhausted = (error: unknown) =>
  error instanceof Fault && error.code === "MODEL_BUDGET_EXHAUSTED";
test("selection spend survives restart and cannot consume more than five dollars", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-phase-"));
  try {
    await assert.rejects(
      new PhaseBudget(root).run(60_000, "selection", async () => {
        throw new Fault("MODEL_UNAVAILABLE");
      }),
    );
    const reopened = new PhaseBudget(root);
    assert.equal(reopened.usage().reservedUsd, 3);
    await assert.rejects(
      reopened.run(40_001, "selection", async () => assert.fail("must not send")),
      exhausted,
    );
    await reopened.run(40_000, "selection", async () => {});
    assert.equal(reopened.usage().selectionReservedUsd, 5);
    await assert.rejects(
      new PhaseBudget(root).run(1, "selection", async () => assert.fail("must not send")),
      exhausted,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("aggregate fifty-dollar ceiling includes selection and acceptance across instances", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-phase-"));
  try {
    await new PhaseBudget(root).run(100_000, "selection", async () => {});
    for (let n = 0; n < 9; n++)
      await new PhaseBudget(root).run(100_000, "acceptance", async () => {});
    const reopened = new PhaseBudget(root);
    assert.equal(reopened.usage().reservedUsd, 50);
    await assert.rejects(
      reopened.run(1, "acceptance", async () => assert.fail("must not send")),
      exhausted,
    );
    assert.equal(reopened.usage().calls, 10);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("phase lock prohibits concurrent requests before another reservation or send", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-phase-"));
  let release = () => {};
  let started = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const start = new Promise<void>((resolve) => {
    started = resolve;
  });
  try {
    const first = new PhaseBudget(root).run(100, "selection", async () => {
      started();
      await pending;
    });
    await start;
    await assert.rejects(
      new PhaseBudget(root).run(100, "selection", async () => assert.fail("concurrent send")),
      (error) => error instanceof Fault && error.code === "EVIDENCE_WRITE_FAILED",
    );
    release();
    await first;
    assert.equal(new PhaseBudget(root).usage().calls, 1);
  } finally {
    release();
    await rm(root, { recursive: true, force: true });
  }
});

test("completed phase remains closed across restarts without resetting reservations", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-phase-"));
  try {
    await new PhaseBudget(root).run(100, "acceptance", async () => {});
    await writeFile(join(root, "assignment-20260908.closed"), "qualified");
    await assert.rejects(
      new PhaseBudget(root).run(100, "acceptance", async () => assert.fail("closed phase sent")),
      exhausted,
    );
    assert.equal(new PhaseBudget(root).usage().tokens, 100);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
