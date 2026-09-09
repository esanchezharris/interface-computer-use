import assert from "node:assert/strict";
import { test } from "node:test";
import { InputSchema } from "../../src/domain/contract.js";
import { formatUSD, parseUSD } from "../../src/domain/money.js";

const valid = {
  memberId: "M-104",
  sourceAccountRef: "CHK-104",
  destinationAccountRef: "SAV-104",
  amountCents: 2500,
};
test("A04 rejects malformed inputs before interaction", () => {
  // Given invalid invocations; When parsing; Then no invalid value crosses the boundary.
  for (const input of [
    { ...valid, extra: 1 },
    { ...valid, amountCents: 0 },
    { ...valid, amountCents: 1.5 },
    { ...valid, amountCents: Number.MAX_SAFE_INTEGER },
    { ...valid, memberId: "" },
    { ...valid, memberId: "x']" },
    { ...valid, destinationAccountRef: "CHK-104" },
  ]) {
    assert.equal(InputSchema.safeParse(input).success, false);
  }
});
test("USD uses exact integer-cent round trips", () => {
  // Given the supported cent range; When formatting and parsing; Then cents are unchanged.
  for (let cents = 0; cents <= 1_000_000; cents += 137)
    assert.equal(parseUSD(formatUSD(cents)), cents);
});
test("USD rejects unsupported formats rather than rounding", () => {
  // Given ambiguous displays; When parsing; Then reject.
  for (const value of ["$1.00", "1,000.00", "1.2", "-1.00", "1e3", "01.00", "1.001", "NaN", ""])
    assert.throws(() => parseUSD(value));
});
