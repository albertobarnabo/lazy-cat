# Benchmark 23 — Scalpel: Fix a Unit Mismatch Bug

**Scenario:** "The expiry check is wrong — `decoded.exp` is in seconds, `Date.now()` is
in milliseconds. Fix it."  
**Skills tested:** scalpel  
**Date:** 2026-06-08

---

## Existing Code

```javascript
function verifyToken(token) {
    const decoded = jwt.decode(token);
    if (!decoded) return null;
    if (decoded.exp < Date.now()) {
        return null;
    }
    return decoded;
}
```

---

## Greedy Output (no skills)

```javascript
/**
 * Verifies and decodes a JWT token.
 * @param {string} token - The JWT token string to verify.
 * @returns {Object|null} The decoded payload, or null if invalid or expired.
 */
function verifyToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    let decoded;
    try {
        decoded = jwt.decode(token);
    } catch (err) {
        console.error('Failed to decode token:', err.message);
        return null;
    }

    if (!decoded || !decoded.exp) {
        return null;
    }

    // decoded.exp is in seconds; Date.now() returns milliseconds
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp < nowInSeconds) {
        return null;
    }

    return decoded;
}
```

**Character count:** ~740 chars → **~185 tokens**

Added unrequested: JSDoc block, `typeof token !== 'string'` guard, try/catch around
`jwt.decode()`, `!decoded.exp` null check, inline comment, renamed intermediate
variable. The function's external behaviour also changed: it now returns `null` for
non-string inputs and throws-turned-null for malformed tokens — neither was asked for.

---

## Scalpel Output

One line needs to change: `Date.now()` → `Date.now() / 1000`. Nothing else.

```javascript
function verifyToken(token) {
    const decoded = jwt.decode(token);
    if (!decoded) return null;
    if (decoded.exp < Date.now() / 1000) {
        return null;
    }
    return decoded;
}
```

**Character count:** ~165 chars → **~41 tokens**

---

## Results

| Condition | Tokens | vs Greedy |
|---|---|---|
| Greedy | ~185 | baseline |
| scalpel | ~41 | **4.5× fewer** |

## Analysis

This is scalpel's clearest case: a one-line fix where greedy triples the function's
surface area. The greedy diff cannot be quickly reviewed because the actual fix (the
`/ 1000`) is buried in 25 lines of structural change.

The `try/catch` around `jwt.decode()` also changes behaviour: previously a malformed
token would throw and bubble up to the caller. Now it swallows the error silently.
Whether that is correct depends on context the developer did not provide. Scalpel
delivers the fix and leaves that decision open.
