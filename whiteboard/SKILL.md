# Figma Design System Forge

Agent-centric design system creation for non-designers. Through iterative visual comparison in Figma — generate, compare, select, refine — produce a complete, consistent design system from `brand.yaml`.

Figma is the shared whiteboard between agent and human. The human judges. The agent builds.

## Prerequisites

- `brand.yaml` with tokens defined (colors, typography, spacing, radius)
- Figma file with write access
- Figma MCP (`use_figma` / Plugin API) available
- **`figma/SKILL.md` loaded** — Figma Plugin API operation rules. Contains critical patterns for color conversion (Section 1), auto-layout sizing (Section 2), variable binding (Section 3), and screen assembly (Section 8). Load before starting any phase.
- **Variables synced to Figma** — brand.yaml tokens must be in the Figma file as Variables before starting. This is done via the brandspec workshop (see `workshop/SKILL.md` Phase 3 → `brandspec generate --format figma`) or by the agent reading brand.yaml and creating Variables via `use_figma`. If Variables don't exist yet, create them first before proceeding to Phase 1.

## Deliverables

```
Figma file:
├── Variables          # Synced from brand.yaml tokens
├── Primitives         # Atoms: Button, Input, Badge, Tag, Toggle, etc.
├── Components         # Molecules: FormField, SearchBar, NavItem, etc.
├── Patterns           # Organisms: DataTable, SettingsPanel, Header, etc.
└── Screens            # Template-level samples (Dashboard, Settings, etc.)
```

## Upstream Connection

This skill is the next step after the **brandspec workshop** (`workshop/SKILL.md`). The workshop produces `brand.yaml` (Phases 1-4: Discovery → Concept → Visual Identity → Documentation). This skill picks up from there — turning the yaml definition into a living design system in Figma.

```
Workshop Phase 3 (Visual Identity)
  → personality, mood, colors, typography decisions
  → brand.yaml
    → This skill: Figma Design System Forge
```

The personality traits from the workshop (`brand.yaml core.personality`) inform Taste axis proposals in Phase 1. See "Personality → Taste Inference" below.

## Flow

```
Workshop (brand.yaml)
  ↓
Variables Sync
  ↓
Taste → Primitives → Components → Patterns → Screens → Confirm → Handoff
                                                                    ↓
                                                              Product Code
```

Each phase uses the same core loop: **Generate variants → Compare → Select → Refine**.

## Phase 1: Taste (Look & Feel)

**Goal**: Establish the design system's overall look & feel before touching individual components.

### Taste Axes

Every design system sits somewhere on these 10 axes. The agent proposes 3 positions (A/B/C), each a coherent combination:

| Axis | Spectrum | Affects |
|------|----------|---------|
| Density | compact ←→ spacious | padding, gap |
| Shape | sharp ←→ rounded | border-radius, corner style |
| Weight | light ←→ heavy | border-width, shadow, font-weight contrast |
| Contrast | subtle ←→ bold | color usage, background differentiation |
| Elevation | flat ←→ layered | shadow depth, overlay usage, z-axis |
| Typography Scale | tight ←→ dramatic | heading/body size ratio, letter-spacing |
| Color Temperature | cool ←→ warm | neutral surface tint, border tint |
| Surface Distinction | seamless ←→ segmented | component boundary treatment |
| Motion | instant ←→ expressive | transition speed, easing, hover transforms |
| Icon Style | thin-stroke ←→ filled | stroke weight, size relative to text |

### Taste Parameter Map

The agent uses this map to translate taste direction into concrete values.

#### Density

Controls spacing only. Typography sizing is handled by Typography Scale axis.

```yaml
density:
  compact:
    padding-sm-interactive: "6px 10px"    # buttons, inputs
    padding-sm-display: "2px 6px"         # badges, tags
    padding-md: "8px 14px"
    padding-lg: "8px 16px"
    gap-sm: "4px"
    gap-md: "8px"
    gap-lg: "12px"
  balanced:
    padding-sm-interactive: "8px 14px"
    padding-sm-display: "4px 8px"
    padding-md: "10px 18px"
    padding-lg: "12px 24px"
    gap-sm: "6px"
    gap-md: "10px"
    gap-lg: "16px"
  spacious:
    padding-sm-interactive: "10px 18px"
    padding-sm-display: "6px 12px"
    padding-md: "14px 24px"
    padding-lg: "16px 32px"
    gap-sm: "8px"
    gap-md: "12px"
    gap-lg: "20px"
```

#### Shape

```yaml
shape:
  sharp:
    radius-sm: "2px"
    radius-md: "4px"
    radius-lg: "6px"
    radius-pill: "4px"           # sharp systems don't use pill
    radius-input: "4px"
    radius-card: "6px"
  moderate:
    radius-sm: "4px"
    radius-md: "6px"
    radius-lg: "8px"
    radius-pill: "9999px"
    radius-input: "6px"
    radius-card: "8px"
  rounded:
    radius-sm: "6px"
    radius-md: "8px"
    radius-lg: "12px"
    radius-pill: "9999px"
    radius-input: "8px"
    radius-card: "12px"
```

#### Weight

```yaml
weight:
  light:
    border-width: "1px"
    shadow: "none"
    heading-weight: "500"
    body-weight: "400"
  medium:
    border-width: "1px"
    shadow: "0 1px 2px rgba(0,0,0,0.05)"
    heading-weight: "600"
    body-weight: "400"
  heavy:
    border-width: "2px"
    shadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
    heading-weight: "700"
    body-weight: "400"
```

#### Contrast

```yaml
contrast:
  subtle:
    muted-opacity: "0.05"
    border-opacity: "0.08"
    hover-shift: "0.03"           # lightness delta in oklch
  moderate:
    muted-opacity: "0.08"
    border-opacity: "0.12"
    hover-shift: "0.04"
  bold:
    muted-opacity: "0.12"
    border-opacity: "0.18"
    hover-shift: "0.06"
```

