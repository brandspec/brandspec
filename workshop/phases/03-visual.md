# Phase 3: Visual Identity

## Goal

Define the visual language: colors, typography, and logo direction.

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

**Subsection overview:**

| Item | Classification | Notes |
|------|---------------|-------|
| primary + foreground, secondary + foreground | Required | Minimum brand colors |
| background / foreground / muted | Required | UI surfaces |
| destructive | Required | Error states |
| success / warning / info (3.2.1) | Recommended | AI generates defaults from primary hue, user adjusts |
| dark mode (3.2.4) | Optional | Ask explicitly: "Does your product need dark mode?" |
| brand-scale 50–900 (3.2.5) | Optional | Advanced use only |
| $extensions.compat (3.2.3) | Optional | Only when legacy tool support is needed |

#### Progressive shortcut (recommended flow)

The full color system can feel overwhelming. Use this progressive approach:

1. **User decides**: primary color direction (from personality/mood)
2. **User decides**: secondary/accent color
3. **AI generates**: all remaining colors (surfaces, semantics, destructive) derived from the chosen primary hue
4. **User confirms**: "Does this palette feel right?" — adjust any that don't work

This keeps user decisions to 2-3 choices while producing a complete, harmonious palette. The subsections below (3.2.1–3.2.5) provide detail for when users want fine-grained control.

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

For users who want to define each color individually, walk through the subsections below.

**Questions to answer:**

- What's the primary brand color?
- What secondary/accent colors?
- What about neutrals?
- Dark mode considerations?

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

**Output: Color Palette**

```yaml
# Example (oklch format for wide gamut)
tokens:
  colors:
    primary:
      $value: "oklch(0.65 0.18 250)"
      $description: "Main brand color"
    primary-foreground:
      $value: "oklch(0.98 0.01 250)"
    secondary:
      $value: "oklch(0.75 0.12 150)"
    secondary-foreground:
      $value: "oklch(0.20 0.02 150)"
    background:
      $value: "oklch(0.99 0.005 250)"
    foreground:
      $value: "oklch(0.15 0.02 250)"
    muted:
      $value: "oklch(0.95 0.01 250)"
    muted-foreground:
      $value: "oklch(0.45 0.02 250)"
```

#### 3.2.1 Semantic Colors [Recommended]

After defining brand colors, define **semantic status colors** for UI feedback. AI generates defaults from the primary hue; the user adjusts as needed.

**Facilitation approach:**

```
Your brand palette is set. Based on your primary color, here are
semantic colors I've generated:

  success:  oklch(0.65 0.18 145) — green family
  warning:  oklch(0.75 0.15 85)  — amber family
  info:     oklch(0.65 0.12 230) — blue family

These are conventional associations that harmonize with your palette.
Keep these defaults, or adjust any of them?
```

**Output: Semantic Colors**

```yaml
tokens:
  colors:
    success:
      $value: "oklch(0.65 0.18 145)"
      $type: color
      $description: "Positive actions and confirmations"
    success-foreground:
      $value: "oklch(0.98 0.01 145)"
      $type: color
    success-muted:
      $value: "oklch(0.92 0.05 145)"
      $type: color
    warning:
      $value: "oklch(0.75 0.15 85)"
      $type: color
      $description: "Caution states and non-blocking alerts"
    warning-foreground:
      $value: "oklch(0.25 0.05 85)"
      $type: color
    warning-muted:
      $value: "oklch(0.92 0.05 85)"
      $type: color
    info:
      $value: "oklch(0.65 0.12 230)"
      $type: color
      $description: "Informational messages and tips"
    info-foreground:
      $value: "oklch(0.98 0.01 230)"
      $type: color
    info-muted:
      $value: "oklch(0.92 0.04 230)"
      $type: color
```

#### 3.2.2 Variant Pattern [Required]

Every color token SHOULD have at least a `-foreground` variant. For colors used as backgrounds, add `-muted` for subtle/toned-down usage:

| Suffix | Purpose | When to Define |
|--------|---------|----------------|
| *(none)* | Base color (used as background) | Always |
| `-foreground` | Text/icon on that background | Always |
| `-muted` | Subtle background variant | Optional, for semantic and brand colors |

Ensure contrast ratios meet WCAG AA (4.5:1 for normal text) between base and `-foreground` pairs.

#### 3.2.3 Color Format Policy [Optional — legacy support only]

All color values SHOULD use **oklch** as the canonical format:

- oklch is perceptually uniform, wide gamut, and natively supported in CSS
- When tools need hsl or hex, add `$extensions.compat`:

```yaml
primary:
  $value: "oklch(0.65 0.18 250)"
  $type: color
  $extensions:
    compat:
      hsl: "hsl(220 70% 50%)"
      hex: "#3b82f6"
```

