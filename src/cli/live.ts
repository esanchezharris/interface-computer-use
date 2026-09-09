import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { startSandbox } from "../../sandbox/server.js";
import { createOpenAIModel } from "../discovery/openai.js";
import { discover } from "../discovery/run.js";
import { Fault } from "../domain/contract.js";
import { readJSON, reportError } from "./args.js";

try {
  const model = createOpenAIModel(process.env);
  mkdirSync("artifacts", { recursive: true });
  const app = await startSandbox({ port: 0 });
  try {
    const learned = await discover({
      goal: "Find the supplied member and prepare the supplied transfer. Stop at review; never submit.",
      input: readJSON("examples/member-a.json"),
      model,
      outputPath: "artifacts/prepare-transfer.json",
      origin: app.origin,
      headed: false,
      operator: false,
      actor: "automation",
      evidenceRoot: ".runs/live",
    });
    if (learned.result.status !== "success") throw new Fault("MODEL_UNAVAILABLE");
    process.stderr.write(`Genuine discovery evidence: ${learned.evidenceDirectory}\n`);
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !/OPENAI|ANTHROPIC|API_KEY|CUA_/.test(key)),
    );
    const child = spawn(
      process.execPath,
      [
        "--import",
        "./dist/scripts/model-bomb.js",
        "dist/src/cli/replay.js",
        "--artifact",
        "artifacts/prepare-transfer.json",
        "--inputs",
        "examples/member-b.json",
        "--origin",
        app.origin,
      ],
      { env, stdio: ["ignore", "ignore", "inherit"] },
    );
    const exit = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", resolve);
    });
    if (exit !== 0) throw new Fault("CHECKPOINT_MISMATCH");
    process.stdout.write(
      `${JSON.stringify({ liveDiscovery: true, keylessReplay: true, commits: app.stats.commits, manualHandoff: false })}\n`,
    );
  } finally {
    await app.close();
  }
} catch (error) {
  reportError(error);
}
