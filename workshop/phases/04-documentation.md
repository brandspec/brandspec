# Phase 4: Documentation

## Goal

Generate final deliverables into the brandspec repository.

**Spec reference:** See `../../schema/spec/tokens.md` §Spacing, §Radius, and §Export Mapping. See `../../schema/spec/assets.md` for asset registration.

## Steps

### 4.1 Spacing & Radius Confirmation

Before generating outputs, confirm spacing and radius tokens.

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

**Spec reference:** See `../../schema/spec/assets.md` for the `assets` field structure, file naming convention, and role/variant/context values.

**Facilitation approach:**

```
Do you have any brand assets ready (logos, icons, images)?

a) Yes — let's register them in the assets section
b) Not yet — I'll note this as a next action after the workshop

If you have a logo brief from Phase 3, it will be saved in
guidelines.logo-brief for reference.
```

If assets exist, add them using the structure defined in spec/assets.md.
If not, record the next action and leave `assets: []`.

---

### 4.3 Export Format Selection

Choose which formats to generate.

**Facilitation approach:**

```
Which export formats do you need?

  ✓ tokens.css         (always generated)
  ✓ brand.md           (always generated)
  ☐ tailwind.config.ts
  ☐ brand.html         (visual preview with color chips, font samples)

You can generate additional formats later with:
  npx brandspec generate --format <fmt>
```

---

### 4.4 YAML Generation

Generate `brandspec.yaml` from all decisions (using latest non-superseded decisions).

**Process:**

1. Gather all decisions from `decisions.yml` (latest non-superseded for each key)
2. Structure into brandspec format following the spec files (tokens.md, assets.md, guidelines.md)
3. Write to `brandspec.yaml` (repository root)
4. Validate against schema:

```bash
npx brandspec validate brandspec.yaml
```

If validation fails, fix the YAML and re-validate before proceeding.

If dark mode was defined, add `$extensions.dark` to surface and brand color tokens.
If compat values are needed, add `$extensions.compat` with hsl/hex to key brand colors.

**Output:** `brandspec.yaml` (repository root)

---

### 4.5 Export Generation

Generate selected export formats using the CLI.

**Spec reference:** See `../../schema/spec/tokens.md` §Export Mapping for CSS, Tailwind, and Figma mapping rules.

#### brand.md

Human-readable brand documentation. Three-layer pattern for each section:

1. **Definition** — What it is
2. **Intent** — Why we chose it
3. **Usage** — How to apply it

**Output:** `brand.md` (in project root or output directory)

#### Token files

Use the CLI:

```bash
npx brandspec generate --format css            # → out/tokens.css
npx brandspec generate --format tailwind        # → out/theme.css
npx brandspec generate --format css,tailwind    # → both
npx brandspec generate --format all             # → all formats
```

The CLI produces machine-precise output. The AI-generated `brand.md` is still best produced by the AI, as it requires narrative writing.

---

## Phase Complete Checklist

- [ ] Spacing/radius confirmed
- [ ] Assets registered (or next action documented)
- [ ] `brandspec.yaml` generated and valid
- [ ] Selected export files generated
- [ ] User has reviewed and approved

## Final Review

Before marking complete, review with user:

```
Here's your brandspec directory:

📄 brandspec.yaml - Source of truth
📁 assets/        - Brand assets

Run `npx brandspec generate --format <fmt>` to generate token files.

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
completed_at: "2026-02-20"
```

**Next steps to suggest:**

1. Create actual logo based on brief and register in `assets/`
2. Generate token files: `npx brandspec generate --format tailwind`
3. Use `npx brandspec consult` to get brand-aligned AI consultation
4. Host on brandspec.tools for team distribution
