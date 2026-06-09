# Benchmark 22 — Scalpel: Add Parameter to Existing Function

**Scenario:** "Add an optional `limit` parameter to `get_posts()`, default 20"  
**Skills tested:** scalpel  
**Date:** 2026-06-08

---

## Existing Code

```python
def get_posts(user_id, page=1):
    offset = (page - 1) * 20
    return db.query(
        "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20 OFFSET ?",
        (user_id, offset)
    )
```

---

## Greedy Output (no skills)

```python
def get_posts(user_id: int, page: int = 1, limit: int = 20) -> list[dict]:
    """
    Retrieve paginated posts for a user.

    Args:
        user_id: The ID of the user whose posts to retrieve.
        page: The page number (1-indexed). Defaults to 1.
        limit: Maximum number of posts per page. Must be between 1 and 100. Defaults to 20.

    Returns:
        List of post records as dictionaries.

    Raises:
        ValueError: If page or limit are out of valid range.
    """
    if page < 1:
        raise ValueError(f"page must be >= 1, got {page}")
    if not 1 <= limit <= 100:
        raise ValueError(f"limit must be between 1 and 100, got {limit}")
    offset = (page - 1) * limit
    return db.query(
        "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (user_id, limit, offset)
    )
```

**Character count:** ~810 chars → **~203 tokens**

Added unrequested: type annotations on all params + return type, full docstring with
Args/Returns/Raises, `page < 1` guard, `limit` range guard (1–100) — this is new
runtime behaviour that silently rejects previously valid calls if `limit` ever exceeds 100.

---

## Scalpel Output

Three lines need to change: signature (add `limit=20`), offset calculation (replace
hardcoded `20` with `limit`), query string (add `?` and `limit` to params). Nothing else.

```python
def get_posts(user_id, page=1, limit=20):
    offset = (page - 1) * limit
    return db.query(
        "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (user_id, limit, offset)
    )
```

**Character count:** ~195 chars → **~49 tokens**

---

## Results

| Condition | Tokens | vs Greedy |
|---|---|---|
| Greedy | ~203 | baseline |
| scalpel | ~49 | **4.1× fewer** |

## Analysis

The limit validation guard (`1 <= limit <= 100`) is the most dangerous addition. It
introduces a new `ValueError` for calls that pass `limit=200` — which may be valid in
the calling code today. The reviewer cannot tell without reading every call site whether
this is safe. The greedy diff is not safe to approve blindly.

The scalpel diff is three lines. It can be reviewed in 10 seconds.
