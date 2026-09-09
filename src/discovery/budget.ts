import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { z } from "zod";
import { Fault } from "../domain/contract.js";

export const BudgetConfigSchema = z.strictObject({
  budgetId: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/),
  model: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/),
  maxCalls: z.number().int().positive().max(32),
  maxTotalTokens: z.number().int().positive().max(1_000_000),
  maxOutputTokens: z.number().int().positive().max(4000),
});
export type BudgetConfig = Readonly<z.infer<typeof BudgetConfigSchema>>;
const Ledger = z.strictObject({
  schemaVersion: z.literal(1),
  config: BudgetConfigSchema,
  calls: z.number().int().min(0).max(32),
  tokens: z.number().int().min(0).max(1_000_000),
});
type Ledger = z.infer<typeof Ledger>;

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

export class DurableBudget {
  readonly #config: BudgetConfig;
  readonly #directory: string;
  readonly #path: string;
  constructor(config: BudgetConfig, directory = resolve(".runs/budgets")) {
    const parsed = BudgetConfigSchema.safeParse(config);
    if (!parsed.success) throw new Fault("MODEL_UNAVAILABLE");
    this.#config = parsed.data;
    this.#directory = directory;
    this.#path = join(directory, `${parsed.data.budgetId}.json`);
  }
  #read(): Ledger {
    try {
      if (statSync(this.#path).size > 4096) throw new Fault("EVIDENCE_WRITE_FAILED");
      const parsed = Ledger.safeParse(JSON.parse(readFileSync(this.#path, "utf8")));
      if (!parsed.success) throw new Fault("EVIDENCE_WRITE_FAILED");
      if (JSON.stringify(parsed.data.config) !== JSON.stringify(this.#config))
        throw new Fault("MODEL_UNAVAILABLE");
      if (
        parsed.data.calls > this.#config.maxCalls ||
        parsed.data.tokens > this.#config.maxTotalTokens
      )
        throw new Fault("EVIDENCE_WRITE_FAILED");
      return parsed.data;
    } catch (error) {
      if (hasCode(error, "ENOENT"))
        return { schemaVersion: 1, config: this.#config, calls: 0, tokens: 0 };
      if (error instanceof Fault) throw error;
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
  }
  usage(): { calls: number; tokens: number } {
    const ledger = this.#read();
    return { calls: ledger.calls, tokens: ledger.tokens };
  }
  async reserve(tokens: number): Promise<{ calls: number; tokens: number }> {
    if (!Number.isSafeInteger(tokens) || tokens < 1) throw new Fault("MODEL_UNAVAILABLE");
    const lock = `${this.#path}.lock`;
    const deadline = performance.now() + 2000;
    let descriptor: number;
    for (;;) {
      try {
        mkdirSync(this.#directory, { recursive: true, mode: 0o700 });
        descriptor = openSync(lock, "wx", 0o600);
        break;
      } catch (error) {
        if (!hasCode(error, "EEXIST") || performance.now() >= deadline)
          throw new Fault("EVIDENCE_WRITE_FAILED");
        await setTimeout(10);
      }
    }
    let outcome: { calls: number; tokens: number } | Fault;
    try {
      const previous = this.#read();
      if (
        previous.calls >= this.#config.maxCalls ||
        previous.tokens + tokens > this.#config.maxTotalTokens
      )
        throw new Fault("MODEL_BUDGET_EXHAUSTED");
      const next = { ...previous, calls: previous.calls + 1, tokens: previous.tokens + tokens };
      const pending = `${this.#path}.pending`;
      const file = openSync(pending, "wx", 0o600);
      try {
        writeFileSync(file, `${JSON.stringify(next)}\n`);
        fsyncSync(file);
      } finally {
        closeSync(file);
      }
      renameSync(pending, this.#path);
      const directory = openSync(this.#directory, "r");
      try {
        fsyncSync(directory);
      } finally {
        closeSync(directory);
      }
      outcome = { calls: next.calls, tokens: next.tokens };
    } catch (error) {
      outcome = error instanceof Fault ? error : new Fault("EVIDENCE_WRITE_FAILED");
    }
    try {
      closeSync(descriptor);
      unlinkSync(lock);
    } catch {
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
    if (outcome instanceof Fault) throw outcome;
    return outcome;
  }
}
