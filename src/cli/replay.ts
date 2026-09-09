import { readFileSync } from "node:fs";
import { replay } from "../replay/run.js";
import { args, readJSON, reportError, required } from "./args.js";
import { terminalOperator } from "./operator.js";

try {
  const options = args();
  if (options.help) {
    process.stdout.write(
      "replay --artifact FILE --inputs FILE [--origin http://127.0.0.1:4173] [--headed]\n",
    );
  } else {
    let stop = () => {};
    try {
      const run = await replay({
        artifactBytes: readFileSync(required(options.artifact), "utf8"),
        input: readJSON(required(options.inputs)),
        origin: options.origin ?? "http://127.0.0.1:4173",
        headed: !!options.headed,
        operator: !!options.headed && !!process.stdin.isTTY,
        actor: options.headed && process.stdin.isTTY ? "human" : "automation",
        evidenceRoot: ".runs/replay",
        onRuntime: (runtime) => {
          if (runtime.options.operator) stop = terminalOperator(runtime);
        },
      });
      process.stdout.write(`${JSON.stringify(run.result)}\n`);
      process.stderr.write(`Evidence: ${run.evidenceDirectory}\n`);
      if (run.result.status !== "success" && run.result.status !== "business_outcome")
        process.exitCode = 1;
    } finally {
      stop();
    }
  }
} catch (error) {
  reportError(error);
}
