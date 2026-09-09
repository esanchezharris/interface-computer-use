import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { PhaseBudget, RepairApproval } from "../../src/discovery/phase-budget.js";
import { Fault } from "../../src/domain/contract.js";

const approval = {
  phase: "assignment-20260908",
  stage: "account-repair",
  additionalLimitUsd: 5,
  aggregateLimitUsd: 50,
  priorCalls: 8,
  priorReservedTokens: 69398,
  model: "gpt-5.6-sol",
  reasoning: "low",
  maxOutputTokens: 2000,
};
async function previousPhase(root: string): Promise<void> {
  for (let i = 0; i < 8; i++)
    await new PhaseBudget(root).run(i === 7 ? 62398 : 1000, "acceptance", async () => {});
  await writeFile(join(root, "assignment-20260908.closed"), "original phase remains closed");
}
const exhausted = (error: unknown) =>
  error instanceof Fault && error.code === "MODEL_BUDGET_EXHAUSTED";
const unavailable = (error: unknown) =>
  error instanceof Fault && error.code === "MODEL_UNAVAILABLE";
test("repair requires exact new approval, retained original accounting, and original closure", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-repair-"));
  try {
    const path = join(root, "assignment-20260908-account-repair.approved.json");
    const send = () =>
      new PhaseBudget(root).run(1, "account-repair", async () => assert.fail("unapproved send"));
    await assert.rejects(send(), unavailable);
    await writeFile(path, JSON.stringify(approval));
    await assert.rejects(send(), unavailable);
    await previousPhase(root);
    await writeFile(path, JSON.stringify({ ...approval, priorReservedTokens: 100000 }));
    await assert.rejects(send(), unavailable);
    assert.equal(RepairApproval.safeParse({ ...approval, additionalLimitUsd: 50 }).success, false);
    assert.equal(new PhaseBudget(root).usage().tokens, 69398);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("repair preserves prior reserves and holds failed requests within five additional dollars across restarts", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-repair-"));
  try {
    await previousPhase(root);
    await writeFile(
      join(root, "assignment-20260908-account-repair.approved.json"),
      JSON.stringify(approval),
    );
    await assert.rejects(
      new PhaseBudget(root).run(60000, "account-repair", async () => {
        throw new Fault("MODEL_UNAVAILABLE");
      }),
      unavailable,
    );
    await assert.rejects(
      new PhaseBudget(root).run(40001, "account-repair", async () =>
        assert.fail("over repair ceiling"),
      ),
      exhausted,
    );
    await new PhaseBudget(root).run(40000, "account-repair", async () => {});
    assert.deepEqual(new PhaseBudget(root).usage(), {
      calls: 10,
      tokens: 169398,
      reservedUsd: 8.4699,
      selectionReservedUsd: 0,
    });
    await assert.rejects(
      new PhaseBudget(root).run(1, "account-repair", async () =>
        assert.fail("over repair ceiling"),
      ),
      exhausted,
    );
    for (const stage of ["selection", "acceptance"] as const)
      await assert.rejects(
        new PhaseBudget(root).run(1, stage, async () => assert.fail("original phase reopened")),
        exhausted,
      );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("repair closure stops paid requests without resetting the retained aggregate ledger", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-repair-"));
  try {
    await previousPhase(root);
    await writeFile(
      join(root, "assignment-20260908-account-repair.approved.json"),
      JSON.stringify(approval),
    );
    await new PhaseBudget(root).run(500, "account-repair", async () => {});
    await writeFile(
      join(root, "assignment-20260908-account-repair.closed"),
      "qualified replacement",
    );
    await assert.rejects(
      new PhaseBudget(root).run(1, "account-repair", async () => assert.fail("closed repair sent")),
      exhausted,
    );
    assert.equal(new PhaseBudget(root).usage().tokens, 69898);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
