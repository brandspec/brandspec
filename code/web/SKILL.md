# Figma to Code

Translate a confirmed Figma design system into production React components with Tailwind CSS and Radix UI primitives.

Input: Figma file produced by the Design System Forge skill (confirmed taste, variables, primitives through screens).
Output: Working component library that matches the Figma source 1:1.

## Prerequisites

- Figma design system file (confirmed — Phase 6 of figma-design)
- `figma-operation` skill loaded for reading Figma state
- React project with Tailwind CSS configured
- Radix UI packages installed as needed

## Deliverables

```
src/
├── styles/
│   └── tokens.css              # CSS custom properties from Figma Variables
├── components/
│   ├── primitives/             # Atoms: Button, Input, Badge, etc.
│   ├── components/             # Molecules: FormField, SearchBar, etc.
│   └── patterns/               # Organisms: DataTable, Sidebar, etc.
└── tailwind.config.ts          # Token-aware Tailwind config (if extending)
```

## Flow

```
Read Figma → Extract Tokens → Generate CSS → Build Primitives → Build Components → Build Patterns → Verify
```

## Phase 1: Token Extraction

### Read Figma Variables

Use `get_variable_defs` or `use_figma` to extract all variable collections:

```
Figma Variables          →  CSS Custom Properties
─────────────────────────────────────────────────
primitives/titanium/50   →  --color-titanium-50: #f6f4f1;
semantic/background      →  --background: var(--color-titanium-50);
semantic/foreground      →  --foreground: var(--color-titanium-900);
```

### Generate tokens.css

```css
@layer base {
  :root {
    /* Primitives */
    --color-titanium-50: oklch(0.97 0.005 80);
    --color-titanium-100: oklch(0.93 0.008 80);
    /* ... */
    --color-ember: oklch(0.65 0.10 70);

    /* Semantic */
    --background: var(--color-titanium-50);
    --foreground: var(--color-titanium-900);
    --card: var(--color-titanium-50);
    --card-foreground: var(--color-titanium-900);
    --primary: var(--color-titanium-900);
    --primary-foreground: var(--color-titanium-50);
    /* ... */

    /* Taste-derived */
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --spacing-sm: 6px;
    --spacing-md: 10px;
    --spacing-lg: 16px;
  }

  .dark {
    --background: var(--color-dark-bg);
    --foreground: var(--color-titanium-100);
    /* ... */
  }
}
```

### Source of Truth

Figma Variables are authoritative. If the Figma process refined a token value (Phase 7 of figma-design), that refined value is what goes into CSS. Don't read brand.yaml directly — read the Figma file.

Exception: if brand.yaml was already updated in the figma-design Handoff phase, either source is fine.

## Phase 2: Primitives

### Decision: shadcn or Custom

For each Figma Primitive, decide the implementation strategy:

| Figma Primitive | Radix Primitive Exists? | Strategy |
|-----------------|------------------------|----------|
| Button | No (native button) | Custom + Tailwind |
| Input | No (native input) | Custom + Tailwind |
| Dialog | Yes: `@radix-ui/react-dialog` | Radix + Tailwind |
| Toast | Yes: `@radix-ui/react-toast` | Radix + Tailwind |
| Dropdown Menu | Yes: `@radix-ui/react-dropdown-menu` | Radix + Tailwind |
| Select | Yes: `@radix-ui/react-select` | Radix + Tailwind |
| Tooltip | Yes: `@radix-ui/react-tooltip` | Radix + Tailwind |
| Tabs | Yes: `@radix-ui/react-tabs` | Radix + Tailwind |
| Switch | Yes: `@radix-ui/react-switch` | Radix + Tailwind |
| Badge | No | Custom + Tailwind |
| Avatar | No (or `@radix-ui/react-avatar`) | Custom or Radix |
| Separator | No | Custom (single div) |
| Skeleton | No | Custom + Tailwind animation |

### Mapping Figma to Code

For each Figma component, extract:

1. **Variants** → React props
2. **Taste values** → Tailwind classes
3. **Variable bindings** → CSS custom properties
4. **Component Properties** → React props (text, boolean, slots)

```
Figma: Button (Variant=Primary, Variant=Secondary, Variant=Ghost, Variant=Destructive)

→ React:
  type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"

  interface ButtonProps {
    variant?: ButtonVariant
    size?: "sm" | "md" | "lg"
    children: React.ReactNode
  }
```

### Figma Taste → Tailwind Classes

```
Figma                          →  Tailwind
──────────────────────────────────────────────
padding: 10px 20px             →  px-5 py-2.5
border-radius: 6px             →  rounded-md  (or rounded-[var(--radius-md)])
font: Inter Medium 14px        →  font-medium text-sm
fill: semantic/primary         →  bg-primary
text: semantic/primary-fg      →  text-primary-foreground
border: semantic/secondary 1px →  border border-secondary
```

### Component Template

```tsx
// components/primitives/button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  // Base: from Figma component's shared properties
  "inline-flex items-center justify-center font-medium text-sm rounded-[var(--radius-md)] transition-colors",
  {
    variants: {
      variant: {
        // Each from Figma's variant
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground border border-secondary",
        ghost: "text-muted-foreground hover:bg-accent",
        destructive: "bg-destructive text-white",
      },
      size: {
        // From Figma's size variants (derived from Taste density)
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props} />
  )
}
```

