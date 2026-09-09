import { URL } from "node:url";
import { createOpenAIModel } from "../discovery/openai.js";
import { discover } from "../discovery/run.js";
import { Fault } from "../domain/contract.js";
import { args, readJSON, reportError, required } from "./args.js";
import { terminalOperator } from "./operator.js";

try {
  const options = args();
  if (options.help)
    process.stdout.write(
      "discover --goal TEXT --target http://127.0.0.1:4173/app --inputs FILE --output FILE [--headed]\nRequires explicitly approved provider/model and a finite durable budget.\n",
    );
  else {
    const model = createOpenAIModel(process.env);
    const target = new URL(required(options.target));
    if (
      target.pathname !== "/app" ||
      target.search ||
      target.hash ||
      target.username ||
      target.password
    )
      throw new Fault("POLICY_DENIED");
    let stop = () => {};
    try {
      const run = await discover({
        goal: required(options.goal),
        input: readJSON(required(options.inputs)),
        outputPath: required(options.output),
        origin: target.origin,
        headed: !!options.headed,
        operator: !!options.headed && !!process.stdin.isTTY,
        actor: options.headed && process.stdin.isTTY ? "human" : "automation",
        evidenceRoot: ".runs/discovery",
        model,
        onRuntime: (runtime) => {
          if (runtime.options.operator) stop = terminalOperator(runtime);
        },
      });
      process.stdout.write(`${JSON.stringify(run.result)}\n`);
      process.stderr.write(`Evidence: ${run.evidenceDirectory}\n`);
      if (run.result.status !== "success") process.exitCode = 1;
    } finally {
      stop();
    }
  }
} catch (error) {
  reportError(error);
}
