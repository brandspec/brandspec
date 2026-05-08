# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**brandspec** — Define Brand Identity as code.

A unified CLI and specification for creating, validating, and generating brand tokens from `brand.yaml`. Includes an AI-facilitated Workshop for brand creation with any LLM (BYOM — Bring Your Own Model).

## Repository Structure

```
brandspec/
├── cli/                    # TypeScript CLI source
│   ├── cli.ts              # CLI entry (init, validate, generate, workshop)
│   ├── index.ts            # Library entry point
│   ├── parser.ts           # YAML parse/serialize
│   ├── validate.ts         # Schema validation (ajv)
│   ├── tokens.ts           # Token export generators (CSS, Tailwind, Figma, SD)
│   ├── schema.ts           # JSON Schema loading
│   ├── types.ts            # TypeScript type definitions
│   ├── test/               # CLI tests
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   └── CHANGELOG.md
├── schema/                 # Specification (SSoT)
│   ├── v0.1.0.yaml         # JSON Schema (draft 2020-12) for validation
│   └── spec/               # Machine-friendly spec knowledge (tokens, assets, guidelines)
├── docs/                   # Human-readable docs and examples
│   ├── exports/            # Export format docs (css, tailwind, figma)
│   └── examples/           # Example brand.yaml files
├── workshop/               # AI-facilitated brand creation toolkit
│   ├── SKILL.md            # Workshop skill (4-phase brand creation)
│   ├── flow.md             # 4-phase process overview
│   ├── phases/             # 01-discovery, 02-concept, 03-visual, 04-documentation
│   └── templates/          # Scaffolded when running `brandspec init`
├── whiteboard/             # Figma design system creation
│   ├── SKILL.md            # Design System Forge skill (Taste → Screens)
│   └── figma/SKILL.md      # Figma MCP operation rules
├── code/                   # Figma-to-code generation
│   └── web/SKILL.md        # React + Tailwind + Radix
├── site/                   # LP (brandspec.dev)
└── package.json
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
brandspec validate [path]               # Validate a brand.yaml
brandspec generate [path] --format all  # Generate output/ (css, tailwind, figma, sd)
brandspec consult [path]                # Print brand context for AI consultation
brandspec workshop                      # Print workshop prompt (auto start/resume)
brandspec workshop status               # Show workshop position
brandspec whiteboard                    # Print Figma design system prompt
brandspec code [stack]                  # Print Figma-to-code prompt (default: web)
```

## Specification (brand.yaml)

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
  - `_workshop/position.yml` — current phase/step tracker
  - `_workshop/decisions.yml` — append-only decision log
  - `_workshop/memo.md` — working notes
  - `_workshop/session.md` — handoff context
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
