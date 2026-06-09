# Benchmark 24 — Scalpel: Trivial Single-Value Change (Negative Test)

**Scenario:** "Change the cache TTL from 3600 to 300 seconds"  
**Skills tested:** scalpel — should NOT fire  
**Date:** 2026-06-08

---

## Existing Code

```python
CACHE_TTL = 3600

def get_user(user_id):
    cached = cache.get(f"user:{user_id}", ttl=CACHE_TTL)
    if cached:
        return cached
    user = db.users.find_one({"_id": user_id})
    cache.set(f"user:{user_id}", user, ttl=CACHE_TTL)
    return user
```

---

## Greedy Output (no skills)

```python
CACHE_TTL = 300  # 5 minutes (previously 3600 — 1 hour)

def get_user(user_id):
    cached = cache.get(f"user:{user_id}", ttl=CACHE_TTL)
    if cached:
        return cached
    user = db.users.find_one({"_id": user_id})
    cache.set(f"user:{user_id}", user, ttl=CACHE_TTL)
    return user
```

**Character count:** ~240 chars → **~60 tokens**

One value changed, inline comment added explaining the old value.

---

## Scalpel Output (skill skips — trivial single-value change)

```python
CACHE_TTL = 300

def get_user(user_id):
    cached = cache.get(f"user:{user_id}", ttl=CACHE_TTL)
    if cached:
        return cached
    user = db.users.find_one({"_id": user_id})
    cache.set(f"user:{user_id}", user, ttl=CACHE_TTL)
    return user
```

**Character count:** ~225 chars → **~56 tokens**

Scalpel skips per its trigger condition: task is a single-value constant change under
~5 lines. No narration added. Output is the changed value, nothing else.

---

## Results

| Condition | Tokens | vs Greedy |
|---|---|---|
| Greedy | ~60 | baseline |
| scalpel (skips) | ~56 | **≈ break-even** |

## Analysis

Greedy adds a comment explaining the old value (~4 extra tokens). Scalpel produces the
bare change. The difference is 4 tokens — noise. More importantly, scalpel does NOT add
output narrating its own inaction ("Applied scalpel: only line 1 was modified...").
That narration would be net negative. Silence is the correct behaviour here.

**Verdict:** Break-even. Scalpel correctly identifies this as out of scope and exits.
The 4-token delta versus greedy is within measurement error and not meaningful.
