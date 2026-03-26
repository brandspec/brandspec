<p align="center">
  <img src="brandspec/assets/logo-horizontal-h80.png" height="40" alt="brandspec">
</p>

<h3 align="center">Define Brand Identity as code.</h3>

<p align="center">
  One YAML file. CSS, Tailwind v4, Figma tokens, Style Dictionary.<br>
  AI creates your brand. You own the file.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/brandspec"><img src="https://img.shields.io/npm/v/brandspec" alt="npm version"></a>
  <a href="https://github.com/brandspec/brandspec/blob/main/LICENSE"><img src="https://img.shields.io/github/license/brandspec/brandspec" alt="MIT License"></a>
  <a href="https://brandspec.dev"><img src="https://img.shields.io/badge/web-brandspec.dev-blue" alt="Website"></a>
</p>

---

```bash
npx brandspec init
```

```
brandspec/
├── brand.yaml        # Your brand definition
├── assets/           # Logo, symbol, favicon
└── _workshop/        # AI workshop state (resumable)
```

```bash
npx brandspec generate --format tailwind
```

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.65 0.18 250);
  --color-primary-foreground: oklch(0.98 0.01 250);
  --color-secondary: oklch(0.75 0.12 150);
  --color-background: oklch(0.99 0.005 250);
  --color-foreground: oklch(0.15 0.02 250);
  --font-heading: Inter, system-ui, sans-serif;
  --font-body: Inter, system-ui, sans-serif;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

One file in, tokens out. Works with **shadcn/ui + Tailwind v4** out of the box.

## What it does

**brand.yaml** holds your brand decisions and design tokens in one place:

```yaml
meta:
  name: "Acme"

core:
  essence: "Tools that get out of your way"
  tagline: "Build, not configure"
  personality: [precise, confident, minimal]

tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.18 250)"   # W3C DTCG format
      $type: color
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
```

Only `meta.name` is required. Everything else is opt-in.

**Generate tokens for any platform:**

```bash
npx brandspec generate --format css       # → tokens.css
npx brandspec generate --format tailwind  # → theme.css (Tailwind v4)
npx brandspec generate --format figma     # → figma-tokens.json
npx brandspec generate --format sd        # → style-dictionary/
npx brandspec generate --format all       # → all of the above
```

**Validate your brand:**

```bash
npx brandspec lint
# Acme Corp — Score: 100/100
```

## Workshop — Build your brand with AI

A structured 4-phase process that works with **any LLM**. Claude, GPT, Gemini — bring your own model.

```bash
npx brandspec workshop
# Copy the output into your AI. The workshop begins.
```

```
Discovery → Concept → Visual Identity → Documentation
```

The AI guides you through brand essence, personality, colors, typography. All decisions are recorded in `_workshop/decisions.yml` — resumable, auditable, model-independent.

## Whiteboard — Design system in Figma

Turn your brand.yaml into a complete Figma design system. AI builds, you judge.

```bash
npx brandspec whiteboard
# Copy into Claude Code. It reads the skills and asks for your Figma URL.
```

```
Taste → Primitives → Components → Patterns → Screens
```

The AI proposes 3 design directions (10 axes: density, shape, contrast, etc.), generates components in Figma, and iterates based on your visual feedback. No design experience needed.

## Code — Figma to production

Generate production components from your confirmed Figma design system.

```bash
npx brandspec code
# Copy into Claude Code. Point it to your Figma file.
```

Outputs React + Tailwind + Radix components with CSS custom properties from your brand tokens. Every color, spacing, and radius value traces back to brand.yaml.

## Consult — Brand-aligned AI

Turn any LLM into a brand consultant:

```bash
npx brandspec consult | pbcopy
# Paste into AI. It knows your brand's voice, colors, rules.
```

The system prompt includes personality, voice principles, color palette, typography, logo system, and guidelines. Evaluate copy, design, campaigns — anything — against your brand identity.

## Cloud sync

Push your brand to [brandspec.tools](https://brandspec.tools) for team access, AI image generation, and a visual dashboard:

```bash
npx brandspec login
npx brandspec push
```

Free during beta — 500K AI tokens included.

## Format

Built on [W3C Design Tokens (DTCG)](https://tr.designtokens.org/format/). Colors in oklch. Extensible — unknown fields are preserved, not rejected.

| Section | Purpose |
|---------|---------|
| `meta` | Name, version, description, URL |
| `core` | Essence, tagline, personality, voice |
| `tokens` | Colors, typography, spacing, radius (DTCG) |
| `assets` | Logo system with role + variant |
| `guidelines` | Usage rules with severity levels |
| `extensions` | Your custom fields |

Full schema: [`schema/v0.1.0.yaml`](schema/v0.1.0.yaml) | Examples: [`docs/examples/`](docs/examples/)

> **Live example:** The [`brandspec/`](brandspec/) directory in this repo is brandspec's own brand — built with the Workshop.

## CLI reference

```
brandspec <command> [options]

  init                    Create brandspec/ directory
  validate [path]         Validate against schema
  lint [path]             Score and check brand.yaml
    --json                  Machine-readable output
  generate [path]         Generate token files
    --format <fmt>          css, tailwind, figma, sd, all
    --out <dir>             Output directory (default: ./output)
  consult [path]          Print brand context for AI
  workshop                Print workshop prompt (auto start/resume)
  workshop status         Show current position
  whiteboard              Print Figma design system prompt
  code [stack]            Print Figma-to-code prompt (default: web)
  login                   Authenticate with brandspec.tools
  push [org/brand]        Push to cloud
  pull [org/brand]        Pull from cloud
```

## License

MIT
