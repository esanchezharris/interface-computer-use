import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { DurableBudget } from "../../src/discovery/budget.js";
import type { ModelRequest } from "../../src/discovery/model.js";
import { approvedConfig, createOpenAIModel } from "../../src/discovery/openai.js";
import { Fault } from "../../src/domain/contract.js";

const config = {
  budgetId: "unit-budget",
  model: "test-model",
  maxCalls: 2,
  maxTotalTokens: 10_000,
  maxOutputTokens: 100,
};
const authorized = {
  OPENAI_API_KEY: "synthetic-only-key",
  CUA_MODEL: "gpt-5.6-sol",
  CUA_LIVE_PHASE: "assignment-20260908",
  CUA_BUDGET_STAGE: "selection",
  CUA_API_APPROVED: "true",
  CUA_MAX_CALLS: "2",
  CUA_MAX_TOTAL_TOKENS: "10000",
  CUA_MAX_OUTPUT_TOKENS: "100",
  CUA_BUDGET_ID: "unit-budget",
};
function code(expected: string): (error: unknown) => boolean {
  return (error) => error instanceof Fault && error.code === expected;
}

test("approval rejects missing approval, key-only access, and unbounded configuration", () => {
  // Given incomplete or unsafe configuration; When parsed; Then no client is authorized.
  for (const env of [
    {},
    { OPENAI_API_KEY: "synthetic-only-key" },
    { ...authorized, CUA_API_APPROVED: "false" },
    { ...authorized, CUA_MODEL: "" },
    { ...authorized, CUA_MAX_CALLS: "33" },
    { ...authorized, CUA_MAX_TOTAL_TOKENS: "Infinity" },
    { ...authorized, CUA_MAX_OUTPUT_TOKENS: "4001" },
    { ...authorized, CUA_BUDGET_ID: "../escape" },
  ])
    assert.throws(() => approvedConfig(env), code("MODEL_UNAVAILABLE"));
  assert.equal(approvedConfig(authorized).maxCalls, 2);
});

