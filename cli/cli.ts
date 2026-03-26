import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  mkdirSync,
  cpSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { parse } from "./parser.js";
import { validate } from "./validate.js";
import { lintBrandspec } from "./lint.js";
import type { LintReport } from "./lint.js";
import { toCss, toTailwindCss, toFigmaTokens, toStyleDictionary } from "./tokens.js";
import {
  API_BASE,
  getCredentialsPath,
  loadToken,
  loadRemote,
  ensureBrandspecrc,
  saveCredentials,
} from "./remote.js";
import type { BrandspecYaml } from "./types.js";

const VERSION = "0.1.0";

// ── Color utilities (NO_COLOR + TTY aware) ──

function color(code: string, text: string): string {
  if (process.env.NO_COLOR || !process.stdout.isTTY) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}
const green = (t: string) => color("32", t);
const yellow = (t: string) => color("33", t);
const red = (t: string) => color("31", t);
const dim = (t: string) => color("2", t);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function requireToken(): string {
  const token = loadToken();
  if (!token) {
    console.error("Not logged in. Run 'brandspec login' first or set BRANDSPEC_TOKEN.");
    process.exit(1);
  }
  return token;
}

function requireRemote(args: string[]): { org: string; brand: string } {
  const remote = loadRemote(args);
  if (!remote) {
    console.error("No remote specified. Use 'brandspec push org/brand' or create .brandspecrc.");
    process.exit(1);
  }
  return remote;
}

