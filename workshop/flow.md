# Workshop Flow

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         brandspec workshop                               │
├─────────────┬─────────────┬─────────────────┬────────────────────────────┤
│  Phase 1    │  Phase 2    │    Phase 3      │      Phase 4               │
│  Discovery  │  Concept    │ Visual Identity │   Documentation            │
├─────────────┼─────────────┼─────────────────┼────────────────────────────┤
│ • product   │ • personality│ • mood         │ • spacing/radius confirm   │
│ • users     │ • voice     │ • colors        │ • asset registration       │
│ • context   │ • naming    │ • typography    │ • export format selection   │
│             │ • tagline   │ • logo          │ • yaml generation          │
│             │             │                 │ • dist generation          │
└─────────────┴─────────────┴─────────────────┴────────────────────────────┘
```

## Output

Workshop populates the `brandspec/` directory created by `brandspec init`:

```
brandspec/
├── brand.yaml              # source of truth
├── assets/                     # brand assets
├── out/                       # generated from yaml
│   ├── tokens.css
│   ├── theme.css
│   └── figma-tokens.json
└── _workshop/                  # process records
    ├── decisions.yml
    ├── memo.md
    └── session.md
```

## [Phase 1: Discovery](phases/01-discovery.md)

**Goal**: Understand what we're branding

### Steps

1. **product** - What is the product? What problem does it solve?
2. **users** - Who are the users? What do they need?
3. **context** - Market position, competitors, constraints

### Outputs

- Product essence statement
- User personas (brief)
- Competitive insights

### Complete When

- [ ] Product can be explained in one sentence
- [ ] Target user is clearly defined
- [ ] Market position is understood

---

## [Phase 2: Concept](phases/02-concept.md)

**Goal**: Define brand personality and voice

### Steps

1. **personality** - Brand personality traits (3-5 adjectives)
2. **voice** - Tone, principles, examples
3. **naming** - Brand name (if not decided)
4. **tagline** - Tagline or slogan

### Outputs

- Personality traits
- Voice & tone guidelines
- Name (confirmed)
- Tagline options → final selection

### Complete When

- [ ] Personality traits selected
- [ ] Voice principles documented
- [ ] Name confirmed
- [ ] Tagline selected

---

## [Phase 3: Visual Identity](phases/03-visual.md)

**Goal**: Create visual language

### Steps

1. **mood** - Visual direction, references, mood
2. **colors** - Color palette (primary, secondary, etc.)
3. **typography** - Font selection
4. **logo** - Logo direction/concept

### Outputs

- Mood references
- Color palette (oklch values)
- Typography selection
- Logo brief (actual logo creation may be external)

### Complete When

- [ ] Color palette finalized
- [ ] Typography selected
- [ ] Logo direction documented

---

## [Phase 4: Documentation](phases/04-documentation.md)

**Goal**: Generate final deliverables into brandspec repository

### Steps

1. **spacing-radius** - Confirm spacing/radius defaults or customize
2. **assets** - Register existing assets or note next actions
3. **export-selection** - Choose export formats (css, tailwind, html, etc.)
4. **yaml** - Generate `brand.yaml`
5. **dist** - Generate selected exports into `out/`

### Outputs

- `brand.yaml` - Machine-readable spec (repository root)
- `out/tokens.css` - CSS variables
- `out/brand.md` - Human-readable document
- `out/brand.html` - Visual preview (if selected)
- `out/tailwind.config.ts` - Tailwind config (if selected)

### Complete When

- [ ] `brand.yaml` generated and valid
- [ ] Selected dist files generated
- [ ] User has reviewed and approved

---

## State Transitions

```
Discovery ──[all steps complete]──> Concept
Concept   ──[all steps complete]──> Visual Identity
Visual    ──[all steps complete]──> Documentation
Documentation ──[approved]──────> COMPLETE
```

### Backtracking Rules

Going back to a previous phase is allowed. When backtracking:

1. Increment `revision` in `position.yml` by 1
2. New decisions MUST include `supersedes` referencing the previous decision ID
3. When generating YAML in Phase 4, use only the latest (non-superseded) decisions
4. Superseded decisions remain in `decisions.yml` (append-only is preserved)

## Operating Modes

### Facilitation Mode (Default)

AI presents options, user decides.

```
AI: "Here are 3 personality directions:
     a) Professional & Trustworthy
     b) Playful & Approachable  
     c) Bold & Innovative
     Which resonates?"

User: "b"

AI: [Records decision, moves forward]
```

### Execution Mode

AI makes decisions autonomously.

```
User: "Just create a brand for a productivity app"

AI: [Runs through all phases]
    [Presents complete brandspec for review]
```

Switch with: "Let me decide" / "You decide"
