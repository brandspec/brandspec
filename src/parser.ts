import yaml from "js-yaml";
import type { BrandspecYaml, ParseResult } from "./types.js";

/**
 * Parse a YAML string into a typed BrandspecYaml object.
 * Performs structural validation (required fields, correct types).
 * For full schema validation, use `validate()` after parsing.
 */
export function parse(content: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (e) {
    return {
      success: false,
      errors: [`Invalid YAML: ${e instanceof Error ? e.message : "Unknown error"}`],
      warnings: [],
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return { success: false, errors: ["YAML must be an object"], warnings: [] };
  }

  const doc = parsed as Record<string, unknown>;

  // meta (required)
  if (!doc.meta || typeof doc.meta !== "object") {
    errors.push("Missing required field: meta");
    return { success: false, errors, warnings };
  }

  const meta = doc.meta as Record<string, unknown>;
  if (!meta.name || typeof meta.name !== "string") {
    errors.push("Missing required field: meta.name");
    return { success: false, errors, warnings };
  }

  // assets validation
  if (doc.assets !== undefined) {
    if (!Array.isArray(doc.assets)) {
      errors.push("Field 'assets' must be an array");
    } else {
      doc.assets.forEach((asset: unknown, i: number) => {
        if (!asset || typeof asset !== "object") {
          errors.push(`assets[${i}] must be an object`);
        } else {
          const a = asset as Record<string, unknown>;
          if (!a.file || typeof a.file !== "string") {
            errors.push(`assets[${i}].file is required and must be a string`);
          }
        }
      });
    }
  }

  // Soft warnings
  if (!doc.core) {
    warnings.push("No 'core' section — brand essence, personality, and voice are recommended");
  }
  if (!doc.tokens) {
    warnings.push("No 'tokens' section — design tokens are recommended");
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  return {
    success: true,
    data: doc as unknown as BrandspecYaml,
    errors: [],
    warnings,
  };
}

/** Serialize a BrandspecYaml object back to YAML string. */
export function serialize(data: BrandspecYaml): string {
  return yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
}
