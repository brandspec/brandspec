# Tokens Specification

Machine-readable specification for the `tokens` section of brandspec.yaml.

Follows the [W3C Design Tokens Community Group (DTCG)](https://tr.designtokens.org/format/) format.

## Token Format

Every token uses DTCG properties:

```yaml
token-name:
  $value: "..."          # Required. The token value.
  $type: color           # Recommended. Token type.
  $description: "..."    # Optional. Human-readable description.
  $extensions:           # Optional. Extra metadata.
    dark: "..."          # Dark mode override value.
    compat:              # Legacy format alternatives.
      hex: "..."
      hsl: "..."
```

### Supported Types

| `$type` | Value format | Example |
|---------|-------------|---------|
| `color` | oklch string | `"oklch(0.65 0.18 250)"` |
| `dimension` | CSS length | `"1rem"`, `"16px"` |
| `fontFamily` | CSS font stack | `"Inter, system-ui, sans-serif"` |
| `fontWeight` | CSS weight | `"400"`, `"bold"` |
| `duration` | CSS duration | `"200ms"` |
| `cubicBezier` | Array of 4 numbers | `[0.4, 0, 0.2, 1]` |

## Token Categories

```yaml
tokens:
  colors:       # Color tokens (see §Colors below)
  typography:   # Font tokens (see §Typography below)
  spacing:      # Spacing tokens (see §Spacing below)
  radius:       # Border radius tokens (see §Radius below)
```

---

## Colors

### Color Format

All color values MUST use **oklch** as the canonical format.

```yaml
$value: "oklch(L C H)"
# L = lightness (0–1)
# C = chroma (0–0.4, typical brand colors 0.10–0.20)
# H = hue angle (0–360)
```

Why oklch:
- Perceptually uniform (equal steps look equal)
- Wide gamut (P3, Rec.2020)
- Native CSS support
- Predictable palette generation (rotate H, adjust L/C)

### Variant Naming Convention

Every color token uses a flat naming pattern with suffixes:

| Suffix | Purpose | When to define |
|--------|---------|----------------|
| *(none)* | Base color (used as background) | Always |
| `-foreground` | Text/icon color on that background | Always |
| `-muted` | Subtle/toned-down background variant | Optional |

CSS output maps directly:
```
primary         → --primary
primary-foreground → --primary-foreground
primary-muted   → --primary-muted
```

Contrast requirement: base + `-foreground` pair MUST meet WCAG AA (4.5:1 normal text, 3:1 large text).

### Required Color Tokens

These tokens MUST be defined for a complete brandspec:

```yaml
tokens:
  colors:
    # Brand colors
    primary:
      $value: "oklch(L C H)"
      $type: color
    primary-foreground:
      $value: "oklch(L C H)"
      $type: color
    secondary:
      $value: "oklch(L C H)"
      $type: color
    secondary-foreground:
      $value: "oklch(L C H)"
      $type: color

    # Surface colors
    background:
      $value: "oklch(L C H)"
      $type: color
    foreground:
      $value: "oklch(L C H)"
      $type: color
    muted:
      $value: "oklch(L C H)"
      $type: color
    muted-foreground:
      $value: "oklch(L C H)"
      $type: color

    # Status colors
    destructive:
      $value: "oklch(L C H)"
      $type: color
    destructive-foreground:
      $value: "oklch(L C H)"
      $type: color
```

### Recommended Color Tokens

These tokens SHOULD be defined for UI completeness:

```yaml
    # Semantic status colors
    success:
      $value: "oklch(L C H)"        # Green family (H ≈ 145)
      $type: color
    success-foreground:
      $value: "oklch(L C H)"
      $type: color
    success-muted:
      $value: "oklch(L C H)"
      $type: color
    warning:
      $value: "oklch(L C H)"        # Amber family (H ≈ 85)
      $type: color
    warning-foreground:
      $value: "oklch(L C H)"
      $type: color
    warning-muted:
      $value: "oklch(L C H)"
      $type: color
    info:
      $value: "oklch(L C H)"        # Blue family (H ≈ 230)
      $type: color
    info-foreground:
      $value: "oklch(L C H)"
      $type: color
    info-muted:
      $value: "oklch(L C H)"
      $type: color

    # Brand color muted variants
    primary-muted:
      $value: "oklch(L C H)"
      $type: color
    secondary-muted:
      $value: "oklch(L C H)"
      $type: color
```

### Complete Color Token List

```
Required:
  background, foreground
  primary, primary-foreground
  secondary, secondary-foreground
  muted, muted-foreground
  destructive, destructive-foreground

Recommended:
  primary-muted, secondary-muted
  success, success-foreground, success-muted
  warning, warning-foreground, warning-muted
  info, info-foreground, info-muted
```

### Dark Mode

Define dark mode values using `$extensions.dark` on each token:

```yaml
background:
  $value: "oklch(0.99 0.005 250)"       # Light mode
  $type: color
  $extensions:
    dark: "oklch(0.15 0.02 250)"        # Dark mode
```

Rules:
- `$value` is the light mode (default) value
- `$extensions.dark` is the dark override
- Dark variants are optional; ask the user explicitly
- When defined, export produces both `:root` and `.dark` blocks

### Legacy Compatibility

When interoperability with tools that don't support oklch is needed, provide `$extensions.compat`:

```yaml
primary:
  $value: "oklch(0.65 0.18 250)"
  $type: color
  $extensions:
    compat:
      hsl: "hsl(220 70% 50%)"
      hex: "#3b82f6"
```

Rules:
- `$value` (oklch) is always the source of truth
- `compat` values are informational; conversions are approximate (oklch covers wider gamut than sRGB)
- CSS export uses `$value` directly (browsers support oklch natively)

### Palette Generation Guidelines

When generating a harmonious palette from a primary color:

| Token | Derivation from primary |
|-------|------------------------|
| `primary-foreground` | L ≈ 0.98, C ≈ 0.01, same H |
| `primary-muted` | L ≈ 0.90, C ≈ 0.04, same H |
| `secondary` | Different H, similar L/C |
| `background` | L ≈ 0.99, C ≈ 0.005, primary H |
| `foreground` | L ≈ 0.15, C ≈ 0.02, primary H |
| `muted` | L ≈ 0.95, C ≈ 0.01, primary H |
| `muted-foreground` | L ≈ 0.45, C ≈ 0.02, primary H |
| `destructive` | L ≈ 0.55, C ≈ 0.20, H ≈ 25 (red) |
| `success` | L ≈ 0.65, C ≈ 0.18, H ≈ 145 (green) |
| `warning` | L ≈ 0.75, C ≈ 0.15, H ≈ 85 (amber) |
| `info` | L ≈ 0.65, C ≈ 0.12, H ≈ 230 (blue) |

---

## Typography

### Required Typography Tokens

```yaml
tokens:
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
    body:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
```

### Optional Typography Tokens

```yaml
    mono:
      $value: "JetBrains Mono, monospace"
      $type: fontFamily
```

### Font Pairing Strategies

| Strategy | Heading | Body | Effect |
|----------|---------|------|--------|
| Same family | Inter | Inter | Simple, consistent |
| Contrast | Space Grotesk | Inter | Distinctive headlines |
| Editorial | Fraunces (serif) | Inter (sans) | Editorial, premium |

---

## Spacing

### Recommended Spacing Scale

```yaml
tokens:
  spacing:
    xs:
      $value: "0.25rem"
      $type: dimension
    sm:
      $value: "0.5rem"
      $type: dimension
    md:
      $value: "1rem"
      $type: dimension
    lg:
      $value: "1.5rem"
      $type: dimension
    xl:
      $value: "2rem"
      $type: dimension
```

Compatible with shadcn/ui + Tailwind v4 defaults.

---

## Radius

### Recommended Radius Scale

```yaml
tokens:
  radius:
    sm:
      $value: "0.25rem"
      $type: dimension
    md:
      $value: "0.5rem"
      $type: dimension
    lg:
      $value: "1rem"
      $type: dimension
```

---

## Export Mapping

### CSS Custom Properties

| brandspec path | CSS output |
|----------------|------------|
| `tokens.colors.{name}.$value` | `--{name}: {value};` |
| `tokens.typography.{name}.$value` | `--font-{name}: {value};` |
| `tokens.spacing.{name}.$value` | `--spacing-{name}: {value};` |
| `tokens.radius.{name}.$value` | `--radius-{name}: {value};` |

Dark mode: `$extensions.dark` values emit under `.dark {}` selector.

### Tailwind Config

Tailwind config references CSS variables (not hardcoded values):

```ts
colors: {
  primary: "var(--primary)",
  "primary-foreground": "var(--primary-foreground)",
}
```

### Figma Variables

- oklch values are converted to sRGB hex for Figma import
- If `$extensions.compat.hex` exists, use it directly
- Dark mode creates a "Dark" mode within the Figma variable collection

---

## shadcn/ui Compatibility

brandspec tokens map directly to shadcn/ui CSS variables:

```
--primary          → bg-primary
--primary-foreground → text-primary-foreground
--muted            → bg-muted
--destructive      → bg-destructive
```

Usage: `<button class="bg-primary text-primary-foreground">Click</button>`

## Brand Extensions

For brand-specific color scales (50–900) or custom tokens beyond the standard set, use the top-level `extensions` section:

```yaml
extensions:
  brand-scale:
    primary-50:
      $value: "oklch(0.97 0.02 250)"
      $type: color
    # ... through primary-900
```

Rules:
- Use `extensions` for non-standard tokens
- Follow the same DTCG format
- Preserved by schema (`additionalProperties: true`)
