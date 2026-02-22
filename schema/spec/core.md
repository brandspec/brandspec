# Core Specification

Machine-readable specification for the `core` section of brand.yaml.

Defines the brand's verbal identity: essence, personality, voice, and strategic statements.

## Structure

```yaml
core:
  essence: "..."           # Internal guiding principle. One sentence.
  tagline: "..."           # Public-facing copy. One line.
  mission: "..."           # Why the brand exists.
  vision: "..."            # What the brand aspires to become.
  values:                  # Core beliefs that drive decisions.
    - "..."
  personality:             # 3-5 adjectives describing the brand character.
    - "..."
  voice:                   # How the brand speaks.
    tone:
      - "..."
    principles:
      - "..."
```

Only `meta.name` is required for a valid brandspec. All `core` fields are optional at the schema level.

---

## Fields

### `essence` (recommended)

One sentence capturing the brand's internal guiding principle. Used as a north star for decisions, not shown to end users directly.

```yaml
essence: "Make brand identity accessible to every builder"
```

Rules:
- Single sentence, concise
- Internal-facing (guides decisions, not marketing copy)
- Distinct from `tagline` (which is public-facing)

### `tagline` (recommended)

Public-facing copy that captures the brand promise. One line.

```yaml
tagline: "Brand clarity, delivered"
```

Rules:
- Short, memorable
- External-facing (marketing, website, social)
- Distinct from `essence` (which is internal)

### `mission` (optional)

Why the brand exists. What it does and for whom.

```yaml
mission: "To give every team a single source of truth for their brand identity"
```

### `vision` (optional)

What the brand aspires to become or achieve long-term.

```yaml
vision: "A world where every product ships with a consistent, intentional brand"
```

### `values` (optional)

Array of strings. Core beliefs that drive brand decisions.

```yaml
values:
  - "Simplicity over complexity"
  - "Openness by default"
  - "Craft in every detail"
```

### `personality` (recommended)

Array of 3-5 adjectives describing the brand character. These inform voice, visual choices, and content tone.

```yaml
personality:
  - innovative
  - approachable
  - confident
  - playful
```

Rules:
- 3-5 adjectives
- Ordered by prominence (most defining trait first)
- Used as input for voice tone and visual direction

### `voice` (optional)

Object defining how the brand speaks. Contains two sub-fields:

```yaml
voice:
  tone:
    - friendly
    - clear
    - encouraging
  principles:
    - "Use active voice"
    - "Keep sentences short"
    - "Celebrate user wins"
```

#### `voice.tone` (string[])

Adjectives describing the emotional quality of brand communication. Overlaps with `personality` but focuses specifically on written/spoken communication.

#### `voice.principles` (string[])

Actionable writing rules the brand follows. Each principle should be a concrete, checkable guideline.

---

## Required vs Recommended

| Field | Level | Rationale |
|-------|-------|-----------|
| `essence` | Recommended | Core guiding principle — high value for brand consistency |
| `tagline` | Recommended | Public-facing identity — needed for most touchpoints |
| `personality` | Recommended | Drives voice and visual decisions across phases |
| `mission` | Optional | Useful but not needed for visual/verbal output |
| `vision` | Optional | Useful but not needed for visual/verbal output |
| `values` | Optional | Useful but not needed for visual/verbal output |
| `voice` | Optional | Can be derived from personality if not explicitly set |

The Workshop recommends defining at least `essence`, `tagline`, and `personality` during Phase 2 (Concept).

---

## Voice: What Goes Where

The `core.voice` object defines **tone** and **principles** only.

Do/Don't examples, specific copywriting rules, and detailed voice enforcement belong in the `guidelines` section as structured rules:

```yaml
# core section — tone and principles
core:
  voice:
    tone: [friendly, clear]
    principles:
      - "Use active voice"
      - "Keep sentences short"

# guidelines section — enforceable voice rules with examples
guidelines:
  voice-examples:
    content: |
      ## Voice Examples
      - Greeting: "Hey there!" (not "Dear user")
      - Error: "Something went wrong" (not "Error 500")
    rules:
      - id: "voice-active"
        description: "Copy uses active voice"
        severity: warning
        applies_to: voice
      - id: "voice-no-jargon"
        description: "No technical jargon in user-facing messages"
        severity: warning
        applies_to: voice
```

This separation keeps `core` as a concise identity definition and `guidelines` as the enforceable rulebook.

---

## Extensions

For brand phrases, copy collections, or verbal identity elements that don't fit the standard `core` fields, use the top-level `extensions` section:

```yaml
extensions:
  copy:
    key_phrase: "Build brands that last"
    cta_primary: "Get started"
    cta_secondary: "See examples"
  naming:
    rationale: "Evokes clarity, multiple facets, light/modern feel"
    alternatives_considered:
      - "BrandSync"
      - "AssetHub"
```

Rules:
- Use `extensions` for non-standard verbal identity content
- `extensions` is fully open (`additionalProperties: true`)
- Naming rationale belongs in `extensions.naming` or `_workshop/decisions.yml`, not in `core`
