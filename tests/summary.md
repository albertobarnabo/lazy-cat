# Test Suite Summary

**Skills tested:** think-twice v1.0 + surgical v1.0  
**Date:** 2026-06-07  
**Total benchmarks:** 7 scenarios across 12 independent agents  
**Methodology:** Each benchmark generates full code for all conditions and counts characters. Tokens estimated at 1 token ≈ 4 characters. Full outputs in individual files.

---

## Master Comparison

| Scenario | Greedy | surgical only | think-twice only | Both | Winner |
|---|---|---|---|---|---|
| 500 fake profiles | ~66,320 tok | ~66,263 tok (≈1x) | ~372 tok | **~372 tok (178x)** | think-twice |
| PDF invoice generation | ~4,281 tok | ~4,251 tok (≈1x) | ~2,281 tok | **~2,281 tok (2x)** | think-twice |
| Live currency conversion | ~1,795 tok | ~1,678 tok (1.1x) | ~134 tok | **~134 tok (13x)** | think-twice |
| City autocomplete | ~2,460 tok | ~2,105 tok (1.2x) | ~410 tok | **~410 tok (6x)** | think-twice |
| Sliding window rate limiter | ~2,152 tok | ~852 tok (2.5x) | ~414 tok | **~414 tok (5.2x)** | both (stacked) |
| Bug fix — parse_date | ~962 tok | **~61 tok (16x)** | ~962 tok (no fire) | ~61 tok (16x) | surgical |
| User auth setup | ~967 tok | **~190 tok (5x)** | ~270 tok | ~270 tok (3.6x) | surgical beats both |

> **Note on think-twice-only:** For scenarios 06–10, think-twice redirects to a library or API. The resulting lean implementation is already minimal, so think-twice-only ≈ both. The distinction matters only when the library itself adds boilerplate (see auth below).

---

## When think-twice is the right tool

**Scenarios: fake profiles, currency conversion, city autocomplete, PDF invoices**

These tasks share one trait: the greedy approach wastes tokens on data or verbosity that a library or API eliminates entirely. Surgical can only trim the surface — it cannot redirect the implementation strategy.

- Fake profiles: surgical removes ~57 of 66,320 tokens (the DB wrapper function). think-twice removes 65,948 by replacing 500 inline JSON objects with a 54-line faker script.
- Currency conversion: surgical removes 2 helper functions (~117 tokens). think-twice eliminates the entire 5,720-char hardcoded rates object by fetching from an API.
- City autocomplete: surgical trims keyboard nav, ARIA, clear button (~355 tokens). think-twice eliminates the static city array by using the `world-cities` package.
- PDF invoices: the PDFKit code IS the task (logo, line items, totals, payment terms). Surgical finds almost nothing to cut (~30 tokens). think-twice saves ~2,000 tokens by switching to pdfmake's declarative layout.

**Rule of thumb:** if the greedy wastes tokens on data generation or a wrong implementation choice, think-twice is load-bearing. Surgical is a rounding error.

---

## When surgical is the right tool

**Scenario: bug fix — parse_date**

The task is a one-line change. think-twice correctly does not fire (skip condition: trivially small, <10 lines, no data, no new dependencies). The greedy approach adds type annotations, input validation, a docstring with Args/Returns/Raises/Examples, 13 unit tests, and logging. None of it was asked for.

Surgical removes everything except the fix itself:

- Greedy: ~962 tokens (bug fix + validation + docstring + 13 tests + logging)
- Surgical only: ~61 tokens (one-line fix + note about what was left out)
- Both: ~61 tokens (identical — think-twice adds nothing here)

**Rule of thumb:** if the task is small and scoped (bug fix, single-function addition, targeted refactor), surgical is the only relevant skill. think-twice will skip correctly.

---

## When surgical beats both skills combined

**Scenario: user auth setup** *(from 05-token-benchmark.md)*

This is the most important edge case. think-twice fires at checkpoint #2 and correctly redirects to Passport.js — a widely-used, well-maintained auth library. But Passport.js requires import boilerplate: strategy configuration, session middleware, serialize/deserialize functions. That boilerplate is legitimate code that surgical cannot cut (it was produced by a valid library recommendation).

Surgical applied to the greedy (hand-rolled JWT + bcrypt implementation) cuts all the unrequested extras — roles middleware, 2FA, audit logs, password reset — and produces a minimal hand-rolled auth flow.

| Condition | Tokens | vs. Greedy |
|---|---|---|
| Greedy | ~967 | baseline |
| think-twice only | ~270 | 3.6x fewer |
| surgical only | **~190** | **5x fewer** |
| Both | ~270 | 3.6x fewer |

Surgical alone wins. The Passport.js boilerplate inflates the "both" output above what a minimal hand-rolled implementation would produce.

**Rule of thumb:** when the "smart" library has mandatory setup overhead, and the user's request is simple enough that a minimal hand-rolled solution is shorter — use surgical alone, not both. The skills are not always additive.

---

## When both skills stack

**Scenario: sliding window rate limiter**

This is the one scenario where both skills contribute meaningfully and independently:

- Surgical alone removes the unrequested extras (IP blocking, CAPTCHA, account lockout, admin flush endpoint, graceful shutdown helper): 2,152 → 852 tokens (**2.5x**)
- think-twice then redirects to `rate-limiter-flexible`, eliminating the entire custom Redis/Lua implementation: 852 → 414 tokens (**2.1x**)
- Combined: **5.2x** (the two multipliers compound)

The stacking works here because: (a) the greedy added genuine scope creep on top of a complex custom implementation, and (b) a library exists that handles the core logic. Both conditions are necessary for full stacking.

---

## Files

| File | Scenario | surgical only | think-twice only | Both |
|---|---|---|---|---|
| `06-benchmark-city-autocomplete.md` | City autocomplete | 1.2x | 6x | 6x |
| `07-benchmark-fake-profiles.md` | 500 fake profiles | ≈1x | 178x | 178x |
| `08-benchmark-currency-conversion.md` | Currency conversion | 1.1x | 13x | 13x |
| `09-benchmark-pdf-invoices.md` | PDF invoice generation | ≈1x | 2x | 2x |
| `10-benchmark-rate-limiting.md` | Sliding window rate limiter | 2.5x | 5x | 5.2x |
| `11-benchmark-bug-fix.md` | Bug fix — parse_date | 16x | no fire | 16x |
| `05-token-benchmark.md` | Auth setup (surgical > both) | **5x** | 3.6x | 3.6x |
