import { type FailureCode, Fault } from "../domain/contract.js";
import type { Actor, Evidence } from "../evidence/store.js";
export type Owner = "AUTOMATION" | "PAUSING" | "HUMAN" | "RESUMING" | "TERMINAL";
export class Session {
  owner: Owner = "AUTOMATION";
  epoch = 0;
  readonly actor: Actor;
  private pauseStart: number | null = null;
  private pausedMs = 0;
  private readonly pending = new Set<Promise<unknown>>();
  private notify: (() => void) | null = null;
  private waiting: Promise<void> | null = null;
  private deadline: ReturnType<typeof setTimeout> | null = null;
  private resumeCheck: (() => Promise<number | null>) | null = null;
  private continuation: number | null = null;
  private terminalCode: FailureCode | null = null;
  constructor(
    readonly evidence: Evidence,
    readonly options: {
      readonly actor: Actor;
      readonly operator: boolean;
      readonly interventionMs: number;
      readonly settleMs: number;
    },
  ) {
    this.actor = options.actor;
  }
  assert(epoch: number): void {
    if (this.owner !== "AUTOMATION" || epoch !== this.epoch)
      throw new Fault(this.terminalCode ?? "OWNERSHIP_LOST");
  }
  anchor(check: () => Promise<number | null>): void {
    this.resumeCheck = check;
  }
  consumeContinuation(): number | null {
    const value = this.continuation;
    this.continuation = null;
    return value;
  }
  async dispatch<T>(operation: () => Promise<T>, epoch: number): Promise<T> {
    this.assert(epoch);
    const pending = operation();
    this.pending.add(pending);
    try {
      const result = await pending;
      return result;
    } finally {
      this.pending.delete(pending);
    }
  }
  private transition(owner: Owner): void {
    try {
      this.evidence.event({ kind: "ownership", actor: "system", owner });
      this.owner = owner;
    } catch (error) {
      this.owner = "TERMINAL";
      this.terminalCode = "EVIDENCE_WRITE_FAILED";
      this.epoch++;
      clearTimeout(this.deadline ?? undefined);
      this.notify?.();
      throw error;
    }
  }
  async takeover(): Promise<void> {
    if (this.owner !== "AUTOMATION") throw new Fault("COMMAND_INVALID");
    this.pauseStart = performance.now();
    this.transition("PAUSING");
    this.epoch++;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        Promise.allSettled([...this.pending]),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Fault("HANDOFF_NOT_QUIESCENT")),
            this.options.settleMs,
          );
        }),
      ]);
    } catch (error) {
      this.transition("TERMINAL");
      throw error;
    } finally {
      clearTimeout(timer);
    }
    if (this.status().owner === "TERMINAL") throw new Fault("ABORTED");
    this.waiting = new Promise<void>((resolve) => {
      this.notify = resolve;
    });
    this.transition("HUMAN");
    this.deadline = setTimeout(() => {
      this.terminalCode = "INTERVENTION_TIMEOUT";
      try {
        this.transition("TERMINAL");
      } catch (error) {
        if (!(error instanceof Fault)) this.terminalCode = "EVIDENCE_WRITE_FAILED";
      }
      this.notify?.();
    }, this.options.interventionMs);
  }
  async requestHuman(): Promise<void> {
    if (!this.options.operator) throw new Fault("HUMAN_REQUIRED");
    if (this.owner === "AUTOMATION") await this.takeover();
    await this.ready();
  }
  async resume(): Promise<void> {
    if (this.owner !== "HUMAN" || !this.resumeCheck) throw new Fault("COMMAND_INVALID");
    this.transition("RESUMING");
    let next: number | null = null;
    try {
      next = await this.resumeCheck();
    } catch (error) {
      if (!(error instanceof Fault)) {
        this.transition("HUMAN");
        throw error;
      }
    }
    if (this.status().owner === "TERMINAL") throw new Fault(this.terminalCode ?? "ABORTED");
    if (next === null) {
      this.transition("HUMAN");
      throw new Fault("RESUME_STATE_MISMATCH");
    }
    this.continuation = next;
    clearTimeout(this.deadline ?? undefined);
    this.deadline = null;
    this.pausedMs += this.pauseStart === null ? 0 : performance.now() - this.pauseStart;
    this.pauseStart = null;
    this.transition("AUTOMATION");
    this.epoch++;
    this.notify?.();
    this.notify = null;
    this.waiting = null;
  }
  async ready(): Promise<void> {
    if (this.owner !== "AUTOMATION" && this.owner !== "TERMINAL") {
      // PAUSING can precede creation of the human wait promise: settle it first.
      while (this.owner === "PAUSING") await new Promise<void>((resolve) => setTimeout(resolve, 5));
      if (this.waiting) await this.waiting;
    }
    if (this.status().owner === "TERMINAL") throw new Fault(this.terminalCode ?? "ABORTED");
  }
  abort(): void {
    if (this.status().owner === "TERMINAL") throw new Fault("COMMAND_INVALID");
    this.epoch++;
    this.terminalCode = "ABORTED";
    clearTimeout(this.deadline ?? undefined);
    this.transition("TERMINAL");
    this.notify?.();
  }
  close(): void {
    clearTimeout(this.deadline ?? undefined);
    this.epoch++;
    this.owner = "TERMINAL";
    this.notify?.();
  }
  pausedDuration(): number {
    return this.pausedMs + (this.pauseStart === null ? 0 : performance.now() - this.pauseStart);
  }
  status(): { owner: Owner; epoch: number; inFlight: number } {
    return { owner: this.owner, epoch: this.epoch, inFlight: this.pending.size };
  }
}
