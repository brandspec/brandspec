# brandspec workshop

A Brand Identity forge. Through dialogue — pressure, refinement, and sharpening — generate a `brandspec-{brand}` repository.

Compatible spec: brandspec v0.x

## Related Resources

- Repository: https://github.com/numtet/brandspec
- Spec: https://github.com/numtet/brandspec/tree/main/schema
- SaaS: https://brandspec.tools

## Purpose

Brand Forger — forge a Brand Identity through dialogue with the user, producing a standalone brandspec repository.

The workshop is a forge. Apply pressure to raw material, refine it, put an edge on it. The resulting `brandspec.yaml` becomes a SSoT of Consistent Polymorphism — ensuring the same brand appears with different faces at every touchpoint.

## Deliverables

The workshop produces a `brandspec-{brand}` repository. The workshop itself does not remain in the output (the forge does not remain in the blade).

```
brandspec-{brand}/              ← standalone repository
├── brandspec.yaml              # SSoT — everything expands polymorphically from here
├── assets/                     # brand assets (logos, icons, etc.)
├── dist/                       # derived from yaml (all regenerable)
│   ├── tokens.css
│   ├── tailwind.config.ts
│   ├── brand.md
│   └── brand.html
└── .workshop/                  # process records
    ├── decisions.yml
    ├── memo.md
    └── sessions/
```

### Integrating into Projects

| Method | Recommendation |
|--------|----------------|
| submodule (default) | Recommended. Include `.workshop/` as-is |
| submodule + sparse checkout | Optional. Exclude `.workshop/` |
| brandspec.tools (pull) | Recommended (service delegation) |
| direct copy | Possible. Not recommended long-term |

```bash
# submodule example
git submodule add git@github.com:user/brandspec-acme.git brandspec
```

## Flow

4 phases. See `flow.md` for details.

```
Discovery → Concept → Visual Identity → Documentation
```

## Activation Triggers

Activate this skill on utterances like:

- "I want to create a brand identity"
- "Let's define a brand"
- "I want to create a brandspec"
- "Let's decide on colors and logo"
- "I want to define the brand direction"

## Initialization Sequence

1. **Ask session language**: Ask the user which language they prefer for the workshop session. Record as the first decision (`session_language`). Conduct the entire session in that language from this point forward.
2. Confirm brand name
3. Scaffold the brand repository from `templates/`
4. Read `.workshop/position.yml` to determine current position
5. Load the corresponding phase `.md`

## Session Language

The workshop supports any language. The session language is determined at initialization and recorded in `decisions.yml`:

```yaml
- id: "d001"
  timestamp: "..."
  phase: 0
  step: "init"
  key: "session_language"
  value: "en"          # or "ja", "zh", "ko", "fr", etc.
  rationale: "User preference"
```

**Rules:**
- All facilitator dialogue, questions, and explanations MUST be in the session language
- `brandspec.yaml` field keys remain English (they are part of the spec)
- `brandspec.yaml` values (essence, tagline, personality, etc.) are written in the session language unless the user prefers otherwise
- `decisions.yml` values follow the session language
- On session resume, read `session_language` from decisions and continue in that language

## State Management

```
.workshop/
├── position.yml    # current phase/step
├── decisions.yml   # confirmed decisions (append-only)
├── memo.md         # working notes (overwritable)
└── session.md      # session handoff summary
```

### position.yml

```yaml
phase: 1              # 1-4
step: "product"       # step within phase
mode: "facilitation"  # facilitation | execution
revision: 1           # +1 when backtracking
updated: ""
completed_at: null     # ISO date when workshop finishes
```

### decisions.yml

```yaml
decisions: []
# Decision schema:
#   - id: "d001"
#     timestamp: "ISO 8601"
#     phase: 1
#     step: "product"
#     key: "product_essence"
#     value: "..."
#     rationale: "..."
#     supersedes: null    # or "d00X" if overriding a previous decision
```

## Operating Modes

| Mode | AI Role | When |
|------|---------|------|
| facilitation | Present options, user decides | Exploring, direction unclear |
| execution | AI works autonomously | Direction is clear |

Switch via user utterance:
- "Show me options" / "Let me decide" → facilitation
- "You decide" / "Just do it" → execution

## Phase Details

See files in `phases/`:

- `phases/01-discovery.md` - Discovery
- `phases/02-concept.md` - Concept
- `phases/03-visual.md` - Visual Identity
- `phases/04-documentation.md` - Documentation

## Key Rules

1. **Record all decisions in decisions.yml** (use `supersedes` to reference overridden decisions)
2. **Update position.yml at each step completion**
3. **Use memo.md for working hypotheses and candidates (overwrite OK)**
4. **Update session.md at session end (for handoff)**
5. **Never advance phases without user approval**
6. **Increment revision in position.yml when backtracking**

## Flow Control Guidance

### Phase 3.2 Colors: Progressive Defaults

Colors is the most complex step. To reduce user burden, use a progressive approach:

1. Ask the user to decide only the primary and secondary direction
2. AI auto-generates the rest (surfaces, semantics, destructive) from the primary hue
3. Present the full palette: "Does this look right? Anything to adjust?"
4. Handle individual adjustments if needed, otherwise proceed

Only walk through subsections 3.2.1–3.2.5 if the user requests detailed control.

## Session Resume Algorithm

When context is lost (new session, different AI, long gap), fully restore using this procedure:

```
1. Read position.yml → get current phase / step / mode / revision
2. Read decisions.yml → load all decisions
3. Resolve supersedes chains:
   - Collect decisions where supersedes != null
   - For each key, keep only the latest (non-superseded) decision
4. Reconstruct current state from active decisions:
   - Phase 1 complete? → product_essence, primary_user, positioning
   - Phase 2 complete? → personality, voice, name, tagline
   - Phase 3 complete? → mood, colors, typography, logo
5. Check session_language decision → continue session in that language
6. Read session.md for supplementary context (not required)
7. Present state summary to user:
   "Restored your previous session.
    Current: Phase {N}, Step {step}
    Confirmed: {summary of active decisions}
    Next action: {step description}
    Continue?"
```

This algorithm enables full restoration from `decisions.yml` + `position.yml` alone. `session.md` is supplementary context, not required.

## Session Start Example

```
Let's start the brandspec workshop.

First — what language would you like to use for this session?
(e.g. English, 日本語, 中文, etc.)
```

After language is confirmed:

```
Great. Let's forge your brand.

Current status:
- Phase: Discovery
- Step: product

Tell me about your product.
What are you building? What problem does it solve?
```

## Session End

1. Record progress summary in `session.md`
2. Note next actions clearly
3. Report completion to user
