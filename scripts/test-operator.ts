import { setTimeout as pause } from "node:timers/promises";
import { Fault } from "../src/domain/contract.js";
import type { Runtime } from "../src/session/browser.js";
import { workspace } from "../src/surface/observe.js";
export async function testOperator(runtime: Runtime): Promise<void> {
  const deadline = performance.now() + 10000;
  while (runtime.session.owner !== "HUMAN") {
    if (runtime.session.owner === "TERMINAL" || performance.now() > deadline)
      throw new Fault("HUMAN_REQUIRED");
    await pause(10);
  }
  const page = runtime.page;
  const context = runtime.context;
  const frame = workspace(page);
  await frame.getByLabel("Demo password", { exact: true }).fill("demo-only");
  await Promise.all([
    frame
      .getByRole("heading", { name: "Prepare transfer", exact: true })
      .waitFor({ state: "visible" }),
    frame.getByRole("button", { name: "Restore session", exact: true }).click(),
  ]);
  if (runtime.page !== page || runtime.context !== context)
    throw new Fault("RESUME_STATE_MISMATCH");
  await runtime.session.resume();
}
