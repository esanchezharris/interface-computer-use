import { closeSync, existsSync, mkdirSync, openSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { Fault } from "../domain/contract.js";
import { DurableBudget } from "./budget.js";

export const LIVE_PHASE = "assignment-20260908";
export const MAX_INPUT_TOKENS = 16_384;
export const RESERVED_USD_PER_MILLION = 50;
export type BudgetStage = "selection" | "acceptance";
export class PhaseBudget {
  readonly #directory: string;
  readonly #total: DurableBudget;
  readonly #selection: DurableBudget;
  constructor(directory = resolve(".runs/budgets")) {
    this.#directory = directory;
    const config = {
      model: "standard-two-candidate-phase",
      maxCalls: 32,
      maxOutputTokens: 4000,
    };
    this.#total = new DurableBudget(
      { ...config, budgetId: `${LIVE_PHASE}-total`, maxTotalTokens: 1_000_000 },
      directory,
    );
    this.#selection = new DurableBudget(
      { ...config, budgetId: `${LIVE_PHASE}-selection`, maxTotalTokens: 100_000 },
      directory,
    );
  }
  usage() {
    const total = this.#total.usage();
    const selection = this.#selection.usage();
    return {
      calls: total.calls,
      tokens: total.tokens,
      reservedUsd: (total.tokens * RESERVED_USD_PER_MILLION) / 1_000_000,
      selectionReservedUsd: (selection.tokens * RESERVED_USD_PER_MILLION) / 1_000_000,
    };
  }
  async run<T>(tokens: number, stage: BudgetStage, request: () => Promise<T>): Promise<T> {
    mkdirSync(this.#directory, { recursive: true, mode: 0o700 });
    const lock = join(this.#directory, `${LIVE_PHASE}.inflight`);
    let file: number;
    try {
      file = openSync(lock, "wx", 0o600);
    } catch {
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
    try {
      if (existsSync(join(this.#directory, `${LIVE_PHASE}.closed`)))
        throw new Fault("MODEL_BUDGET_EXHAUSTED");
      if (stage === "selection") await this.#selection.reserve(tokens);
      await this.#total.reserve(tokens);
      return await request();
    } finally {
      closeSync(file);
      unlinkSync(lock);
    }
  }
}
