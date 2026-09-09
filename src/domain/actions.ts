import { z } from "zod";
import { type TransferInput, unreachable } from "./contract.js";
import { formatUSD } from "./money.js";
export const StaticLabel = z.enum([
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
]);
export const InputName = z.enum(["memberId", "sourceAccountRef", "destinationAccountRef"]);
export const ValueExpression = z.union([
  z.strictObject({ kind: z.literal("input"), name: InputName, transform: z.literal("identity") }),
  z.strictObject({
    kind: z.literal("input"),
    name: z.literal("amountCents"),
    transform: z.literal("usd-decimal"),
  }),
]);
export const Expression = z.union([
  z.strictObject({ kind: z.literal("literal"), text: StaticLabel }),
  z.strictObject({ kind: z.literal("input"), name: InputName, transform: z.literal("identity") }),
  z.strictObject({
    kind: z.literal("input"),
    name: z.literal("amountCents"),
    transform: z.literal("usd-decimal"),
  }),
]);
export type Expression = z.infer<typeof Expression>;
export function resolveExpression(expression: Expression, input: TransferInput): string {
  switch (expression.kind) {
    case "literal":
      return expression.text;
    case "input":
      return expression.name === "amountCents"
        ? formatUSD(input.amountCents)
        : input[expression.name];
    default:
      return unreachable(expression);
  }
}
export const Binding = z.discriminatedUnion("strategy", [
  z.strictObject({
    strategy: z.literal("role"),
    frame: z.literal("Workspace"),
    role: z.enum(["button", "link", "textbox", "combobox"]),
    name: Expression,
  }),
  z.strictObject({
    strategy: z.literal("table-label"),
    frame: z.literal("Workspace"),
    role: z.literal("textbox"),
    label: z.literal("Amount USD"),
  }),
]);
export type Binding = z.infer<typeof Binding>;

export const Action = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("click"), targetRef: z.string().regex(/^target-\d{3}$/) }),
  z.strictObject({
    action: z.literal("fill"),
    targetRef: z.string().regex(/^target-\d{3}$/),
    value: ValueExpression,
  }),
  z.strictObject({
    action: z.literal("select"),
    targetRef: z.string().regex(/^target-\d{3}$/),
    value: ValueExpression,
  }),
]);
export type Action = z.infer<typeof Action>;
export const Decision = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("click"),
    candidate: z.string().max(80),
    reason: z.literal("advance"),
  }),
  z.strictObject({
    action: z.literal("fill"),
    candidate: z.string().max(80),
    value: ValueExpression,
    reason: z.literal("supply-input"),
  }),
  z.strictObject({
    action: z.literal("select"),
    candidate: z.string().max(80),
    value: ValueExpression,
    reason: z.literal("supply-input"),
  }),
  z.strictObject({ action: z.literal("wait"), reason: z.literal("observe-change") }),
  z.strictObject({ action: z.literal("finish"), reason: z.literal("verify-review") }),
  z.strictObject({ action: z.literal("request_human"), reason: z.literal("need-operator") }),
]);
export type Decision = z.infer<typeof Decision>;
