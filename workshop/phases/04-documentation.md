# Phase 4: Documentation

## Goal

Generate final deliverables into the brandspec repository.

## Steps

### 4.1 Spacing & Radius Confirmation

Before generating outputs, confirm spacing and radius tokens. These are not defined in Phase 3 but are needed for CSS export.

**Facilitation approach:**

```
Your colors and typography are set. Before generating outputs,
let's confirm spacing and border radius values.

Here are recommended defaults (compatible with shadcn/ui + Tailwind v4):

Spacing:
  xs: 0.25rem, sm: 0.5rem, md: 1rem, lg: 1.5rem, xl: 2rem

Border Radius:
  sm: 0.25rem, md: 0.5rem, lg: 1rem

Use these defaults, or would you like to customize?
```

Record the decision in `decisions.yml`.

---

### 4.2 Asset Registration

Register any existing brand assets, or document next steps.

**Facilitation approach:**

```
Do you have any brand assets ready (logos, icons, images)?

a) Yes — let's register them in the assets section
b) Not yet — I'll note this as a next action after the workshop

If you have a logo brief from Phase 3, it will be saved in
guidelines.logo-brief for reference.
```

If assets exist, add them to `assets` in brandspec.yaml.
If not, record the next action and leave `assets: []`.

---

### 4.3 Export Format Selection

Choose which formats to generate into `dist/`.

**Facilitation approach:**

```
Which export formats do you need?

  ✓ tokens.css         (always generated)
  ✓ brand.md           (always generated)
  ☐ tailwind.config.ts
  ☐ brand.html         (visual preview with color chips, font samples)

You can generate additional formats later.
```

Record the selection. This may be stored in `.brandspecrc` or equivalent.

---

### 4.4 YAML Generation

Generate `brandspec.yaml` from all decisions (using latest non-superseded decisions).

**Process:**

1. Gather all decisions from `decisions.yml` (latest non-superseded for each key)
2. Structure into brandspec format using the template in `templates/brandspec.yaml`
3. Write to `brandspec.yaml` (repository root)
4. Validate against schema:

```bash
npx brandspec validate brandspec.yaml
```

If validation fails, fix the YAML and re-validate before proceeding.

**Template:**

```yaml
meta:
  name: "{name}"
  version: "1.0.0"
  updated: "{today}"
  description: "{product_essence}"

core:
  essence: "{product_essence}"
  tagline: "{tagline}"
  personality:
    {personality_traits}
  voice:
    tone:
      {voice_tone}
    principles:
      {voice_principles}

tokens:
  colors:
    # Brand colors with -foreground variants
    primary:
      $value: "{primary_oklch}"
      $type: color
      $description: "{primary_description}"
    primary-foreground:
      $value: "{primary_fg_oklch}"
      $type: color
    secondary:
      $value: "{secondary_oklch}"
      $type: color
    secondary-foreground:
      $value: "{secondary_fg_oklch}"
      $type: color

    # Surface colors
    background:
      $value: "{background_oklch}"
      $type: color
    foreground:
      $value: "{foreground_oklch}"
      $type: color
    muted:
      $value: "{muted_oklch}"
      $type: color
    muted-foreground:
      $value: "{muted_fg_oklch}"
      $type: color

    # Status colors
    destructive:
      $value: "{destructive_oklch}"
      $type: color
    destructive-foreground:
      $value: "{destructive_fg_oklch}"
      $type: color
    success:
      $value: "{success_oklch}"
      $type: color
    success-foreground:
      $value: "{success_fg_oklch}"
      $type: color
    warning:
      $value: "{warning_oklch}"
      $type: color
    warning-foreground:
      $value: "{warning_fg_oklch}"
      $type: color
    info:
      $value: "{info_oklch}"
      $type: color
    info-foreground:
      $value: "{info_fg_oklch}"
      $type: color

  typography:
    {typography_tokens}

assets:
  # To be added when assets are created
  []

guidelines:
  logo-usage:
    content: |
      {logo_guidelines}
  voice-examples:
    content: |
      {voice_examples}
```

If dark mode was defined, add `$extensions.dark` to surface and brand color tokens.
If compat values are needed, add `$extensions.compat` with hsl/hex to key brand colors.

**Output:** `brandspec.yaml` (repository root)

---

### 4.5 Dist Generation

Generate selected export formats into `dist/`.

**Reference templates** are available in `templates/dist/*.tmpl`. Use them as structural guides to ensure consistent output regardless of which LLM runs the workshop. The AI reads the template, substitutes values from decisions, and writes the final file.

#### brand.md

Human-readable brand documentation.

**Structure:**

```markdown
# {Brand Name}

> {Tagline}

## Essence

{Product essence paragraph}

## Personality

{Personality description with traits}

## Voice & Tone

{Voice guidelines with examples}

## Visual Identity

### Colors

{Color descriptions and usage}

### Typography

{Font selections and usage}

### Logo

{Logo brief and guidelines}

## Quick Reference

{Summary table or cheatsheet}
```

**Three-layer pattern for each section:**

1. **Definition** - What it is
2. **Intent** - Why we chose it
3. **Usage** - How to apply it

**Output:** `dist/brand.md`

#### tokens.css

CSS custom properties following [export rules](../../docs/exports/css.md).

