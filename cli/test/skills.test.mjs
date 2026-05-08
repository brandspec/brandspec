import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");

describe("skill files are present in package", () => {
  const requiredFiles = [
    "workshop/SKILL.md",
    "whiteboard/SKILL.md",
    "whiteboard/figma/SKILL.md",
    "code/web/SKILL.md",
  ];

  for (const rel of requiredFiles) {
    it(`${rel} exists at the path the CLI resolves to`, () => {
      const abs = join(repoRoot, rel);
      assert.ok(existsSync(abs), `${rel} must be present so the CLI prompt can reference it`);
    });
  }

  it("package.json files field includes every skill directory", () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));
    const files = pkg.files ?? [];
    for (const dir of ["workshop", "whiteboard", "code"]) {
      assert.ok(files.includes(dir), `package.json files[] must include "${dir}" or skills will be missing after npm publish`);
    }
  });
});
