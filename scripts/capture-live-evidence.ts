import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import type { Fault as SandboxFault } from "../sandbox/data.js";
import { startSandbox } from "../sandbox/server.js";
import { Artifact } from "../src/domain/artifact.js";
import { BusinessCode, FailureCode, Fault } from "../src/domain/contract.js";
import { Manifest } from "../src/evidence/schema.js";
import { replay } from "../src/replay/run.js";
import { promote } from "./evidence-files.js";
import { testOperator } from "./test-operator.js";

const Entry = z.strictObject({
  case: z.enum([
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
  commits: z.literal(0),
  reviewRequests: z.number().int().min(0),
});
const Collection = z.strictObject({
  id: z.uuid(),
  origin: z.literal("live-model"),
  liveDiscovery: z.literal(true),
  manualHandoff: z.literal(false),
  artifact: z.literal("artifacts/prepare-transfer.json"),
  artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
  discoveryRunId: z.uuid(),
  entries: z.array(Entry),
});
const artifactBytes = readFileSync("artifacts/prepare-transfer.json", "utf8");
const artifact = Artifact.parse(JSON.parse(artifactBytes));
const hash = createHash("sha256").update(artifactBytes).digest("hex");
if (artifact.provenance.origin !== "live-model") throw new Fault("CONTRACT_INVALID");
const discoveryDirectory = `.runs/live/${artifact.provenance.runId}`;
const manifest = Manifest.parse(
  JSON.parse(readFileSync(`${discoveryDirectory}/manifest.json`, "utf8")),
);
if (manifest.artifactHash !== hash || manifest.origin !== "live-model" || manifest.modelCalls < 1)
  throw new Fault("CONTRACT_INVALID");
promote(discoveryDirectory);
const entries: z.infer<typeof Entry>[] = [];
const cases: readonly (readonly [z.infer<typeof Entry>["case"], SandboxFault, string])[] = [
  ["changed-input", "none", "success"],
  ["business-outcome", "insufficient", "INSUFFICIENT_FUNDS"],
  ["recovery", "slow", "success"],
  ["hard-failure", "app-error", "APP_ERROR"],
  ["policy-failure", "misdirected", "POLICY_DENIED"],
  ["test-operator", "expired", "success"],
];
for (const [name, fault, expected] of cases) {
  const app = await startSandbox({ port: 0, fault, delayMs: 150 });
  let operator = Promise.resolve();
  let operatorFailed = false;
  try {
    const run = await replay({
      artifactBytes,
      input: {
        memberId: "M-207",
        sourceAccountRef: "CHK-207",
        destinationAccountRef: "SAV-207",
        amountCents: 3750,
      },
      origin: app.origin,
      operator: fault === "expired",
      headed: false,
      actor: fault === "expired" ? "test_operator" : "automation",
      evidenceRoot: ".runs/live-capture",
      onRuntime: (runtime) => {
        if (fault === "expired")
          operator = testOperator(runtime).catch(() => {
            operatorFailed = true;
            runtime.session.abort();
          });
      },
    });
    await operator;
    if (
      operatorFailed ||
      ("code" in run.result ? run.result.code : run.result.status) !== expected ||
      app.stats.commits !== 0
    )
      throw new Fault("CHECKPOINT_MISMATCH");
    entries.push({
      case: name,
      runId: promote(run.evidenceDirectory),
      status: run.result.status,
      code: "code" in run.result ? run.result.code : null,
      commits: 0,
      reviewRequests: app.stats.reviewRequests,
    });
  } finally {
    await app.close();
  }
}
if (
  createHash("sha256").update(readFileSync("artifacts/prepare-transfer.json")).digest("hex") !==
  hash
)
  throw new Fault("CONTRACT_INVALID");
const collection = Collection.parse({
  id: randomUUID(),
  origin: "live-model",
  liveDiscovery: true,
  manualHandoff: false,
  artifact: "artifacts/prepare-transfer.json",
  artifactHash: hash,
  discoveryRunId: manifest.runId,
  entries,
});
mkdirSync("evidence/collections", { recursive: true });
const path = `evidence/collections/${collection.id}.json`;
writeFileSync(path, `${JSON.stringify(collection, null, 2)}\n`);
process.stdout.write(`${path}\n`);
