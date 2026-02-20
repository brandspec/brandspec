/**
 * Lint engine for brandspec.yaml files.
 * Ported from brandspec-tools SaaS — single source of truth.
 */

import type { BrandspecYaml } from "./types.js";
import { findColorValue, getContrastRatio } from "./color.js";

// ── Types ───────────────────────────────────────────────────────

export type LintSeverity = "error" | "warning" | "info";

export interface LintResult {
  rule: string;
  severity: LintSeverity;
  message: string;
  path?: string;
}

export interface LintReport {
  score: number; // 0-100
  results: LintResult[];
  errors: number;
  warnings: number;
  infos: number;
}

// ── Rule type ───────────────────────────────────────────────────

type LintRule = (spec: BrandspecYaml) => LintResult[];

// ── Rules ───────────────────────────────────────────────────────

const requiredFields: LintRule = (spec) => {
  const results: LintResult[] = [];

  if (!spec.meta.version) {
    results.push({
      rule: "meta/version-required",
      severity: "warning",
      message: "meta.version is recommended for tracking changes",
      path: "meta.version",
    });
  }

  if (!spec.core) {
    results.push({
      rule: "core/missing",
      severity: "warning",
      message: "core section is missing \u2014 brand identity is undefined",
      path: "core",
    });
  } else {
    if (!spec.core.essence && !spec.core.tagline) {
      results.push({
        rule: "core/identity-missing",
        severity: "warning",
        message: "Neither essence nor tagline is defined",
        path: "core",
      });
    }
    if (!spec.core.personality || spec.core.personality.length === 0) {
      results.push({
        rule: "core/personality-empty",
        severity: "info",
        message: "No personality traits defined",
        path: "core.personality",
      });
    }
    if (!spec.core.voice) {
      results.push({
        rule: "core/voice-missing",
        severity: "info",
        message: "Voice guidelines not defined",
        path: "core.voice",
      });
    }
  }

  if (!spec.tokens) {
    results.push({
      rule: "tokens/missing",
      severity: "warning",
      message: "No design tokens defined",
      path: "tokens",
    });
  } else {
    if (!spec.tokens.colors || Object.keys(spec.tokens.colors).length === 0) {
      results.push({
        rule: "tokens/colors-empty",
        severity: "warning",
        message: "No color tokens defined",
        path: "tokens.colors",
      });
    }
    if (
      !spec.tokens.typography ||
      Object.keys(spec.tokens.typography).length === 0
    ) {
      results.push({
        rule: "tokens/typography-empty",
        severity: "info",
        message: "No typography tokens defined",
        path: "tokens.typography",
      });
    }
  }

  return results;
};

const colorContrast: LintRule = (spec) => {
  const results: LintResult[] = [];
  const colors = spec.tokens?.colors;
  if (!colors) return results;

  const bg = findColorValue(colors, "background");
  const fg = findColorValue(colors, "foreground");

  if (bg && fg) {
    const ratio = getContrastRatio(bg, fg);
    if (ratio < 4.5) {
      results.push({
        rule: "contrast/bg-fg-aa",
        severity: "error",
        message: `Background/foreground contrast ratio is ${ratio.toFixed(1)}:1 (WCAG AA requires 4.5:1)`,
        path: "tokens.colors",
      });
    } else if (ratio < 7) {
      results.push({
        rule: "contrast/bg-fg-aaa",
        severity: "info",
        message: `Background/foreground contrast ratio is ${ratio.toFixed(1)}:1 (WCAG AAA requires 7:1)`,
        path: "tokens.colors",
      });
    }
  }

  const primary = findColorValue(colors, "primary");
  if (primary && bg) {
    const ratio = getContrastRatio(bg, primary);
    if (ratio < 3) {
      results.push({
        rule: "contrast/primary-bg",
        severity: "warning",
        message: `Primary on background contrast ratio is ${ratio.toFixed(1)}:1 (minimum 3:1 for large text)`,
        path: "tokens.colors.primary",
      });
    }
  }

  return results;
};

const ASSET_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$/;

const assetNaming: LintRule = (spec) => {
  const results: LintResult[] = [];
  if (!spec.assets) return results;

  for (const asset of spec.assets) {
    const fileName = asset.file.split("/").pop() ?? asset.file;
    if (!ASSET_PATTERN.test(fileName)) {
      results.push({
        rule: "assets/naming-convention",
        severity: "warning",
        message: `Asset "${asset.file}" doesn't follow {role}-{variant}.{ext} naming convention`,
        path: "assets",
      });
    }

    if (!asset.role) {
      results.push({
        rule: "assets/role-missing",
        severity: "info",
        message: `Asset "${asset.file}" has no role defined`,
        path: "assets",
      });
    }
  }

  return results;
};

const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const tokenNaming: LintRule = (spec) => {
  const results: LintResult[] = [];
  if (!spec.tokens) return results;

  for (const [group, tokens] of Object.entries(spec.tokens)) {
    if (!tokens || typeof tokens !== "object") continue;
    for (const name of Object.keys(tokens as Record<string, unknown>)) {
      if (name.startsWith("$")) continue; // DTCG metadata
      if (!KEBAB_CASE.test(name)) {
        results.push({
          rule: "tokens/naming-kebab",
          severity: "info",
          message: `Token "${group}.${name}" should use kebab-case`,
          path: `tokens.${group}.${name}`,
        });
      }
    }
  }

  return results;
};

const essentialColors: LintRule = (spec) => {
  const results: LintResult[] = [];
  const colors = spec.tokens?.colors;
  if (!colors) return results;

  const essential = ["primary", "background", "foreground"];
  for (const name of essential) {
    if (!findColorValue(colors, name)) {
      results.push({
        rule: "tokens/essential-color",
        severity: "warning",
        message: `Essential color token "${name}" is missing`,
        path: `tokens.colors.${name}`,
      });
    }
  }

  return results;
};

// ── All rules ───────────────────────────────────────────────────

const ALL_RULES: LintRule[] = [
  requiredFields,
  colorContrast,
  assetNaming,
  tokenNaming,
  essentialColors,
];

// ── Lint entry point ────────────────────────────────────────────

export function lintBrandspec(spec: BrandspecYaml): LintReport {
  const results = ALL_RULES.flatMap((rule) => rule(spec));

  const errors = results.filter((r) => r.severity === "error").length;
  const warnings = results.filter((r) => r.severity === "warning").length;
  const infos = results.filter((r) => r.severity === "info").length;

  // Score: start at 100, -10 per error, -3 per warning, -1 per info
  const score = Math.max(
    0,
    Math.min(100, 100 - errors * 10 - warnings * 3 - infos),
  );

  return { score, results, errors, warnings, infos };
}
