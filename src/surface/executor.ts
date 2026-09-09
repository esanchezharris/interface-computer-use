import { errors } from "playwright";
import { Action, type Binding, resolveExpression } from "../domain/actions.js";
import type { Step } from "../domain/artifact.js";
import { Fault, unreachable } from "../domain/contract.js";
import { authorize, permittedRequest } from "../policy/profile.js";
import type { Runtime } from "../session/browser.js";
import { current, waitConditions, waitTransition } from "./checks.js";
import { effectOf, uniqueTarget } from "./target.js";
export async function execute(
  runtime: Runtime,
  step: Step,
  bindings: Readonly<Record<string, Binding>>,
): Promise<void> {
  const operation = Action.parse(step.operation);
  const before = await current(runtime);
  const epoch = runtime.session.epoch;
  runtime.session.assert(epoch);
  runtime.check();
  const binding = bindings[operation.targetRef];
  if (!binding) throw new Fault("CONTRACT_INVALID");
  runtime.expectedScreen = step.preconditions.find((c) => c.kind === "screen")?.screen ?? "unknown";
  await waitConditions(runtime, step.preconditions, bindings);
  const target = await uniqueTarget(runtime.page, binding, runtime.options.input);
  const effect = await effectOf(target);
  authorize(binding, operation.action, effect);
  if (
    operation.action === "click" &&
    (effect.href || effect.formAction) &&
    !permittedRequest(
      effect.href || effect.formAction,
      effect.href ? "GET" : effect.method,
      runtime.options.origin,
    )
  )
    throw new Fault("POLICY_DENIED");
  runtime.session.assert(epoch);
  runtime.check();
  runtime.evidence.event({
    kind: "action-start",
    actor: "automation",
    stepId: step.id,
    action: operation.action,
    strategy: binding.strategy,
    reason: operation.action === "click" ? "advance" : "supply-input",
  });
  try {
    await runtime.session.dispatch(async () => {
      switch (operation.action) {
        case "click":
          await target.click({ timeout: runtime.actionMs });
          break;
        case "fill":
          if (!(await target.isEditable())) throw new Fault("TARGET_INVALID");
          runtime.session.assert(epoch);
          await target.fill(resolveExpression(operation.value, runtime.options.input), {
            timeout: runtime.actionMs,
          });
          break;
        case "select":
          await target.selectOption(
            { label: resolveExpression(operation.value, runtime.options.input) },
            { timeout: runtime.actionMs },
          );
          break;
        default:
          return unreachable(operation);
      }
    }, epoch);
    runtime.completedDispatches.add(step.id);
  } catch (error) {
    runtime.check();
    runtime.session.assert(epoch);
    if (!(error instanceof errors.TimeoutError)) throw error;
    // A timed-out click may have executed. Only its declared postcondition may reconcile it.
    if (!step.postconditions.length) throw new Fault("LOAD_TIMEOUT");
    await waitConditions(runtime, step.postconditions, bindings);
    runtime.evidence.event({
      kind: "recovery",
      actor: "system",
      stepId: step.id,
      reason: "observe-change",
    });
  }
  runtime.check();
  runtime.session.assert(epoch);
  if (step.postconditions.length) await waitConditions(runtime, step.postconditions, bindings);
  else await waitTransition(runtime, before.screen);
  const after = await current(runtime);
  runtime.session.assert(epoch);
  runtime.evidence.event({
    kind: "action-complete",
    actor: "automation",
    stepId: step.id,
    screen: after.screen,
    action: operation.action,
    strategy: binding.strategy,
  });
}
