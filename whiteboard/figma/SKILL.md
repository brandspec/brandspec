# Figma MCP Operation Skill

Practical rules for AI agents writing to Figma via `use_figma` Plugin API. Learned from production use with brandspec design system generation.

Complements the official `figma-use` skill (Plugin API rules). This skill covers **patterns, gotchas, and workflows** specific to design system generation from brand tokens.

## Prerequisites

- Figma MCP server connected (`/mcp` to authenticate if needed)
- `figma-use` skill loaded (mandatory before any `use_figma` call)
- Figma **Design** file (not Make — `figma.com/design/...` URLs only)
- Figma Pro plan or above for meaningful work (Starter = 6 reads/month)

## 1. Color Conversion: oklch → sRGB

Figma colors are sRGB `{r, g, b}` in 0–1 range. brandspec tokens use oklch. The conversion **must include gamma correction** — without it, dark colors are catastrophically wrong.

### Correct Conversion Function

```js
function oklchToSrgb(L, C, H) {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → linear LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // Linear LMS → linear sRGB
  let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // CRITICAL: Linear sRGB → sRGB (gamma correction)
  function gamma(c) {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }

  return { r: gamma(rLin), g: gamma(gLin), b: gamma(bLin) };
}
```

### What Goes Wrong Without Gamma

| oklch | With gamma (correct) | Without gamma (wrong) |
|-------|---------------------|----------------------|
| `(0.15, 0.01, 70)` dark/bg | `#0d0a06` (near black) | `#150f0e` (too light) |
| `(0.97, 0.005, 80)` titanium/50 | `#f6f4f1` (warm white) | `#f8f5f2` (close but off) |
| `(0.65, 0.10, 70)` ember | `#b68346` (rich amber) | `#a67e47` (desaturated) |

Dark colors diverge most. Always verify against the browser's computed color.

## 2. Auto-Layout Sizing (The h=10 Problem)

The most common bug. Pattern: `resize(width, 10)` to set width, expecting height to auto-size. It doesn't.

### The Rule

After creating any auto-layout frame with a fixed width:

```js
const frame = figma.createFrame();
frame.layoutMode = "VERTICAL";
frame.counterAxisSizingMode = "FIXED";  // width = fixed
frame.resize(320, 10);                  // placeholder height
frame.primaryAxisSizingMode = "AUTO";   // ← MUST SET THIS. height = auto.
```

### Axis Mapping

| layoutMode | primaryAxis | counterAxis |
|------------|------------|-------------|
| VERTICAL | height (↕) | width (↔) |
| HORIZONTAL | width (↔) | height (↕) |

So for HORIZONTAL layout with auto height:
```js
frame.layoutMode = "HORIZONTAL";
frame.counterAxisSizingMode = "AUTO";   // ← height = auto
```

### Pre-Flight Check

Before returning from any `use_figma` call that creates frames:
```js
// Audit all created nodes
for (const id of createdNodeIds) {
  const node = figma.getNodeById(id);
  if (node && node.height <= 20 && node.layoutMode !== "NONE") {
    // Almost certainly a sizing bug
    node.primaryAxisSizingMode = "AUTO";
  }
}
```

## 3. Variable-Bound Paints

### Creating a paint bound to a variable

```js
function makePaint(variable, modeId) {
  const val = variable.valuesByMode[modeId];
  // MUST use only {r, g, b} — no 'a' property
  return figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: val.r, g: val.g, b: val.b } },
    "color",
    variable
  );
}

// Usage
node.fills = [makePaint(myVar, modeId)];
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Unrecognized key 'a' in .color` | Color object has alpha | Use `{r, g, b}` only, no `a` |
| `Required value missing at .color.r` | Semantic alias doesn't resolve | Use the primitive variable's raw value for the color, bind to semantic variable |

### Semantic → Primitive Pattern

When binding semantic variables (aliases), you need the resolved primitive value for the color but bind to the semantic variable:

```js
// Semantic "background" aliases to primitive "dark/bg"
const semVar = semanticVars["background"];
const primVar = primitiveVars["dark/bg"];
const val = primVar.valuesByMode[primMode];

const paint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: val.r, g: val.g, b: val.b } },
  "color",
  semVar  // ← bind to semantic, not primitive
);
```

## 4. Component Architecture

### Always Use Instances

When a component needs a child that matches an existing component, use `createInstance()`:

