import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, serialize, validate, schema, toCss, toTailwindCss, toFigmaTokens, toStyleDictionary, flattenTokens } from "../../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

function readExample(name) {
  return readFileSync(resolve(root, "docs/examples", name), "utf-8");
}

// ─── parse ───────────────────────────────────────────────────

describe("parse", () => {
  it("parses minimal.yaml", () => {
    const result = parse(readExample("minimal.yaml"));
    assert.equal(result.success, true);
    assert.equal(result.data?.meta.name, "My Brand");
    assert.equal(result.errors.length, 0);
  });

  it("parses standard.yaml", () => {
    const result = parse(readExample("standard.yaml"));
    assert.equal(result.success, true);
    assert.equal(result.data?.meta.name, "Acme Corp");
    assert.ok(result.data?.tokens?.colors?.primary);
  });

  it("parses full.yaml", () => {
    const result = parse(readExample("full.yaml"));
    assert.equal(result.success, true);
    assert.ok(result.data?.core?.essence);
    assert.ok(result.data?.tokens?.colors);
    assert.ok(result.data?.tokens?.typography);
    assert.ok(result.data?.tokens?.spacing);
    assert.ok(result.data?.assets && result.data.assets.length > 0);
    assert.ok(result.data?.guidelines);
    assert.ok(result.data?.extensions);
  });

  it("fails on invalid YAML syntax", () => {
    const result = parse(":::not yaml:::");
    assert.equal(result.success, false);
    assert.ok(result.errors.length > 0);
  });

  it("fails on missing meta", () => {
    const result = parse("core:\n  essence: hello");
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("meta")));
  });

  it("fails on missing meta.name", () => {
    const result = parse("meta:\n  version: '1.0'");
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("meta.name")));
  });

  it("fails when YAML is a scalar", () => {
    const result = parse("hello");
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("object")));
  });

  it("warns on missing core and tokens", () => {
    const result = parse('meta:\n  name: "Test"');
    assert.equal(result.success, true);
    assert.ok(result.warnings.some((w) => w.includes("core")));
    assert.ok(result.warnings.some((w) => w.includes("tokens")));
  });

  it("fails on invalid assets (not array)", () => {
    const result = parse('meta:\n  name: "Test"\nassets: "bad"');
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("assets")));
  });

  it("fails on asset missing file", () => {
    const result = parse('meta:\n  name: "Test"\nassets:\n  - role: logo');
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.includes("file")));
  });
});

// ─── serialize ───────────────────────────────────────────────

describe("serialize", () => {
  it("roundtrips through parse → serialize → parse", () => {
    const original = parse(readExample("standard.yaml"));
    assert.equal(original.success, true);

    const yaml = serialize(original.data);
    const reparsed = parse(yaml);
    assert.equal(reparsed.success, true);
    assert.equal(reparsed.data?.meta.name, original.data?.meta.name);
    assert.deepEqual(
      Object.keys(reparsed.data?.tokens?.colors ?? {}),
      Object.keys(original.data?.tokens?.colors ?? {})
    );
  });
});

// ─── validate ────────────────────────────────────────────────

describe("validate", () => {
  it("validates minimal example", () => {
    const { data } = parse(readExample("minimal.yaml"));
    const result = validate(data);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it("validates standard example", () => {
    const { data } = parse(readExample("standard.yaml"));
    const result = validate(data);
    assert.equal(result.valid, true);
  });

  it("validates full example", () => {
    const { data } = parse(readExample("full.yaml"));
    const result = validate(data);
    assert.equal(result.valid, true);
  });

  it("rejects missing meta.name", () => {
    const result = validate({ meta: {} });
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it("rejects wrong meta.name type", () => {
    const result = validate({ meta: { name: 123 } });
    assert.equal(result.valid, false);
  });
});

// ─── schema ──────────────────────────────────────────────────

describe("schema", () => {
  it("exports a valid JSON Schema object", () => {
    assert.ok(schema);
    assert.equal(schema.$id, "https://brandspec.tools/schema/v0.1.0");
    assert.ok(schema.properties);
  });
});

// ─── toCss ───────────────────────────────────────────────────

describe("toCss", () => {
  it("generates CSS custom properties", () => {
    const { data } = parse(readExample("standard.yaml"));
    const css = toCss(data);
    assert.ok(css.includes(":root {"));
    assert.ok(css.includes("--primary:"));
    assert.ok(css.includes("oklch("));
    assert.ok(css.includes("--typography-heading:"));
  });

  it("returns empty :root for no tokens", () => {
    const css = toCss({ meta: { name: "Test" } });
    assert.equal(css, ":root {}\n");
  });

  it("generates .dark block for dark extensions", () => {
    const { data } = parse(readExample("full.yaml"));
    const css = toCss(data);
    assert.ok(css.includes(".dark {"));
  });
});

// ─── toTailwindCss ───────────────────────────────────────────

describe("toTailwindCss", () => {
  it("generates Tailwind v4 @theme block", () => {
    const { data } = parse(readExample("standard.yaml"));
    const css = toTailwindCss(data);
    assert.ok(css.includes('@import "tailwindcss"'));
    assert.ok(css.includes("@theme {"));
    assert.ok(css.includes("--color-primary:"));
    assert.ok(css.includes("--font-heading:"));
  });

  it("includes spacing and radius tokens", () => {
    const { data } = parse(readExample("full.yaml"));
    const css = toTailwindCss(data);
    assert.ok(css.includes("--spacing-"));
    assert.ok(css.includes("--radius-"));
  });

  it("returns empty @theme for no tokens", () => {
    const css = toTailwindCss({ meta: { name: "Test" } });
    assert.ok(css.includes("@theme {}"));
  });
});

// ─── toFigmaTokens ──────────────────────────────────────────

describe("toFigmaTokens", () => {
  it("generates valid JSON", () => {
    const { data } = parse(readExample("standard.yaml"));
    const json = toFigmaTokens(data);
    const parsed = JSON.parse(json);
    assert.ok(parsed.colors);
    assert.ok(parsed.colors.primary);
    assert.equal(parsed.colors.primary.type, "color");
    assert.ok(parsed.colors.primary.value.includes("oklch"));
  });

  it("returns empty object for no tokens", () => {
    const json = toFigmaTokens({ meta: { name: "Test" } });
    assert.deepEqual(JSON.parse(json), {});
  });
});

// ─── toStyleDictionary ──────────────────────────────────────

describe("toStyleDictionary", () => {
  it("generates tokens.json and config.json", () => {
    const { data } = parse(readExample("standard.yaml"));
    const { tokens, config } = toStyleDictionary(data);

    const t = JSON.parse(tokens);
    assert.ok(t.colors);
    assert.ok(t.colors.primary.$value);
    assert.equal(t.colors.primary.$type, "color");

    const c = JSON.parse(config);
    assert.ok(c.platforms.css);
    assert.ok(c.platforms.scss);
    assert.equal(c.usesDtcg, true);
  });
});

// ─── flattenTokens ──────────────────────────────────────────

describe("flattenTokens", () => {
  it("flattens all token groups", () => {
    const { data } = parse(readExample("full.yaml"));
    const flat = flattenTokens(data);
    assert.ok(flat.length > 0);
    assert.ok(flat.some((t) => t.group === "colors"));
    assert.ok(flat.some((t) => t.group === "typography"));
    assert.ok(flat.some((t) => t.group === "spacing"));
    assert.ok(flat.every((t) => t.token.$value));
  });

  it("returns empty array for no tokens", () => {
    const flat = flattenTokens({ meta: { name: "Test" } });
    assert.deepEqual(flat, []);
  });
});
