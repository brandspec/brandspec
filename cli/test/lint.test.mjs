import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parse,
  validate,
  lintBrandspec,
  parseColor,
  getContrastRatio,
} from "../../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

function readExample(name) {
  return readFileSync(resolve(root, "docs/examples", name), "utf-8");
}

// ─── parseColor ─────────────────────────────────────────────────

describe("parseColor", () => {
  it("parses 6-digit hex", () => {
    const c = parseColor("#ff8000");
    assert.deepEqual(c, [255, 128, 0]);
  });

  it("parses 3-digit hex", () => {
    const c = parseColor("#f00");
    assert.deepEqual(c, [255, 0, 0]);
  });

  it("parses rgb()", () => {
    const c = parseColor("rgb(10, 20, 30)");
    assert.deepEqual(c, [10, 20, 30]);
  });

  it("parses oklch()", () => {
    const c = parseColor("oklch(0.65 0.18 250)");
    assert.ok(c);
    assert.equal(c.length, 3);
    c.forEach((v) => {
      assert.ok(v >= 0 && v <= 255);
    });
  });

  it("parses oklch with percent lightness", () => {
    const c = parseColor("oklch(65% 0.18 250)");
    assert.ok(c);
    assert.equal(c.length, 3);
  });

  it("returns null for invalid strings", () => {
    assert.equal(parseColor("not-a-color"), null);
    assert.equal(parseColor(""), null);
    assert.equal(parseColor("hsl(120, 50%, 50%)"), null);
  });
});

// ─── getContrastRatio ───────────────────────────────────────────

describe("getContrastRatio", () => {
  it("returns 21 for black on white", () => {
    const ratio = getContrastRatio("#ffffff", "#000000");
    assert.ok(ratio >= 20.9 && ratio <= 21.1);
  });

  it("returns 1 for same color", () => {
    const ratio = getContrastRatio("#888888", "#888888");
    assert.ok(ratio >= 0.99 && ratio <= 1.01);
  });

  it("returns 21 (safe side) when color cannot be parsed", () => {
    const ratio = getContrastRatio("invalid", "#000000");
    assert.equal(ratio, 21);
  });
});

// ─── requiredFields rule ────────────────────────────────────────

describe("requiredFields rule", () => {
  it("warns when meta.version is missing", () => {
    const spec = { meta: { name: "Test" } };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "meta/version-required"));
  });

  it("warns when core section is missing", () => {
    const spec = { meta: { name: "Test", version: "1.0" } };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "core/missing"));
  });

  it("reports info when personality is empty", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      core: { essence: "e", personality: [] },
    };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "core/personality-empty"));
  });

  it("reports info when voice is missing", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      core: { essence: "e", personality: ["bold"] },
    };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "core/voice-missing"));
  });
});

// ─── colorContrast rule ─────────────────────────────────────────

describe("colorContrast rule", () => {
  it("reports error for low bg/fg contrast (AA violation)", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#999999", $type: "color" },
          primary: { $value: "#000000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "contrast/bg-fg-aa"));
  });

  it("reports info for AA-pass but AAA-fail contrast", () => {
    // #595959 on white ≈ 7.0:1, #767676 on white ≈ 4.54:1
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#767676", $type: "color" },
          primary: { $value: "#000000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(
      report.results.some((r) => r.rule === "contrast/bg-fg-aaa"),
      "Should report AAA info",
    );
    assert.ok(
      !report.results.some((r) => r.rule === "contrast/bg-fg-aa"),
      "Should not report AA error",
    );
  });

  it("warns when primary/bg contrast is below 3:1", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#000000", $type: "color" },
          primary: { $value: "#dddddd", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "contrast/primary-bg"));
  });
});

// ─── assetNaming rule ───────────────────────────────────────────

describe("assetNaming rule", () => {
  it("warns on uppercase in asset filename", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      assets: [{ file: "Logo_Primary.SVG", role: "logo" }],
    };
    const report = lintBrandspec(spec);
    assert.ok(
      report.results.some((r) => r.rule === "assets/naming-convention"),
    );
  });

  it("warns on underscore in asset filename", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      assets: [{ file: "logo_primary.svg", role: "logo" }],
    };
    const report = lintBrandspec(spec);
    assert.ok(
      report.results.some((r) => r.rule === "assets/naming-convention"),
    );
  });

  it("passes for kebab-case asset filename", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      assets: [{ file: "logo-primary.svg", role: "logo" }],
    };
    const report = lintBrandspec(spec);
    assert.ok(
      !report.results.some((r) => r.rule === "assets/naming-convention"),
    );
  });

  it("extracts filename from path for validation", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      assets: [{ file: "assets/logo-primary.svg", role: "logo" }],
    };
    const report = lintBrandspec(spec);
    assert.ok(
      !report.results.some((r) => r.rule === "assets/naming-convention"),
    );
  });
});

