# Test Suite Summary

**Skills tested:** think-twice v1.0 + surgical v1.0  
**Date:** 2026-06-07  
**Total benchmarks:** 12 scenarios across 16+ independent agents  
**Methodology:** Each benchmark generates full code for all conditions and counts characters. Tokens estimated at 1 token ≈ 4 characters. Full outputs in individual files.

---

## Master Comparison

| Scenario | Greedy | surgical only | think-twice only | Both | Winner |
|---|---|---|---|---|---|
| 500 fake profiles | ~66,320 tok | ~66,263 tok (≈1x) | ~372 tok | **~372 tok (178x)** | think-twice |
| Email validation | ~1,675 tok | **~93 tok (18x)** | ~1,675 tok (no fire) | ~93 tok (18x) | surgical |
| Bug fix — parse_date | ~962 tok | **~61 tok (16x)** | ~962 tok (no fire) | ~61 tok (16x) | surgical |
| Live currency conversion | ~1,795 tok | ~1,678 tok (1.1x) | ~134 tok | **~134 tok (13x)** | think-twice |
| Dark mode toggle | ~962 tok | **~117 tok (8.2x)** | ~723 tok (1.3x) | ~152 tok (6.3x) | surgical beats both |
| Deep clone fix | ~287 tok | ~80 tok (3.6x) | **~40 tok (7.2x)** | **~40 tok (7.2x)** | think-twice |
| City autocomplete | ~2,460 tok | ~2,105 tok (1.2x) | ~410 tok | **~410 tok (6x)** | think-twice |
| Rate limiter — sliding window | ~2,152 tok | ~852 tok (2.5x) | ~414 tok | **~414 tok (5.2x)** | both (stacked) |
| Pagination | ~995 tok | **~203 tok (4.9x)** | ~395 tok (2.5x) | ~360 tok (2.8x) | surgical beats both |
| Console.log for debugging | ~419 tok | **~106 tok (4x)** | ~419 tok (no fire) | ~106 tok (4x) | surgical |
| PDF invoice generation | ~4,281 tok | ~4,251 tok (≈1x) | ~2,281 tok | **~2,281 tok (2x)** | think-twice |
| User auth setup | ~967 tok | **~190 tok (5x)** | ~270 tok (3.6x) | ~270 tok (3.6x) | surgical beats both |

---

## When think-twice is the right tool

**Scenarios: fake profiles, currency conversion, city autocomplete, PDF invoices, deep clone**

These tasks share one trait: the greedy approach picks a wrong or expensive implementation strategy that a library, API, or built-in eliminates entirely. Surgical can only trim the surface — it cannot redirect strategy.

- **Fake profiles:** surgical removes ~57 of 66,320 tokens (a DB wrapper). think-twice removes 65,948 by replacing 500 inline JSON objects with a 54-line faker script.
- **Currency conversion:** surgical removes 2 helper functions (~117 tokens). think-twice eliminates the entire hardcoded rates object by fetching from the Frankfurter API.
- **City autocomplete:** surgical trims keyboard nav, ARIA, clear button (~355 tokens). think-twice eliminates the static city array by using the `world-cities` package.
- **PDF invoices:** the PDFKit code IS the task. Surgical finds almost nothing to cut. think-twice saves ~2,000 tokens by switching to pdfmake's declarative layout.
- **Deep clone:** greedy writes a 40-line recursive `deepClone` utility that misses circular refs and typed arrays. think-twice finds `structuredClone()` — built into Node 17+ and all modern browsers, one line, handles everything correctly. This is also a correctness argument: the greedy output is both longer and more error-prone.

**Rule of thumb:** if greedy wastes tokens on a wrong implementation choice or data generation, think-twice is load-bearing. Surgical is a rounding error.

---

## When surgical is the right tool

**Scenarios: email validation, bug fix — parse_date, console.log for debugging**

These tasks have a fixed, bounded surface area. The creep is independent of the task size — it comes from Claude adding everything it considers "good practice while it's already there."

- **Email validation:** the user said "validate email." Greedy produces a module: RFC 5322 regex, a 65-entry disposable domain blocklist, a live SMTP/MX probe, `lru_cache`, four keyword parameters, a tuple return type, and a full docstring. think-twice correctly does not fire — there is no external API or package that makes a simple email check cheaper than stdlib `re`. Surgical removes everything except the regex and returns a plain bool.
  - Greedy: ~1,675 tokens. Surgical: ~93 tokens. **18×**

- **Bug fix — parse_date:** think-twice correctly does not fire (trivially small, <10 lines, no data, no new dependencies). Greedy adds type annotations, input validation, a docstring with Args/Returns/Raises/Examples, 13 unit tests, and logging. Surgical removes everything except the one-line fix.
  - Greedy: ~962 tokens. Surgical: ~61 tokens. **16×**