test("failed attempts remain reserved across budget reconstruction and exhaustion", async () => {
  // Given a reserved failed request; When reopened and used again; Then the original debit persists.
  const directory = await mkdtemp(join(tmpdir(), "cua-budget-"));
  try {
    const first = new DurableBudget(config, directory);
    await first.reserve(4000);
    const reopened = new DurableBudget(config, directory);
    assert.deepEqual(reopened.usage(), { calls: 1, tokens: 4000 });
    await reopened.reserve(4000);
    await assert.rejects(reopened.reserve(1), code("MODEL_BUDGET_EXHAUSTED"));
    assert.deepEqual(reopened.usage(), { calls: 2, tokens: 8000 });
    const serialized = await readFile(join(directory, "unit-budget.json"), "utf8");
    assert.equal(serialized.includes(authorized.OPENAI_API_KEY), false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("existing budget rejects model and limit changes", async () => {
  // Given a durable approved configuration; When another configuration reuses its ID; Then reject.
  const directory = await mkdtemp(join(tmpdir(), "cua-budget-"));
  try {
    await new DurableBudget(config, directory).reserve(100);
    for (const changed of [
      { ...config, model: "other-model" },
      { ...config, maxCalls: 3 },
    ])
      assert.throws(() => new DurableBudget(changed, directory).usage(), code("MODEL_UNAVAILABLE"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("token exhaustion rejects before reserving another call", async () => {
  // Given an almost-consumed token budget; When another request exceeds it; Then preserve the ledger.
  const directory = await mkdtemp(join(tmpdir(), "cua-budget-"));
  try {
    const budget = new DurableBudget(config, directory);
    await budget.reserve(9999);
    await assert.rejects(budget.reserve(2), code("MODEL_BUDGET_EXHAUSTED"));
    assert.deepEqual(budget.usage(), { calls: 1, tokens: 9999 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("concurrent processes cannot over-reserve the shared budget", async () => {
  // Given four competing processes and two calls; When reserving concurrently; Then exactly two win.
  const directory = await mkdtemp(join(tmpdir(), "cua-budget-"));
  const moduleUrl = new URL("../../src/discovery/budget.js", import.meta.url).href;
  const script = `const {DurableBudget}=await import(process.argv[1]); const config=JSON.parse(process.argv[3]); try {await new DurableBudget(config,process.argv[2]).reserve(100);process.stdout.write("reserved");} catch(error){process.stdout.write(error.code);}`;
  try {
    const run = promisify(execFile);
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        run(process.execPath, [
          "--input-type=module",
          "-e",
          script,
          moduleUrl,
          directory,
          JSON.stringify(config),
        ]),
      ),
    );
    assert.equal(results.filter((result) => result.stdout === "reserved").length, 2);
    assert.equal(results.filter((result) => result.stdout === "MODEL_BUDGET_EXHAUSTED").length, 2);
    assert.deepEqual(new DurableBudget(config, directory).usage(), { calls: 2, tokens: 200 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("SDK wire fixture proves no retries, failed-call debit, JSON parsing, and safe errors", async (context) => {
  // Given a local HTTP provider fixture; When requests fail or return JSON; Then count every attempt without live API access.
  const budgetId = `wire-${randomUUID()}`;
  const directory = await mkdtemp(join(tmpdir(), "cua-wire-"));
  const request: ModelRequest = {
    goal: "Use the visible interface",
    correction: false,
    input: {
      memberId: "M-104",
      sourceAccountRef: "CHK-104",
      destinationAccountRef: "SAV-104",
      amountCents: 2500,
    },
    observation: {
      id: "current",
      screen: "search",
      candidates: [],
      member: "",
      text: "",
      controls: [],
    },
  };
  const decision = { action: "wait", reason: "observe-change" };
  let calls = 0;
  const server = createServer((incoming, response) => {
    incoming.resume();
    calls += 1;
    response.setHeader("Content-Type", "application/json");
    if (calls === 1) {
      response.statusCode = 503;
      response.end(JSON.stringify({ error: { message: "SENSITIVE_TEST_PROVIDER_ERROR" } }));
      return;
    }
    if (calls === 2) response.setHeader("x-request-id", "req_wire_fixture");
    response.end(
      JSON.stringify({
        id: "resp_wire_fixture",
        object: "response",
        status: "completed",
        output: [
          {
            type: "message",
            id: "msg_wire_fixture",
            status: "completed",
            role: "assistant",
            content: [
              {
                type: "output_text",
                text: calls === 2 ? JSON.stringify(decision) : "malformed",
                annotations: [],
              },
            ],
          },
        ],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address !== null && typeof address !== "string");
  const nativeFetch = globalThis.fetch;
  context.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      assert.equal(String(input), "https://api.openai.com/v1/responses");
      return nativeFetch(`http://127.0.0.1:${address.port}/responses`, init);
    },
  );
  try {
    const model = createOpenAIModel(
      {
        ...authorized,
        CUA_BUDGET_ID: budgetId,
        CUA_MAX_CALLS: "3",
        CUA_MAX_TOTAL_TOKENS: "100000",
      },
      directory,
    );
    assert.ok("lastRequestMetadata" in model && typeof model.lastRequestMetadata === "function");
    await assert.rejects(model.decide(request), code("MODEL_UNAVAILABLE"));
    assert.deepEqual(model.lastRequestMetadata(), { httpStatus: 503 });
    assert.equal(calls, 1);
    assert.equal(model.usage().calls, 1);
    assert.deepEqual(await model.decide(request), decision);
    assert.deepEqual(model.lastRequestMetadata(), {
      requestId: "req_wire_fixture",
      responseStatus: "completed",
      inputTokens: 1,
      outputTokens: 1,
    });
    assert.equal(await model.decide(request), null);
    assert.deepEqual(model.lastRequestMetadata(), {
      inputTokens: 1,
      outputTokens: 1,
      responseStatus: "completed",
    });
    assert.equal(calls, 3);
    await assert.rejects(model.decide(request), code("MODEL_BUDGET_EXHAUSTED"));
    const persisted = await readFile(join(directory, `${budgetId}.json`), "utf8");
    assert.equal(persisted.includes("SENSITIVE_TEST_PROVIDER_ERROR"), false);
    assert.equal(persisted.includes(authorized.OPENAI_API_KEY), false);
  } finally {
    context.mock.restoreAll();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error === undefined ? resolve() : reject(error)));
      server.closeAllConnections();
    });
    await rm(directory, { recursive: true, force: true });
  }
});
