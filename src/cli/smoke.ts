import { startSandbox } from "../../sandbox/server.js";
import { createOpenAIModel } from "../discovery/openai.js";
import { Decision } from "../domain/actions.js";
import { Fault, InputSchema } from "../domain/contract.js";
import { failedResult } from "../replay/result.js";
import { Runtime } from "../session/browser.js";
import { current } from "../surface/checks.js";
import { readJSON, reportError } from "./args.js";

try {
  const model = createOpenAIModel(process.env);
  const input = InputSchema.parse(readJSON("examples/member-a.json"));
  const app = await startSandbox({ port: 0 });
  try {
    const runtime = await Runtime.create({
      origin: app.origin,
      input,
      mode: "discovery",
      provenance: "live-model",
      artifactHash: null,
      actor: "automation",
      operator: false,
      headed: false,
      evidenceRoot: ".runs/compatibility",
    });
    try {
      const observation = await current(runtime);
      runtime.evidence.event({ kind: "model-request", actor: "system", ...model.usage() });
      const proposal = await model.decide({
        goal: "Find the supplied member and prepare the supplied transfer. Stop at review; never submit.",
        input,
        observation,
        correction: false,
        timeoutMs: 30000,
      });
      runtime.evidence.event({
        kind: "model-response",
        actor: "system",
        ...model.usage(),
        ...model.lastRequestMetadata?.(),
      });
      const parsed = Decision.safeParse(proposal);
      if (!parsed.success) throw new Fault("MODEL_INVALID");
      const decision = parsed.data;
      if (
        "candidate" in decision &&
        !observation.candidates.some((c) => c.id === decision.candidate)
      )
        throw new Fault("STALE_CANDIDATE");
      runtime.evidence.finish({
        status: "aborted",
        runId: runtime.evidence.runId,
        reasonCode: "ABORTED",
      });
      process.stdout.write(
        `${JSON.stringify({ compatibility: "passed", discoveryComplete: false, action: parsed.data.action, evidence: runtime.evidence.directory, commits: app.stats.commits })}\n`,
      );
    } catch (error) {
      runtime.evidence.event({
        kind: "model-response",
        actor: "system",
        ...model.usage(),
        ...model.lastRequestMetadata?.(),
      });
      runtime.evidence.finish(await failedResult(runtime, error, null));
      process.stderr.write(`Compatibility evidence: ${runtime.evidence.directory}\n`);
      throw error;
    } finally {
      await runtime.close();
    }
  } finally {
    await app.close();
  }
} catch (error) {
  reportError(error);
}
