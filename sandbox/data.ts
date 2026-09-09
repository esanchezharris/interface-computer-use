import { z } from "zod";

export const faults = [
  "none",
  "not-found",
  "insufficient",
  "validation",
  "permission",
  "expired",
  "slow",
  "app-error",
  "wrong-member",
  "wrong-source",
  "wrong-destination",
  "wrong-amount",
  "bad-fee",
  "ambiguous",
  "duplicate-frame",
  "modal",
  "misdirected",
  "conflicting",
] as const;
export type Fault = (typeof faults)[number];

const memberId = z.string().regex(/^M-[0-9]{3}$/);
const accountRef = z.string().regex(/^(CHK|SAV)-[0-9]{3}$/);
export const memberQuery = z.object({ member: memberId }).strict();
export const transferForm = z
  .object({
    source: accountRef,
    destination: accountRef,
    amount: z.string().regex(/^(0|[1-9][0-9]{0,6})\.[0-9]{2}$/),
  })
  .strict();
export const reauthForm = z.object({ password: z.literal("demo-only") }).strict();

export type Member = {
  readonly id: string;
  readonly accounts: readonly [string, string];
  readonly balances: readonly [number, number];
};
export const members: readonly Member[] = [
  { id: "M-104", accounts: ["CHK-104", "SAV-104"], balances: [185000, 450000] },
  { id: "M-207", accounts: ["CHK-207", "SAV-207"], balances: [275000, 625000] },
];
export type Transfer = z.infer<typeof transferForm> & { readonly member: Member };

export type Session = {
  member: Member | undefined;
  expired: boolean;
  expiryUsed: boolean;
  review: Transfer | undefined;
  readyAt: number;
};

export function cents(amount: string): number {
  const [whole, fraction] = amount.split(".");
  return Number(whole) * 100 + Number(fraction);
}

export function dollars(value: number): string {
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

export function fields(parameters: URLSearchParams): Record<string, string> | undefined {
  const names = new Set<string>();
  for (const [key] of parameters) {
    if (names.has(key)) return undefined;
    names.add(key);
  }
  return Object.fromEntries(parameters);
}
