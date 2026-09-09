import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { Fault, type RunResult } from "../domain/contract.js";
import { Event, Manifest, Metadata, SafeResult, Snapshot } from "./schema.js";

export { Actor, Event, Manifest, Snapshot } from "./schema.js";
export function sourceIdentity(): { revision: string; dirty: boolean } {
  try {
    return {
      revision: execFileSync("git", ["rev-parse", "HEAD"], { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim(),
      dirty:
        execFileSync("git", ["status", "--porcelain"], { stdio: ["ignore", "pipe", "ignore"] })
          .length > 0,
    };
  } catch {
    return { revision: "uncommitted", dirty: true };
  }
}
export class Evidence {
  readonly runId = randomUUID();
  readonly directory: string;
  readonly metadata: z.infer<typeof Metadata>;
  private modelCalls = 0;
  private reservedTokens = 0;
  private initialCalls: number | null = null;
  private initialTokens = 0;
  private readonly source = sourceIdentity();
  private artifactHash: string | null;
  private readonly startedAt = new Date().toISOString();
  constructor(root: string, metadata: z.infer<typeof Metadata>) {
    this.metadata = Metadata.parse(metadata);
    this.directory = join(root, this.runId);
    this.artifactHash = metadata.artifactHash;
    try {
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    } catch {
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
    this.writeManifest();
  }
  private write(
    name: "manifest.json" | "snapshot.safe.json" | "result.safe.json",
    value: unknown,
  ): void {
    try {
      writeFileSync(join(this.directory, name), `${JSON.stringify(value, null, 2)}\n`, {
        mode: 0o600,
      });
    } catch {
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
  }
  private writeManifest(): void {
    this.write(
      "manifest.json",
      Manifest.parse({
        ...this.metadata,
        runId: this.runId,
        startedAt: this.startedAt,
        source: this.source,
        runtime: process.version,
        profile: "synthetic-bank-v1",
        policy: "review-only-v1",
        modelCalls: this.modelCalls,
        reservedTokens: this.reservedTokens,
        artifactHash: this.artifactHash,
      }),
    );
  }
  event(value: Event): void {
    const parsed = Event.parse(value);
    if (this.initialCalls === null && parsed.kind === "model-request") {
      this.initialCalls = parsed.calls ?? 0;
      this.initialTokens = parsed.tokens ?? 0;
    }
    this.modelCalls = Math.max(
      this.modelCalls,
      (parsed.calls ?? this.initialCalls ?? 0) - (this.initialCalls ?? 0),
    );
    this.reservedTokens = Math.max(
      this.reservedTokens,
      (parsed.tokens ?? this.initialTokens) - this.initialTokens,
    );
    try {
      appendFileSync(
        join(this.directory, "events.jsonl"),
        `${JSON.stringify({ at: new Date().toISOString(), runId: this.runId, ...parsed })}\n`,
        { mode: 0o600 },
      );
    } catch {
      throw new Fault("EVIDENCE_WRITE_FAILED");
    }
  }
  snapshot(value: Snapshot): void {
    this.write("snapshot.safe.json", Snapshot.parse(value));
  }
  linkArtifact(hash: string): void {
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Fault("CONTRACT_INVALID");
    this.artifactHash = hash;
  }
  finish(result: RunResult): void {
    this.event({
      kind: "terminal",
      actor: "system",
      ...("code" in result ? { code: result.code } : {}),
    });
    this.writeManifest();
    this.write(
      "result.safe.json",
      SafeResult.parse({
        runId: this.runId,
        status: result.status,
        code: "code" in result ? result.code : null,
        outputs: result.status === "success" ? "[REDACTED]" : null,
        finishedAt: new Date().toISOString(),
      }),
    );
  }
}
