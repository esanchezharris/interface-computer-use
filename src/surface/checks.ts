import { setTimeout as pause } from "node:timers/promises";
import { errors } from "playwright";
import { type Binding, resolveExpression } from "../domain/actions.js";
import type { Condition } from "../domain/artifact.js";
import {
  BusinessOutcome,
  Fault,
  OutputSchema,
  type TransferOutput,
  unreachable,
} from "../domain/contract.js";
import { parseUSD } from "../domain/money.js";
import type { Runtime } from "../session/browser.js";
import { type Observation, observe, workspace } from "./observe.js";
import { locator } from "./target.js";
export function classify(observation: Observation): void {
  switch (observation.screen) {
    case "not-found":
      throw new BusinessOutcome("MEMBER_NOT_FOUND");
    case "insufficient":
      throw new BusinessOutcome("INSUFFICIENT_FUNDS");
    case "validation":
      throw new BusinessOutcome("VALIDATION_REJECTED");
    case "permission":
      throw new Fault("PERMISSION_DENIED");
    case "app-error":
      throw new Fault("APP_ERROR");
    case "expired":
      throw new Fault("HUMAN_REQUIRED");
    case "search":
    case "member":
    case "accounts":
    case "transfer":
    case "review":
    case "loading":
    case "unknown":
      return;
    default:
      unreachable(observation.screen);
  }
}
export async function current(runtime: Runtime): Promise<Observation> {
  const deadline = performance.now() + runtime.waitMs;
  do {
    runtime.check();
    try {
      const obs = await observe(runtime.page, runtime.options.input);
      runtime.lastScreen = obs.screen;
      return obs;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !/Execution context was destroyed|Cannot find context with specified id/.test(error.message)
      )
        throw error;
      runtime.evidence.event({ kind: "recovery", actor: "system", reason: "observe-change" });
      await pause(25);
    }
  } while (performance.now() < deadline);
  throw new Fault("LOAD_TIMEOUT");
}
export async function waitStable(runtime: Runtime): Promise<Observation> {
  const deadline = performance.now() + runtime.waitMs;
  let recovered = false;
  do {
    try {
      const obs = await current(runtime);
      classify(obs);
      if (obs.screen !== "loading" && obs.screen !== "unknown") {
        if (recovered)
          runtime.evidence.event({
            kind: "recovery",
            actor: "system",
            screen: obs.screen,
            reason: "observe-change",
          });
        return obs;
      }
      recovered = true;
    } catch (error) {
      if (!(error instanceof errors.TimeoutError)) throw error;
    }
    await pause(25);
  } while (performance.now() < deadline);
  throw new Fault("LOAD_TIMEOUT");
}
export async function matches(
  runtime: Runtime,
  conditions: readonly Condition[],
  bindings: Readonly<Record<string, Binding>>,
): Promise<boolean> {
  const obs = await current(runtime);
  classify(obs);
  for (const condition of conditions) {
    switch (condition.kind) {
      case "screen":
        if (obs.screen !== condition.screen) return false;
        break;
      case "member-equals":
        if (obs.member !== runtime.options.input.memberId) return false;
        break;
      case "visible":
      case "value-equals": {
        const binding = bindings[condition.targetRef];
        if (!binding) throw new Fault("CONTRACT_INVALID");
        const target = locator(runtime.page, binding, runtime.options.input);
        const count = await target.count();
        if (count > 1) throw new Fault("TARGET_AMBIGUOUS");
        if (count === 0 || !(await target.isVisible())) return false;
        if (condition.kind === "value-equals") {
          const value = await target.evaluate((e) =>
            e instanceof HTMLSelectElement
              ? (e.selectedOptions[0]?.textContent?.trim() ?? "")
              : e instanceof HTMLInputElement
                ? e.value
                : "",
          );
          if (value !== resolveExpression(condition.expected, runtime.options.input)) return false;
        }
        break;
      }
      default:
        return unreachable(condition);
    }
  }
  return true;
}
export async function waitConditions(
  runtime: Runtime,
  conditions: readonly Condition[],
  bindings: Readonly<Record<string, Binding>>,
): Promise<void> {
  const deadline = performance.now() + runtime.waitMs;
  let waited = false;
  do {
    const obs = await current(runtime);
    classify(obs);
    if (await matches(runtime, conditions, bindings)) {
      if (waited)
        runtime.evidence.event({
          kind: "recovery",
          actor: "system",
          reason: "observe-change",
          screen: obs.screen,
        });
      return;
    }
    waited = true;
    await pause(25);
  } while (performance.now() < deadline);
  const obs = await current(runtime);
  for (const condition of conditions)
    if (condition.kind === "visible") {
      const binding = bindings[condition.targetRef];
      if (binding && (await locator(runtime.page, binding, runtime.options.input).count()) === 0)
        throw new Fault("TARGET_NOT_FOUND");
    }
  throw new Fault(obs.screen === "loading" ? "LOAD_TIMEOUT" : "CHECKPOINT_MISMATCH");
}
export async function extract(runtime: Runtime): Promise<TransferOutput> {
  runtime.expectedScreen = "review";
  const obs = await current(runtime);
  classify(obs);
  if (obs.screen !== "review") throw new Fault("CHECKPOINT_MISMATCH");
  const frame = workspace(runtime.page);
  const table = await frame.getByRole("table").evaluateAll((tables) =>
    tables.flatMap((table) =>
      Array.from(table.querySelectorAll("tr"))
        .filter(
          (row) =>
            row.getClientRects().length > 0 &&
            getComputedStyle(row).visibility !== "hidden" &&
            Array.from(row.cells).every(
              (cell) =>
                cell.getClientRects().length > 0 && getComputedStyle(cell).visibility !== "hidden",
            ),
        )
        .map((row) => ({
          label: row.cells[0]?.innerText.trim() ?? "",
          value: row.cells[1]?.innerText.trim() ?? "",
        })),
    ),
  );
  const get = (label: string) => {
    const rows = table.filter((r) => r.label === label);
    if (rows.length !== 1) throw new Fault("OUTPUT_INVALID");
    return rows[0]?.value ?? "";
  };
  const parsed = OutputSchema.safeParse({
    memberId: get("Member ID"),
    sourceAccountRef: get("Source account"),
    destinationAccountRef: get("Destination account"),
    amountCents: parseUSD(get("Amount USD")),
    feeCents: parseUSD(get("Fee USD")),
    currency: get("Currency"),
    reviewStatus: get("Review status"),
  });
  if (!parsed.success) throw new Fault("OUTPUT_INVALID");
  const output = parsed.data;
  for (const field of [
    "memberId",
    "sourceAccountRef",
    "destinationAccountRef",
    "amountCents",
  ] as const)
    if (output[field] !== runtime.options.input[field]) throw new Fault("CHECKPOINT_MISMATCH");
  if (output.feeCents !== 0) throw new Fault("CHECKPOINT_MISMATCH");
  return output;
}
export async function waitTransition(
  runtime: Runtime,
  before: Observation["screen"],
): Promise<Observation> {
  const deadline = performance.now() + runtime.waitMs;
  let loading = false;
  do {
    const obs = await current(runtime);
    classify(obs);
    if (obs.screen === "loading") loading = true;
    if (obs.screen !== before && obs.screen !== "loading" && obs.screen !== "unknown") {
      if (loading)
        runtime.evidence.event({
          kind: "recovery",
          actor: "system",
          screen: obs.screen,
          reason: "observe-change",
        });
      return obs;
    }
    await pause(25);
  } while (performance.now() < deadline);
  throw new Fault(loading ? "LOAD_TIMEOUT" : "NO_PROGRESS");
}
