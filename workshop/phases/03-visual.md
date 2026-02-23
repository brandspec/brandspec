# Phase 3: Visual Identity

## Goal

Define the visual language: colors, typography, and logo direction.

**Spec reference:** Read `../../schema/spec/tokens.md` for token format, color system, and naming conventions. Read `../../schema/spec/assets.md` for logo system patterns and asset structure.

## Steps

### 3.1 Mood

**Questions to answer:**

- What's the visual feeling we're going for?
- What existing brands/designs inspire us?
- What visual territory should we own?

**Facilitation approach:**

Describe visual directions based on personality:

```
Based on your personality (approachable, confident, modern, playful),
here are visual directions:

a) Clean & Minimal - Lots of white space, subtle colors, geometric
b) Warm & Friendly - Rounded shapes, warm palette, illustrations
c) Bold & Dynamic - Strong colors, sharp contrasts, movement

Which direction appeals?
```

**Output: Mood Direction**

```yaml
# Example
mood:
  direction: "Clean & Minimal with warm touches"
  references:
    - "Linear (the app)"
    - "Notion"
    - "Stripe"
  characteristics:
    - "Generous white space"
    - "Subtle, purposeful color"
    - "Modern but not cold"
```

---

### 3.2 Colors

**Spec reference:** See `../../schema/spec/tokens.md` §Colors for the complete color specification including variant naming, required/recommended tokens, dark mode, and palette generation guidelines.

**Subsection overview:**

| Item | Classification | Notes |
|------|---------------|-------|
| primary + foreground, secondary + foreground | Required | Minimum brand colors |
| background / foreground / muted | Required | UI surfaces |
| destructive | Required | Error states |
| success / warning / info | Recommended | AI generates defaults from primary hue, user adjusts |
| dark mode | Optional | Ask explicitly: "Does your product need dark mode?" |
| brand-scale 50–900 | Optional | Advanced use only |
| $extensions.compat | Optional | Only when legacy tool support is needed |

#### Progressive shortcut (recommended flow)

The full color system can feel overwhelming. Use this progressive approach:

1. **User decides**: primary color direction (from personality/mood)
2. **User decides**: secondary/accent color
3. **AI generates**: all remaining colors (surfaces, semantics, destructive) using the palette generation guidelines in spec/tokens.md
4. **User confirms**: "Does this palette feel right?" — adjust any that don't work

This keeps user decisions to 2-3 choices while producing a complete, harmonious palette.

```
Facilitation shortcut:

AI: "You chose teal as your primary. Here's the complete palette
     I've derived from it:

     Brand:    primary oklch(0.65 0.15 190) / secondary oklch(0.70 0.10 100)
     Surfaces: background, foreground, muted (neutral with teal undertone)
     Status:   success (green), warning (amber), info (blue), destructive (red)

     [Shows full palette]

     This all works together. Want to adjust anything, or shall we move on?"
```

#### Full control path

For users who want to define each color individually, walk through the token categories defined in spec/tokens.md (required → recommended → optional).

**Color psychology reference:**

| Color | Associations |
|-------|-------------|
| Blue | Trust, stability, technology |
| Green | Growth, nature, health |
| Purple | Creativity, luxury, wisdom |
| Orange | Energy, warmth, friendliness |
| Red | Passion, urgency, power |
| Yellow | Optimism, clarity, warmth |

**Facilitation approach:**

```
Given your personality (modern, approachable), consider:

a) Blue-based: Trust + professionalism
   Primary: oklch(0.65 0.18 250)

b) Teal-based: Modern + fresh
   Primary: oklch(0.65 0.15 190)

c) Purple-based: Creative + premium
   Primary: oklch(0.60 0.20 300)

Which family feels right?
```

#### Dark mode [Optional — ask explicitly]

```
Does your product need dark mode?

a) Yes — let's define dark variants for your core colors
b) No — skip for now (can be added later)
c) Not sure — let's skip it and revisit when needed
```

If yes, generate `$extensions.dark` values as specified in spec/tokens.md §Dark Mode.

---

### 3.3 Typography

**Spec reference:** See `../../schema/spec/tokens.md` §Typography for token format and font pairing strategies.

**Questions to answer:**

- What font for headings?
- What font for body text?
- What about code/monospace?

**Facilitation approach:**

```
Typography options:

a) Modern & Clean
   Heading: Inter (bold)
   Body: Inter (regular)

b) Distinctive Headlines
   Heading: Space Grotesk
   Body: Inter

c) Editorial Feel
   Heading: Fraunces (serif)
   Body: Inter

Which direction?
```

---

### 3.4 Logo System

**Spec reference:** See `../../schema/spec/assets.md` §Logo System Patterns for pattern definitions, required assets per pattern, and recommended variants.

**Note:** This step produces a **logo system brief** — the pattern, required assets, and usage guidance. Actual logo creation may be done externally.

**Facilitation approach:**

Present patterns based on brand personality and practical needs:

```
Your brand identity so far:
- Name: [from Phase 2]
- Personality: [from Phase 2]
- Mood: [from 3.1]

Logo system patterns:

a) Wordmark
   Your name as the identity. Clean, typographic.
   Simplest to manage.

b) Symbol + Wordmark
   A mark that can stand on its own + your name.
   Most flexible. Best if you need an app icon.

c) Combination Mark
   An integrated logo — symbol and name as one unit.
   Consistent, easier to manage than (b).

d) Emblem
   Name enclosed in a shape. Heritage, authority feel.

Which pattern fits your brand?
```

After pattern selection, confirm the asset checklist from spec/assets.md:

```
You chose: Symbol + Wordmark

Assets you'll need:
  ✓ symbol (primary, inverse, monochrome)
  ✓ wordmark (primary, inverse, monochrome)
  ○ logo-horizontal (recommended, combined layout)
  ○ logo-vertical (recommended, combined layout)

Plus for digital use:
  ✓ favicon derived from symbol
  ○ app icon (if applicable)
  ○ OG image for social sharing

Shall I record this, or adjust anything?
```

Then explore the visual concept:

**Output: Logo System Brief**

```yaml
logo:
  pattern: "symbol_wordmark"
  concept: "Abstract prism shape suggesting clarity and multiple perspectives"
  required_assets:
    - role: symbol
      variants: [primary, inverse, monochrome]
    - role: wordmark
      variants: [primary, inverse, monochrome]
  optional_assets:
    - role: logo
      variants: [horizontal, vertical]
    - role: favicon
      note: "Derived from symbol"
  requirements:
    - "Symbol works at 16px (favicon)"
    - "Single color version for sponsorship contexts"
```

---

## Phase Complete Checklist

- [ ] Visual mood/direction defined
- [ ] Color palette complete (all required tokens from spec/tokens.md)
- [ ] Typography selected (heading, body, optionally mono)
- [ ] Logo system pattern selected
- [ ] Required and optional assets identified
- [ ] Logo concept/brief documented
- [ ] All recorded in `decisions.yml`

## Transition to Phase 4

When all items are checked:

```yaml
# Update position.yml
phase: 4
step: "defaults"
mode: "facilitation"
```
