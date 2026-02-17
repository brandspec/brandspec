import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "./parser.js";
import { validate } from "./validate.js";
import { serialize } from "./parser.js";
import { toCss, toTailwindCss, toFigmaTokens, toStyleDictionary } from "./tokens.js";
import type { BrandspecYaml } from "./types.js";

const VERSION = "0.1.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HELP = `
brandspec v${VERSION}
Define Brand Identity as code.

Usage:
  brandspec <command> [options]

Commands:
  init              Create a new brandspec.yaml in the current directory
  validate [path]   Validate a brandspec.yaml file (default: ./brandspec.yaml)
  generate [path]   Generate dist files from brandspec.yaml
    --format <fmt>   css, tailwind, figma, sd, all (default: all)
    --out <dir>      Output directory (default: ./dist)

  workshop start [name]   Scaffold a new brand project with workshop structure
  workshop status         Show current workshop position
  workshop resume         Reconstruct state from decisions.yml

  consult [path]          Print brand context for AI consultation

Options:
  --help, -h       Show this help
  --version, -v    Show version
`.trim();

const MINIMAL_TEMPLATE: BrandspecYaml = {
  meta: {
    name: "My Brand",
    version: "0.1.0",
    updated: new Date().toISOString().split("T")[0],
  },
  core: {
    essence: "",
    tagline: "",
    personality: [],
    voice: {
      tone: [],
      principles: [],
    },
  },
  tokens: {
    colors: {
      primary: {
        $value: "oklch(0.65 0.18 250)",
        $type: "color",
        $description: "Primary brand color",
      },
      "primary-foreground": {
        $value: "oklch(0.98 0.01 250)",
        $type: "color",
      },
      background: {
        $value: "oklch(0.99 0.005 250)",
        $type: "color",
      },
      foreground: {
        $value: "oklch(0.15 0.02 250)",
        $type: "color",
      },
    },
    typography: {
      heading: {
        $value: "Inter, system-ui, sans-serif",
        $type: "fontFamily",
      },
      body: {
        $value: "Inter, system-ui, sans-serif",
        $type: "fontFamily",
      },
    },
  },
};

function cmdInit() {
  const target = resolve("brandspec.yaml");

  if (existsSync(target)) {
    console.error("brandspec.yaml already exists in this directory.");
    process.exit(1);
  }

  const content = serialize(MINIMAL_TEMPLATE);
  writeFileSync(target, content, "utf-8");
  console.log("Created brandspec.yaml");
}

function cmdValidate(filePath?: string) {
  const target = resolve(filePath ?? "brandspec.yaml");

  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");

  // Step 1: Parse
  const parseResult = parse(content);
  if (!parseResult.success) {
    console.error("Parse errors:");
    for (const err of parseResult.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  // Step 2: Schema validation
  const validationResult = validate(parseResult.data);

  // Output warnings
  for (const w of parseResult.warnings) {
    console.warn(`  warn: ${w}`);
  }
  for (const w of validationResult.warnings) {
    console.warn(`  warn: ${w}`);
  }

  if (!validationResult.valid) {
    console.error("Schema validation errors:");
    for (const err of validationResult.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  // Summary
  const data = parseResult.data!;
  const colorCount = data.tokens?.colors ? Object.keys(data.tokens.colors).length : 0;
  const assetCount = data.assets?.length ?? 0;
  const guidelineCount = data.guidelines ? Object.keys(data.guidelines).length : 0;

  console.log(`Valid: ${data.meta.name}`);
  if (data.core?.essence) console.log(`  "${data.core.essence}"`);
  console.log(`  ${colorCount} colors, ${assetCount} assets, ${guidelineCount} guideline sections`);
}

type Format = "css" | "tailwind" | "figma" | "sd" | "all";

function cmdGenerate(args: string[]) {
  let filePath: string | undefined;
  let format: Format = "all";
  let outDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      format = args[++i] as Format;
    } else if (args[i] === "--out" && args[i + 1]) {
      outDir = args[++i];
    } else if (!args[i].startsWith("-")) {
      filePath = args[i];
    }
  }

  const target = resolve(filePath ?? "brandspec.yaml");
  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const parseResult = parse(content);
  if (!parseResult.success) {
    console.error("Parse errors:");
    for (const err of parseResult.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const data = parseResult.data!;
  const dist = resolve(outDir ?? "dist");
  mkdirSync(dist, { recursive: true });

  const generated: string[] = [];

  if (format === "css" || format === "all") {
    const out = resolve(dist, "tokens.css");
    writeFileSync(out, toCss(data), "utf-8");
    generated.push("tokens.css");
  }

  if (format === "tailwind" || format === "all") {
    const out = resolve(dist, "theme.css");
    writeFileSync(out, toTailwindCss(data), "utf-8");
    generated.push("theme.css");
  }

  if (format === "figma" || format === "all") {
    const out = resolve(dist, "figma-tokens.json");
    writeFileSync(out, toFigmaTokens(data), "utf-8");
    generated.push("figma-tokens.json");
  }

  if (format === "sd" || format === "all") {
    const sdDir = resolve(dist, "style-dictionary");
    mkdirSync(sdDir, { recursive: true });
    const sd = toStyleDictionary(data);
    writeFileSync(resolve(sdDir, "tokens.json"), sd.tokens, "utf-8");
    writeFileSync(resolve(sdDir, "config.json"), sd.config, "utf-8");
    generated.push("style-dictionary/tokens.json");
    generated.push("style-dictionary/config.json");
  }

  console.log(`Generated from ${data.meta.name}:`);
  for (const f of generated) {
    console.log(`  ${dist}/${f}`);
  }
}

// ── Workshop commands ──

function getWorkshopTemplatesDir(): string {
  // Templates are shipped alongside the CLI in the npm package
  return resolve(__dirname, "..", "workshop", "templates");
}

function cmdWorkshopStart(name?: string) {
  const brandName = name ?? "my-brand";
  const targetDir = resolve(`brandspec-${brandName}`);

  if (existsSync(targetDir)) {
    console.error(`Directory already exists: brandspec-${brandName}/`);
    process.exit(1);
  }

  const templatesDir = getWorkshopTemplatesDir();
  if (!existsSync(templatesDir)) {
    console.error("Workshop templates not found. Ensure brandspec is installed correctly.");
    process.exit(1);
  }

  // Scaffold the project
  cpSync(templatesDir, targetDir, { recursive: true });

  // Update position.yml with timestamp
  const positionPath = join(targetDir, ".workshop", "position.yml");
  if (existsSync(positionPath)) {
    let pos = readFileSync(positionPath, "utf-8");
    pos = pos.replace('updated: ""', `updated: "${new Date().toISOString()}"`);
    writeFileSync(positionPath, pos, "utf-8");
  }

  console.log(`Created brandspec-${brandName}/`);
  console.log();
  console.log("Next steps:");
  console.log(`  cd brandspec-${brandName}`);
  console.log();
  console.log("  # With Claude Code:");
  console.log('  claude "Let\'s start the brand workshop"');
  console.log();
  console.log("  # With other LLMs:");
  console.log("  Share workshop/flow.md and workshop/phases/01-discovery.md");
  console.log("  with your AI to begin Phase 1: Discovery");
}

function cmdWorkshopStatus() {
  const positionPath = resolve(".workshop", "position.yml");
  if (!existsSync(positionPath)) {
    console.error("No .workshop/position.yml found in current directory.");
    console.error("Are you inside a brandspec project?");
    process.exit(1);
  }

  const content = readFileSync(positionPath, "utf-8");
  console.log("Workshop status:");
  console.log(content);
}

function cmdWorkshopResume() {
  const decisionsPath = resolve(".workshop", "decisions.yml");
  const positionPath = resolve(".workshop", "position.yml");

  if (!existsSync(decisionsPath) || !existsSync(positionPath)) {
    console.error("No .workshop/ state found in current directory.");
    process.exit(1);
  }

  const position = readFileSync(positionPath, "utf-8");
  const decisions = readFileSync(decisionsPath, "utf-8");

  console.log("Workshop state:");
  console.log();
  console.log("── Position ──");
  console.log(position);
  console.log("── Decisions ──");
  console.log(decisions);
  console.log();
  console.log("Pass this output to your AI to resume the workshop session.");
}

function cmdWorkshop(args: string[]) {
  const sub = args[0];

  if (!sub || sub === "--help") {
    console.log(`
