# surgical

> Forces Claude to build exactly what was asked — nothing more, nothing less.

Part of the **lean** plugin — [albertobarnabo/lean](https://github.com/albertobarnabo/lean)

---

## What it does

When Claude fixes a bug, it often adds input validation, docstrings, unit tests, and variable renames — none of which were asked for. The user asked for a bug fix. They got a PR diff they didn't expect and can't easily review.

surgical fixes that. Before writing any function, class, or block, Claude asks one question:

```
Did the user explicitly ask for this?
  YES → write it
  NO  → don't write it
```

---

## The Scope Test

Before each block:

```
[ ] Is this in the task description?
[ ] Would removing this break what was asked for?
[ ] Would a reviewer ask "why is this here"?
```

If the first is NO, or the third is YES — cut it.

---

## What Scope Creep Looks Like

**Error handling for inputs that can't happen:**
```python
# Asked: write a function that doubles a number
def double(n):
    if n is None: raise ValueError(...)   # scope creep
    if not isinstance(n, (int, float)): raise TypeError(...)  # scope creep
    return n * 2

# Correct:
def double(n):
    return n * 2
```

**Abstractions for one-time use:**
```typescript
// Asked: format a date as YYYY-MM-DD in one place
// Scope creep: class DateFormatter { constructor(private format: string) {} ... }
// Correct:
const formatted = date.toISOString().split('T')[0];
```

**Future-proofing nobody requested:**
```python
# Asked: save preferences to a file
def save_prefs(prefs, backend="json"):  # nobody asked for multi-backend
    if backend == "json": ...
    elif backend == "sqlite": ...  # scope creep
```

---

## Legitimate Additions

Some things are genuinely necessary even when not requested:

- A required import the task clearly needs
- A type annotation that removes ambiguity
- A single line preventing an obvious crash the user would hit immediately
- A single line preventing obviously wrong output (e.g. timezone offset that would produce incorrect dates)

For anything beyond these — ask:
> "I can also add X — want me to include it?"

---

## Token Savings

| Task | Without skill | With skill | Saved |
|---|---|---|---|
| Bug fix in `parse_date` | ~800 tokens | ~120 tokens | **7x** |
| `isValidEmail` function | ~466 tokens | ~18 tokens | **96%** |
| User authentication setup | ~967 tokens | ~190 tokens (surgical only) | **80%** |

---

## Install

**This skill only:**
```bash
curl -sL https://raw.githubusercontent.com/albertobarnabo/lean/main/skills/surgical/SKILL.md \
  -o ~/.claude/skills/surgical/SKILL.md --create-dirs
```

**Full lean plugin (think-twice + surgical):**
```
/plugin install albertobarnabo/lean
```

---

## When NOT to apply

- User explicitly asks for a complete or production-ready implementation
- The request IS error handling, validation, or tests — those are the task, not scope creep
- Safety or security genuinely requires defensive code