```js
// WRONG: creating a new frame that looks like Avatar
const avatar = figma.createFrame();
avatar.resize(32, 32);
avatar.cornerRadius = 16;
avatar.fills = [makePaint(emberVar, modeId)];

// RIGHT: instantiate the Avatar component
const avatar = avatarComponent.createInstance();
avatar.resize(28, 28);
avatar.layoutSizingHorizontal = "FIXED";
avatar.layoutSizingVertical = "FIXED";
```

Benefits:
- Changes to Avatar propagate everywhere
- Figma tracks the dependency
- Forces you to answer "what IS this component?"

### Component Properties

Expose overridable values as Component Properties:

```js
// On the ComponentSet
const propId = componentSet.addComponentProperty("Label", "TEXT", "Default");

// Link child text node to the property
textNode.componentPropertyReferences = { characters: propId };
```

Instance users can then override `Label` without detaching.

### Fixed-Size Components (Avatar, Icons)

Components that must maintain aspect ratio should NOT use auto-layout:

```js
const avatar = figma.createComponent();
avatar.layoutMode = "NONE";     // ← not auto-layout
avatar.resize(32, 32);
avatar.cornerRadius = 16;

// Center child text with constraints
const txt = figma.createText();
txt.constraints = { horizontal: "CENTER", vertical: "CENTER" };
txt.textAlignHorizontal = "CENTER";
txt.textAlignVertical = "CENTER";
avatar.appendChild(txt);
```

## 5. Variable Collections Architecture

### Two-Collection Pattern for Themed Systems

```
primitives (no modes)
├── titanium/50 ... titanium/900
├── ember/subtle, ember/default, ember/strong
└── dark/bg, dark/card, dark/muted

semantic (modes: Light / Dark, or OSS / SaaS)
├── background  → aliases to primitives
├── foreground  → aliases to primitives
├── card        → aliases to primitives
├── ...
└── ring        → aliases to primitives
```

### Variable Scopes

Always set explicit scopes. `ALL_SCOPES` pollutes the property picker:

```js
// Background colors
variable.scopes = ["FRAME_FILL", "SHAPE_FILL"];

// Text colors
variable.scopes = ["TEXT_FILL"];

// Border/stroke colors
variable.scopes = ["STROKE_COLOR"];

// Spacing
variable.scopes = ["GAP"];
```

## 6. Page Organization

### Standard Page Structure

```
Figma file:
├── Primitives    # Tokens + atom-level components
├── Components    # Molecules (composed from primitives)
├── Patterns      # Organisms (page-level building blocks)
├── Screens       # Full page assemblies (instances only)
└── [Feature]     # Feature-specific pages (Chat, Portal, etc.)
```

### Page Backgrounds

Set on every page to match the design system's base background:

```js
for (const page of figma.root.children) {
  page.backgrounds = [{ type: "SOLID", color: bgColor }];
}
```

Note: `page.backgrounds` doesn't support variable binding. Use raw sRGB values.

### Component Set Backgrounds

Use the background token so components are visible on the page:

```js
componentSet.fills = [makePaint(backgroundVar, modeId)];
```

## 7. Validation Workflow

### After Every `use_figma` Call

1. Return all created/mutated node IDs
2. Check for h<=20 anomalies in the return data
3. If creating multiple components, `get_screenshot` after each batch

### After Every Page of Components

```
Checklist:
- [ ] All colors are variable-bound (no hardcoded RGB)
- [ ] All auto-layout frames have correct sizing modes
- [ ] Component sets have consistent background fills
- [ ] Page background is set
- [ ] Instances used (not frame copies) for sub-components
- [ ] Component Properties defined for overridable text
- [ ] Fixed-size elements (avatars, icons) use layoutMode="NONE"
```

### Spot-Check with `get_screenshot`

Don't trust node dimensions alone. Screenshot catches:
- Text overflow / clipping
- Color contrast issues
- Misaligned elements
- Background inconsistencies between components

## 8. Screen Assembly Pattern

### Collecting Components Across Pages

```js
const comps = {};
for (const page of figma.root.children) {
  if (page.name === "Screens") continue;
  await figma.setCurrentPageAsync(page);
  for (const node of page.children) {
    if (node.type === "COMPONENT") comps[node.name] = node;
    if (node.type === "COMPONENT_SET") {
      for (const child of node.children) {
        if (child.type === "COMPONENT")
          comps[`${node.name}/${child.name}`] = child;
      }
    }
  }
}
await figma.setCurrentPageAsync(screensPage);
```

