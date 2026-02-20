# Guidelines Specification

Machine-readable specification for the `guidelines` section of brand.yaml.

## Structure

Each key under `guidelines` is a named guideline section containing free-form content and optional machine-readable rules:

```yaml
guidelines:
  logo-usage:
    content: |
      ## Logo Usage
      Markdown content for human readers...
    rules:
      - id: "logo-min-size"
        description: "Logo must meet minimum size requirements"
        severity: error
        applies_to: logo
        criteria:
          - "Digital usage: minimum 120px width"
          - "Print usage: minimum 25mm width"
```

---

## Fields

### `content` (recommended)

Free-form Markdown string. Human-readable guidelines for a specific topic.

Typical sections: logo usage, color usage, voice & tone examples.

### `rules` (optional)

Array of structured, machine-readable rules for AI-driven brand linting.

Each rule:

```yaml
- id: "rule-id"              # Recommended. Unique rule identifier.
  description: "..."         # Required. What this rule enforces.
  severity: error            # Required. info | warning | error.
  applies_to: "logo"        # Optional. Target: logo, color, typography, voice.
  criteria:                  # Optional. Specific checkable conditions.
    - "Condition 1"
    - "Condition 2"
```

### Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| `info` | Advisory, best practice | No action required |
| `warning` | Should fix, non-critical | Review recommended |
| `error` | Must fix, violation | Requires resolution |

---

## Common Guideline Sections

### `logo-usage`

Typical rules:

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `logo-min-size` | Minimum size requirements (120px digital, 25mm print) | error |
| `logo-clear-space` | Clear space around logo | warning |
| `logo-no-rotation` | Logo must not be rotated | error |
| `logo-no-effects` | No shadows, gradients, or effects applied to logo | error |
| `logo-no-distortion` | Aspect ratio must match original | error |

### `color-usage`

Typical rules:

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `color-contrast-aa` | Text on brand colors meets WCAG AA (4.5:1 normal, 3:1 large) | error |
| `color-secondary-area` | Secondary color not used for large background areas (>30% viewport) | warning |

### `voice-examples`

Typical rules:

| Rule ID | Description | Severity |
|---------|-------------|----------|
| `voice-active` | Copy uses active voice | warning |
| `voice-no-jargon` | No technical jargon in user-facing messages | warning |
| `voice-button-descriptive` | Button labels describe the action (not "Submit", "Click here") | error |

---

## Extensions and Core Sections

The `guidelines` key is for usage rules about the brand.

For brand-specific metadata that doesn't fit standard sections, use the top-level `extensions` section:

```yaml
extensions:
  social:
    twitter: "@brand"
    linkedin: "company/brand"
  legal:
    trademark: "Brand™"
    copyright: "© 2026 Brand Inc."
```
