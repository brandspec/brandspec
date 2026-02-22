# Phase 4: Documentation

## Goal

Generate `brand.yaml` and finalize the brandspec directory.

**Spec reference:** See `../../schema/spec/tokens.md` §Spacing, §Radius. See `../../schema/spec/assets.md` for asset registration. See `../../schema/spec/core.md` for core field structure.

## Steps

### 4.1 Defaults Confirmation

Confirm standard spacing and radius tokens before generating `brand.yaml`.

```
Almost done. Standard spacing and radius will be included
(compatible with shadcn/ui + Tailwind v4):

  Spacing: xs 0.25rem / sm 0.5rem / md 1rem / lg 1.5rem / xl 2rem
  Radius:  sm 0.25rem / md 0.5rem / lg 1rem

OK with these defaults?
```

If the user wants to customize, adjust. Otherwise record as confirmed and move on.

---

### 4.2 brand.yaml Generation

Generate `brand.yaml` from all decisions (using latest non-superseded decisions).

**Process:**

1. Gather all decisions from `decisions.yml` (latest non-superseded for each key)
2. Structure into brandspec format following the spec files (core.md, tokens.md, assets.md, guidelines.md)
3. Write to `brand.yaml`
4. If assets exist from Phase 3 logo work or user-provided files, register them in the `assets` section using the structure defined in spec/assets.md. If none exist, leave `assets: []`
5. If dark mode was defined, add `$extensions.dark` to surface and brand color tokens
6. Validate against schema:

```bash
npx brandspec validate brand.yaml
```

If validation fails, fix and re-validate.

**Output:** `brand.yaml` (brandspec directory root)

---

### 4.3 Final Review

Present the completed brandspec directory to the user for approval.

```
Here's your brandspec:

  brandspec/
  ├── brand.yaml          — source of truth
  ├── assets/             — brand assets (if any)
  └── _workshop/          — process records
      └── decisions.yml

Review:
1. Does the essence capture your brand?
2. Are the colors right?
3. Anything to adjust?
```

If the user requests changes, go back and fix. Otherwise, mark complete.

---

## Phase Complete Checklist

- [ ] Spacing/radius confirmed
- [ ] `brand.yaml` generated and valid
- [ ] Assets registered (or noted as next action)
- [ ] User has reviewed and approved

## Workshop Complete

When approved:

```yaml
# Update position.yml
phase: 4
step: "complete"
mode: "execution"
completed_at: "2026-02-23"
```

**Next steps to suggest:**

1. Create logo based on the brief (Phase 3) and register in `assets/`
2. Generate token files: `npx brandspec generate --format all`
3. Use `npx brandspec consult` for brand-aligned AI consultation
4. Host on brandspec.tools for team distribution
