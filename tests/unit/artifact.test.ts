import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Artifact } from "../../src/domain/artifact.js";
import { replay } from "../../src/replay/run.js";

const artifact = Artifact.parse(
  JSON.parse(readFileSync("artifacts/development-fixture.json", "utf8")),
);
test("A04 artifact rejects unknown versions bindings transforms and references", () => {
  // Given malformed artifact variants; When parsing; Then fail before any UI access.
  const first = artifact.steps[0];
  assert.ok(first);
  for (const value of [
    { ...artifact, schemaVersion: 2 },
    { ...artifact, extra: true },
    { ...artifact, bindings: { "target-001": { strategy: "css", selector: "body" } } },
    {
      ...artifact,
      steps: [
        {
          ...first,
          operation: {
            action: "fill",
            targetRef: "target-999",
            value: { kind: "input", name: "memberId", transform: "identity" },
          },
        },
      ],
    },
    {
      ...artifact,
      steps: [
        {
          ...first,
          operation: {
            action: "fill",
            targetRef: "target-001",
            value: { kind: "input", name: "amountCents", transform: "identity" },
          },
        },
      ],
    },
    { ...artifact, provenance: { ...artifact.provenance, origin: "live-model" } },
    { ...artifact, profile: { ...artifact.profile, policy: "allow-commit" } },
  ])
    assert.equal(Artifact.safeParse(value).success, false);
});
test("A04 invocation and artifact validation precede browser creation", async () => {
  // Given invalid input and an unreachable origin; When invoking; Then no runtime callback occurs.
  let opened = false;
  await assert.rejects(
    replay({
      artifactBytes: JSON.stringify(artifact),
      input: { amountCents: -1 },
      origin: "http://127.0.0.1:1",
      evidenceRoot: ".runs/tests",
      actor: "automation",
      operator: false,
      headed: false,
      onRuntime: () => {
        opened = true;
      },
    }),
  );
  assert.equal(opened, false);
});
