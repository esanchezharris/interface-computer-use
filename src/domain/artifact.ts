import { z } from "zod";
import { Action, Binding, ValueExpression } from "./actions.js";
import { Screen } from "./contract.js";
export const Condition = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("screen"), screen: Screen }),
  z.strictObject({ kind: z.literal("visible"), targetRef: z.string().regex(/^target-\d{3}$/) }),
  z.strictObject({
    kind: z.literal("value-equals"),
    targetRef: z.string().regex(/^target-\d{3}$/),
    expected: ValueExpression,
  }),
  z.strictObject({
    kind: z.literal("member-equals"),
    expected: z.strictObject({
      kind: z.literal("input"),
      name: z.literal("memberId"),
      transform: z.literal("identity"),
    }),
  }),
]);
export type Condition = z.infer<typeof Condition>;
export const Step = z.strictObject({
  id: z.string().regex(/^step-\d{3}$/),
  operation: Action,
  preconditions: z.array(Condition).min(1).max(12),
  postconditions: z.array(Condition).min(1).max(12),
});
export type Step = z.infer<typeof Step>;
export const contract = {
  inputs: {
    memberId: "identifier",
    sourceAccountRef: "identifier",
    destinationAccountRef: "identifier",
    amountCents: "positive-policy-cents",
  },
  outputs: {
    memberId: "identifier",
    sourceAccountRef: "identifier",
    destinationAccountRef: "identifier",
    amountCents: "positive-policy-cents",
    feeCents: "fee-cents",
    currency: "USD",
    reviewStatus: "AWAITING_CONFIRMATION",
  },
} as const;
export const exceptions = [
  { screen: "not-found", disposition: "business", code: "MEMBER_NOT_FOUND" },
  { screen: "insufficient", disposition: "business", code: "INSUFFICIENT_FUNDS" },
  { screen: "validation", disposition: "business", code: "VALIDATION_REJECTED" },
  { screen: "permission", disposition: "failure", code: "PERMISSION_DENIED" },
  { screen: "app-error", disposition: "failure", code: "APP_ERROR" },
  { screen: "expired", disposition: "intervention", code: "HUMAN_REQUIRED" },
  { screen: "loading", disposition: "wait", code: "LOAD_TIMEOUT" },
] as const;
export const completion = {
  screen: "review",
  strategy: "visible-table",
  labels: [
    "Member ID",
    "Source account",
    "Destination account",
    "Amount USD",
    "Fee USD",
    "Currency",
    "Review status",
  ],
  checks: ["extract-output-contract", "compare-invocation", "fee-policy", "no-conflicting-error"],
} as const;
// This deliberately finite contract subset cannot add executable schemas or weaken checks.
const exact = <T>(value: T) =>
  z.custom<T>((candidate) => JSON.stringify(candidate) === JSON.stringify(value));
export const Artifact = z
  .strictObject({
    schemaVersion: z.literal(1),
    capabilityId: z.literal("prepare-transfer-review"),
    capabilityVersion: z.literal(1),
    description: z.literal("Prepare the supplied member transfer and stop at verified review"),
    profile: z.strictObject({
      id: z.literal("synthetic-bank"),
      version: z.literal(1),
      policy: z.literal("review-only-v1"),
    }),
    surface: z.tuple([z.literal("iframe-role"), z.literal("table-label")]),
    contract: exact(contract),
    exceptions: exact(exceptions),
    completion: exact(completion),
    bindings: z.record(z.string().regex(/^target-\d{3}$/), Binding),
    steps: z.array(Step).min(1).max(30),
    provenance: z.strictObject({
      runId: z.uuid(),
      origin: z.enum(["live-model", "development-fixture"]),
      provider: z.enum(["openai", "fixture"]),
      model: z.string().regex(/^[a-zA-Z0-9._:-]{1,100}$/),
      authoredConfig: z.literal("profile-v1;exceptions-v1;completion-v1"),
      normalized: z.literal(false),
    }),
  })
  .superRefine((artifact, ctx) => {
    const ids = new Set<string>();
    for (const step of artifact.steps) {
      if (ids.has(step.id)) ctx.addIssue({ code: "custom", message: "duplicate step" });
      ids.add(step.id);
      const refs = [
        step.operation.targetRef,
        ...[...step.preconditions, ...step.postconditions].flatMap((c) =>
          "targetRef" in c ? [c.targetRef] : [],
        ),
      ];
      if (refs.some((ref) => !artifact.bindings[ref]))
        ctx.addIssue({ code: "custom", message: "unresolved reference" });
    }
    if (
      (artifact.provenance.origin === "live-model") !==
      (artifact.provenance.provider === "openai")
    )
      ctx.addIssue({ code: "custom", message: "inconsistent provenance" });
  });
export type Artifact = z.infer<typeof Artifact>;
