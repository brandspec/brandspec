import {
  readFileSync,
  writeFileSync,
  existsSync,
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
import { serialize } from "./parser.js";
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
  brandspec <command> [options]

Commands:
  init              Create a brandspec/ directory with templates
  lint [path]       Lint a brand.yaml (validate + rules + score)
    --json           Output as JSON (for CI/pipe)
    --quiet          Exit code only, no output
  validate [path]   Alias for lint
  generate [path]   Generate token files from brand.yaml
    --format <fmt>   css, tailwind, figma, sd, all (comma-separated)
    --out <dir>      Output directory (default: ./out)

  consult [path]          Print brand context for AI consultation

  workshop start          Print start prompt for AI workshop
  workshop resume         Print resume prompt for AI workshop
  workshop status         Show current workshop position

  login             Save API token for brandspec.tools
  logout            Remove saved API token
  pull [org/brand]  Pull brand from brandspec.tools
  push [org/brand]  Push brand to brandspec.tools
    --include-workshop   Include .workshop/ files

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
  const targetDir = resolve("brandspec");

  if (existsSync(targetDir)) {
    console.error("brandspec/ already exists in this directory.");
    process.exit(1);
  }

  const templatesDir = getWorkshopTemplatesDir();
  if (!existsSync(templatesDir)) {
    console.error("Templates not found. Ensure brandspec is installed correctly.");
    process.exit(1);
  }

  // Create brandspec/ with templates (yaml + assets/ + .workshop/)
  cpSync(templatesDir, targetDir, { recursive: true });

  // Update position.yml with timestamp
  const positionPath = join(targetDir, ".workshop", "position.yml");
  if (existsSync(positionPath)) {
    let pos = readFileSync(positionPath, "utf-8");
    pos = pos.replace('updated: ""', `updated: "${new Date().toISOString()}"`);
    writeFileSync(positionPath, pos, "utf-8");
  }

  console.log("Created brandspec/");
  console.log();
  console.log("Next steps:");
  console.log("  cd brandspec");
  console.log();
  console.log("  # Start the brand workshop with any AI:");
  console.log("  npx brandspec workshop start | pbcopy");
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
    lines.push(`Errors (${errors.length}):`);
    for (const r of errors) {
      lines.push(`  \u2717 [${r.rule}] ${r.message}`);
    }
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push(`Warnings (${warnings.length}):`);
    for (const r of warnings) {
      lines.push(`  \u26A0 [${r.rule}] ${r.message}`);
    }
  }

  if (infos.length > 0) {
    lines.push("");
    lines.push(`Info (${infos.length}):`);
    for (const r of infos) {
      lines.push(`  \u2139 [${r.rule}] ${r.message}`);
    }
  }

  return lines.join("\n");
}

