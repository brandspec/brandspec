# Design Tokens

The `tokens` section in brandspec follows the [W3C Design Tokens Community Group](https://tr.designtokens.org/format/) specification.

## Why W3C DTCG?

- Industry standard backed by Figma, Sketch, Adobe, Framer, Penpot
- Compatible with [Style Dictionary](https://amzn.github.io/style-dictionary/), [Tokens Studio](https://tokens.studio/)
- Direct export/import from design tools
- Future-proof interoperability

## Format

```yaml
tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.18 250)"
      $type: color
      $description: "Primary brand color"
    secondary:
      $value: "{colors.primary}"  # Alias reference
      $type: color
```

### Token Properties

| Property | Required | Description |
|----------|----------|-------------|
| `$value` | Yes | The token value |
| `$type` | No | Token type (color, dimension, fontFamily, etc.) |
| `$description` | No | Human-readable description |

### Supported Types

| Type | Example Value |
|------|---------------|
| `color` | `"oklch(0.65 0.18 250)"`, `"#3b82f6"` |
| `dimension` | `"1rem"`, `"16px"` |
| `fontFamily` | `"Inter, sans-serif"` |
| `fontWeight` | `"400"`, `"bold"` |
| `duration` | `"200ms"` |
| `cubicBezier` | `[0.4, 0, 0.2, 1]` |

## Color Format Recommendation

We recommend **oklch** for color values:

```yaml
primary:
  $value: "oklch(0.65 0.18 250)"
```

Why oklch:
- Perceptually uniform
- Wide gamut support
- Easy to create consistent palettes
- Native CSS support

## Semantic Color Tokens

Beyond `primary` and `secondary`, brandspec recommends defining **semantic color tokens** for common UI states:

| Token | Purpose | Typical Hue |
|-------|---------|-------------|
| `success` | Positive actions, confirmations | Green |
| `warning` | Caution states, non-blocking alerts | Amber / Yellow |
| `info` | Informational messages, tips | Blue / Cyan |
| `destructive` | Errors, destructive actions | Red |

Each semantic color SHOULD include `-foreground` and `-muted` variants (see Variant Naming Convention below).

```yaml
tokens:
  colors:
    success:
      $value: "oklch(0.65 0.18 145)"
      $type: color
      $description: "Positive actions and confirmations"
    success-foreground:
      $value: "oklch(0.98 0.01 145)"
      $type: color
    success-muted:
      $value: "oklch(0.92 0.05 145)"
      $type: color
      $description: "Subtle success background"
```

## Variant Naming Convention

brandspec uses a **flat naming convention** with suffixes to express color variants:

| Suffix | Purpose | Example |
|--------|---------|---------|
| *(none)* | Base color (used as background) | `primary` |
| `-foreground` | Text/icon color on that background | `primary-foreground` |
| `-muted` | Subtle/toned-down variant for backgrounds | `primary-muted` |

This flat approach keeps tokens simple and aligns directly with CSS variable names used by shadcn/ui and Tailwind:

```yaml
tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.18 250)"
      $type: color
    primary-foreground:
      $value: "oklch(0.98 0.01 250)"
      $type: color
    primary-muted:
      $value: "oklch(0.90 0.04 250)"
      $type: color
```

The full recommended set of color tokens:

```
background, foreground
primary, primary-foreground, primary-muted
secondary, secondary-foreground, secondary-muted
muted, muted-foreground
destructive, destructive-foreground
success, success-foreground, success-muted
warning, warning-foreground, warning-muted
info, info-foreground, info-muted
```

## Color Format Policy

brandspec **SHOULD** use **oklch** as the canonical color format.

When interoperability with older tools or browsers is needed, use `$extensions.compat` to provide alternative representations alongside the oklch `$value`:

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
- `$value` is always the **source of truth** (oklch)
- `$extensions.compat` values are informational and MAY be used by tools that don't support oklch
- Conversions between formats are approximate — oklch covers a wider gamut than sRGB

## Dark Mode Tokens

Define dark mode values using `$extensions.dark`. This keeps light and dark definitions co-located with each token:

```yaml
tokens:
  colors:
    background:
      $value: "oklch(0.99 0.005 250)"
      $type: color
      $description: "Page background"
      $extensions:
        dark: "oklch(0.15 0.02 250)"
    foreground:
      $value: "oklch(0.15 0.02 250)"
      $type: color
      $extensions:
        dark: "oklch(0.95 0.01 250)"
    primary:
      $value: "oklch(0.65 0.18 250)"
      $type: color
      $extensions:
        dark: "oklch(0.70 0.16 250)"
```

CSS export with dark mode:

```css
:root {
  --background: oklch(0.99 0.005 250);
  --foreground: oklch(0.15 0.02 250);
}

.dark {
  --background: oklch(0.15 0.02 250);
  --foreground: oklch(0.95 0.01 250);
}
```

## Brand Extensions

The top-level `extensions` section in a brandspec file can hold brand-specific color scales and custom tokens that go beyond the standard set. This is useful for product-specific palettes or marketing sub-brands:

```yaml
extensions:
  brand-scale:
    primary-50:
      $value: "oklch(0.97 0.02 250)"
      $type: color
    primary-100:
      $value: "oklch(0.93 0.04 250)"
      $type: color
    primary-200:
      $value: "oklch(0.87 0.08 250)"
      $type: color
    # ... through primary-900
```

Guidelines:
- Use `extensions` for brand-specific scales that don't fit the standard token set
- Follow the same W3C DTCG format (`$value`, `$type`, `$description`)
- These tokens are preserved by the schema (`additionalProperties: true`) but are not part of the standard token vocabulary

## shadcn/ui Compatibility

For projects using shadcn/ui + Tailwind, export tokens as CSS variables:

```css
:root {
  --primary: oklch(0.65 0.18 250);
  --primary-foreground: oklch(0.98 0.01 250);
  --secondary: oklch(0.75 0.12 150);
  --secondary-foreground: oklch(0.20 0.02 150);
  --muted: oklch(0.95 0.01 250);
  --muted-foreground: oklch(0.45 0.02 250);
  --destructive: oklch(0.55 0.20 25);
  --destructive-foreground: oklch(0.98 0.01 25);
  --success: oklch(0.65 0.18 145);
  --success-foreground: oklch(0.98 0.01 145);
  --warning: oklch(0.75 0.15 85);
  --warning-foreground: oklch(0.25 0.05 85);
  --info: oklch(0.65 0.12 230);
  --info-foreground: oklch(0.98 0.01 230);
}
```

Pattern:
- `--{name}` = background color
- `--{name}-foreground` = text color on that background

Usage in Tailwind:
```html
<button class="bg-primary text-primary-foreground">Click me</button>
```

## Grouping

Organize tokens by category:

```yaml
tokens:
  colors:
    # Color tokens
  typography:
    # Font tokens
  spacing:
    # Spacing tokens
  radius:
    # Border radius tokens
```

## References

- [W3C Design Tokens Format](https://tr.designtokens.org/format/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Tokens Studio](https://tokens.studio/)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
