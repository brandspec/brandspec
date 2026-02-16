/**
 * brandspec JSON Schema v0.1.0
 * Bundled from schema/v0.1.0.yaml
 *
 * This is the canonical schema inlined as a JS object
 * so it ships with the package without runtime YAML parsing.
 */
export const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://brandspec.tools/schema/v0.1.0",
  title: "brandspec",
  description: "Brand Identity specification format",
  type: "object" as const,

  required: ["meta"],

  properties: {
    meta: {
      type: "object" as const,
      description: "Brand metadata",
      required: ["name"],
      properties: {
        name: { type: "string" as const, description: "Brand name" },
        version: { type: "string" as const, description: "Brand spec version (semver)" },
        updated: { type: "string" as const, format: "date", description: "Last updated date" },
        description: { type: "string" as const, description: "Brief brand description" },
        url: { type: "string" as const, format: "uri", description: "Brand website" },
      },
      additionalProperties: true,
    },

    core: {
      type: "object" as const,
      description: "Brand essence, personality, and voice",
      properties: {
        essence: { type: "string" as const },
        tagline: { type: "string" as const },
        mission: { type: "string" as const },
        vision: { type: "string" as const },
        values: { type: "array" as const, items: { type: "string" as const } },
        personality: { type: "array" as const, items: { type: "string" as const } },
        voice: {
          type: "object" as const,
          properties: {
            tone: { type: "array" as const, items: { type: "string" as const } },
            principles: { type: "array" as const, items: { type: "string" as const } },
          },
          additionalProperties: true,
        },
      },
      additionalProperties: true,
    },

    tokens: {
      type: "object" as const,
      description: "Design tokens (W3C DTCG compliant)",
      additionalProperties: true,
    },

    assets: {
      type: "array" as const,
      description: "Brand assets",
      items: {
        type: "object" as const,
        required: ["file"],
        properties: {
          file: { type: "string" as const },
          id: { type: "string" as const },
          role: { type: "string" as const },
          variant: { type: "string" as const },
          context: { type: "string" as const },
          description: { type: "string" as const },
          formats: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                path: { type: "string" as const },
                width: { type: "integer" as const },
                height: { type: "integer" as const },
              },
              additionalProperties: true,
            },
          },
          tags: { type: "array" as const, items: { type: "string" as const } },
        },
        additionalProperties: true,
      },
    },

    guidelines: {
      type: "object" as const,
      description: "Usage guidelines",
      additionalProperties: {
        type: "object" as const,
        properties: {
          content: { type: "string" as const },
          rules: {
            type: "array" as const,
            items: { $ref: "#/$defs/guidelineRule" },
          },
        },
        additionalProperties: true,
      },
    },

    extensions: {
      type: "object" as const,
      description: "Custom extensions",
      additionalProperties: true,
    },
  },

  additionalProperties: true,

  $defs: {
    guidelineRule: {
      type: "object" as const,
      required: ["description", "severity"],
      properties: {
        id: { type: "string" as const },
        description: { type: "string" as const },
        severity: {
          type: "string" as const,
          enum: ["info", "warning", "error"],
        },
        criteria: { type: "array" as const, items: { type: "string" as const } },
        applies_to: { type: "string" as const },
      },
      additionalProperties: true,
    },
  },
} as const;
