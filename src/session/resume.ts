import type { Artifact, Step } from "../domain/artifact.js";
import { Fault } from "../domain/contract.js";
import { extract, matches } from "../surface/checks.js";
import { snapshot } from "../surface/snapshot.js";
import type { Runtime } from "./browser.js";
export function stepAnchor(
  runtime: Runtime,
  step: Step,
  bindings: Artifact["bindings"],
  index: number,
): void {
  runtime.session.anchor(async () => {
    runtime.check();
    const after = await matches(runtime, step.postconditions, bindings);
    const before = await matches(runtime, step.preconditions, bindings);
    if (after && before && step.operation.action === "click") return null;
    if (after) {
      if (step.postconditions.some((c) => c.kind === "screen" && c.screen === "review"))
        await extract(runtime);
      return index + 1;
    }
    return before ? index : null;
  });
}
export async function intervene(runtime: Runtime, step: Step): Promise<void> {
  runtime.evidence.snapshot(await snapshot(runtime.page));
  runtime.evidence.event({
    kind: "intervention",
    actor: "system",
    stepId: step.id,
    code: "HUMAN_REQUIRED",
    screen: "expired",
    recoveryScreen: step.postconditions.find((c) => c.kind === "screen")?.screen ?? "unknown",
    evidenceRef: "snapshot.safe.json",
  });
  await runtime.session.requestHuman();
}
export async function verifiedOutput(runtime: Runtime) {
  for (;;) {
    await runtime.session.ready();
    const epoch = runtime.session.epoch;
    try {
      const output = await extract(runtime);
      runtime.session.assert(epoch);
      return output;
    } catch (error) {
      if (!(error instanceof Fault) || error.code !== "OWNERSHIP_LOST") throw error;
    }
  }
}
