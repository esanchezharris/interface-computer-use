import type { Expression } from "./actions.js";
import type { Artifact } from "./artifact.js";
import { Fault } from "./contract.js";

const roles = [
  ["Source account", "sourceAccountRef"],
  ["Destination account", "destinationAccountRef"],
] as const;
function references(value: Expression, name: string): boolean {
  return value.kind === "input" && value.name === name && value.transform === "identity";
}
export type AccountInput = (typeof roles)[number][1];
export function recordedAccountInputs(
  artifact: Pick<Artifact, "steps" | "bindings">,
): AccountInput[] {
  const inputs: AccountInput[] = [];
  for (const [label, input] of roles) {
    let established = false;
    for (const step of artifact.steps) {
      const operation = step.operation;
      const binding = artifact.bindings[operation.targetRef];
      if (
        binding?.strategy !== "role" ||
        binding.role !== "combobox" ||
        binding.name.kind !== "literal" ||
        binding.name.text !== label
      )
        continue;
      if (
        operation.action !== "select" ||
        !references(operation.value, input) ||
        !step.postconditions.some(
          (condition) =>
            condition.kind === "value-equals" &&
            condition.targetRef === operation.targetRef &&
            references(condition.expected, input),
        )
      )
        throw new Fault("RECORDING_INCOMPLETE");
      established = true;
    }
    if (established) inputs.push(input);
  }
  return inputs;
}
export function requireAccountBindings(artifact: Artifact): void {
  if (recordedAccountInputs(artifact).length !== roles.length)
    throw new Fault("RECORDING_INCOMPLETE");
}
