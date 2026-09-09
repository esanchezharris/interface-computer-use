import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Fault as SandboxFault } from "../sandbox/data.js";
import { startSandbox } from "../sandbox/server.js";
import { discover } from "../src/discovery/run.js";
import { Artifact } from "../src/domain/artifact.js";
import { BusinessCode, FailureCode, Fault } from "../src/domain/contract.js";
import { replay } from "../src/replay/run.js";
import { promote } from "./evidence-files.js";
import { FixtureModel } from "./fixture-model.js";
import { testOperator } from "./test-operator.js";

const Entry = z.strictObject({
  case: z.enum([
    "development-discovery",
    "changed-input",
    "business-outcome",
    "recovery",
    "hard-failure",
    "policy-failure",
    "test-operator",
  ]),
  runId: z.uuid(),
  status: z.enum(["success", "failed", "business_outcome", "aborted"]),
  code: z.union([FailureCode, BusinessCode]).nullable(),
  commits: z.number().int().min(0),
  reviewRequests: z.number().int().min(0),
});
const Collection = z.strictObject({
  id: z.uuid(),
  origin: z.literal("development-fixture"),
  liveDiscovery: z.literal(false),
  manualHandoff: z.literal(false),
  artifact: z.string().regex(/^[a-f0-9-]{36}\/capability\.json$/),
  entries: z.array(Entry),
});

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
const entries: z.infer<typeof Entry>[] = [];
const app = await startSandbox({ port: 0 });
let artifactBytes = "";
let discoveredRunId = "";
try {
  const run = await discover({
    origin: app.origin,
    input: a,
    model: new FixtureModel(),
    goal: "Prepare supplied transfer to review",
    operator: false,
    headed: false,
    actor: "automation",
    evidenceRoot: ".runs/capture",
  });
  if (run.result.status !== "success" || !run.artifact) throw new Fault("CHECKPOINT_MISMATCH");
  artifactBytes = `${JSON.stringify(Artifact.parse(run.artifact), null, 2)}\n`;
  discoveredRunId = promote(run.evidenceDirectory);
  writeFileSync(join("evidence", discoveredRunId, "capability.json"), artifactBytes);
  entries.push({
    case: "development-discovery",
    runId: discoveredRunId,
    status: run.result.status,
    code: null,
    commits: app.stats.commits,
    reviewRequests: app.stats.reviewRequests,
  });
} finally {
  await app.close();
}
const cases: readonly (readonly [z.infer<typeof Entry>["case"], SandboxFault, string])[] = [
  ["changed-input", "none", "success"],
  ["business-outcome", "insufficient", "INSUFFICIENT_FUNDS"],
  ["recovery", "slow", "success"],
  ["hard-failure", "app-error", "APP_ERROR"],
  ["policy-failure", "misdirected", "POLICY_DENIED"],
  ["test-operator", "expired", "success"],
];
for (const [name, fault, expected] of cases) {
  const target = await startSandbox({ port: 0, fault, delayMs: 150 });
  let operatorError: unknown;
  let operator = Promise.resolve();
  try {
    const run = await replay({
      artifactBytes,
      input: b,
      origin: target.origin,
      operator: fault === "expired",
      headed: false,
      actor: fault === "expired" ? "test_operator" : "automation",
      evidenceRoot: ".runs/capture",
      onRuntime: (runtime) => {
        if (fault === "expired")
          operator = testOperator(runtime).catch((error) => {
            operatorError = error;
            runtime.session.abort();
          });
      },
    });
    await operator;
    if (operatorError) throw new Fault("RESUME_STATE_MISMATCH");
    const result = "code" in run.result ? run.result.code : run.result.status;
    if (result !== expected || target.stats.commits !== 0) throw new Fault("CHECKPOINT_MISMATCH");
    entries.push({
      case: name,
      runId: promote(run.evidenceDirectory),
      status: run.result.status,
      code: "code" in run.result ? run.result.code : null,
      commits: target.stats.commits,
      reviewRequests: target.stats.reviewRequests,
    });
  } finally {
    await target.close();
  }
}
const collection = Collection.parse({
  id: randomUUID(),
  origin: "development-fixture",
  liveDiscovery: false,
  manualHandoff: false,
  artifact: `${discoveredRunId}/capability.json`,
  entries,
});
mkdirSync("evidence/collections", { recursive: true });
const path = `evidence/collections/${collection.id}.json`;
writeFileSync(path, `${JSON.stringify(collection, null, 2)}\n`);
process.stdout.write(`${path}\n`);
