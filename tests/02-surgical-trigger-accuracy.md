# Scope-Guard Trigger Accuracy Test

**Skill tested:** `surgical` v1.0.0  
**Skill path:** `/Users/albi/Projects/think-twice/skills/surgical/SKILL.md`  
**Date:** 2026-06-07  
**Tester:** Claude Sonnet 4.6 (automated quality evaluation)

---

## Methodology

For each scenario, the skill's binary rule was applied:

> "Did the user explicitly ask for this? YES → write it. NO → don't write it."

Baseline behavior is what Claude typically produces absent any guiding skill. "With Skill" behavior applies all three scope checks from the skill: (1) Is this in the task description? (2) Would removing this break what was asked for? (3) Would a reviewer ask "why is this here"?

The skill's legitimate carve-outs were also applied:
- Required imports the task clearly needs → keep
- A single line preventing an obvious crash the user would hit immediately → keep
- Safety/security genuinely requires defensive code → keep

---

## Scenario 1 — Fix login button disabled after one failed attempt

**Request:** "Fix the bug where the login button is disabled after one failed attempt"

### Baseline (no skill)

Baseline Claude identifies the bug and fixes it, but typically also adds:

- Retry counter logic with a max-attempts threshold (3 attempts before permanent lockout) — ~12 lines
- `console.error` or structured logging of failed attempts — ~3 lines
- An error message string displayed to the user ("Too many attempts, try again in 60s") — ~5 lines
- A unit test covering the re-enable behavior — ~15 lines
- Sometimes: a rate-limiting comment or TODO about server-side lockout

**Approximate extra lines: 35**

### With Skill

Scope-guard cuts everything except the single-line (or few-line) fix to the condition that incorrectly disables the button. The actual bug fix might look like:

```js
// Before: button remains disabled after any failure
setDisabled(true);

// After: reset on next render / re-enable after failure
setDisabled(false);
```

