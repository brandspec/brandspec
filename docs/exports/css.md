# Export: CSS Custom Properties

Export rules for generating CSS custom properties from `brandspec.yaml`.

## Token Mapping

| brandspec path | CSS output |
|----------------|------------|
| `tokens.colors.{name}.$value` | `--{name}: {value};` |
| `tokens.typography.{name}.$value` | `--font-{name}: {value};` |
| `tokens.spacing.{name}.$value` | `--spacing-{name}: {value};` |
| `tokens.radius.{name}.$value` | `--radius-{name}: {value};` |

## Dark Mode

If `$extensions.dark` is present on a token, emit a `.dark` block:

```css
:root {
  --background: oklch(0.99 0.005 250);
}

.dark {
  --background: oklch(0.15 0.02 250);
}
```

## Compat Values

`$extensions.compat` values are NOT emitted in CSS output. CSS uses `$value` (oklch) directly, as modern browsers support it natively.

## Output File

`dist/tokens.css`