### Screen Frame

```js
const screen = figma.createFrame();
screen.name = "Screen: Dashboard";
screen.resize(1280, 800);           // standard desktop
screen.layoutMode = "HORIZONTAL";   // sidebar + main
screen.primaryAxisSizingMode = "FIXED";
screen.counterAxisSizingMode = "FIXED";
screen.fills = [{ type: "SOLID", color: bgColor }];
screen.clipsContent = true;         // hide overflow
```

### Instance Placement

```js
// Sidebar: fixed width, fill height
const sidebar = comps["DashboardSidebar"].createInstance();
screen.appendChild(sidebar);
sidebar.layoutSizingVertical = "FILL";

// Main: fill remaining width
const main = figma.createFrame();
main.layoutMode = "VERTICAL";
// ... padding, spacing
screen.appendChild(main);
main.layoutSizingHorizontal = "FILL";
main.layoutSizingVertical = "FILL";

// Content instances inside main
const header = comps["PageHeader"].createInstance();
main.appendChild(header);
header.layoutSizingHorizontal = "FILL";
```

### Positioning Multiple Screens

```js
// Stack screens vertically with gaps
const existing = screensPage.children.filter(n => n !== newScreen);
let maxY = 0;
for (const n of existing) maxY = Math.max(maxY, n.y + n.height);
newScreen.x = 100;
newScreen.y = maxY + 80;
```

## 9. Component Variants (ComponentSet)

### Creating Variants

```js
const primary = figma.createComponent();
primary.name = "Variant=Primary";
// ... build primary

const secondary = figma.createComponent();
secondary.name = "Variant=Secondary";
// ... build secondary

const set = figma.combineAsVariants([primary, secondary], figma.currentPage);
set.name = "Button";
set.layoutMode = "HORIZONTAL";
set.itemSpacing = 16;
set.paddingTop = 16; set.paddingBottom = 16;
set.paddingLeft = 16; set.paddingRight = 16;
set.primaryAxisSizingMode = "AUTO";
set.counterAxisSizingMode = "AUTO";
set.fills = [makePaint(backgroundVar, modeId)];
```

### Naming Convention

Variant names use `Property=Value` format: `Variant=Primary`, `State=Default`, `Size=Small`.

### Instantiating a Specific Variant

```js
// Access variant from set
const variant = comps["Button/Variant=Primary"];
const instance = variant.createInstance();
```

## 10. Text Styles

```js
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

const style = figma.createTextStyle();
style.name = "brandspec/Heading";
style.description = "Section heading";
style.fontName = { family: "Inter", style: "Semi Bold" };
style.fontSize = 24;
style.letterSpacing = { unit: "PERCENT", value: -2 };  // -0.02em = -2%
// For uppercase labels:
style.textCase = "UPPER";
```

Note: `letterSpacing` and `lineHeight` require `{unit, value}` objects, not bare numbers.

## 11. Moving Components Between Pages

```js
const sourcePage = figma.root.children.find(p => p.name === "Primitives");
const targetPage = figma.root.children.find(p => p.name === "Dashboard");

await figma.setCurrentPageAsync(sourcePage);
const node = sourcePage.children.find(n => n.name === "PageHeader");

const clone = node.clone();
targetPage.appendChild(clone);
node.remove();
```

Instances referencing the moved component update automatically.

## 12. MCP Connection

### Initial Setup

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

### Authentication

After adding, authenticate with `/mcp` command in Claude Code. Browser OAuth flow opens. Does not open automatically on restart.

### File URL Parsing

```
https://figma.com/design/:fileKey/:fileName?node-id=:nodeId
                         ^^^^^^^^                   ^^^^^
                         use as fileKey              convert - to : for nodeId
```

**Make files (`figma.com/make/...`) are not supported** by `use_figma` or `get_metadata`. Create a Design file instead.

### Rate Limits

| Plan | Read tools (get_metadata, get_screenshot) | Write tools (use_figma) |
|------|------------------------------------------|------------------------|
| Starter (free) | 6/month | Exempt from limits |
| Pro ($15/mo) | 200/day | Exempt from limits |

`use_figma` is always exempt. Budget your reads.