- **Console.log for debugging:** the user asked for one log line. Greedy installs Winston, adds a `VALID_USER_TYPES` constant, validates the `price` argument, and adds structured JSON logging at multiple levels. think-twice does not fire — there is no smarter approach to a console.log. Surgical adds two lines.
  - Greedy: ~419 tokens. Surgical: ~106 tokens. **4×**

**Rule of thumb:** if the task is small and scoped (bug fix, single-function addition, targeted micro-feature), surgical is the only relevant skill. think-twice correctly skips. The token savings are independent of any scale parameter — they can't be argued away by changing N.

---

## When surgical beats both skills combined

**Scenarios: dark mode toggle, pagination, user auth setup**

The pattern: think-twice recommends a library or more sophisticated approach, but the library's required boilerplate inflates the output beyond what a minimal hand-rolled implementation would produce. Surgical applied to the greedy directly wins.

**Dark mode toggle:**

| Condition | Tokens | vs. Greedy |
|---|---|---|
| Greedy | ~962 | baseline |
| think-twice only | ~723 | 1.3x fewer |
| surgical only | **~117** | **8.2x fewer** |
| Both | ~152 | 6.3x fewer |

think-twice evaluates next-themes, react-use-dark-mode, and the CSS class approach. It correctly rules out the libraries but still proceeds with the full theme system (ThemeProvider, useTheme hook, localStorage, system preference detection, CSS transitions). Surgical reads the request literally — "a toggle button in the header" — and produces one file changed: useState + classList.toggle + 4 CSS lines.

**Pagination:**

| Condition | Tokens | vs. Greedy |
|---|---|---|
| Greedy | ~995 | baseline |
| think-twice only | ~395 | 2.5x fewer |
| surgical only | **~203** | **4.9x fewer** |
| Both | ~360 | 2.8x fewer |

think-twice redirects to TanStack Table (the right call for a table that will grow). But TanStack's column definition DSL and import boilerplate add ~150 tokens the hand-rolled slice approach doesn't need. For a simple 20-rows-per-page request, surgical's 15-line answer outperforms.

**User auth setup:**

| Condition | Tokens | vs. Greedy |
|---|---|---|
| Greedy | ~967 | baseline |
| think-twice only | ~270 | 3.6x fewer |
| surgical only | **~190** | **5x fewer** |
| Both | ~270 | 3.6x fewer |

think-twice redirects to Passport.js — correct for production auth. But Passport.js requires strategy configuration, session middleware, and serialize/deserialize boilerplate. Surgical applied to the greedy (hand-rolled JWT + bcrypt) cuts roles middleware, 2FA, audit logs, and password reset — producing a minimal hand-rolled flow that's shorter than the Passport.js setup.

**Rule of thumb:** when the "smart" library has mandatory setup overhead and the user's request is simple enough that a minimal hand-rolled solution is shorter — use surgical alone. The skills are not always additive.

---

## When both skills stack

**Scenario: sliding window rate limiter**

The one scenario where both skills contribute meaningfully and independently:

- Surgical alone removes unrequested extras (IP blocking, CAPTCHA, account lockout, admin flush endpoint, graceful shutdown helper): 2,152 → 852 tokens (**2.5x**)
- think-twice then redirects to `rate-limiter-flexible`, eliminating the entire custom Redis/Lua implementation: 852 → 414 tokens (**2.1x**)
- Combined: **5.2x** (the multipliers compound)

Stacking works here because: (a) greedy added genuine scope creep on top of a complex custom implementation, and (b) a library exists that handles the core logic. Both conditions are necessary.

---

## Files

| File | Scenario | surgical only | think-twice only | Both |
|---|---|---|---|---|
| `05-token-benchmark.md` | Auth setup (surgical > both) | **5x** | 3.6x | 3.6x |
| `06-benchmark-city-autocomplete.md` | City autocomplete | 1.2x | 6x | 6x |
| `07-benchmark-fake-profiles.md` | 500 fake profiles | ≈1x | 178x | 178x |
| `08-benchmark-currency-conversion.md` | Currency conversion | 1.1x | 13x | 13x |
| `09-benchmark-pdf-invoices.md` | PDF invoice generation | ≈1x | 2x | 2x |
| `10-benchmark-rate-limiting.md` | Sliding window rate limiter | 2.5x | 5x | 5.2x |
| `11-benchmark-bug-fix.md` | Bug fix — parse_date | **16x** | no fire | 16x |
| `12-benchmark-console-log.md` | Console.log for debugging | **4x** | no fire | 4x |
| `13-benchmark-email-validation.md` | Email validation | **18x** | no fire | 18x |
| `14-benchmark-dark-mode.md` | Dark mode toggle | **8.2x** | 1.3x | 6.3x |
| `15-benchmark-deep-clone.md` | Deep clone fix | 3.6x | **7.2x** | 7.2x |
| `16-benchmark-pagination.md` | Pagination | **4.9x** | 2.5x | 2.8x |
