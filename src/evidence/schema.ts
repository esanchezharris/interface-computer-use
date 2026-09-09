import { z } from "zod";
import { BusinessCode, FailureCode, Screen } from "../domain/contract.js";
export const Actor = z.enum(["automation", "system", "test_operator", "human"]);
export type Actor = z.infer<typeof Actor>;
export const Event = z.strictObject({
  kind: z.enum([
    "action-start",
    "action-complete",
    "check",
    "exception",
    "recovery",
    "ownership",
    "operator-activity",
    "model-request",
    "model-response",
    "model-invalid",
    "late-response-dropped",
    "intervention",
    "terminal",
  ]),
  actor: Actor,
  stepId: z
    .string()
    .regex(/^step-\d{3}$/)
    .optional(),
  screen: Screen.optional(),
  action: z.enum(["click", "fill", "select", "wait", "finish", "request_human"]).optional(),
  strategy: z.enum(["role", "table-label"]).optional(),
  recoveryScreen: Screen.optional(),
  evidenceRef: z.literal("snapshot.safe.json").optional(),
  requestId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,128}$/)
    .optional(),
  inputTokens: z.number().int().min(0).max(1000000).optional(),
  outputTokens: z.number().int().min(0).max(1000000).optional(),
  reason: z
    .enum(["advance", "supply-input", "observe-change", "verify-review", "need-operator"])
    .optional(),
  code: z.union([FailureCode, BusinessCode]).optional(),
  owner: z.enum(["AUTOMATION", "PAUSING", "HUMAN", "RESUMING", "TERMINAL"]).optional(),
  activity: z.enum(["navigation", "activation", "field-change"]).optional(),
  field: z.enum(["member", "source", "destination", "amount", "credential", "unknown"]).optional(),
  calls: z.number().int().min(0).max(100).optional(),
  tokens: z.number().int().min(0).max(1_000_000).optional(),
});
export type Event = z.infer<typeof Event>;
export const Snapshot = z.strictObject({
  redacted: z.literal(true),
  frames: z
    .array(
      z.strictObject({
        scope: z.enum(["root", "Workspace", "unknown"]),
        route: z.enum([
          "/app",
          "/search",
          "/member",
          "/accounts",
          "/transfer",
          "/review",
          "/reauth",
          "[REDACTED]",
        ]),
        controls: z
          .array(
            z.strictObject({
              tag: z.enum(["button", "a", "input", "select"]),
              label: z.enum([
                "Member ID",
                "Search",
                "Accounts",
                "Prepare transfer",
                "Source account",
                "Destination account",
                "Amount USD",
                "Review transfer",
                "Submit transfer",
                "Demo password",
                "Restore session",
                "[REDACTED]",
              ]),
              visible: z.boolean(),
              enabled: z.boolean(),
              values: z.literal("[REDACTED]"),
              matches: z.number().int().min(0).max(10000),
            }),
          )
          .max(100),
      }),
    )
    .max(10),
});
export type Snapshot = z.infer<typeof Snapshot>;
export const Metadata = z.strictObject({
  mode: z.enum(["discovery", "replay"]),
  actor: Actor,
  origin: z.enum(["live-model", "development-fixture"]),
  artifactHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
  browserVersion: z.string().regex(/^(\d+(\.\d+){1,4}|unit-fixture)$/),
});
export const Manifest = Metadata.extend({
  runId: z.uuid(),
  startedAt: z.iso.datetime(),
  source: z.strictObject({
    revision: z.string().regex(/^([a-f0-9]{40}|uncommitted)$/),
    dirty: z.boolean(),
  }),
  runtime: z.string().regex(/^v\d+\.\d+\.\d+$/),
  profile: z.literal("synthetic-bank-v1"),
  policy: z.literal("review-only-v1"),
  modelCalls: z.number().int().min(0).max(100),
  reservedTokens: z.number().int().min(0).max(1000000),
});
export const SafeResult = z.strictObject({
  runId: z.uuid(),
  status: z.enum(["success", "business_outcome", "failed", "aborted"]),
  code: z.union([FailureCode, BusinessCode]).nullable(),
  outputs: z.literal("[REDACTED]").nullable(),
  finishedAt: z.iso.datetime(),
});
