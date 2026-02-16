# Phase 1: Discovery

## Goal

Understand what we're branding before we brand it.

## Steps

### 1.1 Product

**Questions to answer:**

- What is the product/service/company?
- What problem does it solve?
- What makes it unique?
- What's the core value proposition?

**Facilitation prompts:**

```
Describe your product in one sentence.
What would users miss most if it disappeared?
How is this different from alternatives?
```

**Output: Product Essence**

A single sentence capturing the core of what this is.

```yaml
# Example
product_essence: "AI-powered writing assistant that helps non-native speakers write confidently"
```

---

### 1.2 Users

**Questions to answer:**

- Who is the primary user?
- What are their goals?
- What are their pain points?
- What's their context (B2B/B2C, technical level, etc.)?

**Facilitation prompts:**

```
Who uses this? Paint a picture of your ideal user.
What's frustrating them right now?
Where do they encounter your product?
```

**Output: User Definition**

```yaml
# Example
primary_user:
  who: "Non-native English speakers in professional settings"
  goals:
    - "Write emails that sound natural"
    - "Avoid embarrassing mistakes"
  pain_points:
    - "Unsure if their writing sounds professional"
    - "Existing tools feel like cheating"
  context: "B2C, used during work hours"
```

---

### 1.3 Context

**Questions to answer:**

- Who are the competitors?
- What's the market position?
- Are there constraints (regulatory, technical, budget)?
- What's the timeline/stage?

**Facilitation prompts:**

```
What alternatives do users have today?
Where do you want to position relative to competitors?
Any constraints I should know about?
```

**Output: Market Context**

```yaml
# Example
competitors:
  - name: "Grammarly"
    position: "Mass market, feature-heavy"
  - name: "Hemingway"
    position: "Simplicity-focused"
    
positioning: "Premium feel, focused on confidence not correction"

constraints:
  - "Launch in 3 months"
  - "Small team, can't maintain complex brand"
```

---

## Phase Complete Checklist

- [ ] Product essence defined (one sentence)
- [ ] Primary user identified
- [ ] Competitive context understood
- [ ] All recorded in `decisions.yml`

## Transition to Phase 2

When all items are checked:

```yaml
# Update position.yml
phase: 2
step: "personality"
mode: "facilitation"
```

## Example Session

```
AI: Let's start with Discovery. Tell me about your product.
    What are you building?

User: It's a SaaS for managing Brand Identity files.

AI: Interesting! What problem does this solve? Why would someone 
    choose this over just using Google Drive?

User: Designers hand off brand assets but they get lost, 
    outdated versions get used, there's no single source of truth.

AI: Got it. So the core value is "Single source of truth for brand assets."
    Let me capture that:
    
    Product essence: "Single source of truth for Brand Identity 
    that ensures teams always use the right assets."
    
    Does that capture it?

User: Yes, but also add that it works with their existing tools.

AI: Updated:
    "Single source of truth for Brand Identity that integrates 
    with existing design and development workflows."
    
    [Records to decisions.yml]
    
    Now let's talk about users. Who's buying and who's using?
```
