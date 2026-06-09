---
name: surgical
description: >
  Forces Claude to match output scope exactly to what was requested. Triggers before adding error
  handling for impossible edge cases, extracting one-time abstractions into classes, writing tests
  that weren't asked for, or future-proofing with config options nobody requested. Does not trigger
  when error handling, tests, or validation are the explicit subject of the request. Does not
  trigger on edits to existing lines — for minimum-diff enforcement on existing code, use scalpel.
  The best code is code you didn't write.
version: 1.0.0
---

# Surgical — Build Exactly What Was Asked

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry

Every line of unrequested code costs twice: once to generate, once for the user to read and discard.
Match the output scope to the request scope. Nothing more.

**Override this skill immediately when:**
- The user explicitly asks for a complete or production-ready implementation
- The request is for error handling, validation, or tests (those are the task, not scope creep)
- Safety or security genuinely requires defensive code

---

## The Rule

Before writing any function, class, or block, ask one question:

```
Did the user explicitly ask for this?
  YES → write it
  NO  → don't write it
```

---

## What Scope Creep Looks Like

### Error handling for cases that can't happen

```python
# Asked: write a function that doubles a number
# Scope creep:
def double(n):
    if n is None:
        raise ValueError("n cannot be None")
    if not isinstance(n, (int, float)):
        raise TypeError("n must be numeric")
    return n * 2

# Correct:
def double(n):
    return n * 2
```

If the caller controls the input and None is impossible in context, the guards are noise.

### Abstractions for one-time use

```typescript
// Asked: format a date as YYYY-MM-DD in one place
// Scope creep:
class DateFormatter {
  constructor(private format: string) {}
  format(date: Date): string { ... }
  static forISO() { return new DateFormatter('YYYY-MM-DD'); }
}

// Correct:
const formatted = date.toISOString().split('T')[0];
```

Three similar lines is better than a premature abstraction.

### Unrequested tests

If the user says "fix this bug", fix the bug. Don't add a test suite unless asked.
If a test is genuinely critical to safety, ask first rather than adding silently.

### Refactoring surrounding code

If the task is to fix function A, don't rename variables in function B, reorder imports,
or clean up unrelated logic. The user can't easily review what they didn't ask for.

### Future-proofing nobody requested

```python
# Asked: save user preferences to a file
# Scope creep:
def save_prefs(prefs, backend="json"):
    if backend == "json": ...
    elif backend == "sqlite": ...   # nobody asked
    elif backend == "redis": ...    # nobody asked

# Correct:
def save_prefs(prefs):
    with open(PREFS_PATH, "w") as f:
        json.dump(prefs, f)
```

Don't design for hypothetical future requirements.

---

## The Scope Test

Before each block, run three checks:

```
[ ] Is this in the task description?
[ ] Would removing this break what was asked for?
[ ] Would a reviewer ask "why is this here"?
```

If the first is NO, or the third is YES — cut it.

---

## Legitimate Additions

Some additions are genuinely necessary even when not requested:

- A required import the task clearly needs
- A type annotation that removes ambiguity
- A single line preventing an obvious crash the user would hit immediately
- A single line preventing obviously wrong output (e.g. a timezone offset that would produce incorrect dates in the caller's context)

For anything beyond these, surface it explicitly:

> "I can also add X — want me to include it?"

---

## When NOT to Guard Scope

Override this skill when:

- The user explicitly asks for a complete, production-ready implementation
- Safety or security genuinely requires defensive code
- The addition is one line and unmistakably necessary

---

## The Rule

**Build exactly what was asked. Note what was deliberately left out.
Never silently expand the scope.**

If scope is genuinely ambiguous — ask the user one targeted question before writing any code.