#### Elevation

```yaml
elevation:
  flat:
    shadow-sm: "none"
    shadow-md: "none"
    shadow-lg: "none"
    separation: "border"
  moderate:
    shadow-sm: "0 1px 2px rgba(0,0,0,0.05)"
    shadow-md: "0 4px 6px rgba(0,0,0,0.07)"
    shadow-lg: "0 10px 15px rgba(0,0,0,0.1)"
    separation: "shadow"
  layered:
    shadow-sm: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)"
    shadow-md: "0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)"
    shadow-lg: "0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.12)"
    separation: "shadow+blur"
```

#### Typography Scale

Controls size hierarchy independent of density.

```yaml
typography-scale:
  tight:
    scale-ratio: "1.125"           # major second
    h1: "1.8rem / 500"
    h2: "1.5rem / 500"
    h3: "1.25rem / 500"
    body: "0.875rem / 400"
    small: "0.75rem"
    letter-spacing-heading: "0"
    letter-spacing-body: "0"
    line-height-heading: "1.2"
    line-height-body: "1.4"
  moderate:
    scale-ratio: "1.250"           # major third
    h1: "2.25rem / 600"
    h2: "1.75rem / 600"
    h3: "1.375rem / 600"
    body: "1rem / 400"
    small: "0.875rem"
    letter-spacing-heading: "-0.01em"
    letter-spacing-body: "0"
    line-height-heading: "1.25"
    line-height-body: "1.5"
  dramatic:
    scale-ratio: "1.414"           # augmented fourth
    h1: "3rem / 700"
    h2: "2.25rem / 700"
    h3: "1.6rem / 600"
    body: "1rem / 400"
    small: "0.875rem"
    letter-spacing-heading: "-0.025em"
    letter-spacing-body: "0.01em"
    line-height-heading: "1.1"
    line-height-body: "1.6"
```

#### Color Temperature

Controls the tint of all neutral surfaces. Independent of brand color.

```yaml
color-temperature:
  cool:
    neutral-hue: "brand-hue"       # tinted toward brand color
    neutral-chroma: "0.01-0.02"
    background-L: "0.985"
    muted-L: "0.94"
    border-chroma: "0.01"
  neutral:
    neutral-hue: "0"               # achromatic
    neutral-chroma: "0.005"
    background-L: "0.99"
    muted-L: "0.95"
    border-chroma: "0.005"
  warm:
    neutral-hue: "60-80"           # sand/stone
    neutral-chroma: "0.015-0.025"
    background-L: "0.975"
    muted-L: "0.93"
    border-chroma: "0.02"
```

#### Surface Distinction

How clearly component boundaries are drawn. Separate from elevation.

```yaml
surface-distinction:
  seamless:
    card-border: "none"
    card-bg: "transparent"
    input-style: "border-bottom only"
    divider-weight: "none"
    section-gap: "spacing only"
    nested-surface-shift: "0"       # L delta for nested surfaces
  defined:
    card-border: "1px solid border-color"
    card-bg: "background"
    input-style: "full border"
    divider-weight: "1px / low opacity"
    section-gap: "spacing + divider"
    nested-surface-shift: "+0.02"
  segmented:
    card-border: "1px solid border-color"
    card-bg: "muted"               # distinct from page background
    input-style: "full border + distinct bg"
    divider-weight: "1px / full opacity"
    section-gap: "spacing + divider + bg-shift"
    nested-surface-shift: "+0.04"
```

#### Motion

```yaml
motion:
  instant:
    duration-fast: "0ms"
    duration-base: "0ms"
    duration-slow: "0ms"
    easing-default: "linear"
    easing-enter: "linear"
    easing-exit: "linear"
    hover-transform: "none"
    focus-transition: "none"
  crisp:
    duration-fast: "100ms"
    duration-base: "150ms"
    duration-slow: "200ms"
    easing-default: "cubic-bezier(0.2, 0, 0, 1)"
    easing-enter: "cubic-bezier(0, 0, 0.2, 1)"
    easing-exit: "cubic-bezier(0.4, 0, 1, 1)"
    hover-transform: "none"
    focus-transition: "border-color only"
  expressive:
    duration-fast: "150ms"
    duration-base: "250ms"
    duration-slow: "400ms"
    easing-default: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    easing-enter: "cubic-bezier(0.22, 1.2, 0.36, 1)"
    easing-exit: "cubic-bezier(0.4, 0, 0.7, 0.2)"
    hover-transform: "scale(1.02)"
    focus-transition: "ring + scale"
```

#### Icon Style

```yaml
icon-style:
  thin-stroke:
    icon-stroke-width: "1.5px"
    icon-size-sm: "14px"
    icon-size-md: "16px"
    icon-size-lg: "20px"
    icon-to-text-ratio: "1.0x"
    icon-optical-adjust: "-1px margin-top"
    recommended-set: "Lucide"
  medium-stroke:
    icon-stroke-width: "2px"
    icon-size-sm: "16px"
    icon-size-md: "20px"
    icon-size-lg: "24px"
    icon-to-text-ratio: "1.25x"
    icon-optical-adjust: "0"
    recommended-set: "Phosphor / Heroicons"
  filled:
    icon-stroke-width: "n/a"
    icon-size-sm: "16px"
    icon-size-md: "20px"
    icon-size-lg: "24px"
    icon-to-text-ratio: "1.25x"
    icon-optical-adjust: "0"
    recommended-set: "Material Symbols"
```

### Personality → Taste Inference

The agent reads `brand.yaml core.personality` and `core.voice.tone` to bias the initial taste proposal. This is not deterministic — personality suggests tendencies, not fixed values.