brandspec workshop — AI-facilitated brand creation

Commands:
  start [name]   Scaffold a new brand project (default name: my-brand)
  status         Show current workshop position
  resume         Print state for AI session resumption
    `.trim());
    process.exit(0);
  }

  switch (sub) {
    case "start":
      cmdWorkshopStart(args[1]);
      break;
    case "status":
      cmdWorkshopStatus();
      break;
    case "resume":
      cmdWorkshopResume();
      break;
    default:
      console.error(`Unknown workshop command: ${sub}`);
      process.exit(1);
  }
}

// ── Consult command ──

function cmdConsult(args: string[]) {
  const filePath = args.find((a) => !a.startsWith("-"));
  const target = resolve(filePath ?? "brandspec.yaml");

  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const parseResult = parse(content);
  if (!parseResult.success) {
    console.error("Parse errors:");
    for (const err of parseResult.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const data = parseResult.data!;
  const lines: string[] = [];

  // Header
  lines.push(`# You are a brand consultant for ${data.meta.name}.`);
  lines.push("");

  // Role
  lines.push("## Your Role");
  lines.push(
    "You evaluate business decisions, creative work, and communications " +
      "against this brand's identity. When asked about any business decision, " +
      "advertisement, campaign, copy, or design — assess whether it aligns " +
      "with the brand. Flag inconsistencies and suggest alternatives.",
  );
  lines.push("");

  // Brand Identity
  lines.push("## Brand Identity");
  lines.push(`- Name: ${data.meta.name}`);
  if (data.meta.description) lines.push(`- Description: ${data.meta.description}`);
  if (data.core?.essence) lines.push(`- Essence: ${data.core.essence}`);
  if (data.core?.tagline) lines.push(`- Tagline: ${data.core.tagline}`);
  if (data.core?.mission) lines.push(`- Mission: ${data.core.mission}`);
  if (data.core?.vision) lines.push(`- Vision: ${data.core.vision}`);
  if (data.core?.values?.length) lines.push(`- Values: ${data.core.values.join(", ")}`);
  if (data.core?.personality?.length)
    lines.push(`- Personality: ${data.core.personality.join(", ")}`);
  lines.push("");

  // Voice & Tone
  if (data.core?.voice) {
    const v = data.core.voice;
    lines.push("## Voice & Tone");
    if (v.tone?.length) lines.push(`Tone: ${v.tone.join(", ")}`);
    if (v.principles?.length) {
      lines.push("Principles:");
      for (const p of v.principles) lines.push(`- ${p}`);
    }
    lines.push("");
  }

  // Do / Don't from extensions.brand-voice.boundaries
  const brandVoice = data.extensions?.["brand-voice"] as
    | { metaphor?: string; boundaries?: { do?: string[]; dont?: string[] } }
    | undefined;
  if (brandVoice?.boundaries) {
    const b = brandVoice.boundaries;
    lines.push("## Do / Don't");
    if (brandVoice.metaphor) lines.push(`Voice metaphor: ${brandVoice.metaphor}`);
    if (b.do?.length) {
      lines.push("Do:");
      for (const d of b.do) lines.push(`- ${d}`);
    }
    if (b.dont?.length) {
      lines.push("Don't:");
      for (const d of b.dont) lines.push(`- ${d}`);
    }
    lines.push("");
  }

  // Visual Identity
  const hasColors = data.tokens?.colors && Object.keys(data.tokens.colors).length > 0;
  const hasTypography = data.tokens?.typography && Object.keys(data.tokens.typography).length > 0;
  const hasAssets = data.assets && data.assets.length > 0;

  if (hasColors || hasTypography || hasAssets) {
    lines.push("## Visual Identity");

    if (hasColors) {
      lines.push("Colors:");
      for (const [name, token] of Object.entries(data.tokens!.colors!)) {
        if (token.$description) {
          const hex = (token.$extensions as Record<string, Record<string, string>> | undefined)
            ?.compat?.hex;
          lines.push(`- ${name}: ${token.$description}${hex ? ` (${hex})` : ""}`);
        }
      }
    }

    if (hasTypography) {
      lines.push("Typography:");
      for (const [name, token] of Object.entries(data.tokens!.typography!)) {
        const desc = token.$description ? ` — ${token.$description}` : "";
        lines.push(`- ${name}: ${token.$value}${desc}`);
      }
    }

    if (hasAssets) {
      // Detect logo system pattern from asset roles
      const roles = new Set(data.assets!.map((a) => a.role).filter(Boolean));
      const parts: string[] = [];
      if (roles.has("symbol")) parts.push("symbol");
      if (roles.has("wordmark")) parts.push("wordmark");
      if (roles.has("lockup-horizontal") || roles.has("lockup-vertical") || roles.has("lockup"))
        parts.push("lockup");
      if (roles.has("favicon")) parts.push("favicon");

      if (parts.length) {
        lines.push(`Logo system: ${parts.join(" + ")}`);
      }

      // List assets with descriptions
      for (const asset of data.assets!) {
        if (asset.description) {
          lines.push(`- ${asset.id ?? asset.file}: ${asset.description}`);
        }
      }
    }

    lines.push("");
  }

  // Guidelines
  if (data.guidelines && Object.keys(data.guidelines).length > 0) {
    lines.push("## Guidelines");
    for (const [, section] of Object.entries(data.guidelines)) {
      if (section.content) {
        lines.push(section.content.trim());
        lines.push("");
      }
      if (section.rules?.length) {
        for (const rule of section.rules) {
          lines.push(`- [${rule.severity}] ${rule.description}`);
        }
        lines.push("");
      }
    }
  }

  // Additional Context from extensions (excluding brand-voice already handled)
  if (data.extensions) {
    const extKeys = Object.keys(data.extensions).filter((k) => k !== "brand-voice");
    if (extKeys.length > 0) {
      lines.push("## Additional Context");
      for (const key of extKeys) {
        const ext = data.extensions[key];
        if (ext && typeof ext === "object" && !Array.isArray(ext)) {
          // Only include objects that have at least one simple string value
          const record = ext as Record<string, unknown>;
          const stringEntries = Object.entries(record).filter(
            ([, v]) => typeof v === "string",
          );
          if (stringEntries.length > 0) {
            lines.push(`### ${key}`);
            for (const [k, v] of stringEntries) {
              lines.push(`- ${k}: ${v}`);
            }
            lines.push("");
          }
        }
      }
    }
  }

  // Usage hint
  lines.push("---");
  lines.push(
    "Use this prompt as a system message for any AI model to get brand-aligned consultation.",
  );

  console.log(lines.join("\n"));
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    process.exit(0);
  }

  switch (command) {
    case "init":
      cmdInit();
      break;
    case "validate":
      cmdValidate(args[1]);
      break;
    case "generate":
      cmdGenerate(args.slice(1));
      break;
    case "workshop":
      cmdWorkshop(args.slice(1));
      break;
    case "consult":
      cmdConsult(args.slice(1));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
