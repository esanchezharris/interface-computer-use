import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";

test("A03 replay dependency graph excludes all discovery provider and fixture modules", () => {
  // Given the actual TypeScript import graph; When walking replay; Then it contains no model path.
  const visited = new Set<string>();
  const walk = (path: string) => {
    if (visited.has(path)) return;
    visited.add(path);
    assert.equal(/\/(discovery|sandbox|scripts)\//.test(path), false);
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(
      /(?:import|export)\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/g,
    )) {
      const specifier = match[1];
      assert.ok(specifier);
      assert.notEqual(specifier, "openai");
      if (specifier.startsWith("."))
        walk(resolve(dirname(path), specifier.replace(/\.js$/, ".ts")));
    }
    assert.equal(/import\s*\(|require\s*\(/.test(source), false);
  };
  walk(resolve("src/cli/replay.ts"));
  assert.ok(visited.size > 10);
});