### Radix Component Template

For components that need Radix behavior:

```tsx
// components/primitives/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"

// Figma: Dialog component → overlay + content card
// Radix slots: Root, Trigger, Portal, Overlay, Content, Title, Description, Close

export function Dialog({ children, ...props }) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
}

export function DialogContent({ children, className, ...props }) {
  return (
    <DialogPrimitive.Portal>
      {/* Overlay: from Figma's overlay opacity/color */}
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />

      {/* Content: from Figma's Dialog component properties */}
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[420px] rounded-[var(--radius-lg)] bg-card p-6",
          "shadow-lg",
          // Animation from Taste motion axis
          "animate-in fade-in duration-200",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
export const DialogClose = DialogPrimitive.Close
```

### Interaction Annotations

The Figma design system includes interaction annotations (from figma-design skill). Map them to implementation:

| Figma Annotation | Implementation |
|-----------------|----------------|
| "Portal rendering" | Radix's built-in Portal |
| "Focus trap" | Radix's built-in focus management |
| "Escape to close" | Radix's `onEscapeKeyDown` |
| "Outside click to close" | Radix's `onPointerDownOutside` |
| "Swipe to dismiss" | Radix Toast's built-in swipe |
| "Keyboard navigation" | Radix's built-in arrow key handling |
| "Auto-dismiss after duration" | Radix Toast's `duration` prop |

These are NOT custom code — Radix handles them. The annotation tells you which Radix primitive to use.

## Phase 3: Components (Molecules)

Compose primitives into higher-level components. Each Figma Component maps to a React component that imports and combines Primitives.

```tsx
// components/components/form-field.tsx
// Figma: FormField = Label + Input + HelperText

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode  // Input, Select, Textarea, etc.
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-sm)]">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
```

### Key Rule

Components MUST import Primitives, not re-implement them. Same principle as Figma instances:

```tsx
// WRONG: re-implementing button styles
<button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md">
  Submit
</button>

// RIGHT: using the Primitive
<Button variant="primary">Submit</Button>
```

## Phase 4: Patterns (Organisms)

Compose components into page-level building blocks.

```tsx
// components/patterns/sidebar.tsx
// Figma: Sidebar = NavItem groups + Dividers + UserMenu

export function Sidebar({ items, user }) {
  return (
    <aside className="w-60 border-r bg-card flex flex-col">
      <nav className="flex-1 p-3 space-y-1">
        {items.map(item => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <Separator />
      <UserMenu user={user} />
    </aside>
  )
}
```

## Phase 5: Verification

### Visual Comparison

For each component, compare Figma screenshot against rendered component:

1. Capture Figma component via `get_screenshot`
2. Render React component in isolation (dev server or test)
3. Compare visually — spacing, colors, typography, radius

### Checklist

```
Per component:
- [ ] All variants match Figma variants
- [ ] Colors use CSS custom properties (not hardcoded)
- [ ] Spacing matches Taste density parameters
- [ ] Radius matches Taste shape parameters
- [ ] Typography matches Taste scale parameters
- [ ] Radix primitive used where applicable (not custom interaction code)
- [ ] Component props match Figma Component Properties
- [ ] Hover/focus/disabled states implemented
```

### Cross-Component Consistency

Same checks as Figma audit, now in code:
- Button sm height = Input sm height = Select sm height
- All padding values trace to Taste density
- All radius values trace to Taste shape
- No orphaned utility classes that bypass tokens

## Implementation Order

```
1. tokens.css                    — foundation
2. Tailwind config               — if extending
3. Primitives (Layer 1)          — Button, Badge, Avatar, Separator
4. Primitives (Layer 2)          — Input, Textarea, Select
5. Primitives (Layer 3)          — Card, Dialog, Toast, Tooltip
6. Components                    — FormField, SearchBar, NavItem
7. Patterns                      — Sidebar, DataTable, Header
8. Verification pass             — visual comparison against Figma
```

This mirrors the Figma build order. Each layer depends on the previous.

## Adapting to Other Stacks

This skill assumes React + Tailwind + Radix. For other stacks:

| Layer | Alternative |
|-------|------------|
| Tailwind | CSS Modules — use tokens.css directly, write classes manually |
| Tailwind | vanilla-extract — type-safe tokens, similar mapping |
| Radix | Headless UI (Vue/React) — same concept, different API |
| Radix | Ark UI (framework-agnostic) — Radix-like, works with Solid/Vue |
| React | Vue — Radix Vue exists, Tailwind is framework-agnostic |
| React | Svelte — Melt UI (Svelte headless), Tailwind works |

The core pattern is the same: **Figma Variables → CSS tokens, Figma structure → component tree, behavior from headless library**.

## Core Rules

1. **Figma is the source of truth for visual properties**. Don't improvise colors, spacing, or typography.
2. **CSS custom properties for all tokens**. Components reference variables, not literal values.
3. **Radix for behavior, Tailwind for style**. Never hand-code focus traps, keyboard nav, or portal rendering.
4. **Primitives are imported, not copied**. Same principle as Figma instances. If Button exists, use Button.
5. **Taste parameters are deterministic**. A density=compact component has exactly one correct padding value. Don't eyeball it.
6. **Verify against Figma**. The implementation is correct when it matches the Figma screenshot, not when it "looks good enough".
