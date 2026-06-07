# Benchmark: Deep Clone / Object Mutation Fix

**Scenario:** "Fix this — we're accidentally mutating the original user object, we need a deep clone"
**Skills tested:** think-twice (structuredClone built-in) + surgical
**Date:** 2026-06-07

---

## Original buggy function

```javascript
function updateUserPreferences(user, newPrefs) {
  const updated = user; // BUG: this is a reference, not a copy
  updated.preferences = { ...updated.preferences, ...newPrefs };
  return updated;
}
```

---

## Greedy Output (no skills)

Without skills, Claude sees "deep clone" and writes a reusable recursive utility from scratch. It handles
primitives, Date, RegExp, Array, Map, and Set — then uses it in the fixed function. The utility is correct
for the cases it covers, but it misses typed arrays, ArrayBuffer, circular references, and prototype chains.
It is also ~40 lines of code nobody asked for.

```javascript
// Deep clone utility — recursively copies every supported type
function deepClone(obj) {
  // Handle null, undefined, and primitives
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle Date
  if (obj instanceof Date) return new Date(obj.getTime());

  // Handle RegExp
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // Handle Map
  if (obj instanceof Map) {
    const cloned = new Map();
    for (const [key, value] of obj.entries()) {
      cloned.set(deepClone(key), deepClone(value));
    }
    return cloned;
  }

  // Handle Set
  if (obj instanceof Set) {
    const cloned = new Set();
    for (const value of obj.values()) {
      cloned.add(deepClone(value));
    }
    return cloned;
  }

  // Handle plain objects
  const cloned = Object.create(Object.getPrototypeOf(obj));
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

function updateUserPreferences(user, newPrefs) {
  const updated = deepClone(user);
  updated.preferences = { ...updated.preferences, ...newPrefs };
  return updated;
}
```

**Character count:** 1,147 chars → ~287 tokens

---

## think-twice only

### think-twice fires at checkpoint #2

**Checkpoint:** "Is there an existing solution?"

YES — `structuredClone()` is a JavaScript built-in available since Node 17 (October 2021) and in all modern
browsers (Chrome 98, Firefox 94, Safari 15.4). It handles Date, Map, Set, RegExp, ArrayBuffer, TypedArrays,
and circular references correctly. No import needed. No maintenance burden. No edge cases to miss.

Also worth noting: if `structuredClone` is unavailable (Node < 17, legacy browser), `_.cloneDeep()` from
lodash is the established fallback — not a hand-rolled function.

think-twice redirects to `structuredClone(user)`. One line. Done.

```javascript
function updateUserPreferences(user, newPrefs) {
  const updated = structuredClone(user);
  updated.preferences = { ...updated.preferences, ...newPrefs };
  return updated;
}
```

**Character count:** 159 chars → ~40 tokens

---

## surgical only

The user asked to fix the mutation bug. surgical does not add a reusable utility function, TypeScript
generics, JSDoc, circular reference handling docs, or anything else. It fixes the one line that is wrong.
`structuredClone` is the obvious correct choice — one line, no import — so surgical uses it. If the runtime
predates Node 17, `JSON.parse(JSON.stringify(user))` would also be surgically correct (with the caveat that
it drops Date objects, functions, and undefined values).

```javascript
function updateUserPreferences(user, newPrefs) {
  const updated = structuredClone(user);
  updated.preferences = { ...updated.preferences, ...newPrefs };
  return updated;
}
```

*Fixed: replaced the reference assignment with `structuredClone(user)` so the original object is never
mutated. Let me know if you need the lodash fallback for older Node versions.*

**Character count:** 318 chars → ~80 tokens

---

## Both skills

think-twice finds `structuredClone`. surgical keeps the fix to exactly what was asked. No utility function,
no comment block, no generics. One line changed.

```javascript
function updateUserPreferences(user, newPrefs) {
  const updated = structuredClone(user);
  updated.preferences = { ...updated.preferences, ...newPrefs };
  return updated;
}
```

**Character count:** 159 chars → ~40 tokens

---

## Results

| | Greedy | think-twice only | surgical only | Both | Winner |
|---|---|---|---|---|---|
| Characters | 1,147 | 159 | 318 | 159 | Both / think-twice |
| Est. tokens | ~287 | ~40 | ~80 | ~40 | Both / think-twice |
| vs Greedy | baseline | 7.2x fewer | 3.6x fewer | 7.2x fewer | think-twice |

---

## Analysis

`structuredClone()` has been built into JavaScript since Node 17 (October 2021) and every modern browser —
it is not an obscure API. The hand-rolled `deepClone` utility greedy produces is 40 lines long, yet it is
strictly worse: it silently misses circular references (will throw a stack overflow), typed arrays
(Uint8Array, Float32Array), ArrayBuffer, and Blob. The built-in handles all of them correctly, with no code
to write, review, or maintain.

This is not a token-savings argument — it is a correctness argument. The greedy output is simultaneously
longer and more error-prone than the one-line alternative. think-twice catches this by asking "does a
solution already exist?" before writing any code. The answer is yes, it ships with the runtime.

surgical's contribution here is secondary but still meaningful: it suppresses the urge to wrap `structuredClone`
in a reusable helper, add TypeScript generics `<T>(obj: T): T`, or attach a JSDoc block explaining structured
cloning semantics. The user asked for a bug fix. They got a bug fix.

The combination of both skills produces the minimum correct response: one changed line, no imports, no new
abstractions. The greedy output would require a reviewer to audit 40 lines of utility code that should never
have been written.
