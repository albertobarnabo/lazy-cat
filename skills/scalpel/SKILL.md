---
name: scalpel
description: >
  Enforces minimum-viable diffs when editing existing code. Triggers before any modification
  to an existing file that affects more than ~5 lines. Claude must identify the exact lines
  that need to change and touch only those — no reformatting, renaming, reordering, or fixing
  unrelated issues in the same pass. Unrelated issues noticed during the edit are surfaced after
  delivery, never folded in silently. Does not trigger on new code that does not yet exist,
  on trivial single-value changes (under ~5 lines), or when the explicit request is to refactor,
  reformat, or restructure a file.
version: 1.0.0
---

# Scalpel — Minimum Viable Diff

> "First, do no harm to code you weren't asked to touch."

When editing existing code, the blast radius of a change should equal the scope of the request.
A 2-line fix should produce a 2-line diff. Anything wider makes review impossible and hides
regressions in noise.

**Override immediately when:**
- The request is explicitly to refactor, clean up, rename, or restructure
- The surrounding code is so broken it would cause the requested change to fail

---

## The Rule

Before making any edit, answer one question:

```
What is the minimum set of lines that need to change to fulfil this request?
```

Change those lines. Touch nothing else.

---

## What Scalpel Prevents

### Reformatting untouched code

```python
# Asked: change the return value of get_user() from a dict to a dataclass

# Wrong — reformatted the whole function:
def get_user(user_id: int) -> User:
    user = db.query(user_id)        # was: user=db.query(user_id)
    if not user:                    # was: if user is None:
        return None
    return User(                    # changed ✓
        id=user.id,
        name=user.name,
    )

# Correct — only the return statement changed:
def get_user(user_id):
    user=db.query(user_id)
    if user is None:
        return None
    return User(id=user.id, name=user.name)  # changed ✓
```

### "While I'm in here" fixes

```typescript
// Asked: add a loading state to fetchOrders()
// Wrong: also renamed 'data' → 'orders', added a missing null check,
//        reordered the useState declarations, removed a trailing space.
// Correct: add isLoading state and the two lines that toggle it. Stop.
```

### Consistency renaming

```python
# Asked: add a retry parameter to send_email()
# Wrong: also renamed send_email → sendEmail to match the JS convention
#        you noticed elsewhere in the file.
# Correct: add the parameter. The naming inconsistency is not your task.
```

---

## The Diff Test

Before submitting an edit, run:

```
[ ] Every changed line is directly required by the request
[ ] No line changed solely for style, consistency, or cleanliness
[ ] Imports, spacing, and naming outside the changed lines are untouched
[ ] If I removed something — was I explicitly asked to?
```

If any line fails the first check — revert it.

---

## Surfacing What You Noticed

If during the edit you spot something genuinely worth fixing:

> "Also noticed: `validate_token()` on line 47 has a null-dereference risk — want me to fix that separately?"

One sentence, after delivering the change. The user decides. You don't.
