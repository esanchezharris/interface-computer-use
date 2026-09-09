import { z } from "zod";

export const MAX_AMOUNT_CENTS = 1_000_000;
export const Identifier = z.string().regex(/^M-\d{3}$/);
export const AccountReference = z.string().regex(/^(CHK|SAV)-\d{3}$/);
export const InputSchema = z
  .strictObject({
    memberId: Identifier,
    sourceAccountRef: AccountReference,
    destinationAccountRef: AccountReference,
    amountCents: z.number().int().positive().max(MAX_AMOUNT_CENTS),
  })
  .refine((v) => v.sourceAccountRef !== v.destinationAccountRef);
export type TransferInput = z.infer<typeof InputSchema>;
export const OutputSchema = z.strictObject({
  memberId: Identifier,
  sourceAccountRef: AccountReference,
  destinationAccountRef: AccountReference,
  amountCents: z.number().int().positive().max(MAX_AMOUNT_CENTS),
  feeCents: z.number().int().min(0).max(10_000),
  currency: z.literal("USD"),
  reviewStatus: z.literal("AWAITING_CONFIRMATION"),
});
export type TransferOutput = z.infer<typeof OutputSchema>;
export const FailureCode = z.enum([
  "CONTRACT_INVALID",
  "PROFILE_MISMATCH",
  "TARGET_AMBIGUOUS",
  "TARGET_NOT_FOUND",
  "TARGET_INVALID",
  "STALE_CANDIDATE",
  "POLICY_DENIED",
  "LOAD_TIMEOUT",
  "APP_ERROR",
  "PERMISSION_DENIED",
  "STATE_AMBIGUOUS",
  "CHECKPOINT_MISMATCH",
  "OUTPUT_INVALID",
  "HUMAN_REQUIRED",
  "INTERVENTION_TIMEOUT",
  "HANDOFF_NOT_QUIESCENT",
  "OWNERSHIP_LOST",
  "RESUME_STATE_MISMATCH",
  "COMMAND_INVALID",
  "UNEXPECTED_MODAL",
  "MODEL_INVALID",
  "MODEL_BUDGET_EXHAUSTED",
  "MODEL_UNAVAILABLE",
  "MODEL_ACCESS_DENIED",
  "MODEL_SCHEMA_INCOMPATIBLE",
  "MODEL_RATE_LIMITED",
  "MODEL_INCOMPLETE",
  "MODEL_PRICING_UNSUPPORTED",
  "NO_PROGRESS",
  "RUN_TIMEOUT",
  "EVIDENCE_WRITE_FAILED",
  "BROWSER_ERROR",
  "ABORTED",
  "RECORDING_INCOMPLETE",
]);
export type FailureCode = z.infer<typeof FailureCode>;
export const BusinessCode = z.enum([
  "MEMBER_NOT_FOUND",
  "INSUFFICIENT_FUNDS",
  "VALIDATION_REJECTED",
]);
export type BusinessCode = z.infer<typeof BusinessCode>;
export class Fault extends Error {
  constructor(readonly code: FailureCode) {
    super(code);
    this.name = "Fault";
  }
}
export class BusinessOutcome extends Error {
  constructor(readonly code: BusinessCode) {
    super(code);
    this.name = "BusinessOutcome";
  }
}
export const Screen = z.enum([
  "search",
  "member",
  "accounts",
  "transfer",
  "review",
  "expired",
  "loading",
  "unknown",
  "not-found",
  "insufficient",
  "validation",
  "permission",
  "app-error",
]);
export type Screen = z.infer<typeof Screen>;
export const SafeDiagnostic = z.strictObject({
  screen: Screen,
  check: z.enum(["contract", "target", "policy", "checkpoint", "ownership", "runtime"]),
  matchCount: z.number().int().min(0).max(10_000).optional(),
  redacted: z.literal(true),
});
export const ResultSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("success"), runId: z.uuid(), outputs: OutputSchema }),
  z.strictObject({
    status: z.literal("business_outcome"),
    runId: z.uuid(),
    code: BusinessCode,
    stepId: z.string().regex(/^step-\d{3}$/),
  }),
  z.strictObject({
    status: z.literal("failed"),
    runId: z.uuid(),
    code: FailureCode,
    stepId: z
      .string()
      .regex(/^step-\d{3}$/)
      .nullable(),
    expected: SafeDiagnostic,
    observed: SafeDiagnostic,
    evidenceRefs: z.array(z.enum(["snapshot.safe.json", "events.jsonl"])),
  }),
  z.strictObject({
    status: z.literal("aborted"),
    runId: z.uuid(),
    reasonCode: z.literal("ABORTED"),
  }),
]);
export type RunResult = z.infer<typeof ResultSchema>;
export function unreachable(_value: never): never {
  throw new Fault("CONTRACT_INVALID");
}
