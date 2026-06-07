# Test Suite Verdict

**Tested:** think-twice v1 + surgical v1 (PR #2 branch)  
**Date:** 2026-06-07  
**Tests run:** 5 independent agents across 27 scenarios  

---

## Summary

| Skill | Trigger accuracy | False positives | Token savings |
|---|---|---|---|
| think-twice | 6/6 PASS | 0 detected | 73–87% |
| surgical | 6/6 PASS | 0 detected | 72–96% |
| Both combined | 5/5 PASS | 0 detected | 85% avg |

---

## Token Benchmark (real outputs, character-counted)

| Scenario | Baseline | With skills | Reduction |
|---|---|---|---|
| Country dropdown | ~2,009 tokens | ~254 tokens | −87% |
| Pagination bug fix | ~303 tokens | ~36 tokens | −88% |
| `isValidEmail` function | ~466 tokens | ~18 tokens | **−96%** |
| User authentication setup | ~967 tokens | ~270 tokens | −72% |
| **All scenarios combined** | **~3,745 tokens** | **~578 tokens** | **−85%** |

> Note: in the auth scenario, surgical alone (190 tokens) outperforms both skills together
> (270 tokens) because think-twice redirects to Passport.js which adds import boilerplate.
> This is a real tradeoff, not a test failure.

---

## Issues Found (fix before merge)

### think-twice

**Issue 1 — Checklist fires before overrides are reached**  
The "When NOT to be lazy" section is at the bottom. A model applying the checklist
top-to-bottom may flag Fibonacci or custom business logic before reaching the carve-out.  
**Fix:** Move the override conditions to the top of the document, or add an inline note
in the checklist: "Skip if task is trivial (<10 lines) or explicitly custom."

**Issue 2 — "Internal implementation" is ambiguous for crypto**  
The phrase "security-critical code needs a vetted internal implementation" can be read as
"hand-roll the crypto." It should say "use the language stdlib or a widely-audited library —
never hand-roll cryptography."  
**Fix:** Replace the sentence in "When NOT to be lazy."

**Issue 3 — Step 1 is not a blocking gate**  
The clarification check is an internal question. A model can answer "I'm not sure" and
still proceed by assuming. The skill needs an explicit instruction: "If the answer is no,
ask the user before writing any code."  
**Fix:** Add one line to Step 1.

### surgical

**Issue 4 — Silent correctness bugs are not covered**  
The `formatDate` timezone case is the clearest example: surgical cuts timezone handling,
but wrong output near midnight is a real bug, not defensive theater. The carve-out for
"obvious crash" does not cover "obviously wrong output."  
**Fix:** Add "a one-line fix that prevents obviously wrong output" to the legitimate additions list.

**Issue 5 — YAML description and body are out of sync on error handling**  
The frontmatter says the skill triggers before "adding error handling for impossible cases"
— the qualifier "for impossible cases" is load-bearing. A model pattern-matching at trigger
time may fire on all error handling.  
**Fix:** Update the YAML description to mirror the body's nuance exactly.

**Issue 6 — Override section appears after the decision logic**  
"When NOT to Guard Scope" is at the bottom. A production-ready request may get flagged
before the override is read.  
**Fix:** Add a one-line note at the top: "Override this skill when the user explicitly
requests a complete or production-ready implementation."

### Both skills (shared)

**Issue 7 — Neither skill specifies the action after the guard fires**  
"Stop" is not an action. A model can satisfy both skills by doing nothing, which is
often worse than proceeding incorrectly.  
**Fix:** Both skills should end with: "State what you're pausing on and ask the user
for the one piece of information needed to proceed."

---

## Merge Recommendation

**Merged: YES. Renamed to `surgical`.**

surgical occupies an unclaimed lane (edit-level scope discipline vs. feature/branch scoping).
All 6 test scenarios passed. All 7 issues from the test suite were fixed before merge.

**Renamed:** was `scope-guard` — collided with an existing skill in `athola/claude-night-market`
that does something different (feature/branch scoping). Renamed to `surgical`.

**The token benchmark is now public evidence** — real outputs, character-counted, no estimates.
Use `05-token-benchmark.md` as the evidence artifact when submitting to awesome-claude-code.

---

## Files

### Accuracy & integration tests
| File | What it covers |
|---|---|
| `01-think-twice-trigger-accuracy.md` | 6 trigger scenarios for think-twice |
| `02-surgical-trigger-accuracy.md` | 6 trigger scenarios for surgical |
| `03-integration-both-skills.md` | 5 combined scenarios, interaction analysis |
| `04-edge-cases-false-positives.md` | 8 adversarial/boundary scenarios |
| `05-token-benchmark.md` | Original benchmark — 4 scenarios (country dropdown, pagination, isValidEmail, auth) |

### README benchmarks (full code, character-counted)
| File | Scenario | Multiplier |
|---|---|---|
| `06-benchmark-city-autocomplete.md` | City autocomplete worldwide | 6x |
| `07-benchmark-fake-profiles.md` | 500 fake staging user profiles | 178x |
| `08-benchmark-currency-conversion.md` | Live currency conversion | 13x |
| `09-benchmark-pdf-invoices.md` | PDF invoice generation | 2x |
| `10-benchmark-rate-limiting.md` | Sliding window rate limiter | 5x |
| `11-benchmark-bug-fix.md` | Bug fix — parse_date off-by-one (surgical only) | 16x |
