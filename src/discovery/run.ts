import { createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { Decision } from "../domain/actions.js";
import type { Artifact, Step } from "../domain/artifact.js";
import { Fault, InputSchema, type RunResult } from "../domain/contract.js";
import { anchor, Recorder } from "../recording/recorder.js";
import { failedResult } from "../replay/result.js";
import { Runtime, type RuntimeOptions } from "../session/browser.js";
import { intervene, stepAnchor } from "../session/resume.js";
import { current, extract, matches, waitStable } from "../surface/checks.js";
import { execute } from "../surface/executor.js";
import type { Model } from "./model.js";
export type DiscoveryOptions = Omit<
  RuntimeOptions,
  "input" | "mode" | "artifactHash" | "provenance"
> & {
  readonly goal: string;
  readonly input: unknown;
  readonly model: Model;
  readonly outputPath?: string;
  readonly onRuntime?: (runtime: Runtime) => void;
};
async function recordedAction(runtime: Runtime, recorder: Recorder, step: Step): Promise<void> {
  const index = recorder.steps.length;
  stepAnchor(runtime, step, recorder.bindings, index);
  try {
    await execute(runtime, step, recorder.bindings);
  } catch (error) {
    if (error instanceof Fault && error.code === "HUMAN_REQUIRED") await intervene(runtime, step);
    else if (error instanceof Fault && error.code === "OWNERSHIP_LOST")
      await runtime.session.ready();
    else throw error;
    const next = runtime.session.consumeContinuation();
    if (next === index) return;
    if (next !== index + 1 || !runtime.completedDispatches.has(step.id))
      throw new Fault("RECORDING_INCOMPLETE");
  }
  const after = await current(runtime);
  runtime.session.assert(runtime.session.epoch);
  if (!(await matches(runtime, step.postconditions, recorder.bindings)))
    throw new Fault("CHECKPOINT_MISMATCH");
  recorder.completed(step, after);
}
export async function discover(
  options: DiscoveryOptions,
): Promise<{ result: RunResult; artifact: Artifact | null; evidenceDirectory: string }> {
  const input = InputSchema.parse(options.input);
  if (options.outputPath && existsSync(options.outputPath)) throw new Fault("CONTRACT_INVALID");
  if (!options.goal.trim() || options.goal.length > 2000) throw new Fault("CONTRACT_INVALID");
  const runtime = await Runtime.create({
    ...options,
    input,
    mode: "discovery",
    provenance: options.model.origin,
    artifactHash: null,
  });
  const recorder = new Recorder();
  let correction = false;
  let repetitions = 0;
  let signature = "";
  try {
    options.onRuntime?.(runtime);
    for (let requests = 0; requests < 32; requests++) {
      await runtime.session.ready();
      const remaining =
        120000 - (performance.now() - runtime.startedAt - runtime.session.pausedDuration());
      if (remaining <= 0 || recorder.steps.length >= 30) throw new Fault("RUN_TIMEOUT");
      const obs = await waitStable(runtime);
      const epoch = runtime.session.epoch;
      const state = JSON.stringify({
        screen: obs.screen,
        member: obs.member,
        controls: obs.controls.map((c) => ({ name: c.name, value: c.value })),
      });
      repetitions = state === signature ? repetitions + 1 : 0;
      signature = state;
      if (repetitions >= 3) throw new Fault("NO_PROGRESS");
      runtime.session.anchor(async () =>
        (await matches(runtime, anchor(obs), recorder.bindings)) ? recorder.steps.length : null,
      );
      runtime.evidence.event({
        kind: "model-request",
        actor: "system",
        screen: obs.screen,
        ...options.model.usage(),
      });
      const proposal = await options.model.decide({
        goal: options.goal,
        input,
        observation: obs,
        correction,
        timeoutMs: Math.min(30000, remaining),
      });
      runtime.evidence.event({
        kind: "model-response",
        actor: "system",
        ...options.model.usage(),
        ...options.model.lastRequestMetadata?.(),
      });
      if (runtime.session.epoch !== epoch || runtime.session.owner !== "AUTOMATION") {
        runtime.evidence.event({ kind: "late-response-dropped", actor: "system" });
        await runtime.session.ready();
        continue;
      }
      const parsed = Decision.safeParse(proposal);
      if (!parsed.success) {
        if (correction) throw new Fault("MODEL_INVALID");
        correction = true;
        runtime.evidence.event({ kind: "model-invalid", actor: "system", code: "MODEL_INVALID" });
        continue;
      }
      correction = false;
      const decision = parsed.data;
      try {
        switch (decision.action) {
          case "finish": {
            const outputs = await extract(runtime);
            runtime.session.assert(epoch);
            const artifact = recorder.artifact({
              runId: runtime.evidence.runId,
              origin: options.model.origin,
              provider: options.model.provider,
              model: options.model.model,
              authoredConfig: "profile-v1;exceptions-v1;completion-v1",
              normalized: false,
            });
            const bytes = `${JSON.stringify(artifact, null, 2)}\n`;
            runtime.evidence.linkArtifact(createHash("sha256").update(bytes).digest("hex"));
            if (options.outputPath)
              writeFileSync(options.outputPath, bytes, { flag: "wx", mode: 0o600 });
            const result: RunResult = { status: "success", runId: runtime.evidence.runId, outputs };
            runtime.evidence.finish(result);
            return { result, artifact, evidenceDirectory: runtime.evidence.directory };
          }
          case "wait":
            await waitStable(runtime);
            break;
          case "request_human":
            await runtime.session.requestHuman();
            break;
          case "click":
          case "fill":
          case "select":
            await recordedAction(runtime, recorder, recorder.prepare(decision, obs));
            break;
        }
      } catch (error) {
        if (error instanceof Fault && error.code === "OWNERSHIP_LOST")
          await runtime.session.ready();
        else throw error;
      }
    }
    throw new Fault("MODEL_BUDGET_EXHAUSTED");
  } catch (error) {
    runtime.evidence.event({
      kind: "model-response",
      actor: "system",
      ...options.model.usage(),
      ...options.model.lastRequestMetadata?.(),
    });
    const result = await failedResult(
      runtime,
      error,
      `step-${String(recorder.steps.length + 1).padStart(3, "0")}`,
    );
    runtime.evidence.finish(result);
    return { result, artifact: null, evidenceDirectory: runtime.evidence.directory };
  } finally {
    await runtime.close();
  }
}