function cmdLint(args: string[]) {
  const jsonMode = args.includes("--json");
  const quietMode = args.includes("--quiet");
  const filePath = args.find((a) => !a.startsWith("-"));
  const target = resolve(filePath ?? "brand.yaml");

  if (!existsSync(target)) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: `File not found: ${target}` }));
    } else if (!quietMode) {
      console.error(`File not found: ${target}`);
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
      console.error("Parse errors:");
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
      console.error("Schema validation errors:");
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
    console.log(`${data.meta.name} \u2014 Score: ${report.score}/100`);
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

  // If no format specified, suggest based on project or default to all
  let formats: Format[];
  if (formatArg) {
    formats = parseFormats(formatArg);
  } else {
    const detected = detectProjectFormat();
    if (detected) {
      console.log(`Hint: ${detected} project detected. You can use --format ${detected} to generate only what you need.`);
    }
    formats = ["all"];
  }

  const target = resolve(filePath ?? "brand.yaml");
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
  const out = resolve(outDir ?? "out");
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
  const positionPath = resolve(".workshop", "position.yml");
  const decisionsPath = resolve(".workshop", "decisions.yml");

  if (!existsSync(positionPath) || !existsSync(decisionsPath)) {
    console.error("No .workshop/ state found in current directory.");
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

  // Guard: if workshop has progressed, tell user to use resume
  const hasDecisions = !/decisions:\s*\[\]/.test(decisions);
  if (!isInitialPosition(position) || hasDecisions) {
    console.error("Workshop already in progress.");
    console.error("Use 'brandspec workshop resume' to continue.");
    process.exit(1);
  }

  // Load workshop materials
  const workshopDir = getWorkshopDir();
  const skillMd = readFileSync(join(workshopDir, "SKILL.md"), "utf-8");
  const flowMd = readFileSync(join(workshopDir, "flow.md"), "utf-8");
  const phase1 = readFileSync(join(workshopDir, "phases", "01-discovery.md"), "utf-8");

  const lines: string[] = [];

  lines.push("# brandspec workshop — Start Session");
  lines.push("");
  lines.push("You are a brand identity facilitator. Guide the user through the brandspec workshop.");
  lines.push("First ask the user's preferred session language, then proceed with Phase 1: Discovery.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(skillMd);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(flowMd);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Current Phase Guide");
  lines.push("");
  lines.push(phase1);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Begin the workshop now. Ask the user their preferred session language.");

  console.log(lines.join("\n"));
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

function getPhaseFile(phase: number): string {
  const phaseFiles: Record<number, string> = {
    1: "01-discovery.md",
    2: "02-concept.md",
    3: "03-visual.md",
    4: "04-documentation.md",
  };
  const file = phaseFiles[phase];
  if (!file) return "";
  const filePath = join(getWorkshopDir(), "phases", file);
  return existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
}

function cmdWorkshopResume() {
  const { positionPath, decisionsPath } = ensureWorkshopState();
  const position = readFileSync(positionPath, "utf-8");
  const decisions = readFileSync(decisionsPath, "utf-8");

  // Extract current phase number
  const phaseMatch = position.match(/phase:\s*(\d+)/);
  const currentPhase = phaseMatch ? parseInt(phaseMatch[1], 10) : 1;

  // Load workshop materials
  const workshopDir = getWorkshopDir();
  const skillMd = readFileSync(join(workshopDir, "SKILL.md"), "utf-8");
  const phaseGuide = getPhaseFile(currentPhase);

  const lines: string[] = [];

  lines.push("# brandspec workshop — Resume Session");
  lines.push("");
  lines.push("You are a brand identity facilitator. The user is resuming a workshop session.");
  lines.push("Restore context from the state below, then continue where they left off.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(skillMd);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Current State");
  lines.push("");
  lines.push("### Position");
  lines.push("```yaml");
  lines.push(position.trim());
  lines.push("```");
  lines.push("");
  lines.push("### Decisions");
  lines.push("```yaml");
  lines.push(decisions.trim());
  lines.push("```");
  lines.push("");

  // Include memo if present
  const memoPath = resolve(".workshop", "memo.md");
  if (existsSync(memoPath)) {
    const memo = readFileSync(memoPath, "utf-8").trim();
    if (memo) {
      lines.push("### Working Notes");
      lines.push(memo);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(`## Current Phase Guide (Phase ${currentPhase})`);
  lines.push("");
  if (phaseGuide) {
    lines.push(phaseGuide);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Resume the workshop. Present the restored state summary, then continue from the current step.");

  console.log(lines.join("\n"));
}

function cmdWorkshop(args: string[]) {
  const sub = args[0];

  if (!sub || sub === "--help") {
    console.log(`
brandspec workshop — AI-facilitated brand creation

Commands:
  start    Print start prompt for AI (initial state only)
  resume   Print resume prompt for AI (any state)
  status   Show current workshop position
    `.trim());
    process.exit(0);
  }

  switch (sub) {
    case "start":
      cmdWorkshopStart();
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
  const target = resolve(filePath ?? "brand.yaml");

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
  const includeWorkshop = args.includes("--include-workshop");

  const url = `${API_BASE}/api/v1/${remote.org}/${remote.brand}/pull${includeWorkshop ? "?include_workshop=true" : ""}`;

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
  const includeWorkshop = args.includes("--include-workshop");

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
    formData.append("assets", new Blob([file.data]), file.path);
  }

  // Optionally collect .workshop/
  if (includeWorkshop) {
    const workshopDir = resolve(".workshop");
    const workshopFiles = collectFiles(workshopDir, "");
    for (const file of workshopFiles) {
      formData.append("workshop", new Blob([file.data]), file.path);
    }
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