```yaml
# Personality trait → Taste axis tendencies
personality-inference:
  # Spatial & density traits
  minimal:        { density: compact, contrast: subtle, elevation: flat, surface-distinction: seamless }
  clean:          { density: balanced, contrast: subtle, elevation: flat, surface-distinction: defined }
  spacious:       { density: spacious, contrast: subtle, elevation: moderate }

  # Character traits
  bold:           { contrast: bold, weight: heavy, typography-scale: dramatic }
  confident:      { weight: medium, contrast: moderate, typography-scale: moderate }
  playful:        { shape: rounded, motion: expressive, icon-style: filled }
  serious:        { shape: sharp, motion: crisp, icon-style: thin-stroke }
  rigorous:       { density: compact, shape: sharp, surface-distinction: defined }
  pragmatic:      { density: compact, weight: light, elevation: flat, motion: crisp }

  # Warmth traits
  warm:           { color-temperature: warm, shape: rounded }
  approachable:   { color-temperature: warm, shape: moderate, contrast: subtle }
  professional:   { color-temperature: neutral, shape: moderate, weight: medium }
  technical:      { color-temperature: cool, typography-scale: tight, density: compact }

  # Expressiveness traits
  expressive:     { motion: expressive, typography-scale: dramatic, contrast: bold }
  understated:    { motion: crisp, typography-scale: tight, contrast: subtle }
  polymorphic:    { surface-distinction: defined }  # clear boundaries enable multi-context use
```

When multiple personality traits are present, the agent merges their tendencies. Conflicts are resolved by preferring the more specific trait (e.g. `rigorous` overrides `spacious` on density).

The agent presents these inferences transparently:

```
"Your brand.yaml says personality: [polymorphic, rigorous, pragmatic].
 This suggests: compact density, sharp shapes, crisp motion, defined surfaces.
 I'll use this as a starting point for the 3 patterns."
```

### Theme Strategy

Before proposing taste patterns, the agent asks about theme requirements:

```
"Does this product need multiple themes?
 a) Single theme (light or dark) — one Figma file, one mode
 b) Light + Dark — one Figma file, two Variable modes (light/dark)
 c) Separate theme files — e.g. OSS=light, SaaS=dark in different files
 d) Not sure yet — proceed with one theme, add later"
```

The decision affects:
- **Figma file structure**: one file with modes vs multiple files
- **Variables setup**: single mode vs light/dark modes in the same collection
- **Color token generation**: whether `$extensions.dark` values are needed
- **Taste evaluation**: each theme may need its own taste review (dark themes often need adjusted contrast and elevation)

Record in Taste Decision:
```yaml
taste:
  theme-strategy: "single-light"  # or "dual-mode" or "separate-files"
  # ...axes...
```

If `dual-mode` or `separate-files`: the agent builds the primary theme first, then generates the alternate theme and presents both for comparison.

### Pre-Generation Dialogue

Before generating anything, the agent confirms its understanding and gathers input that brand.yaml alone can't provide:

```
Agent: "Let me make sure I understand your product.

        brandspec.tools — brand identity management platform.
        Users edit design tokens, preview results, export to code.

        The densest screen is probably the token editor:
        sidebar navigation, token list/table, edit form, live preview pane.

        A few questions before I generate the 3 patterns:

        1. Your users — do they spend long sessions in this tool?
           (affects density: long sessions favor spacious, quick tasks favor compact)

        2. Any product you like the feel of?
           (I have presets for Linear, Notion, Stripe, Vercel, etc.)

        3. Anything you definitely don't want?
           (e.g. 'not too playful', 'no heavy shadows')"
```

The agent asks only what it can't infer. If brand.yaml has strong personality signals, fewer questions are needed. If brand.yaml is minimal, more questions.

After this dialogue, the agent announces what it will build:

```
Agent: "Got it. I'll generate 3 taste directions, each with:
        - Atoms (Button, Input, Card, Badge, etc.)
        - Molecules (FormField, SearchBar, NavItem)
        - Organisms (DataTable, Sidebar)
        - One screen: the token editor view

        All 3 side by side in Figma. This will take a while."
```

Then generation begins. This is a heavy operation — the agent builds 3 complete component stacks and 3 screen compositions.

### Taste Proposal Format

The agent reads `brand.yaml` (personality, tone, tokens) and proposes 3 taste directions:

```
Pattern A: "{Name}" — {one-line description}
  density: compact | shape: sharp | weight: light | contrast: moderate | elevation: flat
  typography-scale: tight | color-temperature: cool | surface-distinction: defined
  motion: crisp | icon-style: thin-stroke
  Character: {what this feels like in a product}

Pattern B: "{Name}" — {one-line description}
  ...
  Character: {what this feels like in a product}

Pattern C: "{Name}" — {one-line description}
  ...
  Character: {what this feels like in a product}
```

Then generates all 3 in Figma, side by side. The goal is **enough visual information to distinguish the taste directions**. This does NOT need to be exhaustive — these are taste sketches, not production components.

The minimum viable comparison:

```
Taste Comparison Layout (in Figma):

           Pattern A          Pattern B          Pattern C
          ┌──────────┐      ┌──────────┐      ┌──────────┐
Atoms     │ Button    │      │ Button    │      │ Button    │
          │ Input     │      │ Input     │      │ Input     │
          │ Card      │      │ Card      │      │ Card      │
          ├──────────┤      ├──────────┤      ├──────────┤
Screen    │ [richest  │      │ [richest  │      │ [richest  │
          │  product  │      │  product  │      │  product  │
          │  screen]  │      │  screen]  │      │  screen]  │
          └──────────┘      └──────────┘      └──────────┘
```

