import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { startSandbox } from "../../sandbox/server.js";
import { Artifact } from "../../src/domain/artifact.js";
import { Fault } from "../../src/domain/contract.js";
import { Runtime } from "../../src/session/browser.js";
import { execute } from "../../src/surface/executor.js";
import { workspace } from "../../src/surface/observe.js";
import { artifactPath } from "../artifact-path.js";

const artifact = Artifact.parse(JSON.parse(readFileSync(artifactPath, "utf8")));
for (const scenario of ["no-form", "button-type", "search-method", "review-method"] as const) {
  test(`A11 unknown click effect ${scenario} is denied before activation`, async () => {
    // Given a trusted label whose actual control effect changed; Then deny before any activation.
    const app = await startSandbox({ port: 0 });
    const runtime = await Runtime.create({
      origin: app.origin,
      input: {
        memberId: "M-207",
        sourceAccountRef: "CHK-207",
        destinationAccountRef: "SAV-207",
        amountCents: 3750,
      },
      mode: "replay",
      provenance: "development-fixture",
      artifactHash: null,
      actor: "test_operator",
      operator: false,
      headed: false,
      evidenceRoot: ".runs/tests",
      waitMs: 500,
    });
    try {
      const label = scenario === "review-method" ? "Review transfer" : "Search";
      const index = artifact.steps.findIndex((step) => {
        const binding = artifact.bindings[step.operation.targetRef];
        return (
          binding?.strategy === "role" &&
          binding.name.kind === "literal" &&
          binding.name.text === label
        );
      });
      assert.ok(index >= 0);
      for (const step of artifact.steps.slice(0, index))
        await execute(runtime, step, artifact.bindings);
      const frame = workspace(runtime.page);
      await frame.getByRole("button", { name: label, exact: true }).evaluate((button, fault) => {
        button.addEventListener("click", () => document.body.setAttribute("data-activated", "yes"));
        if (fault === "no-form") document.body.append(button);
        if (fault === "no-form" || fault === "button-type") button.setAttribute("type", "button");
        if (fault === "search-method") button.setAttribute("formmethod", "post");
        if (fault === "review-method") button.setAttribute("formmethod", "get");
      }, scenario);
      const step = artifact.steps[index];
      assert.ok(step);
      await assert.rejects(
        execute(runtime, step, artifact.bindings),
        (error) => error instanceof Fault && error.code === "POLICY_DENIED",
      );
      assert.equal(await frame.locator("body").getAttribute("data-activated"), null);
      assert.equal(app.stats.reviewRequests, 0);
      assert.equal(app.stats.commits, 0);
      if (label === "Search") assert.equal(app.stats.searchRequests, 0);
    } finally {
      await runtime.close();
      await app.close();
    }
  });
}
