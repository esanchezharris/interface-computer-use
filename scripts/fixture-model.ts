import type { Model, ModelRequest } from "../src/discovery/model.js";
import type { Decision } from "../src/domain/actions.js";
import { Fault } from "../src/domain/contract.js";
// DEVELOPMENT ONLY: a scripted model substitute. Never qualifies as genuine discovery.
export class FixtureModel implements Model {
  readonly origin = "development-fixture";
  readonly provider = "fixture";
  readonly model = "scripted-development-v1";
  private calls = 0;
  async decide(request: ModelRequest): Promise<Decision> {
    this.calls++;
    const choices = [
      {
        name: "Member ID",
        action: "fill",
        value: { kind: "input", name: "memberId", transform: "identity" },
      },
      { name: "Search", action: "click" },
      { name: "Accounts", action: "click" },
      { name: "Prepare transfer", action: "click" },
      {
        name: "Source account",
        action: "select",
        value: { kind: "input", name: "sourceAccountRef", transform: "identity" },
      },
      {
        name: "Destination account",
        action: "select",
        value: { kind: "input", name: "destinationAccountRef", transform: "identity" },
      },
      {
        name: "Amount USD",
        action: "fill",
        value: { kind: "input", name: "amountCents", transform: "usd-decimal" },
      },
      { name: "Review transfer", action: "click" },
    ] as const;
    const choice = choices[this.calls - 1];
    if (!choice) return { action: "finish", reason: "verify-review" };
    const candidate = request.observation.candidates.find(
      (c) => c.control.name === choice.name || c.control.nearbyLabel === choice.name,
    );
    if (!candidate) throw new Fault("TARGET_NOT_FOUND");
    return choice.action === "click"
      ? { action: "click", candidate: candidate.id, reason: "advance" }
      : {
          action: choice.action,
          candidate: candidate.id,
          value: choice.value,
          reason: "supply-input",
        };
  }
  usage(): { calls: number; tokens: number } {
    return { calls: this.calls, tokens: 0 };
  }
}