The agent decides how much to include between Atoms and Screen based on what's needed to make the taste difference visible. If density and surface-distinction are the main differentiators, a DataTable is essential. If typography-scale matters most, a content-heavy layout is needed. The agent uses judgment — the goal is **taste differentiation, not component coverage**.

The screen is **the single product screen where the most component types coexist**. The agent picks this by reading brand.yaml and identifying the product's densest interaction surface. This is NOT a generic "dashboard" — it's product-specific.

**These taste sketches are disposable.** After taste is confirmed, production components are built from scratch in Phase 2-4 with full variants, states, and audits. The sketches served their purpose — helping the user choose a direction.

### Pattern Distance Rule

The 3 initial patterns MUST be clearly distinct directions, not variations of the same idea. If personality inference pushes all patterns toward the same center, the comparison becomes useless.

**Requirements:**
- At least 3 axes must differ between any two patterns
- Pattern A: the natural consequence of personality inference (safe zone)
- Pattern B: intentionally distant from personality — a challenging alternative
- Pattern C: a different reference product aesthetic, or a midpoint that combines unexpected axes

**Anti-pattern:** All 3 patterns are "compact, moderate-radius, light-weight" with only shadow depth varying. This is a micro-adjustment, not a direction comparison.

**Good example:**
```
Pattern A "Forge" (from personality: rigorous, pragmatic):
  density: compact | shape: sharp | weight: light | elevation: flat | motion: crisp

Pattern B "Canvas" (challenging — opposite of rigorous):
  density: spacious | shape: rounded | weight: medium | elevation: layered | motion: expressive

Pattern C "Anvil" (reference: Vercel-like):
  density: balanced | shape: moderate | weight: light | contrast: bold | elevation: flat
```

### Convergence Rounds

Convergence happens AFTER direction is chosen, not during initial proposal.

```
Round 1: Diverge — 3 clearly different directions
  → User picks a direction (or mixes axes)

Round 2: Refine — 3 variations within the chosen direction
  → Subtle adjustments: radius 4px vs 6px vs 8px, padding scale, shadow depth

Round 3: Confirm — final taste locked
```

### User Selects or Mixes (Round 1)

- "B" → Round 2 explores variations of B
- "A's density with B's shape" → agent creates mixed pattern D, generates Round 2 around D
- "Something between A and B" → agent interpolates, generates Round 2 around the midpoint
- "None of these, more like Linear" → agent proposes new Round 1 with reference
- "I like B's screen but A's table density" → agent mixes at the axis level

Every selection/mix regenerates from Atoms through Screens so the user always sees the complete picture.

### Reference Presets

Known product taste profiles for when the user says "like X":

```yaml
presets:
  linear:
    density: compact
    shape: moderate
    weight: light
    contrast: moderate
    elevation: flat
    typography-scale: tight
    color-temperature: warm        # warm grays despite blue brand
    surface-distinction: defined
    motion: crisp
    icon-style: thin-stroke
  notion:
    density: balanced
    shape: moderate
    weight: light
    contrast: subtle
    elevation: flat
    typography-scale: moderate
    color-temperature: warm
    surface-distinction: seamless
    motion: crisp
    icon-style: thin-stroke
  stripe:
    density: spacious
    shape: rounded
    weight: medium
    contrast: moderate
    elevation: moderate
    typography-scale: dramatic
    color-temperature: neutral
    surface-distinction: defined
    motion: expressive
    icon-style: medium-stroke
  vercel:
    density: balanced
    shape: moderate
    weight: light
    contrast: bold
    elevation: flat
    typography-scale: moderate
    color-temperature: neutral
    surface-distinction: defined
    motion: crisp
    icon-style: thin-stroke
  material3:
    density: spacious
    shape: rounded
    weight: medium
    contrast: moderate
    elevation: layered
    typography-scale: dramatic
    color-temperature: warm
    surface-distinction: segmented
    motion: expressive
    icon-style: filled
  github:
    density: balanced
    shape: moderate
    weight: medium
    contrast: moderate
    elevation: moderate
    typography-scale: moderate
    color-temperature: neutral
    surface-distinction: defined
    motion: crisp
    icon-style: medium-stroke
```

### Taste Decision Record

```yaml
taste:
  theme-strategy: "dual-mode"
  density: compact
  shape: moderate
  weight: light
  contrast: moderate
  elevation: flat
  typography-scale: tight
  color-temperature: warm
  surface-distinction: defined
  motion: crisp
  icon-style: thin-stroke
  reference: "Linear-like density with softer edges"
  personality-source: [polymorphic, rigorous, pragmatic]
```

## Phase 2-4: Building the Component System

Phases 2 (Primitives), 3 (Components), 4 (Patterns) share the same rhythm. They differ in what is being built, not how.

Phase 1's taste sketches are disposable — they existed to help choose a direction. Now the agent builds **production components**: full variants, all states, Variables-bound, audited.

### Icon Library Setup

Before building components with icons, the user needs an icon library enabled in Figma. The agent checks the confirmed `taste.icon-style` and recommends the matching library:

| taste.icon-style | Recommended Library | Notes |
|-----------------|-------------------|-------|
| thin-stroke | Lucide Icons | Default for most SaaS. 1.5px stroke |
| medium-stroke | Phosphor Icons or Heroicons | 2px stroke. More visual weight |
| filled | Material Symbols | Solid fills. Suited to dense UIs |

The agent prompts the user:

> "Your taste uses thin-stroke icons. Enable **Lucide Icons** from the Figma Community library (Assets panel → library icon → search 'Lucide Icons' → Enable). This lets me use icons as instances in your components."

Once enabled, icons are available via `search_design_system` and `importComponentByKeyAsync` — see `figma/SKILL.md` for details.

If the user can't find or enable the library, the agent can proceed without icons and add them later. Icons are not a blocker for component structure.

### Scope Negotiation

