import { Fault } from "./contract.js";
export function formatUSD(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Fault("OUTPUT_INVALID");
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
export function parseUSD(text: string): number {
  if (!/^(0|[1-9]\d{0,6})\.\d{2}$/.test(text)) throw new Fault("OUTPUT_INVALID");
  const [whole, fraction] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction);
  if (!Number.isSafeInteger(cents)) throw new Fault("OUTPUT_INVALID");
  return cents;
}