- Retry logic → **CUT** (not asked, would require a reviewer to ask "why is this here")
- Logging → **CUT** (not asked)
- Error messages → **CUT** (not asked; the button fix doesn't require a message)
- Unit tests → **CUT** (not asked; skill explicitly names this as scope creep)

### Assessment

The cuts are all correct. The user asked to fix a specific bug. Adding a retry system is a different feature. Adding tests is a different task. The skill fires precisely.

**Verdict: PASS**  
**LOC saved: ~35**

---

## Scenario 2 — Add a `formatDate(date)` function returning YYYY-MM-DD

**Request:** "Add a `formatDate(date)` function that returns YYYY-MM-DD"

### Baseline (no skill)

Baseline Claude delivers the function but adds:

- UTC normalization (`date.toISOString()` instead of local-time methods, or explicit `new Date(Date.UTC(...))`) to avoid off-by-one at midnight — ~3 lines
- A `locale` or `timeZone` parameter with a default — ~2 lines
- `try/catch` or `if (!(date instanceof Date) || isNaN(date))` guard — ~4 lines
- Possibly `Intl.DateTimeFormat` for locale-aware formatting — ~5 lines

**Approximate extra lines: 14**

### With Skill

The correct output is a minimal implementation:

```js
function formatDate(date) {
  return date.toISOString().split('T')[0];
}
// or
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

- Timezone handling → **CUT** (not asked; surgical's own example in the skill uses this exact scenario as "Abstractions for one-time use")
- Locale support → **CUT** (not asked)
- Error handling for invalid dates → **CUT** with one caveat below

**Caveat on error handling:** The skill says "a single line preventing an obvious crash the user would hit immediately" may stay. Passing `null` or a non-Date to `formatDate` would throw. However, the skill's `double(n)` example explicitly cuts `isinstance` checks on the grounds that "if the caller controls the input and None is impossible in context, the guards are noise." The function signature says it takes a `date` — if the caller passes a non-date, that is a caller bug, not a reason to defend inside `formatDate`. The guard is correctly cut.

### Assessment

All cuts are correct. The skill's own "Abstractions for one-time use" section calls out the DateFormatter class pattern for exactly this kind of request — the skill applies cleanly here.

**Verdict: PASS**  
**LOC saved: ~14**

---

## Scenario 3 — Rename `getUserData` to `fetchUser`

**Request:** "Rename the `getUserData` function to `fetchUser`"

### Baseline (no skill)

Baseline Claude:

1. Renames the function definition — in scope
2. Renames all call sites — in scope (required to not break code)
3. Updates existing comments that reference `getUserData` — borderline
4. Adds JSDoc (`@function fetchUser`, `@param`, `@returns`) where none existed — scope creep
5. Sometimes refactors surrounding code it notices while scanning — scope creep
6. Sometimes updates a README or other docs that mention the old name — scope creep

**Approximate extra lines beyond definition + call sites: 10–20 (JSDoc + surrounding cleanup)**

### With Skill

- Rename function definition → **KEEP** (the task)
- Rename all call sites → **KEEP** (required; removing this would break what was asked — a rename that leaves callers broken is not a rename)
- Update existing comments that name `getUserData` → **KEEP** (stale comments referencing a deleted name are broken artifacts; this is a single-line fix per occurrence that prevents immediate confusion; borderline but defensible as "preventing an obvious problem the user would hit immediately")
- Add new JSDoc where none existed → **CUT** (not asked; reviewer would ask "why is this here")
- Refactor surrounding code → **CUT** (skill explicitly names this: "don't rename variables in function B, reorder imports, or clean up unrelated logic")
- Update README/docs → **CUT** unless explicitly mentioned

**Edge case:** If the codebase has existing JSDoc on `getUserData`, updating its `@function` tag to `fetchUser` is part of the rename and should be kept. Adding JSDoc from scratch is not.

### Assessment

The skill fires correctly on the additions (new JSDoc, surrounding cleanup) while correctly preserving the necessary parts (call sites, existing comment updates). The existing-comment case is a close call but the skill handles it via the "single line preventing an obvious crash" carve-out — a dead reference in a comment isn't a crash, but the spirit applies.

**Verdict: PASS**  
**LOC saved: ~10–20**

---

## Scenario 4 — Add a loading spinner while the API call runs

**Request:** "Add a loading spinner while the API call runs"

### Baseline (no skill)

Baseline Claude adds the spinner state and wiring, but almost always also adds:

- Error state (`isError`, error message display) — ~8 lines
- Timeout handling (`setTimeout` + abort controller or similar) — ~10 lines
- Retry button shown on error — ~6 lines
- Sometimes: a cancel button, skeleton loading instead of spinner, or accessibility attributes (aria-live)

**Approximate extra lines: 24+**

### With Skill

Correct output:

```js
const [isLoading, setIsLoading] = useState(false);

async function callAPI() {
  setIsLoading(true);
  await fetch('/api/data');
  setIsLoading(false);
}

return isLoading ? <Spinner /> : <Content />;
```

- Error state → **CUT** (not asked; a distinct feature)
- Timeout handling → **CUT** (not asked)
- Retry button → **CUT** (not asked; a distinct feature)
- Accessibility attributes → could be offered but not silently added

The skill should surface the gaps: "I can also add error state handling and a timeout — want me to include those?" rather than silently adding them.

### Assessment

This is one of the highest-value scenarios for surgical. The temptation to add "while I'm here" error handling is strong. All cuts are correct — the user asked for a spinner, not an error recovery system.

**Verdict: PASS**  
**LOC saved: ~24+**

---

## Scenario 5 — Write a hello world endpoint in Express (false-positive test)

**Request:** "Write a hello world endpoint in Express"

### Baseline (no skill)

Baseline Claude writes:

```js
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

Sometimes also adds:
- `try/catch` around the route handler — ~3 lines
- `.catch(next)` for async routes — ~1 line
- A 404 handler (`app.use((req, res) => res.status(404).send('Not found'))`) — ~3 lines
- `app.use(express.json())` middleware — ~1 line
- `cors()` middleware — ~2 lines

**Approximate extra lines: 6–10**

### With Skill

This is the critical false-positive test. The skill's "When NOT to Guard Scope" says:

> "Safety or security genuinely requires defensive code"
> "The addition is one line and unmistakably necessary"

For a hello world GET route that returns a static string, an unhandled exception is *theoretically* impossible — the handler does nothing that can throw. A `try/catch` here is pure defensive theater, not safety.

Scope-guard correctly cuts:
- `try/catch` → **CUT** (nothing in the handler can throw; no async operations; defensive theater)
- 404 handler → **CUT** (not asked; different concern)
- `cors()` → **CUT** (not asked; a different infrastructure concern)

Scope-guard correctly keeps:
- `express.json()` middleware → **KEEP if** the endpoint needs to parse request bodies; for a GET/hello-world it doesn't, so cut. If a POST body were involved, it would be a required import carve-out.
- The `require`/`import` statements → **KEEP** (required imports)

**The skill does NOT over-fire here.** The carve-out for "safety genuinely requires defensive code" is not triggered because there is genuinely nothing unsafe about a route that returns a static string. The skill correctly distinguishes between "this could throw" (real risk) and "nothing here can throw" (defensive theater).

**If the request were "write a hello world endpoint that fetches from a database"**, then a `try/catch` would become a legitimate carve-out (async + external I/O = obvious crash risk), and surgical should keep it. The skill handles this correctly via the "single line preventing an obvious crash" rule.

### Assessment

Scope-guard does NOT over-fire. The cuts are precise. The carve-outs in the skill's "When NOT to Guard Scope" and "Legitimate Additions" sections handle the edge correctly.

**Verdict: PASS (no over-firing)**  
**LOC saved from noise: ~6–10**

---

## Scenario 6 — Add input validation to the registration form (in-scope test)

**Request:** "Add input validation to the registration form"

### Baseline (no skill)

Baseline Claude adds full validation: required field checks, format checks (email regex, password strength), inline error messages per field, form submission prevention, visual feedback (red borders, error icons). This is comprehensive but appropriate.

Baseline might over-extend to:
- Server-side validation mirroring — ~20 lines
- Debounced real-time validation — ~8 lines
- Accessibility announcements (`aria-describedby`, live regions) — ~5 lines
- A reusable `validate()` utility extracted to a separate file — scope creep if one-time use

### With Skill

The skill must correctly identify what "add input validation" implies and not cut legitimate parts:

- Field presence checks (required fields) → **KEEP** (core of "input validation")
- Format validation (email, password rules) → **KEEP** (core of "input validation")
- Inline error messages per field → **KEEP** (validation without feedback is useless; this is the output of validation, inseparable from the feature)
- Prevent form submission on invalid input → **KEEP** (the point of validation)
- Red border / visual feedback → **KEEP** (standard validation UI; reviewer would NOT ask "why is this here" — it's expected)
- Server-side validation mirror → **CUT** (different layer, not asked)
- Debounced real-time validation → **CUT** (enhancement not asked for)
- Reusable extracted utility → **CUT** if one-time use (skill's "Abstractions for one-time use" example applies)

**The key risk:** surgical over-firing by cutting error messages because "the user only said validation, not error messages." This would be incorrect. Error display is the necessary output of validation — it passes the second scope test: "Would removing this break what was asked for?" Yes, validation with no feedback is not validation.

### Assessment

The skill should correctly allow the full validation implementation (checks + messages + visual feedback + submit prevention). It should cut the server-side mirror, debouncing, and unnecessary abstraction. The skill's three-check test ("Would removing this break what was asked for?") correctly keeps the in-scope items.

**No over-firing detected.** The skill does not confuse "error handling for impossible cases" (scenario 1/2 pattern) with "error display that is the literal output of the requested feature."

**Verdict: PASS (no over-firing)**  
**LOC saved from noise: ~25–30 (server mirror + debouncing + premature abstraction)**

---

## Summary Table

| # | Scenario | Baseline extra LOC | Skill fires? | Correct? | Verdict |
|---|----------|--------------------|--------------|----------|---------|
| 1 | Fix login button bug | ~35 | Yes | Yes | PASS |
| 2 | Add `formatDate` | ~14 | Yes | Yes | PASS |
| 3 | Rename `getUserData` | ~10–20 | Yes (selective) | Yes | PASS |
| 4 | Add loading spinner | ~24+ | Yes | Yes | PASS |
| 5 | Hello world Express endpoint | ~6–10 | Yes (minimal cuts) | Yes — no over-fire | PASS |
| 6 | Input validation on form | ~25–30 | Yes (selective) | Yes — no over-fire | PASS |

**Overall: 6/6 PASS. No over-firing detected. No under-firing detected.**

---

## Key Findings

### Strengths

1. **The binary rule is clear and enforceable.** "Did the user explicitly ask for this?" is unambiguous in all six scenarios. There is no case where the answer was genuinely unclear once stated.

2. **The carve-outs are well-calibrated.** The three legitimate addition types (required imports, type annotations, single line preventing obvious crash) are narrow enough that they don't swallow the rule, but broad enough to avoid absurd results (e.g., not cutting `require('express')` when writing an Express app).

3. **"When NOT to Guard Scope" prevents over-firing on safety-critical cases.** Scenario 5 and 6 both rely on this. The skill correctly distinguishes between defensive theater and genuine safety requirements.

4. **The Scope Test's three-question check handles the rename scenario (3) cleanly.** Renaming call sites passes Q2 ("Would removing this break what was asked for?"). Adding JSDoc fails Q1 and triggers Q3.

### Weaknesses / Risks

1. **The `formatDate` timezone case is the hardest call.** UTC-vs-local is a genuine silent failure vector — `toLocaleDateString()` gives different dates near midnight depending on timezone. A strict reading of surgical cuts all timezone handling, which could produce a subtly wrong function. The skill would be stronger if it added "silent correctness bugs" to the legitimate carve-outs alongside "obvious crash."

2. **The existing-comments case in scenario 3 is not explicitly addressed.** The skill says "don't rename variables in function B" but is silent on whether updating stale references in existing comments is part of a rename. This is a small gap — the intent is clear but the language doesn't cover it.

3. **The skill relies on Claude's judgment for the "security genuinely requires" carve-out (Scenario 5).** If Claude misjudges what "genuine security" means, it could over-apply the carve-out (too permissive) or under-apply it (too restrictive). The skill would benefit from one concrete example of what security-driven additions look like (e.g., sanitizing SQL inputs in a DB query endpoint IS required; CORS headers on a hello-world IS NOT).

4. **Offering alternatives ("I can also add X — want me to include it?") is the right mechanism but easy to skip.** The skill instructs Claude to surface cuts explicitly, but there's no enforcement mechanism. In practice, Claude may silently cut without noting what was omitted, leaving the user unaware of what's missing.

### Recommended Improvement

Add a short "Silent correctness bugs" carve-out to the Legitimate Additions section:

> A one-line fix for a known silent failure (e.g., UTC normalization when the task is date formatting) — add it with a note, don't silently omit or silently include.

This would resolve the only genuine edge case found in testing (scenario 2, timezone handling).
