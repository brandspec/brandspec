# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-05-08

### Added

- **Whiteboard skill**: AI-facilitated design system creation in Figma — Taste selection (10 axes), Primitives → Components → Patterns → Screens, iterative visual comparison
- **Figma operation skill**: Figma MCP Plugin API rules — oklch→sRGB conversion with gamma correction, auto-layout sizing, variable-bound paints, component architecture patterns
- **Code skill (web)**: Figma → React + Tailwind + Radix code generation — token extraction, component mapping, Radix primitive integration
- **CLI `whiteboard` command**: Outputs prompt for Claude Code with skill paths and brand.yaml reference
- **CLI `code` command**: Outputs prompt for Figma-to-code session with stack selection (default: web)
- **DESIGN.md naming alignment**: Whiteboard and Code skills include 3-layer naming correspondence (Figma PascalCase ↔ React PascalCase ↔ DESIGN.md kebab-case) so primitive names stay consistent across Figma, code, and any future DESIGN.md export

### Changed

- **CLI `workshop` command**: Simplified to single command (auto-detects start/resume). Output format changed to first-person prompt with absolute file paths for Claude Code ingestion
- Terminology standardized: Primitives / Components / Patterns / Screens (not Atomic Design terms)

### Requirements

- **Figma MCP** must be connected for `whiteboard` and `code` commands.
- **Figma Pro plan recommended** ($15/month, 200 reads/day). Starter caps reads at 6/month, which is below what one session typically uses.

## [0.1.0] - 2026-02-19

### Added

- **CLI commands**: `init`, `validate`, `generate`, `consult`, `workshop`
- **Token generation**: 4 output formats — CSS custom properties, Tailwind v4 `@theme`, Figma Tokens Studio JSON, Style Dictionary (DTCG)
- **Schema validation**: JSON Schema (draft 2020-12) for `brand.yaml`
- **Workshop skill**: 4-phase AI-facilitated brand creation (Discovery → Concept → Visual Identity → Documentation), model-agnostic, session resume support
- **Specification**: `brand.yaml` single-file brand definition format with W3C DTCG-compliant design tokens
- **Examples**: minimal, standard, and full `brand.yaml` examples
