import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { ValidationResult } from "./types.js";
import { schema } from "./schema.js";

let ajvInstance: Ajv | null = null;

function getAjv(): Ajv {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

/**
 * Validate a parsed object against the brandspec JSON Schema.
 * Use `parse()` first to get a typed object, then `validate()` for full schema compliance.
 */
export function validate(data: unknown): ValidationResult {
  const ajv = getAjv();
  // Strip $schema and $id — ajv doesn't know draft-2020-12 by default
  // and our schema doesn't use any draft-2020-12-specific features.
  const { $schema: _, $id: __, ...schemaBody } = schema;
  const valid = ajv.validate(schemaBody, data);

  if (valid) {
    return { valid: true, errors: [], warnings: [] };
  }

  const errors: string[] = (ajv.errors ?? []).map((err) => {
    const path = err.instancePath || "/";
    return `${path}: ${err.message}`;
  });

  return { valid: false, errors, warnings: [] };
}
