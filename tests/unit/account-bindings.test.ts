import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Artifact } from "../../src/domain/artifact.js";
import { Fault } from "../../src/domain/contract.js";
import { Recorder } from "../../src/recording/recorder.js";

const fixture = Artifact.parse(
  JSON.parse(readFileSync("artifacts/development-fixture.json", "utf8")),
);
function record(artifact: Artifact): Recorder {
  const recorder = new Recorder();
  Object.assign(recorder.bindings, artifact.bindings);
  recorder.steps.push(...artifact.steps);
  return recorder;
}
const incomplete = (error: unknown) =>
  error instanceof Fault && error.code === "RECORDING_INCOMPLETE";
test("account contract and completion references alone cannot qualify missing executed selections", () => {
  const old = Artifact.parse(
    JSON.parse(readFileSync("artifacts/historical/prepare-transfer-294a274e.json", "utf8")),
  );
  assert.throws(() => record(old).artifact(old.provenance), incomplete);
});
test("both executed symbolic account selections with checked results qualify", () => {
  assert.deepEqual(record(fixture).artifact(fixture.provenance), fixture);
});
for (const corruption of [
  "missing-source",
  "missing-destination",
  "swapped-inputs",
  "swapped-controls",
  "missing-result-check",
  "uncompleted",
] as const)
  test(`account binding qualification rejects ${corruption}`, () => {
    const candidate = structuredClone(fixture);
    for (const step of candidate.steps) {
      if (step.operation.action !== "select") continue;
      if (corruption === "missing-result-check")
        step.postconditions = [{ kind: "screen", screen: "transfer" }];
      if (corruption === "swapped-inputs" && step.operation.value.kind === "input") {
        const value = {
          kind: "input",
          name:
            step.operation.value.name === "sourceAccountRef"
              ? "destinationAccountRef"
              : "sourceAccountRef",
          transform: "identity",
        } as const;
        step.operation.value = value;
        for (const c of step.postconditions)
          if (c.kind === "value-equals" && c.targetRef === step.operation.targetRef)
            c.expected = value;
      }
      const binding = candidate.bindings[step.operation.targetRef];
      if (
        corruption === "swapped-controls" &&
        binding?.strategy === "role" &&
        binding.name.kind === "literal"
      )
        binding.name.text =
          binding.name.text === "Source account" ? "Destination account" : "Source account";
    }
    candidate.steps = candidate.steps.filter((step) => {
      if (step.operation.action !== "select") return true;
      if (corruption === "uncompleted") return false;
      return !(
        step.operation.value.kind === "input" &&
        ((corruption === "missing-source" && step.operation.value.name === "sourceAccountRef") ||
          (corruption === "missing-destination" &&
            step.operation.value.name === "destinationAccountRef"))
      );
    });
    assert.throws(() => record(candidate).artifact(candidate.provenance), incomplete);
  });
