# Using generated files

`brandspec generate` reads your `brand.yaml` and writes token files to `output/` (next to the brand.yaml, or specify `--out <dir>`).

```
brandspec/
├── brand.yaml
└── output/               ← generated
    ├── tokens.css
    ├── theme.css
    ├── figma-tokens.json
    └── style-dictionary/
        ├── tokens.json
        └── config.json
```

## CSS (`tokens.css`)

Custom properties on `:root`. Import it early in your stylesheet.

```css
/* app.css */
@import "./brandspec/output/tokens.css";

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-body);
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}
```

Dark mode tokens (if defined) are emitted under `.dark`:

```css
:root     { --background: oklch(0.99 0.005 80); }
.dark     { --background: oklch(0.15 0.02 60); }
```

→ Format details: [css.md](css.md)

## Tailwind v4 (`theme.css`)

A ready-to-use Tailwind v4 CSS file with `@import "tailwindcss"` and a `@theme` block. Drop it in as your Tailwind entry point or import it alongside your own.

```css
/* generated theme.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.65 0.18 250);
  --color-background: oklch(0.99 0.005 80);
  --font-heading: Inter, system-ui, sans-serif;
}
```

This gives you utilities like `bg-primary`, `text-background`, `font-heading` out of the box.

**Usage in your project:**

```css
/* main.css */
@import "./brandspec/output/theme.css";

/* your styles below — Tailwind utilities are available */
```

Or if you already have a Tailwind entry point, copy the `@theme` block into it.

→ Format details: [tailwind.md](tailwind.md)

## Figma (`figma-tokens.json`)

JSON tokens compatible with [Tokens Studio](https://tokens.studio/) for Figma.

1. Open Tokens Studio in Figma
2. Add a new token set → Import → select `figma-tokens.json`
3. Colors and typography sync to your Figma variables

oklch values are converted to sRGB hex for Figma compatibility.

→ Format details: [figma.md](figma.md)

## Style Dictionary (`style-dictionary/`)

DTCG tokens + a ready-to-run config. Generates output for any platform Style Dictionary supports.

```bash
cd brandspec/output/style-dictionary
npx style-dictionary build --config config.json
```

This produces CSS, SCSS, Swift, Android XML, and more depending on the config platforms.

→ Format details: [css.md](css.md) (for DTCG token structure)

## Tips

- **Commit what you use**: Generate only the formats your project needs (`--format css,tailwind` instead of `all`). Commit `output/` to your repo so designers, AI, and teammates can reference it directly.
- **Regenerate after changes**: Run `brandspec generate` whenever you update `brand.yaml` to keep tokens in sync. Add it to a pre-commit hook or CI step if you prefer automation.
- **Custom output path**: `brandspec generate --out ./src/tokens` to place files where your bundler expects them.
