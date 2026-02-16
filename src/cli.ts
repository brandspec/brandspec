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
    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
