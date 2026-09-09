import type { Binding } from "../domain/actions.js";
import { Fault, type Screen } from "../domain/contract.js";
export const profile = { id: "synthetic-bank", version: 1, policy: "review-only-v1" } as const;
export const headings: Readonly<Record<string, Screen>> = {
  "Member search": "search",
  "Member detail": "member",
  Accounts: "accounts",
  "Prepare transfer": "transfer",
  "Transfer review": "review",
  "Session expired": "expired",
  Loading: "loading",
  "Member not found": "not-found",
  "Insufficient funds": "insufficient",
  "Validation rejected": "validation",
  "Permission denied": "permission",
  "Application error": "app-error",
};
export const routeMethods: Readonly<Record<string, readonly string[]>> = {
  "/app": ["GET"],
  "/search": ["GET"],
  "/member": ["GET"],
  "/accounts": ["GET"],
  "/transfer": ["GET"],
  "/review": ["GET", "POST"],
  "/reauth": ["POST"],
};
export function validateOrigin(origin: string): string {
  const url = new URL(origin);
  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Fault("POLICY_DENIED");
  return url.origin;
}
export function permittedRequest(url: string, method: string, origin: string): boolean {
  const parsed = new URL(url);
  return (
    parsed.origin === origin &&
    !parsed.username &&
    !parsed.password &&
    !!routeMethods[parsed.pathname]?.includes(method)
  );
}
export function safeRoute(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path in routeMethods ? path : "[REDACTED]";
  } catch {
    return "[REDACTED]";
  }
}
export type Effect = {
  readonly tag: string;
  readonly type: string;
  readonly name: string;
  readonly href: string;
  readonly formAction: string;
  readonly method: string;
};
const safeControls: Readonly<Record<string, readonly string[]>> = {
  "Member ID": ["fill"],
  Search: ["click"],
  Accounts: ["click"],
  "Prepare transfer": ["click"],
  "Source account": ["select"],
  "Destination account": ["select"],
  "Amount USD": ["fill"],
  "Review transfer": ["click"],
};
const clickEffects: Readonly<Record<string, readonly [string, string, string, string]>> = {
  Search: ["button", "submit", "/member", "GET"],
  Accounts: ["a", "", "/accounts", "GET"],
  "Prepare transfer": ["a", "", "/transfer", "GET"],
  "Review transfer": ["button", "submit", "/review", "POST"],
};
export function authorize(binding: Binding, operation: string, effect: Effect): void {
  const name =
    binding.strategy === "table-label"
      ? binding.label
      : binding.name.kind === "literal"
        ? binding.name.text
        : "";
  if (!safeControls[name]?.includes(operation) || effect.type === "password")
    throw new Fault("POLICY_DENIED");
  // Actual route checks occur before dispatch too, not merely from the safe label.
  if (operation === "click") {
    const expected = clickEffects[name];
    const route = effect.tag === "a" ? effect.href : effect.formAction;
    if (
      !expected ||
      effect.tag !== expected[0] ||
      effect.type !== expected[1] ||
      effect.method !== expected[3] ||
      !route
    )
      throw new Fault("POLICY_DENIED");
    try {
      if (new URL(route).pathname !== expected[2]) throw new Fault("POLICY_DENIED");
    } catch {
      throw new Fault("POLICY_DENIED");
    }
  }
}

export const transitionScreens: Readonly<Record<string, Screen>> = {
  Search: "member",
  Accounts: "accounts",
  "Prepare transfer": "transfer",
  "Review transfer": "review",
};
