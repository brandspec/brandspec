# Phase 2: Concept

## Goal

Define the brand's personality, voice, and verbal identity.

## Steps

### 2.1 Personality

**Questions to answer:**

- If the brand were a person, how would you describe them?
- What 3-5 adjectives capture the brand?
- What should users feel when interacting with the brand?

**Facilitation approach:**

Present contrasting pairs and ask user to choose:

```
Where does your brand fall?

Formal ←───────→ Casual
Traditional ←───────→ Innovative  
Serious ←───────→ Playful
Reserved ←───────→ Bold
Expert ←───────→ Friendly
```

**Output: Personality Traits**

```yaml
# Example
personality:
  - innovative
  - approachable
  - confident
  - playful
```

---

### 2.2 Voice

**Questions to answer:**

- How does the brand speak?
- What's the tone in different contexts?
- What words/phrases to use or avoid?

**Facilitation prompts:**

```
How would the brand greet a new user?
How would it apologize for an error?
What words are "on brand" vs "off brand"?
```

**Output: Voice Guidelines**

```yaml
# Example
voice:
  tone:
    - friendly
    - clear
    - encouraging
  principles:
    - "Use active voice"
    - "Keep sentences short"
    - "Celebrate user wins"
  do:
    - "Hey there" (not "Dear user")
    - "Oops" (not "Error")
  dont:
    - Corporate jargon
    - Passive voice
    - Negative framing
```

---

### 2.3 Naming (if needed)

Skip if name is already decided.

**Approaches:**

1. **Descriptive** - Says what it does (Dropbox, YouTube)
2. **Abstract** - Evocative, no literal meaning (Apple, Nike)
3. **Founder/Origin** - Personal name (Tesla, Disney)
4. **Compound** - Combined words (Facebook, Snapchat)
5. **Invented** - Made up (Kodak, Xerox)

**Facilitation approach:**

Generate candidates in each category, then filter:

```
# Candidate generation
a) Descriptive: BrandSync, AssetHub
b) Abstract: Beacon, Prism
c) Compound: BrandBox, AssetFlow

# Filtering criteria
- Domain available?
- Easy to spell/pronounce?
- Unique enough to trademark?
- Fits the personality?
```

**Output: Confirmed Name**

```yaml
# Example  
name: "Prism"
rationale: "Evokes clarity, multiple facets of brand, light/modern feel"
```

---

### 2.4 Tagline

**Questions to answer:**

- What's the one-liner that captures the brand promise?
- Is it memorable? Does it differentiate?

**Approaches:**

1. **Benefit-focused** - "Think different"
2. **Emotional** - "Just do it"
3. **Descriptive** - "The ultimate driving machine"
4. **Provocative** - "Have it your way"

**Facilitation approach:**

Generate 5-10 candidates, narrow to 3, user picks:

```
Candidates:
a) "Brand clarity, delivered"
b) "Your brand, everywhere"
c) "One source of truth"

Which resonates most?
```

**Output: Tagline**

```yaml
# Example
tagline: "Brand clarity, delivered"
```

---

## Phase Complete Checklist

- [ ] 3-5 personality traits selected
- [ ] Voice tone and principles defined
- [ ] Name confirmed (or skipped if pre-existing)
- [ ] Tagline selected
- [ ] All recorded in `decisions.yml`

## Transition to Phase 3

When all items are checked:

```yaml
# Update position.yml
phase: 3
step: "mood"
mode: "facilitation"
```

## Example Session

```
AI: Now let's define personality. I'll show you some spectrums.
    Where does your brand fall?
    
    Formal ←───●───→ Casual
    
    (1=very formal, 5=very casual)

User: 4 - pretty casual but not sloppy

AI: Got it. How about:
    
    Serious ←───●───→ Playful

User: 3 - balanced, we want to be taken seriously but not boring

AI: Based on this, here are personality trait candidates:
    
    a) Professional, reliable, calm
    b) Approachable, confident, modern  
    c) Bold, innovative, energetic
    
    Which set feels closest?

User: b, but add a touch of playful from c

AI: How about:
    - Approachable
    - Confident
    - Modern
    - Playful (subtle)
    
    [Records to decisions.yml]
```
