import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { errors } from "playwright";
import "../../scripts/model-bomb.js";
import { startSandbox } from "../../sandbox/server.js";
import { reorderedPage } from "../../scripts/final-fixtures.js";
import { Artifact } from "../../src/domain/artifact.js";
import { replay } from "../../src/replay/run.js";
import { artifactPath } from "../artifact-path.js";

const artifactBytes = readFileSync(artifactPath, "utf8");
const artifact = Artifact.parse(JSON.parse(artifactBytes));
const input = {
  memberId: "M-207",
  sourceAccountRef: "CHK-207",
  destinationAccountRef: "SAV-207",
  amountCents: 3985,
};
const options = {
  artifactBytes,
  input,
  evidenceRoot: ".runs/tests",
  actor: "automation",
  operator: false,
  headed: false,
  waitMs: 1000,
} as const;
for (const scenario of [
  "reordered defaults through replay entry point",
  "timeout after actual review action",
] as const)
  test(`final robustness: ${scenario}`, async (t) => {
    let alteredPage = false;
    let reportedTimeout = false;
    const app = await startSandbox({
      port: 0,
      ...(scenario.startsWith("reordered")
        ? {
            transformPage: (html: string) => {
              if (html.includes('<select id="source"')) alteredPage = true;
              return reorderedPage(html);
            },
          }
        : {}),
    });
    try {
      const run = await replay({
        ...options,
        origin: app.origin,
        onRuntime: (runtime) => {
          if (scenario.startsWith("timeout")) {
            let atReview = false;
            const emit = runtime.evidence.event.bind(runtime.evidence);
            t.mock.method(runtime.evidence, "event", (event: Parameters<typeof emit>[0]) => {
              emit(event);
              if (event.kind === "action-start") {
                const step = artifact.steps.find((s) => s.id === event.stepId);
                const target = step && artifact.bindings[step.operation.targetRef];
                atReview =
                  target?.strategy === "role" &&
                  target.name.kind === "literal" &&
                  target.name.text === "Review transfer";
              }
            });
            const dispatch = runtime.session.dispatch.bind(runtime.session);
            runtime.session.dispatch = async (operation, epoch) => {
              const result = await dispatch(operation, epoch);
              if (atReview && !reportedTimeout) {
                reportedTimeout = true;
                throw new errors.TimeoutError(
                  "Synthetic transport timeout after completed UI action",
                );
              }
              return result;
            };
          }
        },
      });
      assert.equal(run.result.status, "success");
      if (run.result.status === "success")
        assert.deepEqual(run.result.outputs, {
          ...input,
          feeCents: 0,
          currency: "USD",
          reviewStatus: "AWAITING_CONFIRMATION",
        });
      assert.equal(app.stats.reviewRequests, 1);
      assert.equal(app.stats.commits, 0);
      const events = readFileSync(`${run.evidenceDirectory}/events.jsonl`, "utf8");
      if (scenario.startsWith("timeout")) {
        assert.equal(reportedTimeout, true);
        assert.match(events, /"kind":"recovery"/);
      } else assert.equal(alteredPage, true);
      assert.equal(readFileSync(artifactPath, "utf8"), artifactBytes);
    } finally {
      await app.close();
    }
  });
