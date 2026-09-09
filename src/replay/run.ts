import { createHash } from "node:crypto";
import { Artifact } from "../domain/artifact.js";
import { Fault, InputSchema, type RunResult } from "../domain/contract.js";
import { Runtime, type RuntimeOptions } from "../session/browser.js";
import { intervene, stepAnchor, verifiedOutput } from "../session/resume.js";
import { waitStable } from "../surface/checks.js";
import { execute } from "../surface/executor.js";
import { failedResult } from "./result.js";
export type ReplayOptions = Omit<
  RuntimeOptions,
  "input" | "mode" | "artifactHash" | "provenance"
> & {
  readonly artifactBytes: string;
  readonly input: unknown;
  readonly onRuntime?: (runtime: Runtime) => void;
};
export async function replay(
  options: ReplayOptions,
): Promise<{ result: RunResult; evidenceDirectory: string; artifactHash: string }> {
  const input = InputSchema.parse(options.input);
  const artifact = Artifact.parse(JSON.parse(options.artifactBytes));
  const artifactHash = createHash("sha256").update(options.artifactBytes).digest("hex");
  const runtime = await Runtime.create({
    ...options,
    input,
    mode: "replay",
    provenance: artifact.provenance.origin,
    artifactHash,
  });
  let index = 0;
  let result: RunResult;
  try {
    try {
      options.onRuntime?.(runtime);
      while (index < artifact.steps.length) {
        await runtime.session.ready();
        index = runtime.session.consumeContinuation() ?? index;
        const stepIndex = index;
        const step = artifact.steps[index];
        if (!step) break;
        stepAnchor(runtime, step, artifact.bindings, stepIndex);
        try {
          await waitStable(runtime);
          await execute(runtime, step, artifact.bindings);
          index++;
        } catch (error) {
          if (error instanceof Fault && error.code === "HUMAN_REQUIRED") {
            await intervene(runtime, step);
            index = runtime.session.consumeContinuation() ?? index;
          } else if (error instanceof Fault && error.code === "OWNERSHIP_LOST") {
            await runtime.session.ready();
            index = runtime.session.consumeContinuation() ?? index;
          } else throw error;
        }
      }
      runtime.check();
      result = {
        status: "success",
        runId: runtime.evidence.runId,
        outputs: await verifiedOutput(runtime),
      };
    } catch (error) {
      result = await failedResult(runtime, error, artifact.steps[index]?.id ?? null);
    }
    runtime.evidence.finish(result);
    return { result, evidenceDirectory: runtime.evidence.directory, artifactHash };
  } finally {
    await runtime.close();
  }
}
