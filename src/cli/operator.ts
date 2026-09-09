import { createInterface } from "node:readline";
import { Fault } from "../domain/contract.js";
import type { Runtime } from "../session/browser.js";
export function terminalOperator(runtime: Runtime): () => void {
  const lines = createInterface({ input: process.stdin, terminal: false });
  process.stderr.write(
    "Operator controls: status | takeover | resume | abort. Restore only in the existing browser window.\n",
  );
  let commands = Promise.resolve();
  lines.on("line", (line) => {
    commands = commands
      .then(async () => {
        switch (line.trim()) {
          case "status":
            process.stderr.write(`${JSON.stringify(runtime.session.status())}\n`);
            return;
          case "takeover":
            await runtime.session.takeover();
            await runtime.page.bringToFront();
            break;
          case "resume":
            await runtime.session.resume();
            break;
          case "abort":
            runtime.session.abort();
            break;
          default:
            throw new Fault("COMMAND_INVALID");
        }
        process.stderr.write(`${JSON.stringify(runtime.session.status())}\n`);
      })
      .catch((error: unknown) => {
        process.stderr.write(
          `${JSON.stringify({ code: error instanceof Fault ? error.code : "BROWSER_ERROR" })}\n`,
        );
      });
  });
  return () => lines.close();
}
