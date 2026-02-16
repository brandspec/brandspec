import type { BrandspecYaml, DesignToken } from "./types.js";

/**
 * Extract all tokens as flat CSS custom properties.
 *
 * Output:
 *   :root {
 *     --primary: oklch(0.65 0.18 250);
 *     --primary-foreground: oklch(0.98 0.01 250);
 *     --font-heading: Inter, system-ui, sans-serif;
 *     ...
 *   }
 */
export function toCss(data: BrandspecYaml): string {
  const lines: string[] = [];

  if (!data.tokens) return ":root {}\n";

  for (const [group, tokens] of Object.entries(data.tokens)) {
    if (!tokens) continue;
    for (const [name, token] of Object.entries(tokens)) {
      const prefix = group === "colors" ? "" : `${group}-`;
      const varName = `--${prefix}${name}`;
      lines.push(`  ${varName}: ${token.$value};`);
    }
  }

  // Dark mode tokens from $extensions.dark
  const darkLines: string[] = [];
  if (data.tokens.colors) {
    for (const [name, token] of Object.entries(data.tokens.colors)) {
      const dark = token.$extensions?.["dark"];
      if (typeof dark === "string") {
        darkLines.push(`  --${name}: ${dark};`);
      }
    }
  }

  let output = `:root {\n${lines.join("\n")}\n}\n`;

  if (darkLines.length > 0) {
    output += `\n.dark {\n${darkLines.join("\n")}\n}\n`;
  }

  return output;
}

/**
 * Generate a Tailwind v4 CSS import with theme tokens.
 *
 * Tailwind v4 uses CSS-based configuration:
 *   @theme {
 *     --color-primary: oklch(0.65 0.18 250);
 *     --font-heading: Inter, system-ui, sans-serif;
 *   }
 */
export function toTailwindCss(data: BrandspecYaml): string {
  const lines: string[] = [];

  if (!data.tokens) return '@import "tailwindcss";\n\n@theme {}\n';

  if (data.tokens.colors) {
    for (const [name, token] of Object.entries(data.tokens.colors)) {
      lines.push(`  --color-${name}: ${token.$value};`);
    }
  }

  if (data.tokens.typography) {
    for (const [name, token] of Object.entries(data.tokens.typography)) {
      lines.push(`  --font-${name}: ${token.$value};`);
    }
  }

  if (data.tokens.spacing) {
    for (const [name, token] of Object.entries(data.tokens.spacing)) {
      lines.push(`  --spacing-${name}: ${token.$value};`);
    }
  }

  if (data.tokens.radius) {
    for (const [name, token] of Object.entries(data.tokens.radius)) {
      lines.push(`  --radius-${name}: ${token.$value};`);
    }
  }

  return `@import "tailwindcss";\n\n@theme {\n${lines.join("\n")}\n}\n`;
}

/**
 * Generate Figma-compatible tokens JSON (Style Dictionary / Tokens Studio format).
 */
export function toFigmaTokens(data: BrandspecYaml): string {
  if (!data.tokens) return JSON.stringify({}, null, 2);

  const output: Record<string, Record<string, { value: string; type: string; description?: string }>> = {};

  for (const [group, tokens] of Object.entries(data.tokens)) {
    if (!tokens) continue;
    output[group] = {};
    for (const [name, token] of Object.entries(tokens)) {
      output[group][name] = {
        value: token.$value,
        type: token.$type ?? group,
        ...(token.$description && { description: token.$description }),
      };
    }
  }

  return JSON.stringify(output, null, 2) + "\n";
}

/**
 * Generate Style Dictionary token file (DTCG format) + config.
 *
 * Outputs two files:
 *   tokens.json  — DTCG token definitions ($value, $type)
 *   config.json  — Style Dictionary v4 config with common platforms
 *
 * Usage: `npx style-dictionary build --config config.json`
 */
export function toStyleDictionary(data: BrandspecYaml): { tokens: string; config: string } {
  // tokens.json — preserve DTCG $value/$type format
  const tokenFile: Record<string, Record<string, Record<string, unknown>>> = {};

  if (data.tokens) {
    for (const [group, tokens] of Object.entries(data.tokens)) {
      if (!tokens) continue;
      tokenFile[group] = {};
      for (const [name, token] of Object.entries(tokens)) {
        tokenFile[group][name] = {
          $value: token.$value,
          $type: token.$type ?? group,
          ...(token.$description && { $description: token.$description }),
        };
      }
    }
  }

  const tokens = JSON.stringify(tokenFile, null, 2) + "\n";

  // config.json — ready to run
  const brandName = data.meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const config = {
    source: ["tokens.json"],
    usesDtcg: true,
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: `build/css/`,
        files: [
          {
            destination: "variables.css",
            format: "css/variables",
            options: { outputReferences: true },
          },
        ],
      },
      scss: {
        transformGroup: "scss",
        buildPath: `build/scss/`,
        files: [
          {
            destination: "_variables.scss",
            format: "scss/variables",
            options: { outputReferences: true },
          },
        ],
      },
      ios: {
        transformGroup: "ios-swift",
        buildPath: `build/ios/`,
        files: [
          {
            destination: `${brandName}.swift`,
            format: "ios-swift/class.swift",
            className: data.meta.name.replace(/[^a-zA-Z0-9]/g, ""),
          },
        ],
      },
      android: {
        transformGroup: "android",
        buildPath: `build/android/`,
        files: [
          {
            destination: "colors.xml",
            format: "android/resources",
            filter: { $type: "color" },
          },
          {
            destination: "dimens.xml",
            format: "android/resources",
            filter: { $type: "dimension" },
          },
        ],
      },
    },
  };

  return { tokens, config: JSON.stringify(config, null, 2) + "\n" };
}

/** Flatten all tokens to a simple key-value map. */
export function flattenTokens(
  data: BrandspecYaml
): Array<{ group: string; name: string; token: DesignToken }> {
  const result: Array<{ group: string; name: string; token: DesignToken }> = [];

  if (!data.tokens) return result;

  for (const [group, tokens] of Object.entries(data.tokens)) {
    if (!tokens) continue;
    for (const [name, token] of Object.entries(tokens)) {
      result.push({ group, name, token });
    }
  }

  return result;
}
