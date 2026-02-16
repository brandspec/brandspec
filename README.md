# brandspec

Define Brand Identity as code.

Brand identity lives in Figma, PDFs, Notion pages, Slack threads — scattered, inconsistent, out of date. **brandspec** puts it in one file: `brandspec.yaml`. Structured for machines, readable by humans. An open format built on [W3C Design Tokens](https://tr.designtokens.org/format/).

## Quick Start

```bash
npx brandspec init
```

Creates a `brandspec.yaml`. Edit it, then:

```bash
npx brandspec validate          # Check against schema
npx brandspec generate          # → tokens.css, theme.css, figma-tokens.json, style-dictionary/
```

## Workshop — Forge your brand with any AI

No brand yet? The Workshop is a structured 4-phase process that works with **any LLM** you already use. Bring your own model — Claude, GPT, Gemini, or any API. The process and format are standardized; the AI is yours.

```bash
npx brandspec workshop start acme
cd brandspec-acme
```

Then start a session:

**Claude Code:**
```bash
claude "Let's start the brand workshop"
```

**ChatGPT / Gemini / other:**
Copy the contents of `workshop/flow.md` into your chat as system context, then tell the AI:
> "I want to run the brandspec workshop. Start with Phase 1: Discovery. Here's the phase guide:" and paste `workshop/phases/01-discovery.md`.

The workshop asks your preferred language at the start and runs the entire session in it.

**4 phases → one `brandspec.yaml`:**

```
Discovery → Concept → Visual Identity → Documentation
```

The AI guides you through brand essence, personality, colors, typography. All decisions are recorded in `.workshop/decisions.yml` — resumable, auditable, model-independent.

## CLI

```
brandspec <command> [options]

Commands:
  init              Create a new brandspec.yaml
  validate [path]   Validate against schema (default: ./brandspec.yaml)
  generate [path]   Generate dist files from brandspec.yaml
    --format <fmt>   css, tailwind, figma, sd, all (default: all)
    --out <dir>      Output directory (default: ./dist)

  workshop start [name]   Scaffold a new brand project
  workshop status         Show current workshop position
  workshop resume         Print state for AI session resumption
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
    background:
      $value: "oklch(0.99 0.005 250)"
      $type: color
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily

assets:
  - file: assets/logo-primary.svg
    id: logo-primary
    role: logo

guidelines:
  logo-usage:
    content: |
      Use the primary logo on light backgrounds.
      Minimum size: 120px width.
```

Only `meta.name` is required. Everything else is opt-in.

Full schema: [`schema/v0.1.0.yaml`](schema/v0.1.0.yaml) | Examples: [`examples/`](examples/)

## Exports

`brandspec generate` produces:

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties (`--primary`, `--font-heading`, etc.) |
| `theme.css` | Tailwind v4 `@theme` block |
| `figma-tokens.json` | Figma Tokens plugin format |
| `style-dictionary/` | Style Dictionary tokens + config |

All outputs target **shadcn/ui + Tailwind v4** compatibility.

## License

MIT
