import { requireAccountBindings } from "../domain/account-bindings.js";
import type { Action, Binding, Decision } from "../domain/actions.js";
import {
  Artifact,
  type Condition,
  completion,
  contract,
  exceptions,
  type Step,
} from "../domain/artifact.js";
import { Fault } from "../domain/contract.js";
import { transitionScreens } from "../policy/profile.js";
import type { Observation } from "../surface/observe.js";
export function anchor(observation: Observation): Condition[] {
  return [
    { kind: "screen", screen: observation.screen },
    ...(observation.member
      ? [
          {
            kind: "member-equals",
            expected: { kind: "input", name: "memberId", transform: "identity" },
          } satisfies Condition,
        ]
      : []),
  ];
}
export class Recorder {
  readonly steps: Step[] = [];
  readonly bindings: Record<string, Binding> = {};
  private fields: Condition[] = [];
  private fieldScreen = "";
  prepare(decision: Decision, observation: Observation): Step {
    if (!("candidate" in decision)) throw new Fault("MODEL_INVALID");
    const candidate = observation.candidates.find((c) => c.id === decision.candidate);
    if (!candidate) throw new Fault("STALE_CANDIDATE");
    const index = String(this.steps.length + 1).padStart(3, "0");
    const targetRef = `target-${index}`;
    this.bindings[targetRef] = candidate.binding;
    if (this.fieldScreen !== observation.screen) {
      this.fields = [];
      this.fieldScreen = observation.screen;
    }
    const operation: Action =
      decision.action === "click"
        ? { action: "click", targetRef }
        : { action: decision.action, targetRef, value: decision.value };
    const before = [
      ...anchor(observation),
      ...this.fields,
      { kind: "visible", targetRef } satisfies Condition,
    ];
    const label =
      candidate.binding.strategy === "role" && candidate.binding.name.kind === "literal"
        ? candidate.binding.name.text
        : "";
    const nextScreen = transitionScreens[label];
    const clickPost: Condition[] = nextScreen
      ? [
          { kind: "screen", screen: nextScreen },
          {
            kind: "member-equals",
            expected: { kind: "input", name: "memberId", transform: "identity" },
          },
        ]
      : [];
    const after =
      operation.action === "click"
        ? clickPost
        : [
            ...anchor(observation),
            ...this.fields,
            { kind: "value-equals", targetRef, expected: operation.value } satisfies Condition,
          ];
    return { id: `step-${index}`, operation, preconditions: before, postconditions: after };
  }
  completed(step: Step, after: Observation): void {
    const post = step.postconditions.length ? step.postconditions : anchor(after);
    this.steps.push({ ...step, postconditions: post });
    if (step.operation.action !== "click")
      this.fields = post.filter((c) => c.kind === "value-equals");
  }
  artifact(provenance: Artifact["provenance"]): Artifact {
    const artifact = Artifact.parse({
      schemaVersion: 1,
      capabilityId: "prepare-transfer-review",
      capabilityVersion: 1,
      description: "Prepare the supplied member transfer and stop at verified review",
      profile: { id: "synthetic-bank", version: 1, policy: "review-only-v1" },
      surface: ["iframe-role", "table-label"],
      contract,
      exceptions,
      completion,
      bindings: this.bindings,
      steps: this.steps,
      provenance,
    });
    requireAccountBindings(artifact);
    return artifact;
  }
}
