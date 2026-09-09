import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

for (const scenario of ["missing", "fixture"] as const) {
  test(`required-live demonstration rejects ${scenario} artifact without fallback`, async () => {
    const root = await mkdtemp(join(tmpdir(), "cua-demo-"));
    try {
      await mkdir(join(root, "artifacts"));
      await copyFile(
        "artifacts/development-fixture.json",
        join(root, "artifacts/development-fixture.json"),
      );
      if (scenario === "fixture")
        await copyFile(
          "artifacts/development-fixture.json",
          join(root, "artifacts/prepare-transfer.json"),
        );
      const child = spawn(
        process.execPath,
        [resolve("dist/src/cli/demo.js"), "handoff", "--require-live", "--test-operator"],
        { cwd: root, env: {}, stdio: ["ignore", "pipe", "pipe"] },
      );
      let output = "";
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      const exit = await new Promise<number | null>((ok, fail) => {
        child.once("error", fail);
        child.once("exit", ok);
      });
      assert.equal(exit, 1);
      assert.deepEqual(JSON.parse(output), { status: "failed", code: "CONTRACT_INVALID" });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}