The agent does NOT blindly build a fixed list. Instead, at the start of Phase 2:

1. **Agent reads brand.yaml** to understand the product
2. **Agent proposes a component inventory** tailored to the product, organized by layer:

```
Agent: "Based on brand.yaml, this is a SaaS platform for brand management.
        Here's the component inventory I'd recommend:

        Primitives (Atoms):
          Core:     Button, Input, Select, Textarea, Checkbox, Toggle
          Display:  Badge, Tag, Avatar, Divider, Skeleton
          Feedback: Alert, Tooltip, Toast

        Components (Molecules):
          Core:     FormField, SearchBar, NavItem, TabBar
          Data:     ListItem, Stat, Breadcrumb
          Actions:  Pagination, DropdownMenu, CommandPalette

        Patterns (Organisms):
          Layout:   Header, Sidebar, PageShell
          Data:     DataTable, CardGrid, DetailPanel
          Workflow:  Modal, EmptyState, SettingsPanel, Wizard

        Want to add, remove, or adjust anything?"
```

3. **User adjusts**: "CommandPalette isn't needed yet" / "Add a color picker — it's core to our product" / "Looks good"
4. **Inventory is locked** — this becomes the build plan

### Product-Specific Components

Some components are unique to the product. The agent identifies them from brand.yaml context:

```
Agent: "Your product is about brand identity management.
        I'd suggest these product-specific components:

        - ColorSwatch: displays oklch color with value and name
        - TokenCard: shows a design token with preview and copy action
        - BrandPreview: live preview of brand.yaml output
        - YamlStatus: sync indicator between yaml and generated output

        These don't exist in generic systems — they're yours.
        Want to include any of these?"
```

### Build Order

Within each layer, build order follows dependency:

```
Phase 2 — Primitives (Atoms):
  Layer 2a: Foundation — Button, Badge, Tag, Divider, Avatar, Toggle
    (standalone, no dependencies)
  Layer 2b: Input family — Input, Textarea, Select, Checkbox, Radio
    (share height/spacing with 2a)
  Layer 2c: Containers — Card, Alert, Tooltip, Popover, Toast
    (contain atoms from 2a/2b)

  → Checkpoint: "Primitives complete. Review all together?"

Phase 3 — Components (Molecules):
  Built from Phase 2 Primitives (Instances, not copies)

  → Checkpoint: "Components complete. Anything missing for your screens?"

Phase 4 — Patterns (Organisms):
  Built from Phase 2 + 3

  → Checkpoint: "Patterns complete. Ready for screens, or need more patterns?"
```

### Per-Component Spec

Each component MUST have:

| Property | Source |
|----------|--------|
| Colors | brand.yaml tokens → Figma Variables binding |
| Sizing | Taste: density (padding, gap) + typography-scale (font-size) |
| Shape | Taste: shape (radius) |
| States | default, hover, focus, disabled (minimum) |
| Variants | size (sm/md/lg), visual variant (primary/secondary/ghost/destructive) |
| Motion | Taste: motion (transition, hover transform) |
| Icons | Taste: icon-style (size, stroke-weight, recommended set) |

### Component-Specific Derivation Rules

The agent derives component-specific values from taste axes. These are not arbitrary — each rule traces to a taste parameter.

#### Button

| Parameter | Derivation |
|-----------|-----------|
| icon-size | icon-style.icon-size at matching size variant |
| icon-gap | density.gap-sm |
| min-width | density=spacious → 80px minimum, otherwise content-sized |
| active-state | weight=light → opacity 0.9, weight=heavy → translateY(1px) + darken |

#### Input

| Parameter | Derivation |
|-----------|-----------|
| focus-style | elevation=flat → border-color change + 2px ring. elevation=layered → 3px ring. surface-distinction=seamless → border-color only |
| placeholder-opacity | contrast.muted-opacity × 5 (scaled to text) |
| label-gap | density: compact=4px, balanced=6px, spacious=8px |
| error-indicator | weight=heavy → left-border 4px destructive + text. otherwise → border-color + text |

#### Table

| Parameter | Derivation |
|-----------|-----------|
| row-height | density: compact=36px, balanced=44px, spacious=52px |
| header-weight | typography-scale heading-weight |
| header-bg | surface-distinction: segmented=muted, defined=transparent, seamless=transparent |
| stripe-pattern | surface-distinction: segmented=alternating muted/background, otherwise=none |
| cell-padding | density.padding-sm-interactive horizontal |
| border-style | surface-distinction: seamless=border-bottom only, segmented=full grid |

#### Card

| Parameter | Derivation |
|-----------|-----------|
| outer-padding | density.padding-lg |
| content-gap | density.gap-md |
| nested-card-bg | surface-distinction.nested-surface-shift applied to parent bg |
| footer-separator | surface-distinction ≥ defined → 1px border-top, seamless → spacing only |

#### Navigation / Sidebar

| Parameter | Derivation |
|-----------|-----------|
| item-height | density: compact=32px, balanced=36px, spacious=40px |
| active-indicator | shape: sharp=left-border accent, moderate=muted-bg rectangle, rounded=muted-bg with radius |
| icon-label-gap | density: compact=8px, balanced=10px, spacious=12px |
| section-label | typography-scale.small + muted-foreground. weight=heavy → uppercase + tracking 0.05em |

### Build Loop (per component)

1. Agent generates all variants in Figma as a Component Set
2. If the component has behavioral aspects (Dialog, Toast, Dropdown, etc.), define its **Interaction Spec** and write it to the component's description field. See "Interaction Spec" section below for per-component decisions and defaults.
3. Agent places them on the appropriate page, aligned with existing components
4. **Cross-check**: Agent verifies consistency with already-built components
   - Heights align across same-size variants (Button sm = Input sm = Select sm)
   - Spacing tokens are consistent
   - Color usage follows the same pattern