```css
:root {
  /* Brand colors */
  --primary: oklch(0.65 0.18 250);
  --primary-foreground: oklch(0.98 0.01 250);
  --secondary: oklch(0.75 0.12 150);
  --secondary-foreground: oklch(0.20 0.02 150);

  /* Surface colors */
  --background: oklch(0.99 0.005 250);
  --foreground: oklch(0.15 0.02 250);
  --muted: oklch(0.95 0.01 250);
  --muted-foreground: oklch(0.45 0.02 250);

  /* Status colors */
  --destructive: oklch(0.55 0.20 25);
  --destructive-foreground: oklch(0.98 0.01 25);
  --success: oklch(0.65 0.18 145);
  --success-foreground: oklch(0.98 0.01 145);
  --warning: oklch(0.75 0.15 85);
  --warning-foreground: oklch(0.25 0.05 85);
  --info: oklch(0.65 0.12 230);
  --info-foreground: oklch(0.98 0.01 230);

  /* Typography */
  --font-heading: Inter, system-ui, sans-serif;
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: JetBrains Mono, monospace;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}

/* Dark mode (if $extensions.dark was defined) */
.dark {
  --background: oklch(0.15 0.02 250);
  --foreground: oklch(0.95 0.01 250);
  --primary: oklch(0.70 0.16 250);
  --primary-foreground: oklch(0.15 0.02 250);
  --muted: oklch(0.25 0.02 250);
  --muted-foreground: oklch(0.65 0.02 250);
}
```

**Output:** `dist/tokens.css`

#### Other Exports (if selected)

- `dist/tailwind.config.ts` - Tailwind config referencing CSS variables
- `dist/brand.html` - Visual preview (color chips, font samples, logo brief)
- Future: `dist/figma-tokens.json`, JSON, etc.

#### Alternative: Use brandspec CLI

Instead of having the AI generate dist files manually, you can use the CLI:

```bash
npx brandspec generate brandspec.yaml --out dist/
# Generates: tokens.css, theme.css (Tailwind), figma-tokens.json, style-dictionary/
```

The CLI produces machine-precise output. The AI-generated `brand.md` (human-readable documentation) is still best produced by the AI, as it requires narrative writing.

---

## Phase Complete Checklist

- [ ] Spacing/radius confirmed
- [ ] Assets registered (or next action documented)
- [ ] `brandspec.yaml` generated and valid
- [ ] Selected `dist/` files generated
- [ ] User has reviewed and approved

## Final Review

Before marking complete, review with user:

```
Here's your brandspec-{brand} repository:

📄 brandspec.yaml - Source of truth
📁 assets/        - Brand assets
📦 dist/          - Generated exports
  ├── tokens.css
  ├── brand.md
  └── (other selected formats)

Please review:
1. Does the essence capture your brand?
2. Are the colors right?
3. Any missing pieces?

Once approved, your Brand Identity is ready to use!
```

## Workshop Complete

When approved:

```yaml
# Update position.yml
phase: 4
step: "complete"
mode: "execution"
completed_at: "2026-02-07"
```

**Next steps to suggest:**

1. Initialize git repository for `brandspec-{brand}`
2. Create actual logo based on brief and register in `assets/`
3. Add to your project: `git submodule add <repo-url> brandspec`
4. Or host on brandspec.tools for team distribution
5. Regenerate `dist/` anytime by re-running the export step

---

## Example Final Repository

```
brandspec-prism/
├── brandspec.yaml
├── assets/             (empty — logo creation is next step)
├── dist/
│   ├── tokens.css
│   └── brand.md
└── .workshop/
    ├── decisions.yml
    └── sessions/
```

### brandspec.yaml

```yaml
meta:
  name: "Prism"
  version: "1.0.0"
  updated: "2025-01-25"
  description: "Single source of truth for Brand Identity"

core:
  essence: "Brand clarity through a single source of truth"
  tagline: "Brand clarity, delivered"
  personality:
    - approachable
    - confident
    - modern
    - playful
  voice:
    tone:
      - friendly
      - clear
      - encouraging
    principles:
      - "Use active voice"
      - "Keep it simple"
      - "Celebrate wins"

tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.15 190)"
      $type: color
      $description: "Teal - modern and distinctive"
    primary-foreground:
      $value: "oklch(0.98 0.01 190)"
      $type: color
    secondary:
      $value: "oklch(0.70 0.10 100)"
      $type: color
      $description: "Warm accent"
    background:
      $value: "oklch(0.99 0.005 190)"
      $type: color
    foreground:
      $value: "oklch(0.15 0.02 190)"
      $type: color
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
    body:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily

assets: []

guidelines:
  logo-usage:
    content: |
      ## Logo Usage
      
      Use the primary logo on light backgrounds.
      Maintain clear space equal to the height of the "P".
      Minimum size: 120px width (digital), 25mm (print).
```

### brand.md

```markdown
# Prism

> Brand clarity, delivered

## Essence

Prism is the single source of truth for Brand Identity. We help teams 
ensure the right assets are always used, everywhere.

## Personality

We are **approachable** - never intimidating or overly formal.
We are **confident** - we know our stuff, but we're not arrogant.
We are **modern** - fresh and current, not trendy or fleeting.
We are **playful** - a touch of delight, never silly.

## Voice & Tone

**Friendly, clear, encouraging.**

We speak like a helpful colleague, not a corporation. We celebrate 
user wins and make problems feel solvable.

### Examples

✅ "Hey! Your brand is ready to share."
❌ "Your brand assets have been successfully uploaded."

✅ "Oops, something went wrong. Let's fix it."
❌ "Error: Upload failed. Please try again."

## Visual Identity

### Colors

**Primary: Teal** - Modern, distinctive, trustworthy without being 
corporate blue.

**Secondary: Warm coral** - Adds approachability and energy.

### Typography

**Inter** - Clean, modern, highly readable. Used for both headings 
and body text with weight variations for hierarchy.

### Logo

Symbol + wordmark combination. Abstract faceted shape suggesting 
clarity and multiple perspectives. Works at small sizes for favicon.
```
