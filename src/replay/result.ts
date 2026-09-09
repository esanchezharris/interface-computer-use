import { BusinessOutcome, Fault, type RunResult } from "../domain/contract.js";
import type { Runtime } from "../session/browser.js";
import { snapshot } from "../surface/snapshot.js";
export async function failedResult(
  runtime: Runtime,
  error: unknown,
  stepId: string | null,
): Promise<RunResult> {
  if (error instanceof BusinessOutcome)
    return {
      status: "business_outcome",
      runId: runtime.evidence.runId,
      code: error.code,
      stepId: stepId ?? "step-000",
    };
  const code = error instanceof Fault ? error.code : "BROWSER_ERROR";
  if (code === "ABORTED")
    return { status: "aborted", runId: runtime.evidence.runId, reasonCode: "ABORTED" };
  runtime.evidence.event({
    kind: "exception",
    actor: "system",
    code,
    ...(stepId ? { stepId } : {}),
  });
  const refs: ("snapshot.safe.json" | "events.jsonl")[] = ["events.jsonl"];
  try {
    runtime.evidence.snapshot(await snapshot(runtime.page));
    refs.push("snapshot.safe.json");
  } catch (snapshotError) {
    if (snapshotError instanceof Fault && snapshotError.code === "EVIDENCE_WRITE_FAILED")
      throw snapshotError;
  }
  return {
    status: "failed",
    runId: runtime.evidence.runId,
    code,
    stepId,
    expected: { screen: runtime.expectedScreen, check: "checkpoint", redacted: true },
    observed: { screen: runtime.lastScreen, check: "runtime", redacted: true },
    evidenceRefs: refs,
  };
}