5. User reviews
6. Adjust → regenerate → review until confirmed

### Consistency Audit

After each layer, agent runs a cross-component audit:

```
Audit checklist:

Structural consistency:
- [ ] All sm/md/lg heights match across components
- [ ] All padding values come from taste density parameters
- [ ] All colors are Variables-bound (no hardcoded values)
- [ ] All radius values match taste shape setting (with component-specific overrides)
- [ ] Hover/focus states use consistent interaction patterns per motion axis
- [ ] Icon sizes follow icon-style at matching size variant
- [ ] Surface treatments follow surface-distinction axis

Typography precision:
- [ ] Minimum 4-level type hierarchy (display/heading/body/caption) with clear size steps
- [ ] No two adjacent levels share the same font-size — each step must be visually distinct
- [ ] Letter-spacing and line-height set per level (not just font-size)
- [ ] Numeric data right-aligned in tables

Color refinement:
- [ ] Status/semantic colors (success/warning/danger) have reduced chroma to sit within the UI
      — not raw green/yellow/red. Typical range: oklch chroma 0.08–0.12, not 0.15+
- [ ] Status colors maintain WCAG AA contrast against their background
- [ ] Accent color usage is intentional and sparse — not applied to every interactive element

Spacing rhythm:
- [ ] Spacing follows grouping logic: tight within groups, wider between groups
      — e.g. related fields gap-sm (6-8px), section gap-lg (24-32px)
- [ ] Consistent vertical rhythm in lists/tables (row height uniform per density)
- [ ] Header/toolbar visually separated from content (not just by a line — by spacing weight)
```

Report findings visually in Figma (highlight inconsistencies).

### Layer Checkpoint

At the end of each layer (2a/2b/2c, Phase 3, Phase 4), the agent runs a checkpoint:

```
Agent: "Layer complete. Here's what we have:

        Built: Button, Badge, Tag, Toggle, Avatar, Divider (6 primitives)
        Variants: 127 total across all components
        Audit: clean ✓

        Next layer: Input family (Input, Textarea, Select, Checkbox, Radio)

        Before I proceed:
        - Anything to adjust in the current layer?
        - Any components to add to the next layer?
        - Or: go ahead?"
```

### Expansion Prompt

After Phase 4 is complete and before moving to Screens, the agent does a **coverage check**. But this is not just "do we have enough for screens" — it's a systematic scan of the product's entire surface area.

#### Conversational Expansion

The agent proposes expansion through natural dialogue, not checklists. The rhythm:

1. **Suggest one thing that might be core**, with reasoning
2. User says yes or no
3. If yes → build it
4. **Offer the menu casually** — mention a few possibilities to spark ideas
5. User picks, or says done
6. Repeat until user is satisfied

Example flow:

```
Agent: "Your product is about token editing. A ColorPicker is probably
        core — users will interact with it constantly. Want me to build that?"

User:  "Yes"

Agent: [builds ColorPicker]
       "Nice. A token preview card might be core too — showing the live
        result of a color/spacing change. What do you think?"

User:  "Yeah, do that"

Agent: [builds TokenPreviewCard]
       "Ok. There's a lot more I can build when you're ready —
        toast notifications, modal flows, email templates, mobile layouts,
        filter patterns, loading states...
        Anything jump out, or good for now?"

User:  "Toast and loading states"

Agent: [builds Toast, Skeleton/Loading]
       "Done. Want to keep going or move to screens?"

User:  "Screens"

Agent: [proceeds to Phase 5]
```

Key behaviors:
- **One suggestion at a time** for core candidates, with product-specific reasoning
- **Casual menu** of possibilities after core is covered — not a formal checklist
- **User controls pace** — can stop anytime
- **Agent remembers what was deferred** — can revisit after screens if needed
- **No pressure to be exhaustive** — better to build what matters than catalog everything

### Interaction Pattern Decisions

The Pattern layer involves not just visual treatment but product-wide interaction decisions. These don't all need answers in initial build — but the **questions** must be surfaced.

The agent maintains a decision table. Items start as undecided with a sensible default. Decisions are prompted naturally as Screens are assembled in Phase 5.

```
| Pattern | Decision | Options | Status |
|---------|----------|---------|--------|
| Navigation | Primary nav | sidebar / top-nav / tabs | ⬜ undecided |
| DataTable | Sort | header click / external control / both | ⬜ undecided |
| DataTable | Pagination | paginated / infinite scroll / load all | ⬜ undecided |
| Filter | Visibility | always visible / collapsible panel | ⬜ undecided |
| Selection | Row select | none / single / multi-select | ⬜ undecided |
| Editing | Edit mode | inline / modal / slide-over panel | ⬜ undecided |
| Form validation | Error display | inline per-field / summary top / toast | ⬜ undecided |
| Notification | Delivery | toast / banner / badge / combination | ⬜ undecided |
| Loading | Pattern | skeleton / spinner / progressive | ⬜ undecided |
| Confirmation | Destructive actions | inline confirm / dialog | ⬜ undecided |
```

This table is the design system's way of **asking questions, not answering them**. Undecided items get a default placeholder so work can proceed. When a decision is made (by the user or through Phase 5 screen assembly), the table is updated.

In Ongoing mode, this table becomes a reference for new screens — ensuring interaction patterns stay consistent across features built at different times.

## Phase 5: Screens (Templates)

**Goal**: Validate the system by assembling real product screens — not generic templates.

### Screen Generation

The agent reads `brand.yaml` to understand what the product is:

```yaml
# From brand.yaml
meta:
  name: "brandspec.tools"
core:
  essence: "AI-powered brand identity management platform"
  # ... personality, voice, etc.
```

From this, the agent **infers the product's core screens** and proposes them:

```
Agent: "Based on brand.yaml, this is a SaaS platform for brand identity management.
        I'd propose these screens to validate the design system:

        1. Dashboard — project list, recent activity, quick actions
        2. Brand Editor — token editing, live preview, yaml sync status
        3. Asset Library — uploaded logos/icons, variants grid, usage info
        4. Team Settings — members table, role management, invite flow
        5. Onboarding — workspace setup wizard, brand import

        These cover: data tables, forms, cards, empty states, wizards.
        Want to adjust or add screens?"
```

### Screen Content

Screens use **realistic placeholder content derived from the product context**, not "Lorem ipsum" or generic "User Name":

- Field labels match the product domain (e.g. "Brand Name", "Primary Color", not "Title", "Field 1")
- Table data reflects plausible product data (e.g. project names, status values)
- Navigation labels match expected product structure
- Empty states describe the actual product action ("Create your first brand" not "No items yet")

### Screen Composition

Each screen is assembled from existing Patterns, Components, and Primitives. The agent documents the composition:

```
Dashboard:
  Layout: Header + Sidebar + Main content area
  Main:   StatsCards (row of 3) + DataTable (recent projects) + ActivityFeed
  Uses:   Card, Badge, DataTable, Avatar, Button
  New primitives needed: StatsCard (if not yet built)
```

If a screen reveals missing components, the agent builds them (tracing back to Phase 2-4) before composing the screen.

### Validation

At this level, the user can judge:
- Does this feel like **my** product?
- Do the screens make sense for what this product does?
- Is the density right for the data this product handles?
- Is the typography hierarchy clear?
- Does the color temperature feel right?
- Are component boundaries (surface-distinction) appropriate?
- Are there missing screens or flows?
- Does the brand come through visually?
- **Does this screen surface any missing data or features?** (e.g. "wait, we need a status field for this")

If something feels wrong, trace back to the source:
- Layout issue → adjust Pattern
- Component issue → adjust Primitive
- Systemic issue → revisit Taste parameters
- Hierarchy issue → revisit Typography Scale
- Warmth/coldness → revisit Color Temperature
- **Product issue → flag missing data model or feature gap**

## Phase 6: Confirm

**Goal**: Lock the design system.

1. Agent runs final audit across all pages
2. List any remaining hardcoded values or inconsistencies
3. Verify all 10 taste axes are consistently applied
4. User does final review
5. Mark as confirmed

## Phase 7: Handoff

**Goal**: Reflect design refinements back to brand.yaml and mark the boundary to implementation.

### Token Refinement

During Taste selection and component building, token values may be refined through visual judgment. These refinements should flow back to `brand.yaml`:

```
Agent: "During the Figma process, these token values were refined:
        - tokens.radius.md: 6px → 8px (your feedback in Phase 2)
        - tokens.spacing.sm: 4px → 6px (audit found it too tight)
        - tokens.colors.muted lightness: adjusted for contrast
        Updating brand.yaml tokens to match."
```

Then regenerate exports:
```bash
brandspec generate --format css,tailwind,figma
```

This keeps brand.yaml as the SSoT. The Figma process refines tokens through visual testing that the Workshop couldn't — brand.yaml gets better, not bypassed.

**What is NOT updated**: `core` section (personality, essence, voice). Those are Workshop decisions. Only `tokens` values are refined.

### Deliverable Summary

```
Design System: [product name]
Taste: [confirmed taste record]
Theme: [strategy — single/dual-mode/separate-files]

Pages:
  Primitives: [count] components, [count] variants
  Components: [count] molecules
  Patterns: [count] organisms
  Screens: [count] product screens

Token refinements: [list of brand.yaml changes]
Audit status: clean / [N] issues remaining
```

### Boundary

From here, implementation begins — translating the Figma design system into product code. That is outside this skill's scope.

```
This skill's responsibility:
  brand.yaml tokens → Figma Variables → Design system → Confirmed
  → Token refinements back to brand.yaml

Outside this skill:
  Figma → Code implementation
  Code Connect setup
  Storybook verification
  Production deployment
```

## Interaction Spec

Figma shows appearance. But many components have behavior that appearance alone doesn't capture. When the agent builds these components, it must also define their **interaction spec** — the design decisions about how they behave.

These are NOT implementation details (no "use Portal", no "use Radix"). They are **user-facing behavior** that the designer must decide.

The agent writes the interaction spec into each Figma component's description field.

### Per-Component Interaction Spec

#### Dialog / Modal

| Decision | Options | Default |
|----------|---------|---------|
| Dismiss on overlay click | yes / no | yes |
| Dismiss on Escape key | yes / no | yes |
| Focus behavior on open | first focusable / specific element | first focusable |
| Scroll behavior | body locked / body scrollable | body locked |
| Entrance animation | fade / scale / slide | taste.motion derived |

#### Alert Dialog (destructive confirmation)

| Decision | Options | Default |
|----------|---------|---------|
| Dismiss on overlay click | yes / no | **no** (intentional) |
| Dismiss on Escape | yes / no | **no** (must choose action) |
| Required action | confirm button only | confirm button only |

#### Toast / Notification

| Decision | Options | Default |
|----------|---------|---------|
| Position | top-right / top-center / bottom-right / bottom-left | top-right |
| Width | fixed / content-adaptive | fixed (360px) |
| Auto-dismiss duration | seconds / persistent | 5s (info), persistent (error) |
| Stack direction | newest on top / newest on bottom | newest on top |
| Max visible | number | 3 |
| Dismiss gesture | close button / swipe / both | close button |

#### Dropdown / DropdownMenu

| Decision | Options | Default |
|----------|---------|---------|
| Dismiss on outside click | yes / no | yes |
| Preferred position | below / above / auto | auto |
| Max height | fixed / viewport-relative | viewport-relative (50vh) |
| Keyboard navigation | arrow keys / type-ahead / both | both |
| Sub-menu trigger | hover / click | hover |

