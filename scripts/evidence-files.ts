import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { Fault } from "../src/domain/contract.js";
import { Event, Manifest, SafeResult, Snapshot } from "../src/evidence/schema.js";
export function promote(directory: string): string {
  const manifest = Manifest.parse(
    JSON.parse(readFileSync(join(directory, "manifest.json"), "utf8")),
  );
  const lines = readFileSync(join(directory, "events.jsonl"), "utf8").trim().split("\n");
  for (const line of lines)
    Event.extend({ at: z.iso.datetime(), runId: z.uuid() }).parse(JSON.parse(line));
  SafeResult.parse(JSON.parse(readFileSync(join(directory, "result.safe.json"), "utf8")));
  const names = ["manifest.json", "events.jsonl", "result.safe.json"];
  if (existsSync(join(directory, "snapshot.safe.json"))) {
    Snapshot.parse(JSON.parse(readFileSync(join(directory, "snapshot.safe.json"), "utf8")));
    names.push("snapshot.safe.json");
  }
  const destination = join("evidence", manifest.runId);
  if (existsSync(destination)) {
    if (
      !names.every(
        (name) =>
          existsSync(join(destination, name)) &&
          readFileSync(join(directory, name)).equals(readFileSync(join(destination, name))),
      )
    )
      throw new Fault("EVIDENCE_WRITE_FAILED");
    return manifest.runId;
  }
  mkdirSync(destination, { recursive: false });
  for (const name of names) copyFileSync(join(directory, name), join(destination, name));
  return manifest.runId;
}