const HELP = `
brandspec v${VERSION}
Define Brand Identity as code.

Usage:
  brandspec                Lint brand.yaml in current directory
  brandspec <command> [options]

Commands:
  init              Create a brandspec/ directory with templates
  lint [path]       Lint a brand.yaml (validate + rules + score)
    --json           Output as JSON (for CI/pipe)
    --quiet          Exit code only, no output
  validate [path]   Alias for lint
  generate [path]   Generate token files from brand.yaml
    --format <fmt>   css, tailwind, figma, sd, all (comma-separated)
    --out <dir>      Output directory (default: output/ next to brand.yaml)

  consult [path]          Print brand context for AI consultation

  workshop          Print prompt for AI brand workshop
  workshop status   Show current workshop position
  whiteboard        Print prompt for Figma design system session
  code [stack]      Print prompt for Figma-to-code session (default: web)

  login             Save API token for brandspec.tools
  logout            Remove saved API token
  pull [org/brand]  Pull brand from brandspec.tools
    --no-workshop    Exclude _workshop/ files
  push [org/brand]  Push brand to brandspec.tools

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

function resolveBrandYaml(filePath?: string): string {
  let target = resolve(filePath ?? "brand.yaml");
  if (existsSync(target) && statSync(target).isDirectory()) {
    target = join(target, "brand.yaml");
  }
  return target;
}

function cmdInit() {
  const targetDir = resolve("brandspec");

  if (existsSync(targetDir)) {
    console.error("brandspec/ already exists. cd brandspec to start working.");
    process.exit(1);
  }

  const templatesDir = getWorkshopTemplatesDir();
  if (!existsSync(templatesDir)) {
    console.error("Templates not found. Ensure brandspec is installed correctly.");
    process.exit(1);
  }

  // Create brandspec/ with templates (yaml + assets/ + _workshop/)
  cpSync(templatesDir, targetDir, { recursive: true });

  // Update position.yml with timestamp
  const positionPath = join(targetDir, "_workshop", "position.yml");
  if (existsSync(positionPath)) {
    let pos = readFileSync(positionPath, "utf-8");
    pos = pos.replace('updated: ""', `updated: "${new Date().toISOString()}"`);
    writeFileSync(positionPath, pos, "utf-8");
  }

  const clipCmd =
    process.platform === "darwin" ? "pbcopy" :
    process.platform === "win32" ? "clip" :
    "xclip -sel c";

  console.log("Created brandspec/");
  console.log();
  console.log("Next steps:");
  console.log("  cd brandspec");
  console.log();
  console.log("  # Start the brand workshop with any AI:");
  console.log(`  npx brandspec workshop start | ${clipCmd}`);
  console.log("  npx brandspec workshop start > prompt.txt  # or save to file");
  console.log();
  console.log("  # Or edit brand.yaml directly, then:");
  console.log("  npx brandspec generate --format tailwind");
}

function formatLintReport(report: LintReport): string {
  const lines: string[] = [];

  const errors = report.results.filter((r) => r.severity === "error");
  const warnings = report.results.filter((r) => r.severity === "warning");
  const infos = report.results.filter((r) => r.severity === "info");

  if (errors.length > 0) {
    lines.push("");
    lines.push(red(`Errors (${errors.length}):`));
    for (const r of errors) {
      lines.push(red(`  \u2717 [${r.rule}] ${r.message}`));
    }
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push(yellow(`Warnings (${warnings.length}):`));
    for (const r of warnings) {
      lines.push(yellow(`  \u26A0 [${r.rule}] ${r.message}`));
    }
  }

  if (infos.length > 0) {
    lines.push("");
    lines.push(dim(`Info (${infos.length}):`));
    for (const r of infos) {
      lines.push(dim(`  \u2139 [${r.rule}] ${r.message}`));
    }
  }

  return lines.join("\n");
}

function cmdLint(args: string[]) {
  const jsonMode = args.includes("--json");
  const quietMode = args.includes("--quiet");
  const filePath = args.find((a) => !a.startsWith("-"));
  const target = resolveBrandYaml(filePath);

  if (!existsSync(target)) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: `File not found: ${target}` }));
    } else if (!quietMode) {
      console.error(`File not found: ${target}`);
      console.error("Run 'brandspec init' to create one, or specify a path.");
    }
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");

  // Step 1: Parse
  const parseResult = parse(content);
  if (!parseResult.success) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: "parse", details: parseResult.errors }));
    } else if (!quietMode) {
      console.error(`Parse errors in ${target}:`);
      for (const err of parseResult.errors) {
        console.error(`  - ${err}`);
      }
    }
    process.exit(1);
  }

  // Step 2: Schema validation
  const validationResult = validate(parseResult.data);
  if (!validationResult.valid) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: "schema", details: validationResult.errors }));
    } else if (!quietMode) {
      console.error(`Schema validation errors in ${target}:`);
      for (const err of validationResult.errors) {
        console.error(`  - ${err}`);
      }
    }
    process.exit(1);
  }

  // Step 3: Lint
  const data = parseResult.data!;
  const report = lintBrandspec(data);

  if (jsonMode) {
    console.log(JSON.stringify({
      name: data.meta.name,
      score: report.score,
      errors: report.errors,
      warnings: report.warnings,
      infos: report.infos,
      results: report.results,
    }));
  } else if (!quietMode) {
    const scoreText = `${report.score}/100`;
    const coloredScore = report.score >= 80 ? green(scoreText) : report.score >= 50 ? yellow(scoreText) : red(scoreText);
    console.log(`${data.meta.name} \u2014 Score: ${coloredScore}`);
    console.log(formatLintReport(report));
  }

  if (report.errors > 0) {
    process.exit(1);
  }
}

function cmdValidate(args: string[]) {
  if (!args.includes("--json") && !args.includes("--quiet")) {
    console.error("Hint: 'validate' now runs 'lint'. Use 'brandspec lint' directly.");
  }
  cmdLint(args);
}

type Format = "css" | "tailwind" | "figma" | "sd" | "all";
const VALID_FORMATS: Format[] = ["css", "tailwind", "figma", "sd", "all"];

function parseFormats(input: string): Format[] {
  const parts = input.split(",").map((s) => s.trim()) as Format[];
  for (const p of parts) {
    if (!VALID_FORMATS.includes(p)) {
      console.error(`Unknown format: ${p}`);
      console.error(`Valid formats: ${VALID_FORMATS.join(", ")}`);
      process.exit(1);
    }
  }
  if (parts.includes("all")) return ["all"];
  return parts;
}

function detectProjectFormat(): string | undefined {
  // Suggest format based on project files in parent directories
  const checks: Array<{ file: string; format: string; hint: string }> = [
    { file: "tailwind.config.ts", format: "tailwind", hint: "Tailwind project detected" },
    { file: "tailwind.config.js", format: "tailwind", hint: "Tailwind project detected" },
    { file: "postcss.config.js", format: "css", hint: "PostCSS project detected" },
    { file: "postcss.config.mjs", format: "css", hint: "PostCSS project detected" },
  ];

  // Check parent directory (brandspec/ is typically inside a project)
  const parentDir = resolve("..");
  for (const check of checks) {
    if (existsSync(join(parentDir, check.file))) {
      return check.format;
    }
  }
  return undefined;
}

function cmdGenerate(args: string[]) {
  let filePath: string | undefined;
  let formatArg: string | undefined;
  let outDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      formatArg = args[++i];
    } else if (args[i] === "--out" && args[i + 1]) {
      outDir = args[++i];
    } else if (!args[i].startsWith("-")) {
      filePath = args[i];
    }
  }

  // If no format specified, auto-detect from project or default to all
  let formats: Format[];
  if (formatArg) {
    formats = parseFormats(formatArg);
  } else {
    const detected = detectProjectFormat();
    if (detected) {
      console.log(`Detected ${detected} project. Use --format all to generate everything.`);
      formats = [detected as Format];
    } else {
      formats = ["all"];
    }
  }

  const target = resolveBrandYaml(filePath);
  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    console.error("Run 'brandspec init' to create one, or specify a path.");
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const parseResult = parse(content);
  if (!parseResult.success) {
    console.error(`Parse errors in ${target}:`);
    for (const err of parseResult.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const data = parseResult.data!;
  const out = resolve(outDir ?? join(dirname(target), "output"));
  mkdirSync(out, { recursive: true });

  const generated: string[] = [];
  const shouldGenerate = (f: Format) => formats.includes(f) || formats.includes("all");

  if (shouldGenerate("css")) {
    const dest = resolve(out, "tokens.css");
    writeFileSync(dest, toCss(data), "utf-8");
    generated.push("tokens.css");
  }

  if (shouldGenerate("tailwind")) {
    const dest = resolve(out, "theme.css");
    writeFileSync(dest, toTailwindCss(data), "utf-8");
    generated.push("theme.css");
  }

  if (shouldGenerate("figma")) {
    const dest = resolve(out, "figma-tokens.json");
    writeFileSync(dest, toFigmaTokens(data), "utf-8");
    generated.push("figma-tokens.json");
  }

  if (shouldGenerate("sd")) {
    const sdDir = resolve(out, "style-dictionary");
    mkdirSync(sdDir, { recursive: true });
    const sd = toStyleDictionary(data);
    writeFileSync(resolve(sdDir, "tokens.json"), sd.tokens, "utf-8");
    writeFileSync(resolve(sdDir, "config.json"), sd.config, "utf-8");
    generated.push("style-dictionary/tokens.json");
    generated.push("style-dictionary/config.json");
  }

  console.log(`Generated from ${data.meta.name}:`);
  for (const f of generated) {
    console.log(`  ${out}/${f}`);
  }
}

// ── Workshop commands ──

function getWorkshopTemplatesDir(): string {
  // Templates are shipped alongside the CLI in the npm package
  return resolve(__dirname, "..", "workshop", "templates");
}

function getWorkshopDir(): string {
  return resolve(__dirname, "..", "workshop");
}

function ensureWorkshopState(): { positionPath: string; decisionsPath: string } {
  const positionPath = resolve("_workshop", "position.yml");
  const decisionsPath = resolve("_workshop", "decisions.yml");

  if (!existsSync(positionPath) || !existsSync(decisionsPath)) {
    console.error("No _workshop/ state found in current directory.");
    console.error("Run 'brandspec init' first, then cd into brandspec/.");
    process.exit(1);
  }

  return { positionPath, decisionsPath };
}

function isInitialPosition(position: string): boolean {
  // Check if position.yml is in its initial state (phase 1, no completion)
  return /phase:\s*1/.test(position) && /completed_at:\s*null/.test(position);
}

function cmdWorkshopStart() {
  const { positionPath, decisionsPath } = ensureWorkshopState();
  const position = readFileSync(positionPath, "utf-8");
  const decisions = readFileSync(decisionsPath, "utf-8");

  // Guard: if workshop has progressed, auto-fallback to resume
  const hasDecisions = !/decisions:\s*\[\]/.test(decisions);
  if (!isInitialPosition(position) || hasDecisions) {
    cmdWorkshopResume();
    return;
  }

  const workshopDir = getWorkshopDir();
  const skillPath = join(workshopDir, "SKILL.md");
  const flowPath = join(workshopDir, "flow.md");
  const phase1Path = join(workshopDir, "phases", "01-discovery.md");

  const lines: string[] = [];

  lines.push("brandspec is a tool that defines brand identity as code using a YAML file (brand.yaml).");
  lines.push("");
  lines.push("I want to create a brand identity through an AI-facilitated workshop.");
  lines.push("");
  lines.push("Read these skill files — they contain the workshop process:");
  lines.push(`1. ${skillPath}`);
  lines.push(`2. ${flowPath}`);
  lines.push(`3. ${phase1Path}`);
  lines.push("");
  lines.push("Workshop state files:");
  lines.push(`- Position: ${positionPath}`);
  lines.push(`- Decisions: ${decisionsPath}`);
  lines.push("");
  lines.push("Start by reading the skills and state, then begin the workshop.");

  console.log(lines.join("\n"));
}

function cmdWorkshopStatus() {
  const positionPath = resolve("_workshop", "position.yml");
  if (!existsSync(positionPath)) {
    console.error("No _workshop/position.yml found in current directory.");
    console.error("Are you inside a brandspec project?");
    process.exit(1);
  }

  const content = readFileSync(positionPath, "utf-8");
  console.log("Workshop status:");
  console.log(content);
}

function getPhaseFileName(phase: number): string {
  const phaseFiles: Record<number, string> = {
    1: "01-discovery.md",
    2: "02-concept.md",
    3: "03-visual.md",
    4: "04-documentation.md",
  };
  return phaseFiles[phase] ?? "";
}

function getPhaseFile(phase: number): string {
  const file = getPhaseFileName(phase);
  if (!file) return "";
  const filePath = join(getWorkshopDir(), "phases", file);
  return existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
}

function cmdWorkshopResume() {
  const { positionPath, decisionsPath } = ensureWorkshopState();
  const position = readFileSync(positionPath, "utf-8");

  // Extract current phase number
  const phaseMatch = position.match(/phase:\s*(\d+)/);
  const currentPhase = phaseMatch ? parseInt(phaseMatch[1], 10) : 1;

  const workshopDir = getWorkshopDir();
  const skillPath = join(workshopDir, "SKILL.md");
  const phasePath = join(workshopDir, "phases", getPhaseFileName(currentPhase));
  const memoPath = resolve("_workshop", "memo.md");

  const lines: string[] = [];

  lines.push("brandspec is a tool that defines brand identity as code using a YAML file (brand.yaml).");
  lines.push("");
  lines.push("I want to resume my brand identity workshop session.");
  lines.push("");
  lines.push("Read these skill files — they contain the workshop process:");
  lines.push(`1. ${skillPath}`);
  if (existsSync(phasePath)) {
    lines.push(`2. ${phasePath}`);
  }
  lines.push("");
  lines.push("Workshop state files (read these to understand where I left off):");
  lines.push(`- Position: ${positionPath}`);
  lines.push(`- Decisions: ${decisionsPath}`);
  if (existsSync(memoPath)) {
    lines.push(`- Memo: ${memoPath}`);
  }
  lines.push("");
  lines.push("Start by reading the skills and state, then present a summary and continue.");

  console.log(lines.join("\n"));
}

function cmdWorkshop(args: string[]) {
  const sub = args[0];

  if (sub === "status") {
    cmdWorkshopStatus();
    return;
  }

  if (sub === "--help") {
    console.log(`
