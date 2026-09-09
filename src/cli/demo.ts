import { existsSync, readFileSync } from "node:fs";
import { startSandbox } from "../../sandbox/server.js";
import { testOperator } from "../../scripts/test-operator.js";
import { Artifact } from "../domain/artifact.js";
import { Fault } from "../domain/contract.js";
import { replay } from "../replay/run.js";
import { readJSON, reportError } from "./args.js";
import { terminalOperator } from "./operator.js";

try {
  if (process.argv.includes("--help"))
    process.stdout.write(
      "demo:replay [--fixture|--require-live] [--headed]; demo:handoff [--fixture|--require-live] [--test-operator]\n",
    );
  else {
    const handoff = process.argv[2] === "handoff";
    const automated = process.argv.includes("--test-operator");
    const requireLive = process.argv.includes("--require-live");
    if (
      requireLive &&
      (!existsSync("artifacts/prepare-transfer.json") || process.argv.includes("--fixture"))
    )
      throw new Fault("CONTRACT_INVALID");
    const path =
      process.argv.includes("--fixture") || !existsSync("artifacts/prepare-transfer.json")
        ? "artifacts/development-fixture.json"
        : "artifacts/prepare-transfer.json";
    const bytes = readFileSync(path, "utf8");
    const artifact = Artifact.parse(JSON.parse(bytes));
    if (requireLive && artifact.provenance.origin !== "live-model")
      throw new Fault("CONTRACT_INVALID");
    process.stderr.write(
      `Artifact provenance: ${artifact.provenance.origin}. Live discovery gate requires live-model.\n`,
    );
    const app = await startSandbox({ port: 0, ...(handoff ? { fault: "expired" } : {}) });
    let stop = () => {};
    let operatorWork = Promise.resolve();
    try {
      const run = await replay({
        artifactBytes: bytes,
        input: readJSON("examples/member-b.json"),
        origin: app.origin,
        headed: (handoff && !automated) || process.argv.includes("--headed"),
        operator: automated || (handoff && !!process.stdin.isTTY),
        actor: automated
          ? "test_operator"
          : handoff && process.stdin.isTTY
            ? "human"
            : "automation",
        evidenceRoot: ".runs/demo",
        onRuntime: (runtime) => {
          if (automated) operatorWork = testOperator(runtime);
          else if (runtime.options.operator) stop = terminalOperator(runtime);
        },
      });
      await operatorWork;
      process.stdout.write(`${JSON.stringify(run.result)}\n`);
      process.stderr.write(`Evidence: ${run.evidenceDirectory}; commits: ${app.stats.commits}\n`);
      if (run.result.status !== "success") process.exitCode = 1;
    } finally {
      stop();
      await app.close();
    }
  }
} catch (error) {
  reportError(error);
}
