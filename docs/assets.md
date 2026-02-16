# Assets

The `assets` section defines brand assets with semantic metadata.

## Structure

```yaml
assets:
  - file: logo-primary.svg        # Required: file path
    id: logo-primary              # Recommended: semantic ID
    role: logo                    # Recommended: asset role
    variant: primary              # Optional: variation
    context: light-bg             # Optional: usage context
    description: "Primary logo"   # Optional: human description
    formats: [...]                # Optional: derived formats
    tags: [...]                   # Optional: free-form tags
```

## Required Fields

Only `file` is required:

```yaml
assets:
  - file: logo.svg
```

This minimal form is valid. Add more fields as needed.

## Recommended Fields

### `id`

Semantic identifier for referencing the asset.

```yaml
id: logo-primary
```

Should be unique within the brandspec. Use for programmatic access.

### `role`

What the asset is used for.

**Recommended values:**

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

### `variant`

Variation of the asset.

**Recommended values:**

| Variant | Description |
|---------|-------------|
| `primary` | Main version |
| `secondary` | Alternative version |
| `monochrome` | Single color |
| `inverse` | Inverted (e.g., white on dark) |
| `simplified` | Simplified version |
| `stacked` | Vertical layout |
| `horizontal` | Horizontal layout |

Custom values are allowed.

## Optional Fields

### `context`

Intended usage context.

**Recommended values:**

| Context | Description |
|---------|-------------|
| `light-bg` | For light backgrounds |
| `dark-bg` | For dark backgrounds |
| `any` | Works on any background |
| `print` | For print use |
| `digital` | For digital/screen use |
| `social` | For social media |

### `description`

Human-readable description of the asset.

```yaml
description: "Primary logo for use on light backgrounds. Minimum width 120px."
```

### `formats`

Derived formats (different sizes, file types).

```yaml
formats:
  - path: logo-primary.png
    width: 800
    height: 200
  - path: logo-primary@2x.png
    width: 1600
    height: 400
```

### `tags`

Free-form tags for categorization.

```yaml
tags: [header, official, print, marketing]
```

## File Naming Convention

Recommended pattern:

```
{role}-{variant}[-{context}].{ext}
```

Examples:
- `logo-primary.svg`
- `logo-monochrome.svg`
- `logo-inverse-dark-bg.svg`
- `icon-favicon.ico`
- `symbol-simplified.svg`

Benefits:
- Self-documenting file names
- Easy to identify in file browsers
- Consistent organization

## Directory Structure

Recommended:

```
brandspec/
├── brandspec.yaml
└── assets/
    ├── logo-primary.svg
    ├── logo-primary.png
    ├── logo-monochrome.svg
    ├── logo-inverse.svg
    ├── symbol.svg
    ├── icon-favicon.ico
    └── icon-app.png
```

## Examples

### Minimal

```yaml
assets:
  - file: logo.svg
```

### Standard

```yaml
assets:
  - file: assets/logo-primary.svg
    id: logo-primary
    role: logo
    variant: primary
    description: "Primary logo"
```

### Full

```yaml
assets:
  - file: assets/logo-primary.svg
    id: logo-primary
    role: logo
    variant: primary
    context: light-bg
    description: "Primary logo for light backgrounds"
    formats:
      - path: assets/logo-primary.png
        width: 800
        height: 200
      - path: assets/logo-primary@2x.png
        width: 1600
        height: 400
    tags: [header, official, print]
```
