# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**brandspec** — Define Brand Identity as code.

A unified CLI and specification for creating, validating, and generating brand tokens from `brandspec.yaml`. Includes an AI-facilitated Workshop for brand creation with any LLM (BYOM — Bring Your Own Model).

## Repository Structure

```
brandspec/
├── src/                    # TypeScript CLI source
│   ├── cli.ts              # CLI entry (init, validate, generate, workshop)
│   ├── parser.ts           # YAML parse/serialize
│   ├── validate.ts         # Schema validation (ajv)
│   ├── tokens.ts           # Token export generators (CSS, Tailwind, Figma, SD)
│   ├── schema.ts           # JSON Schema loading
│   ├── types.ts            # TypeScript type definitions
│   └── index.ts            # Library entry point
├── schema/v0.1.0.yaml      # JSON Schema (draft 2020-12) for brandspec.yaml
├── docs/                   # Specification docs (tokens, assets, exports)
│   └── exports/            # Export format docs (css, tailwind, figma)
├── examples/               # Example brandspec.yaml files
│   ├── minimal.yaml
│   ├── standard.yaml
│   └── full.yaml
├── workshop/               # AI-facilitated brand creation toolkit
│   ├── SKILL.md            # Claude Code integration entry point (Japanese)
│   ├── flow.md             # 4-phase process overview
│   ├── phases/             # 01-discovery, 02-concept, 03-visual, 04-documentation
│   └── templates/          # Scaffolded when running `brandspec workshop start`
├── .workshop/              # LP/site assets (visual-preview.html, ogp, etc.)
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Build & Development

```bash
npm install
npm run build          # Build with tsup
npm run dev            # Watch mode
npm run typecheck      # TypeScript type checking
```

## CLI Commands

```bash
brandspec init                          # Create brandspec/ directory with templates
brandspec validate [path]               # Validate a brandspec.yaml
brandspec generate [path] --format all  # Generate dist/ (css, tailwind, figma, sd)
brandspec consult [path]                # Print brand context for AI consultation
brandspec workshop start                # Print start prompt for AI workshop
brandspec workshop resume               # Print resume prompt for AI workshop
brandspec workshop status               # Show workshop position
```

## Specification (brandspec.yaml)

- Single-file brand definition format
- Only required field: `meta.name`
- Sections: `meta`, `core`, `tokens`, `assets`, `guidelines`, `extensions`
- `tokens` follows **W3C Design Tokens Community Group (DTCG)** spec
- Colors use **oklch** format (perceptually uniform, wide gamut)
- Unknown fields are preserved, not rejected (extensible by design)
- Schema: `schema/v0.1.0.yaml`

## Workshop

4-phase process: **Discovery → Concept → Visual Identity → Documentation**

- Entry point for Claude Code: `workshop/SKILL.md`
- Phase guides: `workshop/phases/01-04`
- State management (in brandspec/ directory):
  - `.workshop/position.yml` — current phase/step tracker
  - `.workshop/decisions.yml` — append-only decision log
  - `.workshop/memo.md` — working notes
  - `.workshop/session.md` — handoff context
- Two modes: **Facilitation** (AI presents options) / **Execution** (AI works autonomously)
- CSS output targets **shadcn/ui + Tailwind v4** compatibility

### Key Workshop Rules

1. All decisions must be recorded in `decisions.yml`
2. `position.yml` is updated at each step completion
3. Never advance phases without user approval
4. Session resume: reconstruct from `decisions.yml` + `position.yml` only

## Language

- Specification and CLI: English
- Workshop SKILL.md: Japanese
- Phase guidance files: English

## Asset Naming Convention

```
{role}-{variant}[-{context}].{ext}
Examples: logo-primary.svg, logo-monochrome.svg, icon-favicon.ico
```
