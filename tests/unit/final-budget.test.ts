import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { approvedConfig } from "../../src/discovery/openai.js";
import {
  FINAL_STAGE,
  FinalApproval,
  LIVE_PHASE,
  PhaseBudget,
} from "../../src/discovery/phase-budget.js";
import { Fault } from "../../src/domain/contract.js";

const approval = FinalApproval.parse({
  phase: LIVE_PHASE,
  stage: FINAL_STAGE,
  aggregateLimitUsd: 50,
  priorCalls: 17,
  priorReservedTokens: 153245,
  model: "gpt-5.6-sol",
  reasoning: "low",
  maxOutputTokens: 2000,
  maxCalls: 96,
});
const unavailable = (e: unknown) => e instanceof Fault && e.code === "MODEL_UNAVAILABLE";
const exhausted = (e: unknown) => e instanceof Fault && e.code === "MODEL_BUDGET_EXHAUSTED";
async function seed(root: string) {
  await writeFile(
    join(root, `${LIVE_PHASE}-total.json`),
    JSON.stringify({
      schemaVersion: 1,
      config: {
        budgetId: `${LIVE_PHASE}-total`,
        model: "standard-two-candidate-phase",
        maxCalls: 96,
        maxTotalTokens: 1000000,
        maxOutputTokens: 4000,
      },
      calls: 17,
      tokens: 153245,
    }),
  );
  await writeFile(join(root, "live-sol-20260908.json"), "retained model ledger existence fixture");
  await writeFile(join(root, `${LIVE_PHASE}.closed`), "retained");
  await writeFile(join(root, `${LIVE_PHASE}-account-repair.closed`), "retained");
}
test("final phase requires exact authorization and retained accounting and closures", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-final-"));
  const send = () =>
    new PhaseBudget(root, FINAL_STAGE).run(1, FINAL_STAGE, async () =>
      assert.fail("unapproved send"),
    );
  try {
    await assert.rejects(send(), unavailable);
    await writeFile(
      join(root, `${LIVE_PHASE}-${FINAL_STAGE}.approved.json`),
      JSON.stringify(approval),
    );
    await assert.rejects(send(), unavailable);
    await seed(root);
    await rm(join(root, `${LIVE_PHASE}-account-repair.closed`));
    await assert.rejects(send(), unavailable);
    assert.equal(FinalApproval.safeParse({ ...approval, aggregateLimitUsd: 55 }).success, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("final phase preserves all prior and failed reserves across restarts at the original fifty-dollar ceiling", async () => {
  const root = await mkdtemp(join(tmpdir(), "cua-final-"));
  try {
    await seed(root);
    await writeFile(
      join(root, `${LIVE_PHASE}-${FINAL_STAGE}.approved.json`),
      JSON.stringify(approval),
    );
    await assert.rejects(
      new PhaseBudget(root, FINAL_STAGE).run(1000, FINAL_STAGE, async () => {
        throw new Fault("MODEL_UNAVAILABLE");
      }),
      unavailable,
    );
    assert.equal(new PhaseBudget(root, FINAL_STAGE).usage().tokens, 154245);
    await new PhaseBudget(root, FINAL_STAGE).run(845755, FINAL_STAGE, async () => {});
    assert.equal(new PhaseBudget(root, FINAL_STAGE).usage().reservedUsd, 50);
    await assert.rejects(
      new PhaseBudget(root, FINAL_STAGE).run(1, FINAL_STAGE, async () =>
        assert.fail("over ceiling"),
      ),
      exhausted,
    );
    await writeFile(join(root, `${LIVE_PHASE}-${FINAL_STAGE}.closed`), "closed");
    await assert.rejects(
      new PhaseBudget(root, FINAL_STAGE).run(1, FINAL_STAGE, async () =>
        assert.fail("closed send"),
      ),
      exhausted,
    );
    assert.equal(new PhaseBudget(root, FINAL_STAGE).usage().calls, 19);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("final phase permits only the retained model and finite declared limits", () => {
  const env = {
    OPENAI_API_KEY: "synthetic-only",
    CUA_API_APPROVED: "true",
    CUA_MODEL: "gpt-5.6-sol",
    CUA_LIVE_PHASE: LIVE_PHASE,
    CUA_BUDGET_STAGE: FINAL_STAGE,
    CUA_REASONING_EFFORT: "low",
    CUA_BUDGET_ID: "live-sol-20260908",
    CUA_MAX_CALLS: "96",
    CUA_MAX_TOTAL_TOKENS: "1000000",
    CUA_MAX_OUTPUT_TOKENS: "2000",
  };
  assert.equal(approvedConfig(env).stage, FINAL_STAGE);
  for (const change of [
    { CUA_MAX_CALLS: "97" },
    { CUA_MAX_CALLS: "32" },
    { CUA_MODEL: "gpt-6-astra" },
    { CUA_BUDGET_ID: "new-budget" },
    { CUA_REASONING_EFFORT: "medium" },
  ])
    assert.throws(() => approvedConfig({ ...env, ...change }), unavailable);
});