brandspec workshop — AI-facilitated brand creation

Usage:
  workshop          Print prompt for AI (auto-detects start/resume)
  workshop status   Show current workshop position
    `.trim());
    process.exit(0);
  }

  // No subcommand or "start"/"resume" → auto-detect
  cmdWorkshopStart();
}

// ── Whiteboard commands ──

function getWhiteboardDir(): string {
  return resolve(__dirname, "..", "whiteboard");
}

function cmdWhiteboard() {
  const whiteboardDir = getWhiteboardDir();
  const skillPath = join(whiteboardDir, "SKILL.md");
  const figmaSkillPath = join(whiteboardDir, "figma", "SKILL.md");

  if (!existsSync(skillPath)) {
    console.error("Whiteboard skill not found. Ensure brandspec is installed correctly.");
    process.exit(1);
  }

  const target = resolveBrandYaml();
  if (!existsSync(target)) {
    console.error("brand.yaml not found in current directory.");
    console.error("Run 'brandspec init' and complete the workshop first, or provide a brand.yaml.");
    process.exit(1);
  }

  const lines: string[] = [];

  lines.push("brandspec is a tool that defines brand identity as code using a YAML file (brand.yaml).");
  lines.push("It includes colors, typography, personality, and voice guidelines.");
  lines.push("");
  lines.push("I want to create a design system in Figma based on my brand definition.");
  lines.push("");
  lines.push("Read these skill files:");
  lines.push(`1. ${skillPath} — the design system creation process (Taste, Primitives, Components, Patterns, Screens)`);
  if (existsSync(figmaSkillPath)) {
    lines.push(`2. ${figmaSkillPath} — Figma Plugin API operation rules (color conversion, auto-layout, variables, etc.)`);
  }
  lines.push("");
  lines.push("My brand definition is at:");
  lines.push(target);
  lines.push("");
  lines.push("Start by reading the skills and brand.yaml, then ask me for my Figma file URL.");

  console.log(lines.join("\n"));
}

// ── Code commands ──

function getCodeDir(): string {
  return resolve(__dirname, "..", "code");
}

function cmdCode(args: string[]) {
  const stack = args.find((a) => !a.startsWith("-")) ?? "web";
  const codeDir = getCodeDir();
  const skillPath = join(codeDir, stack, "SKILL.md");

  if (!existsSync(skillPath)) {
    console.error(`Code skill not found for stack: ${stack}`);
    const available = existsSync(codeDir)
      ? readdirSync(codeDir).filter((d) => existsSync(join(codeDir, d, "SKILL.md")))
      : [];
    if (available.length > 0) {
      console.error(`Available: ${available.join(", ")}`);
    }
    process.exit(1);
  }

  const target = resolveBrandYaml();
  const brandYamlPath = existsSync(target) ? target : null;

  const lines: string[] = [];

  lines.push("brandspec is a tool that defines brand identity as code using a YAML file (brand.yaml).");
  lines.push("I have a confirmed design system in Figma and want to generate production code from it.");
  lines.push("");
  lines.push("Read this skill file — it contains the full Figma-to-code process:");
  lines.push(`1. ${skillPath}`);
  if (brandYamlPath) {
    lines.push("");
    lines.push("My brand definition is at:");
    lines.push(brandYamlPath);
  }
  lines.push("");
  lines.push("Start by reading the skill, then ask me for my Figma file URL and target directory.");

  console.log(lines.join("\n"));
}

// ── Consult command ──

function cmdConsult(args: string[]) {
  const filePath = args.find((a) => !a.startsWith("-"));
  const target = resolveBrandYaml(filePath);

  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    console.error("Run 'brandspec init' to create one, or specify a path.");
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const parseResult = parse(content);
  if (!parseResult.success) {
    console.error(`Parse errors in ${target}:`);
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
      if (roles.has("logo")) parts.push("logo");
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

  // Additional Context from extensions
  if (data.extensions) {
    const extKeys = Object.keys(data.extensions);
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

// ── Login / Logout ──

async function cmdLogin(args: string[]) {
  let token: string | undefined;

  // --token flag for non-interactive (CI)
  const tokenIdx = args.indexOf("--token");
  if (tokenIdx !== -1 && args[tokenIdx + 1]) {
    token = args[tokenIdx + 1];
  }

  if (!token) {
    // Interactive prompt
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    token = await new Promise<string>((resolve) => {
      rl.question("API token: ", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!token || !token.startsWith("bst_")) {
    console.error("Invalid token. Token must start with 'bst_'.");
    process.exit(1);
  }

  saveCredentials(token);
  console.log(`Token saved to ${getCredentialsPath()}`);
}

function cmdLogout() {
  const credPath = getCredentialsPath();
  if (existsSync(credPath)) {
    unlinkSync(credPath);
    console.log("Logged out. Token removed.");
  } else {
    console.log("No saved token found.");
  }
}

// ── Pull ──

function collectFiles(dir: string, base: string): Array<{ path: string; data: Buffer }> {
  const results: Array<{ path: string; data: Buffer }> = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else {
      results.push({ path: relPath, data: readFileSync(fullPath) });
    }
  }
  return results;
}

async function cmdPull(args: string[]) {
  const token = requireToken();
  const remote = requireRemote(args);
  const excludeWorkshop = args.includes("--no-workshop");

  const url = `${API_BASE}/api/v1/${remote.org}/${remote.brand}/pull${excludeWorkshop ? "" : "?include_workshop=true"}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Pull failed (${res.status}): ${body}`);
    process.exit(1);
  }

  const arrayBuf = await res.arrayBuffer();
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(arrayBuf);

  const outDir = resolve("brandspec");
  mkdirSync(outDir, { recursive: true });

  for (const [filePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) {
      mkdirSync(join(outDir, filePath), { recursive: true });
    } else {
      const dest = join(outDir, filePath);
      mkdirSync(dirname(dest), { recursive: true });
      const content = await zipEntry.async("nodebuffer");
      writeFileSync(dest, content);
    }
  }

  ensureBrandspecrc(remote.org, remote.brand);

  const fileCount = Object.values(zip.files).filter((f) => !f.dir).length;
  console.log(`Pulled ${remote.org}/${remote.brand} → brandspec/ (${fileCount} files)`);
}

// ── Push ──

async function cmdPush(args: string[]) {
  const token = requireToken();
  const remote = requireRemote(args);

  // Read brand.yaml
  const yamlPath = resolve("brand.yaml");
  if (!existsSync(yamlPath)) {
    console.error("brand.yaml not found in current directory.");
    process.exit(1);
  }
  const yamlContent = readFileSync(yamlPath, "utf-8");

  // Build FormData
  const formData = new FormData();
  formData.append("yaml", new Blob([yamlContent], { type: "text/yaml" }), "brand.yaml");

  // Collect assets/
  const assetsDir = resolve("assets");
  const assetFiles = collectFiles(assetsDir, "");
  for (const file of assetFiles) {
    formData.append("assets", new Blob([new Uint8Array(file.data)]), file.path);
  }

  // Collect _workshop/
  const workshopDir = resolve("_workshop");
  const workshopFiles = collectFiles(workshopDir, "");
  for (const file of workshopFiles) {
    formData.append("workshop", new Blob([new Uint8Array(file.data)]), file.path);
  }

  const url = `${API_BASE}/api/v1/${remote.org}/${remote.brand}/push`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Push failed (${res.status}): ${body}`);
    process.exit(1);
  }

  const result = await res.json() as {
    action?: string;
    warnings?: string[];
    assetErrors?: string[];
  };

  console.log(`Pushed to ${remote.org}/${remote.brand}: ${result.action ?? "ok"}`);

  if (result.warnings?.length) {
    for (const w of result.warnings) {
      console.warn(`  warn: ${w}`);
    }
  }
  if (result.assetErrors?.length) {
    for (const e of result.assetErrors) {
      console.error(`  asset error: ${e}`);
    }
  }

  ensureBrandspecrc(remote.org, remote.brand);
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    // No args + brand.yaml exists → default to lint
    if (!command && existsSync(resolveBrandYaml())) {
      cmdLint([]);
      return;
    }
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
    case "lint":
      cmdLint(args.slice(1));
      break;
    case "validate":
      cmdValidate(args.slice(1));
      break;
    case "generate":
      cmdGenerate(args.slice(1));
      break;
    case "workshop":
      cmdWorkshop(args.slice(1));
      break;
    case "whiteboard":
      cmdWhiteboard();
      break;
    case "code":
      cmdCode(args.slice(1));
      break;
    case "consult":
      cmdConsult(args.slice(1));
      break;
    case "login":
      await cmdLogin(args.slice(1));
      break;
    case "logout":
      cmdLogout();
      break;
    case "pull":
      await cmdPull(args.slice(1));
      break;
    case "push":
      await cmdPush(args.slice(1));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