// ─── tokenNaming rule ───────────────────────────────────────────

describe("tokenNaming rule", () => {
  it("reports info for camelCase token names", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          primaryColor: { $value: "#ff0000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(report.results.some((r) => r.rule === "tokens/naming-kebab"));
  });

  it("passes for kebab-case token names", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          "primary-color": { $value: "#ff0000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(!report.results.some((r) => r.rule === "tokens/naming-kebab"));
  });

  it("skips $ keys (DTCG metadata)", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          $description: "Color tokens",
          primary: { $value: "#ff0000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(!report.results.some((r) => r.rule === "tokens/naming-kebab"));
  });
});

// ─── essentialColors rule ───────────────────────────────────────

describe("essentialColors rule", () => {
  it("passes when all 3 essential colors exist", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {
          primary: { $value: "#ff0000", $type: "color" },
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#000000", $type: "color" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.ok(
      !report.results.some((r) => r.rule === "tokens/essential-color"),
    );
  });

  it("warns for each missing essential color", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      tokens: {
        colors: {},
      },
    };
    const report = lintBrandspec(spec);
    const essentialWarnings = report.results.filter(
      (r) => r.rule === "tokens/essential-color",
    );
    assert.equal(essentialWarnings.length, 3);
  });
});

// ─── scoring ────────────────────────────────────────────────────

describe("scoring", () => {
  it("returns 100 for a fully complete spec", () => {
    const spec = {
      meta: { name: "Test", version: "1.0" },
      core: {
        essence: "e",
        tagline: "t",
        personality: ["bold"],
        voice: { tone: ["warm"], principles: ["be clear"] },
      },
      tokens: {
        colors: {
          primary: { $value: "#0000ff", $type: "color" },
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#000000", $type: "color" },
        },
        typography: {
          heading: { $value: "Inter", $type: "fontFamily" },
        },
      },
    };
    const report = lintBrandspec(spec);
    assert.equal(report.score, 100);
    assert.equal(report.errors, 0);
    assert.equal(report.warnings, 0);
    assert.equal(report.infos, 0);
  });

  it("returns score >= 0 for bare spec", () => {
    const spec = { meta: { name: "Bare" } };
    const report = lintBrandspec(spec);
    assert.ok(report.score >= 0);
    assert.ok(report.score <= 100);
  });

  it("deducts correctly: -10 error, -3 warning, -1 info", () => {
    // 1 error (contrast) + warnings + infos → verify formula
    const spec = {
      meta: { name: "Test", version: "1.0" },
      core: {
        essence: "e",
        personality: ["bold"],
        voice: { tone: ["warm"] },
      },
      tokens: {
        colors: {
          primary: { $value: "#ff0000", $type: "color" },
          background: { $value: "#ffffff", $type: "color" },
          foreground: { $value: "#cccccc", $type: "color" },
        },
        typography: {
          heading: { $value: "Inter", $type: "fontFamily" },
        },
      },
    };
    const report = lintBrandspec(spec);
    const expected = 100 - report.errors * 10 - report.warnings * 3 - report.infos;
    assert.equal(report.score, Math.max(0, Math.min(100, expected)));
  });
});

// ─── integration with example files ─────────────────────────────

describe("lint integration", () => {
  it("lints standard.yaml without errors", () => {
    const content = readExample("standard.yaml");
    const { data } = parse(content);
    const vResult = validate(data);
    assert.ok(vResult.valid);

    const report = lintBrandspec(data);
    assert.equal(report.errors, 0);
    assert.ok(report.score >= 80);
  });

  it("lints full.yaml without errors", () => {
    const content = readExample("full.yaml");
    const { data } = parse(content);
    const vResult = validate(data);
    assert.ok(vResult.valid);

    const report = lintBrandspec(data);
    assert.equal(report.errors, 0);
    assert.ok(report.score >= 70);
  });

  it("lints minimal.yaml (bare spec produces warnings)", () => {
    const content = readExample("minimal.yaml");
    const { data } = parse(content);
    const vResult = validate(data);
    assert.ok(vResult.valid);

    const report = lintBrandspec(data);
    assert.ok(report.warnings > 0 || report.infos > 0);
    assert.ok(report.score >= 0);
  });
});
