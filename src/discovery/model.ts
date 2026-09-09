import type { Decision } from "../domain/actions.js";
import type { TransferInput } from "../domain/contract.js";
import type { Observation } from "../surface/observe.js";
export type ModelRequest = {
  readonly goal: string;
  readonly input: TransferInput;
  readonly observation: Observation;
  readonly correction: boolean;
  readonly timeoutMs?: number;
};
export interface Model {
  readonly origin: "live-model" | "development-fixture";
  readonly provider: "openai" | "fixture";
  readonly model: string;
  decide(request: ModelRequest): Promise<unknown>;
  lastRequestMetadata?(): {
    readonly requestId?: string | undefined;
    readonly inputTokens?: number | undefined;
    readonly outputTokens?: number | undefined;
    readonly cachedInputTokens?: number | undefined;
    readonly cacheWriteTokens?: number | undefined;
    readonly reasoningTokens?: number | undefined;
    readonly responseStatus?: "completed" | "incomplete" | "failed" | "other" | undefined;
    readonly httpStatus?: number | undefined;
  };
  usage(): { calls: number; tokens: number };
}
export type ValidDecision = Decision;
