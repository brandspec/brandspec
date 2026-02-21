# Export: Tailwind CSS Config

Export rules for generating a Tailwind CSS configuration from `brand.yaml`.

## Token Mapping

| brandspec path | Tailwind config path |
|----------------|----------------------|
| `tokens.colors.{name}.$value` | `theme.extend.colors.{name}` |
| `tokens.typography.{name}.$value` | `theme.extend.fontFamily.{name}` |
| `tokens.spacing.{name}.$value` | `theme.extend.spacing.{name}` |
| `tokens.radius.{name}.$value` | `theme.extend.borderRadius.{name}` |

## CSS Variable Reference

Tailwind config SHOULD reference CSS custom properties rather than hardcoding values, to keep `tokens.css` as the single runtime source:

```ts
// dist/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
      },
    },
  },
};
```

## Dark Mode

Dark mode is handled at the CSS level (`.dark` class), not in the Tailwind config.

## Output File

`output/theme.css`
