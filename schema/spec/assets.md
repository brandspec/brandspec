# Assets Specification

Machine-readable specification for the `assets` section of brand.yaml.

## Structure

```yaml
assets:
  - file: "path/to/file.svg"       # Required. Relative to brandspec/.
    id: "logo-primary"             # Recommended. Unique semantic identifier.
    role: "logo"                   # Recommended. What the asset is.
    variant: "primary"             # Optional. Which variation.
    context: "light-bg"            # Optional. Usage context.
    description: "Primary logo"    # Optional. Human-readable description.
    formats: [...]                 # Optional. Derived formats.
    tags: [...]                    # Optional. Free-form tags.
```

Only `file` is required. A minimal valid entry:

```yaml
assets:
  - file: logo.svg
```

---

## Fields

### `file` (required)

Relative file path from `brandspec/` directory.

### `id` (recommended)

Unique semantic identifier for programmatic access. Use `{role}-{variant}` pattern.

### `role` (recommended)

What the asset is used for.

| Role | Description |
|------|-------------|
| `logo` | Main logo (may include wordmark) |
| `wordmark` | Text-only logo |
| `symbol` | Icon/symbol mark (no text) |
| `icon` | Small icon (app icon, etc.) |
| `favicon` | Browser favicon |
| `graphic` | General graphic asset |
| `pattern` | Repeating pattern/texture |
| `photo` | Photography |
| `illustration` | Illustrations |
| `video` | Video content |
| `audio` | Audio (sound logo, etc.) |
| `document` | Documents (guidelines PDF, etc.) |
| `font` | Font files |

Custom values are allowed.

### `variant` (optional)

Which variation of the asset.

| Variant | Description |
|---------|-------------|
| `primary` | Main version |
| `secondary` | Alternative version |
| `monochrome` | Single color |
| `inverse` | Inverted (for dark backgrounds) |
| `simplified` | Simplified version (small sizes) |
| `stacked` | Vertical layout |
| `horizontal` | Horizontal layout |

Custom values are allowed.

### `context` (optional)

Intended usage context.

| Context | Description |
|---------|-------------|
| `light-bg` | For light backgrounds |
| `dark-bg` | For dark backgrounds |
| `any` | Works on any background |
| `print` | For print use |
| `digital` | For digital/screen use |
| `social` | For social media |

### `formats` (optional)

Derived formats (different sizes, file types):

```yaml
formats:
  - path: assets/logo-primary.png
    width: 800
    height: 200
  - path: assets/logo-primary@2x.png
    width: 1600
    height: 400
```

### `tags` (optional)

Free-form tags for categorization:

```yaml
tags: [header, official, print, marketing]
```

---

## File Naming Convention

Pattern: `{role}-{variant}[-{context}].{ext}`

| Example | Role | Variant | Context |
|---------|------|---------|---------|
| `logo-primary.svg` | logo | primary | — |
| `logo-monochrome.svg` | logo | monochrome | — |
| `logo-inverse-dark-bg.svg` | logo | inverse | dark-bg |
| `icon-favicon.ico` | favicon | — | — |
| `symbol-simplified.svg` | symbol | simplified | — |

---

## Directory Structure

```
brandspec/
├── brand.yaml
└── assets/
    ├── logo-primary.svg
    ├── logo-monochrome.svg
    ├── logo-inverse.svg
    ├── symbol.svg
    ├── icon-favicon.ico
    └── icon-app.png
```

Assets are stored in `brandspec/assets/` and referenced from `brand.yaml` with relative paths.

---

## Logo System Patterns

Brands use one of four fundamental logo system patterns. Each determines required assets.

### Pattern A: Wordmark

Typography is the identity. Text-only or stylized lettermark.

| Attribute | Detail |
|-----------|--------|
| Examples | Google, FedEx, Coca-Cola, Supreme, IBM |
| Best for | Strong names, text-centric brands |
| Required assets | `wordmark` (+ variants) |
| Optional assets | `lettermark` (initials for compact use) |

### Pattern B: Symbol + Wordmark (separated)

Independent symbol and wordmark, used separately or in lockups.

| Attribute | Detail |
|-----------|--------|
| Examples | Apple, Nike, Spotify, Slack, Airbnb |
| Best for | Apps needing an icon, long-term symbol recognition |
| Required assets | `symbol`, `wordmark` |
| Optional assets | `lockup-horizontal`, `lockup-vertical` |

### Pattern C: Combination Mark (integrated)

Symbol and text form a single inseparable unit.

| Attribute | Detail |
|-----------|--------|
| Examples | Adidas, Burger King, Lacoste |
| Best for | Early-stage brands, consistency priority |
| Required assets | `logo` (integrated unit) |
| Optional assets | `symbol` (extracted for favicon) |

### Pattern D: Emblem

Text enclosed within or integral to a shape.

| Attribute | Detail |
|-----------|--------|
| Examples | Starbucks, BMW, NFL, university crests |
| Best for | Heritage, authority, luxury, institutional |
| Required assets | `logo` (full emblem) |
| Optional assets | `logo-simplified` (reduced detail for small sizes) |

### Pattern Summary

```yaml
logo_system_patterns:
  wordmark:
    required: [wordmark]
    optional: [lettermark]
  symbol_wordmark:
    required: [symbol, wordmark]
    optional: [lockup-horizontal, lockup-vertical]
  combined:
    required: [logo]
    optional: [symbol]
  emblem:
    required: [logo]
    optional: [logo-simplified]
```

### Recommended Variants (all patterns)

| Variant | Purpose | Priority |
|---------|---------|----------|
| `primary` | Standard use on light backgrounds | Required |
| `inverse` | Use on dark backgrounds | High |
| `monochrome` | Single-color constraints | High |
| `simplified` | Small sizes (favicon, 16–32px) | Medium |
| `stacked` / `horizontal` | Layout-specific lockups | Pattern B only |
