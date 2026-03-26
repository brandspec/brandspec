# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-03-26

### Added

- **Whiteboard skill**: AI-facilitated design system creation in Figma — Taste selection (10 axes), Primitives → Components → Patterns → Screens, iterative visual comparison
- **Figma operation skill**: Figma MCP Plugin API rules — oklch→sRGB conversion with gamma correction, auto-layout sizing, variable-bound paints, component architecture patterns
- **Code skill (web)**: Figma → React + Tailwind + Radix code generation — token extraction, component mapping, Radix primitive integration
- **CLI `whiteboard` command**: Outputs prompt for Claude Code with skill paths and brand.yaml reference
- **CLI `code` command**: Outputs prompt for Figma-to-code session with stack selection (default: web)

### Changed

- **CLI `workshop` command**: Simplified to single command (auto-detects start/resume). Output format changed to first-person prompt with absolute file paths for Claude Code ingestion
- Terminology standardized: Primitives / Components / Patterns / Screens (not Atomic Design terms)

## [0.1.0] - 2026-02-19

### Added

- **CLI commands**: `init`, `validate`, `generate`, `consult`, `workshop`
- **Token generation**: 4 output formats — CSS custom properties, Tailwind v4 `@theme`, Figma Tokens Studio JSON, Style Dictionary (DTCG)
- **Schema validation**: JSON Schema (draft 2020-12) for `brand.yaml`
- **Workshop skill**: 4-phase AI-facilitated brand creation (Discovery → Concept → Visual Identity → Documentation), model-agnostic, session resume support
- **Specification**: `brand.yaml` single-file brand definition format with W3C DTCG-compliant design tokens
- **Examples**: minimal, standard, and full `brand.yaml` examples
