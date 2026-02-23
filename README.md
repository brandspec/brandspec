<p align="center">
  <img src="brandspec/assets/logo-horizontal-h80.png" height="40" alt="brandspec">
</p>

# brandspec

Define Brand Identity as code.

1. Brand workshop, facilitated by AI. Any model, four phases, structured decisions.
2. Conclusions and history in one format. `brand.yaml` — structured for machines, readable by humans.
3. Connects consistently to every use — CSS, Tailwind, Figma, Style Dictionary, AI consultation.

An open format built on [W3C Design Tokens](https://tr.designtokens.org/format/). MIT licensed.

| Component | Path | Role |
|-----------|------|------|
| **schema** | `schema/` | Specification — the definition of `brand.yaml` (JSON Schema + machine-friendly spec knowledge) |
| **workshop** | `workshop/` | Facilitation — AI-guided 4-phase process to create a brand identity |
| **cli** | `cli/` | Tooling — validate, generate, consult, push/pull |

## Quick Start

```bash
cd my-app
npx brandspec init              # Creates brandspec/ directory
cd brandspec
```

This gives you:

```
my-app/
├── brandspec/
│   ├── brand.yaml          # Brand definition (edit this)
│   ├── assets/                 # Logo, symbol, favicon, etc.
│   └── _workshop/              # Workshop state (AI-resumable)
└── src/                       # Your app source
```

From here, either edit `brand.yaml` directly or run the Workshop to build your brand with AI. Then generate tokens:

```bash
npx brandspec validate                     # Check against schema
npx brandspec generate --format tailwind   # → output/theme.css
npx brandspec generate --format all        # → output/tokens.css, theme.css, figma-tokens.json, style-dictionary/
```

## Workshop — Forge your brand with any AI

The Workshop is a structured 4-phase process that works with **any LLM**. Bring your own model — Claude, GPT, Gemini, or any API.

```bash
npx brandspec workshop start | pbcopy
```

Paste the prompt into your AI and start the session. The workshop asks your preferred language at the start and runs the entire session in it.

**4 phases → one `brand.yaml`:**

```
Discovery → Concept → Visual Identity → Documentation
```

The AI guides you through brand essence, personality, colors, typography. All decisions are recorded in `_workshop/decisions.yml` — resumable, auditable, model-independent.

**Resume a session:**

```bash
npx brandspec workshop resume | pbcopy
```

The resume prompt includes all previous decisions and current position — paste it into any AI to pick up where you left off.

## Consult — Brand-aligned AI in one command

Already have a `brand.yaml`? Turn any AI into a brand consultant:

```bash
npx brandspec consult
```

This prints a system prompt to stdout — paste it into any LLM (Claude, GPT, Gemini, etc.) and it will evaluate your copy, campaigns, ads, and design decisions against your brand identity. Pipe it directly:

```bash
npx brandspec consult | pbcopy   # macOS — copy to clipboard
```

The prompt includes your brand's personality, voice principles, color palette, typography, logo system, and guidelines — everything the AI needs to stay on-brand.

## CLI

```
brandspec <command> [options]

Commands:
  init              Create a brandspec/ directory with templates
  validate [path]   Validate against schema (alias for lint)
  lint [path]       Lint brand.yaml (score, errors, warnings)
    --json           Machine-readable JSON output
    --quiet          Errors only
  generate [path]   Generate token files from brand.yaml
    --format <fmt>   css, tailwind, figma, sd, all (comma-separated)
    --out <dir>      Output directory (default: ./output)

  consult [path]          Print brand context for AI consultation

  workshop start          Print start prompt for AI workshop
  workshop resume         Print resume prompt for AI workshop
  workshop status         Show current workshop position

  login                   Authenticate with brandspec.tools
    --token <tok>          Non-interactive (CI)
  logout                  Remove saved credentials
  push [org/brand]        Push brandspec/ to brandspec.tools
    --no-workshop          Exclude _workshop/ files
  pull [org/brand]        Pull brandspec/ from brandspec.tools
    --no-workshop          Exclude _workshop/ files
```

## Format

```yaml
meta:
  name: "Acme"
  version: "1.0.0"

core:
  essence: "Tools that get out of your way"
  tagline: "Build, not configure"
  personality: [precise, confident, minimal]
  voice:
    tone: [direct, helpful]
    principles: ["Use active voice", "Skip the fluff"]

tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.18 250)"
      $type: color
    primary-foreground:
      $value: "oklch(0.99 0.005 250)"
      $type: color
    background:
      $value: "oklch(0.99 0.005 250)"
      $type: color
    foreground:
      $value: "oklch(0.25 0.02 250)"
      $type: color
    # ... (see docs/examples/ for complete token set)
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
    body:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily

assets:
  - file: assets/logo-primary.svg
    id: logo-primary
    role: logo
    variant: primary
    description: "Primary logo for light backgrounds"
  - file: assets/logo-inverse.svg
    id: logo-inverse
    role: logo
    variant: inverse
  - file: assets/symbol.svg
    id: symbol
    role: symbol
  - file: assets/favicon.ico
    id: favicon
    role: favicon

guidelines:
  logo-usage:
    content: |
      Use the primary logo on light backgrounds.
    rules:
      - id: logo-min-size
        description: "Logo must meet minimum size requirements"
        severity: error
        applies_to: logo
        criteria:
          - "Digital: minimum 120px width"
          - "Print: minimum 25mm width"
```

Only `meta.name` is required. Everything else is opt-in.

### Logo System Patterns

The `assets` section uses `role` + `variant` to describe a logo system. Common roles:

| Role | Description |
|------|-------------|
| `logo` | Main logo (may include wordmark) |
| `symbol` | Icon/symbol mark (no text) |
| `wordmark` | Text-only logo |
| `icon` | Small icon (app icon, etc.) |
| `favicon` | Browser favicon |

Variants: `primary`, `inverse`, `monochrome`, `simplified`, etc. Custom roles are also allowed.

File naming convention: `{role}-{variant}.{ext}` (e.g., `logo-primary.svg`, `logo-inverse.svg`, `favicon.ico`).

Full asset spec: [`docs/assets.md`](docs/assets.md)

Full schema: [`schema/v0.1.0.yaml`](schema/v0.1.0.yaml) | Examples: [`docs/examples/`](docs/examples/)

> **Live example:** The [`brandspec/`](brandspec/) directory in this repository is brandspec's own brand definition — built with the Workshop.

## Exports

`brandspec generate --format <fmt>` produces files in `output/` (override with `--out`):

| Format | File | Description |
|--------|------|-------------|
| `css` | `tokens.css` | CSS custom properties (`--primary`, `--font-heading`, etc.) |
| `tailwind` | `theme.css` | Tailwind v4 `@theme` block |
| `figma` | `figma-tokens.json` | Figma Tokens plugin format |
| `sd` | `style-dictionary/` | Style Dictionary tokens + config |

Combine formats: `--format css,tailwind`. Use `--format all` to generate everything.

All outputs target **shadcn/ui + Tailwind v4** compatibility.

## License

MIT
