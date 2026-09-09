import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import "../../scripts/model-bomb.js";
import { startSandbox } from "../../sandbox/server.js";
import { requireAccountBindings } from "../../src/domain/account-bindings.js";
import { Artifact } from "../../src/domain/artifact.js";
import { Manifest } from "../../src/evidence/schema.js";
import { Runtime } from "../../src/session/browser.js";
import { extract } from "../../src/surface/checks.js";
import { execute } from "../../src/surface/executor.js";
import { workspace } from "../../src/surface/observe.js";
import { artifactPath } from "../artifact-path.js";

// Install the fatal hook before resolving replay, and remove provider credentials.
for (const key of Object.keys(process.env))
  if (/OPENAI|ANTHROPIC|API_KEY|CUA_/.test(key)) delete process.env[key];
const { replay } = await import("../../src/replay/run.js");
const bytes = readFileSync(artifactPath, "utf8");
const artifact = Artifact.parse(JSON.parse(bytes));
const hash = createHash("sha256").update(bytes).digest("hex");
const options = {
  artifactBytes: bytes,
  actor: "automation",
  operator: false,
  headed: false,
  evidenceRoot: ".runs/parameterization",
} as const;

test("qualified artifact contains both checked operative account input bindings", () => {
  requireAccountBindings(artifact);
});

for (const [member, source, destination, amountCents] of [
  ["104", "CHK", "SAV", 2500],
  ["104", "SAV", "CHK", 4200],
  ["207", "CHK", "SAV", 3750],
  ["207", "SAV", "CHK", 6100],
] as const)
  test(`account inputs M-${member} ${source} → ${destination} ${amountCents} cents reach matching review`, async (t) => {
    const input = {
      memberId: `M-${member}`,
      sourceAccountRef: `${source}-${member}`,
      destinationAccountRef: `${destination}-${member}`,
      amountCents,
    };
    const app = await startSandbox({ port: 0 });
    try {
      const run = await replay({ ...options, origin: app.origin, input });
      t.diagnostic(JSON.stringify({ input, ...run, commits: app.stats.commits }));
      assert.equal(run.result.status, "success", JSON.stringify(run.result));
      if (run.result.status === "success")
        assert.deepEqual(run.result.outputs, {
          ...input,
          feeCents: 0,
          currency: "USD",
          reviewStatus: "AWAITING_CONFIRMATION",
        });
      const manifest = Manifest.parse(
        JSON.parse(readFileSync(`${run.evidenceDirectory}/manifest.json`, "utf8")),
      );
      assert.equal(manifest.modelCalls, 0);
      assert.equal(manifest.reservedTokens, 0);
      assert.equal(manifest.artifactHash, hash);
      assert.equal(app.stats.commits, 0);
      assert.equal(app.stats.reviewRequests, 1);
      assert.equal(readFileSync(artifactPath, "utf8"), bytes);
    } finally {
      await app.close();
    }
  });

test("account selections survive reversed options and changed initial defaults", async (t) => {
  // Existing Runtime harness: mutate only visible controls before executing their recorded steps.
  const input = {
    memberId: "M-207",
    sourceAccountRef: "CHK-207",
    destinationAccountRef: "SAV-207",
    amountCents: 5200,
  };
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({
    ...options,
    origin: app.origin,
    input,
    mode: "replay",
    provenance: artifact.provenance.origin,
    artifactHash: hash,
  });
  let changed = false;
  try {
    for (const step of artifact.steps) {
      if (
        !changed &&
        step.preconditions.some((c) => c.kind === "screen" && c.screen === "transfer")
      ) {
        const frame = workspace(runtime.page);
        await frame.locator("select").evaluateAll((controls) => {
          for (const control of controls) {
            if (!(control instanceof HTMLSelectElement)) throw new Error("Expected account select");
            const previous = control.value;
            control.append(...Array.from(control.options).reverse());
            const other = Array.from(control.options).find((option) => option.value !== previous);
            if (!other) throw new Error("Expected another valid account");
            control.value = other.value;
          }
        });
        assert.equal(
          await frame.getByRole("combobox", { name: "Source account", exact: true }).inputValue(),
          "SAV-207",
        );
        assert.equal(
          await frame
            .getByRole("combobox", { name: "Destination account", exact: true })
            .inputValue(),
          "CHK-207",
        );
        changed = true;
      }
      await execute(runtime, step, artifact.bindings);
    }
    assert.equal(changed, true);
    const outputs = await extract(runtime);
    assert.deepEqual(outputs, {
      ...input,
      feeCents: 0,
      currency: "USD",
      reviewStatus: "AWAITING_CONFIRMATION",
    });
    runtime.evidence.finish({ status: "success", runId: runtime.evidence.runId, outputs });
    const manifest = Manifest.parse(
      JSON.parse(readFileSync(`${runtime.evidence.directory}/manifest.json`, "utf8")),
    );
    assert.equal(manifest.modelCalls, 0);
    assert.equal(manifest.reservedTokens, 0);
    assert.equal(manifest.artifactHash, hash);
    assert.equal(app.stats.commits, 0);
    assert.equal(app.stats.reviewRequests, 1);
    assert.equal(readFileSync(artifactPath, "utf8"), bytes);
    t.diagnostic(
      JSON.stringify({
        input,
        outputs,
        evidenceDirectory: runtime.evidence.directory,
        artifactHash: hash,
        commits: app.stats.commits,
        harness: "visible-DOM perturbation before recorded executor steps",
      }),
    );
  } finally {
    await runtime.close();
    await app.close();
  }
});