#### Select

| Decision | Options | Default |
|----------|---------|---------|
| Search / filter | yes / no | no (< 10 items), yes (≥ 10 items) |
| Multi-select | yes / no | per use case |
| Dismiss on select | yes (single) / no (multi) | depends on mode |
| Keyboard | arrow keys + type-ahead | yes |

#### Tooltip

| Decision | Options | Default |
|----------|---------|---------|
| Show delay | ms | 400ms |
| Hide delay | ms | 0ms |
| Position preference | top / bottom / auto | auto |
| Max width | px | 240px |
| Persist on hover | yes / no | yes |

#### Popover

| Decision | Options | Default |
|----------|---------|---------|
| Dismiss on outside click | yes / no | yes |
| Dismiss on Escape | yes / no | yes |
| Position preference | top / bottom / left / right / auto | auto |
| Arrow indicator | yes / no | taste: sharp=no, rounded=yes |

#### Tabs

| Decision | Options | Default |
|----------|---------|---------|
| Activation | on click / on focus (arrow key) | on click |
| Overflow behavior | scroll / dropdown / wrap | scroll |
| Keyboard | arrow keys cycle tabs | yes |

### How the Agent Uses This

When building a component that has an interaction spec:

1. **Build the visual component** per taste parameters
2. **Present the interaction decisions** with defaults
3. **Record decisions** in the Figma component description
4. User can override defaults or accept them

```
Agent: "Built the Toast component. Here are the interaction defaults:
        - Position: top-right
        - Auto-dismiss: 5s for info, persistent for errors
        - Max 3 visible, newest on top
        - Close button to dismiss

        These feel right for your product? Or adjust?"
```

The defaults are sensible starting points. Most users will accept them. But the decisions are **explicit and visible**, not buried in implementation later.

## Scope and Limits

### What Whiteboard Does

Whiteboard establishes **visual consistency and direction** — the look & feel of a design system. Given a Taste configuration, every visual property (spacing, radius, shadow, typography, color usage) is deterministically derived.

### What Whiteboard Does NOT Do

Whiteboard does not do information design. It does not decide:
- What data to show on a screen
- Column selection for tables
- KPI priority
- Navigation structure
- User flow logic

These are product decisions that come from outside — PRDs, requirements, domain knowledge.

### Communicate This to the User

When assembling Screens (Phase 5), if the information structure is unclear, say so:

> "I can build this screen's visual treatment, but I'm guessing at the data structure. The columns and KPIs I'm showing are placeholders based on the product context in brand.yaml. You should validate the information design separately."

Placeholder screens are useful for validating visual direction. They are NOT a substitute for information design.

## Two Usage Modes

### Initial (Phases 1–6)

Build a design system from zero. Full flow: Taste → Primitives → Components → Patterns → Screens → Confirm.

Requires: brand.yaml with tokens. Optionally, information design for product screens.

### Ongoing (Post Phase 6)

The design system is confirmed. New features need new screens or components.

```
Input: Feature requirements (what the screen needs to show)
     + Existing Figma design system (confirmed Variables, Components, Patterns)

Flow:
1. Read existing Figma file — discover available components
2. Assemble new screen from existing component instances
3. Identify missing components → build them (Phase 2-4 rules apply)
   - New components inherit confirmed Taste parameters
   - Consistency Audit against existing components
4. User reviews the assembled screen
5. Code generation (via code/web skill)
```

Ongoing mode is where the most day-to-day value is. The initial build happens once. Ongoing happens every sprint.

### Detecting Mode

The agent reads the Figma file state:
- No Variables, no components → Initial (start from Phase 1)
- Variables + confirmed Taste + components → Ongoing (assemble new screens)
- Variables + partial components → Resume Initial (continue from current phase)

## Core Rules

1. **Everything is Variables-bound**. No hardcoded colors, ever.
2. **Taste parameters are the source of truth** for spacing, radius, shadow, typography, surfaces. Don't deviate per-component without explicit user decision.
3. **Compare, don't describe**. When the user needs to decide, show options side by side in Figma. Don't ask them to imagine.
4. **Audit after every layer**. Cross-component consistency is checked programmatically, not by eye.
5. **Trace back, don't patch**. If a screen looks wrong, fix the underlying component or taste parameter, not the screen instance.
6. **The human judges, the agent builds**. Never ask the user to manually adjust in Figma.
7. **Derivation rules are deterministic**. Given a taste configuration, every component parameter has exactly one correct value. No ad-hoc decisions during build.

## Operating Modes

| Mode | Agent Role | When |
|------|-----------|------|
| facilitation | Generate options, user selects | Taste, visual direction |
| execution | Agent builds autonomously | Primitives buildout after taste is locked |

Switch via:
- "Show me options" / "Let me choose" → facilitation
- "Just build it" / "Go ahead" → execution

## Resuming a Session

1. Read the Figma file state (what pages/components exist)
2. Determine which phase is complete
3. Present status summary
4. Continue from current position

## Vocabulary

For agent-human communication, these terms are precise:

| Term | Meaning |
|------|---------|
| Taste | The overall look & feel of the design system, expressed across 10 axes (density, shape, weight, contrast, elevation, typography scale, color temperature, surface distinction, motion, icon style) |
| Primitive | Single component (Atom) |
| Component | Combined primitives (Molecule) |
| Pattern | Page-level building block (Organism) |
| Screen | Full page template |
| Cross-check | Consistency verification across same-level elements |
| Audit | Systematic consistency scan across all elements |
| Trace back | Fix source (taste/primitive) instead of patching symptoms |
| Derivation | Deterministic mapping from taste axis to component parameter |
| Preset | Known product's taste profile (e.g. "like Linear") |