**Facilitation tip:** Always define oklch first, then generate compat values as needed.

#### 3.2.4 Dark Mode [Optional — ask explicitly]

Dark mode is an explicit decision point. Always ask the user directly.

**Facilitation approach:**

```
Does your product need dark mode?

a) Yes — let's define dark variants for your core colors
b) No — skip for now (can be added later)
c) Not sure — let's skip it and revisit when needed

If yes, I'll generate dark variants for your core surface and brand colors:

- background / foreground (inverted)
- primary (may need lightness adjustment for dark surfaces)
- muted (adjusted for dark context)

I'll generate dark variants that maintain your brand feel and
contrast ratios.
```

**Output: Dark Mode Extensions**

```yaml
tokens:
  colors:
    background:
      $value: "oklch(0.99 0.005 250)"
      $type: color
      $extensions:
        dark: "oklch(0.15 0.02 250)"
    foreground:
      $value: "oklch(0.15 0.02 250)"
      $type: color
      $extensions:
        dark: "oklch(0.95 0.01 250)"
    primary:
      $value: "oklch(0.65 0.18 250)"
      $type: color
      $extensions:
        dark: "oklch(0.70 0.16 250)"
```

#### 3.2.5 Brand Extensions [Optional — advanced]

For brands that need detailed color scales (50–900) or product-specific sub-palettes, use the `extensions` section:

**Facilitation approach:**

```
Some brands benefit from an extended color scale (50–900 steps)
for fine-grained UI control. This goes in the `extensions` section
of your brandspec.

Would you like me to generate a full primary scale from your
chosen brand color?
```

This is optional — most brands only need the standard token set.

---

### 3.3 Typography

**Questions to answer:**

- What font for headings?
- What font for body text?
- What about code/monospace?

**Font pairing strategies:**

1. **Same family** - Inter for both (simple, consistent)
2. **Contrast** - Serif headings + Sans body (editorial)
3. **Weight contrast** - Same font, different weights

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

**Output: Typography**

```yaml
# Example
tokens:
  typography:
    heading:
      $value: "Inter, system-ui, sans-serif"
      $type: fontFamily
    body:
      $value: "Inter, system-ui, sans-serif"  
      $type: fontFamily
    mono:
      $value: "JetBrains Mono, monospace"
      $type: fontFamily
```

---

### 3.4 Logo

**Questions to answer:**

- What style of logo? (wordmark, symbol, combination)
- What visual metaphor or concept?
- What are the constraints?

**Note:** This step produces a **logo brief**, not the actual logo. Logo creation may be done externally or as a separate exercise.

**Logo types:**

| Type | Example | Best for |
|------|---------|----------|
| Wordmark | Google, Coca-Cola | Strong names |
| Symbol | Apple, Nike | Global brands |
| Combination | Adidas, Slack | Flexibility |
| Lettermark | IBM, HBO | Long names |
| Emblem | Starbucks, NFL | Heritage feel |

**Facilitation approach:**

```
Logo direction options:

a) Wordmark only
   Clean typography, maybe custom letterform
   
b) Symbol + Wordmark
   Abstract mark that works alone
   
c) Lettermark
   First letter or initials, stylized

Given your name and personality, which approach?
```

**Output: Logo Brief**

```yaml
# Example
logo:
  type: "symbol + wordmark"
  concept: "Abstract prism/facet shape suggesting clarity and multiple perspectives"
  requirements:
    - "Works at small sizes (favicon)"
    - "Single color version needed"
    - "Should feel modern but not trendy"
  notes: "Consider how it animates for loading states"
```

---

## Phase Complete Checklist

- [ ] Visual mood/direction defined
- [ ] Color palette complete (primary, secondary, neutrals)
- [ ] Typography selected (heading, body, mono)
- [ ] Logo brief documented
- [ ] All recorded in `decisions.yml`

## Transition to Phase 4

When all items are checked:

```yaml
# Update position.yml
phase: 4
step: "yaml"
mode: "execution"  # Usually execution for documentation
```

## Example Session

```
AI: Let's define colors. Based on your personality (modern, 
    approachable, playful), I suggest these directions:
    
    a) Blue family - trustworthy, tech-forward
       [shows color chips]
       
    b) Teal family - fresh, modern, stands out
       [shows color chips]
       
    c) Coral/warm family - friendly, approachable
       [shows color chips]

User: I like b, the teal feels distinctive

AI: Great. Let me build out the full palette:
    
    Primary: oklch(0.65 0.15 190) - Main teal
    Secondary: oklch(0.70 0.10 100) - Warm accent
    
    For backgrounds and text, I'll create matching neutrals
    with a hint of teal to keep it cohesive.
    
    [Generates full palette]
    
    Does this feel right? Want to adjust any colors?
```
