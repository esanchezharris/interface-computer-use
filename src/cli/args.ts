import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { z } from "zod";
import { Fault } from "../domain/contract.js";
export function args() {
  return parseArgs({
    options: {
      goal: { type: "string" },
      target: { type: "string" },
      origin: { type: "string" },
      inputs: { type: "string" },
      output: { type: "string" },
      artifact: { type: "string" },
      headed: { type: "boolean" },
      help: { type: "boolean" },
      fixture: { type: "boolean" },
      "test-operator": { type: "boolean" },
    },
    strict: true,
  }).values;
}
export function required(value: string | undefined): string {
  if (!value) throw new Fault("CONTRACT_INVALID");
  return value;
}
export function readJSON(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}
export function reportError(error: unknown): void {
  const code =
    error instanceof Fault
      ? error.code
      : error instanceof z.ZodError || error instanceof SyntaxError || error instanceof TypeError
        ? "CONTRACT_INVALID"
        : "BROWSER_ERROR";
  process.stderr.write(`${JSON.stringify({ status: "failed", code })}\n`);
  process.exitCode = 1;
}
