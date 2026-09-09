import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { Artifact } from "../../src/domain/artifact.js";
import { Fault } from "../../src/domain/contract.js";
import { Runtime } from "../../src/session/browser.js";
import { extract } from "../../src/surface/checks.js";
import { execute } from "../../src/surface/executor.js";
import { workspace } from "../../src/surface/observe.js";
import { artifactPath } from "../artifact-path.js";

const input = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3750,
};
const options = {
  input,
  evidenceRoot: ".runs/tests",
  actor: "test_operator",
  operator: true,
  headed: false,
  mode: "replay",
  provenance: "development-fixture",
  artifactHash: null,
  waitMs: 500,
} as const;
const bytes = readFileSync(artifactPath, "utf8");
const artifact = Artifact.parse(JSON.parse(bytes));
test("A03 keyless CLI replay runs with a fatal model import hook and immutable artifact", async () => {
  // Given an actual subprocess with provider keys removed and a model import bomb.
  const app = await startSandbox({ port: 0 });
  try {
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !/OPENAI|ANTHROPIC|API_KEY|CUA_/.test(key)),
    );
    const child = spawn(
      process.execPath,
      [
        "--import",
        "./dist/scripts/model-bomb.js",
        "dist/src/cli/replay.js",
        "--artifact",
        artifactPath,
        "--inputs",
        "examples/member-b.json",
        "--origin",
        app.origin,
      ],
      { env, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c: Buffer) => {
      stdout += c.toString();
    });
    child.stderr.on("data", (c: Buffer) => {
      stderr += c.toString();
    });
    // When executing the real UI; Then the bomb remains unused and outputs are current.
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    assert.equal(code, 0);
    assert.equal(JSON.parse(stdout).outputs.amountCents, 3750);
    assert.equal(stderr.includes("MODEL_IMPORT_FORBIDDEN"), false);
    assert.equal(app.stats.commits, 0);
    assert.equal(
      createHash("sha256").update(readFileSync(artifactPath)).digest("hex"),
      createHash("sha256").update(bytes).digest("hex"),
    );
  } finally {
    await app.close();
  }
});
test("A11 semantic final-submit proposal and human route request are blocked", async () => {
  // Given the real review screen and final submit button.
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({ ...options, origin: app.origin });
  try {
    for (const step of artifact.steps) await execute(runtime, step, artifact.bindings);
    // When proposing submit; Then deny before the application observes any commit.
    await assert.rejects(
      execute(
        runtime,
        {
          id: "step-009",
          operation: { action: "click", targetRef: "target-009" },
          preconditions: [{ kind: "screen", screen: "review" }],
          postconditions: [{ kind: "screen", screen: "review" }],
        },
        {
          ...artifact.bindings,
          "target-009": {
            strategy: "role",
            frame: "Workspace",
            role: "button",
            name: { kind: "literal", text: "Submit transfer" },
          },
        },
      ),
      (e) => e instanceof Fault && e.code === "POLICY_DENIED",
    );
    await runtime.session.takeover();
    await assert.rejects(workspace(runtime.page).goto(`${app.origin}/commit`));
    assert.throws(
      () => runtime.check(),
      (e) => e instanceof Fault && e.code === "POLICY_DENIED",
    );
    assert.equal(app.stats.commits, 0);
  } finally {
    await runtime.close();
    await app.close();
  }
});
test("A10 hidden review values are not accepted as displayed output", async () => {
  // Given a real review whose fee row becomes hidden; When extracting; Then reject it.
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({ ...options, origin: app.origin });
  try {
    for (const step of artifact.steps) await execute(runtime, step, artifact.bindings);
    await workspace(runtime.page)
      .getByRole("row", { name: "Fee USD 0.00", exact: true })
      .evaluate((row) => {
        row.setAttribute("hidden", "");
      });
    await assert.rejects(
      extract(runtime),
      (e) => e instanceof Fault && e.code === "OUTPUT_INVALID",
    );
    await workspace(runtime.page)
      .locator("tr[hidden]")
      .evaluate((row) => {
        row.removeAttribute("hidden");
        const cell = row.querySelector("td");
        if (cell) {
          const hidden = document.createElement("span");
          hidden.hidden = true;
          hidden.textContent = cell.textContent;
          cell.replaceChildren(hidden);
        }
      });
    await assert.rejects(
      extract(runtime),
      (e) => e instanceof Fault && e.code === "OUTPUT_INVALID",
    );
  } finally {
    await runtime.close();
    await app.close();
  }
});
test("A11 button-specific formaction override is checked before activation", async () => {
  // Given an otherwise safe review form with a forbidden submitter override.
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({ ...options, origin: app.origin });
  try {
    const reviewIndex = artifact.steps.findIndex((step) => {
      const b = artifact.bindings[step.operation.targetRef];
      return (
        b?.strategy === "role" && b.name.kind === "literal" && b.name.text === "Review transfer"
      );
    });
    assert.ok(reviewIndex >= 0);
    for (const step of artifact.steps.slice(0, reviewIndex))
      await execute(runtime, step, artifact.bindings);
    await workspace(runtime.page)
      .getByRole("button", { name: "Review transfer", exact: true })
      .evaluate((button) => {
        button.setAttribute("formaction", "/commit");
      });
    const review = artifact.steps[reviewIndex];
    assert.ok(review);
    // When executing; Then no click or forbidden request reaches the server.
    await assert.rejects(
      execute(runtime, review, artifact.bindings),
      (e) => e instanceof Fault && e.code === "POLICY_DENIED",
    );
    assert.equal(app.stats.commits, 0);
    assert.equal(app.stats.reviewRequests, 0);
  } finally {
    await runtime.close();
    await app.close();
  }
});
test("A12 a DOM dialog cannot silently coexist with successful replay", async () => {
  // Given a visible unrecognized DOM modal; When observing; Then stop safely.
  const app = await startSandbox({ port: 0 });
  const runtime = await Runtime.create({ ...options, origin: app.origin });
  try {
    await workspace(runtime.page)
      .locator("body")
      .evaluate((body) => {
        const dialog = document.createElement("div");
        dialog.setAttribute("role", "dialog");
        dialog.textContent = "Unknown confirmation";
        body.append(dialog);
      });
    const first = artifact.steps[0];
    assert.ok(first);
    await assert.rejects(
      execute(runtime, first, artifact.bindings),
      (e) => e instanceof Fault && e.code === "UNEXPECTED_MODAL",
    );
    assert.equal(app.stats.searchRequests, 0);
  } finally {
    await runtime.close();
    await app.close();
  }
});
