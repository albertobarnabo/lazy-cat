# Edge Cases & False Positive Analysis

**Skills under test:** think-twice v(current), surgical v1.0.0
**Date:** 2026-06-07
**Method:** Apply each skill's checklist literally to each scenario, then verdict.

---

## Methodology

Each scenario is evaluated by running through the skill's published decision steps verbatim. The question is whether the *text of the skill* — not reasonable common sense — produces the correct outcome. Skills live or die on their wording, not their intent.

---

## Scenario 1: "Write a Fibonacci function"

**Skill tested:** think-twice
**Expected behavior:** Should NOT fire. Fibonacci is a legitimate 5-line implementation. The "shortcut exists" path does not apply — no external library is needed for a trivial recursive or iterative function.

**Applying the checklist:**

> `[ ] Does an API, package, or dataset already solve this?`

Here the skill breaks. The question is binary and has no threshold. `npm install fibonacci` exists. PyPI has `fibonacci`. The checklist answer is technically YES — a package does exist — so the skill's logic says "stop and explore that path." But installing a package to compute `n*(n+1)/2` or a 5-line loop is absurd.

The "When NOT to be lazy" section does contain a relevant carve-out:

> "The shortcut is overengineered: adding a library for 5 lines of trivial code"

This is the correct out. But it's listed under an override section that requires the model to *already know* the implementation is trivial. The checklist doesn't ask "is the library overkill?" — it asks "does a library exist?" The two are different questions, and the skill only reconciles them in prose, not in the checklist flow.

**Actual behavior:** Ambiguous. A model following the checklist literally hits a YES on "does a package exist?" and must "stop and explore." The prose override may or may not be consulted.

**Verdict: Marginal false positive risk.** The checklist and the override section are in tension. A model that follows the checklist mechanically before reading the override prose will incorrectly hesitate.

**Root cause:** The checklist asks "does a package exist?" not "does a package provide meaningful value over a trivial implementation?" The five-line threshold lives in the override prose (`"adding a library for 5 lines of trivial code"`), not in the decision tree itself.

---

## Scenario 2: "Add a console.log for debugging"

**Skill tested:** surgical
**Expected behavior:** Should NOT fire. One line, unambiguous request, zero scope creep possible.

**Applying the checklist:**

> `[ ] Is this in the task description? → YES`
> `[ ] Would removing this break what was asked for? → YES`
> `[ ] Would a reviewer ask "why is this here"? → NO`

All three checks pass correctly. The skill stays silent.

The "Legitimate Additions" section is also not triggered because the requested item itself is the task.

**Actual behavior:** Correct. Scope-guard does not fire.

**Verdict: Correct. No issue.**

---

## Scenario 3: "Implement custom business logic for our discount calculation: 10% for orders over $100, 20% over $200, 30% over $500"

**Skill tested:** think-twice
**Expected behavior:** Should NOT fire. The task is explicitly custom logic, the thresholds are provided, and no generic library can supply them.

**Applying the checklist:**

> `[ ] Does an API, package, or dataset already solve this?`

Again the same trap as Scenario 1. A model might surface `discount.js` or a generic pricing library and ask whether to use it. The question is whether the *explicit business logic specification* in the prompt is enough signal to short-circuit the library search.

The skill says:

> `[ ] Do I fully understand what's being asked, or am I assuming?`

In this case the user has fully specified the logic. A correct reading of Step 1 ("Am I solving the right problem?") should conclude: yes, fully understood, the implementation is the implementation. But the skill provides no guidance on how explicit specification affects the "does a library exist?" check. A model can still run Step 2 and find a generic pricing library.

**Actual behavior:** Likely correct in practice because the specificity of the numbers makes it obvious no library matches, but the skill provides no mechanism to *guarantee* this. The checklist has no "is this explicitly specified custom logic?" gate.

**Verdict: Latent false positive. Not guaranteed to fail, but not guaranteed to pass either.** The skill should have a carve-out for tasks where the user has already specified the full implementation in their prompt.

**Root cause:** No explicit "user has already constrained the solution" bypass in the checklist. The "does a library exist?" question is applied unconditionally.

---

## Scenario 4: "Update the user's profile"

**Skill tested:** think-twice
**Expected behavior:** Should fire. Vague task — "update" could mean UI, API, DB schema, validation logic, all of the above. The skill's Step 1 should catch this.

**Applying the checklist:**

> `[ ] Do I fully understand what's being asked, or am I assuming?`

This should immediately trigger a stop. The task does not specify what "update" means, what fields are involved, what layer of the stack, or what the current state is.

Step 1 of the skill:

> "Would a 2-sentence clarification save 200 lines of code?"

Answer: obviously yes. The skill should fire and ask for clarification.

The library check (Step 2) is secondary here, but user profile management libraries (Clerk, Auth0, Firebase Auth) do exist and are worth surfacing.

**Actual behavior:** Should fire correctly. The vagueness is unambiguous enough that Step 1 catches it.

**Verdict: Correct. No issue.**

*However*, there is a subtle weakness: the skill phrases Step 1 as questions the model asks *internally*, not as a hard stop. The instruction is "make sure the task is correctly understood" — but it does not say "refuse to proceed until ambiguity is resolved." A model could answer Step 1 by making assumptions and proceeding. The skill relies on the model's judgment to conclude "I don't understand enough" rather than mandating a clarification ask.

---

## Scenario 5: "Make it better"

**Skill tested:** think-twice, surgical
**Expected behavior:** Both skills should fire. This is maximally vague — no task is defined, no scope exists, no implementation can begin.

**think-twice:**

Step 1: "Do I fully understand what's being asked, or am I assuming?" — the answer is clearly NO. The skill should halt.

**Actual behavior:** think-twice should fire. The vagueness is so extreme that Step 1 is an obvious stop.

**surgical:**

> `[ ] Is this in the task description?`

Nothing is in the task description because the task has no content. Every line of code would fail the first scope test. The skill should also halt.

**Actual behavior:** surgical should fire.

**Verdict: Correct for both — but only incidentally.** Neither skill was designed with total task vacuum in mind. They work here because their first gates are broad enough to catch it. But "Make it better" is not the failure mode these skills were designed to address, and their guidance for this case is sparse. The model is left to interpret "I don't understand what's asked" and act on it — the skills don't prescribe *what to do* when Step 1 fails, only that you should not proceed.

**Real weakness exposed:** Neither skill says "when you cannot proceed, ask for clarification before doing anything." They say to stop, but not what comes next. A model could comply with the skill by doing nothing — which is also wrong.

---

## Scenario 6: "Implement SHA-256 hashing"

**Skill tested:** think-twice
**Expected behavior:** Should fire and redirect to stdlib (Python's `hashlib`, Node's `crypto`, Go's `crypto/sha256`). Should NOT redirect to a random npm/PyPI package. Security-critical implementations require vetted code.

**Applying the checklist:**

> `[ ] Does an API, package, or dataset already solve this?`
>
> Under "Standard library": "Does the language's stdlib already cover this?"

The skill correctly lists stdlib as the *first* preference in the library lookup hierarchy:

> "**Standard library**: Does the language's stdlib already cover this?"

So for SHA-256, the skill should correctly identify `hashlib`/`crypto` as the answer, not an external package.

**Actual behavior:** Correct — stdlib is listed before packages in the priority order.

**But there is a gap:** The skill's "When NOT to be lazy" section says:

> "Correctness requires it: security-critical code needs a vetted internal implementation"

This phrasing is ambiguous. "Vetted internal implementation" could mean:
1. Use the language's stdlib (correct)
2. Write your own from scratch (catastrophically wrong)

A model that reads "internal implementation" as "implement it yourself" would skip the stdlib and write a SHA-256 function from scratch — which is exactly the wrong outcome for security-critical code.

**Verdict: Partial failure on edge case.** The standard-library path is correct, but the "When NOT to be lazy" prose creates a dangerous ambiguity. The word "internal" should be "stdlib or language-blessed cryptographic library" rather than anything that could be read as "hand-rolled."

**Root cause:** Line 114 — `"security-critical code needs a vetted internal implementation"` — the word "internal" is doing too much work and is underspecified.

---

## Scenario 7: "Add error handling to the payment function"

**Skill tested:** surgical
**Expected behavior:** Should NOT fire. Error handling IS the requested task. Scope-guard must stay silent.

**Applying the checklist:**

The surgical header description says it triggers before:

> "adding error handling for impossible cases"

This is the exact pattern. The skill's description mentions "error handling for impossible cases" — but the scenario is error handling as *the requested task*, not as an addition to a non-error-handling task.

The body of the skill clarifies with an example:

```python
# Asked: write a function that doubles a number
# Scope creep:
def double(n):
    if n is None:
        raise ValueError(...)
```

The example shows error handling added *to an unrelated task*. The distinction — error handling as a task vs. error handling as an addition — is clear in the example but NOT explicit in the description or the scope test checklist.

**Applying the scope test:**

> `[ ] Is this in the task description? → YES (error handling is the task)`
> `[ ] Would removing this break what was asked for? → YES`
> `[ ] Would a reviewer ask "why is this here"? → NO`

The checklist passes correctly. The skill should not fire.

**Actual behavior:** Correct — the checklist saves it. But the skill *description* (the YAML front-matter and the section header) could mislead a model into triggering surgical before reaching the checklist.

**Verdict: Correct by checklist, risky by description.** A model that reads the description header and pattern-matches on "error handling" before running the checklist could incorrectly flag this. The description says the skill "Triggers before adding error handling for impossible cases" — but "impossible cases" is the key qualifier that a skim could miss.

**Root cause:** The YAML description front-matter says `"adding error handling for impossible cases"` but this nuance is easy to miss at the triggering stage. The trigger condition and the body content are not in sync on this point.

---

## Scenario 8: "Write a complete, production-ready REST API for user management"

**Skill tested:** surgical
**Expected behavior:** Should NOT fire. "Complete" and "production-ready" are explicit scope signals from the user. The skill has a named override for this.

**Applying the checklist:**

The "When NOT to Guard Scope" section says:

> "The user explicitly asks for a complete, production-ready implementation"

This is an exact lexical match to the scenario. The override should fire.

**Actual behavior:** Correct. The skill explicitly handles this case.

**Verdict: Correct.**

*However*, there is a structural weakness: this override only appears in the "When NOT to Guard Scope" section at the *bottom* of the document. A model running the scope test checklist at the top of the skill might apply the three-question gate before reaching the override section. The document structure puts the override *after* the decision logic, not *before* it. If a model runs the checklist and concludes "this is too much scope" before reading the override, it may incorrectly constrain output on a production-ready request.

**Minor verdict addendum: Document structure risk.** The override should appear before or within the checklist, not after it.

---

## Summary Table

| # | Scenario | Skill | Expected | Actual | Verdict |
|---|---|---|---|---|---|
| 1 | Fibonacci function | think-twice | No fire | Ambiguous | Marginal false positive |
| 2 | Add console.log | surgical | No fire | No fire | Correct |
| 3 | Custom discount logic | think-twice | No fire | Probably correct | Latent false positive |
| 4 | "Update the user's profile" | think-twice | Fire | Should fire | Correct (with caveat) |
| 5 | "Make it better" | both | Fire | Should fire | Correct (incidentally) |
| 6 | SHA-256 hashing | think-twice | Fire → stdlib | Ambiguous on "internal" | Partial failure |
| 7 | Error handling requested | surgical | No fire | Correct by checklist | Correct (risky by description) |
| 8 | Complete production API | surgical | No fire | Correct | Correct (document order risk) |

---

## Structural Weaknesses

### think-twice

**1. The checklist and the override are disconnected.**
The "does a package exist?" question in the checklist is binary and has no threshold. The "don't add a library for 5 lines of trivial code" carve-out lives in a separate section. A model that runs the checklist and then stops before reading the overrides will over-trigger on trivial implementations.

**Fix:** Add a sub-question to the checklist: "Would a library provide meaningful value over a trivial implementation, or is it overkill?"

**2. "Internal implementation" is dangerously ambiguous in the security section.**
Line 114: `"security-critical code needs a vetted internal implementation"` — this can be read as "write it yourself," which is the worst outcome for cryptographic code.

**Fix:** Replace with `"security-critical code must use the language stdlib or a vetted, widely-audited library — never hand-rolled."``

**3. Step 1 is not a hard stop.**
The clarification check is phrased as an internal question, not a blocking gate. A model can answer "no" to "do I fully understand this?" and still proceed by making assumptions.

**Fix:** Add explicit language: "If the answer is NO, ask for clarification before proceeding. Do not assume."

**4. No "user already specified the implementation" bypass.**
When a user provides explicit parameter values (the discount tiers, the exact algorithm), the library search in Step 2 is irrelevant. The skill does not distinguish between "I need to figure out how to compute X" and "I need to implement this specific formula the user gave me."

---

### surgical

**1. Description and body are not in sync on error handling.**
The YAML description says the skill triggers before "adding error handling for impossible cases" — the "for impossible cases" qualifier is load-bearing but easy to miss. A model reading the front-matter to decide whether to trigger the skill may fire it incorrectly on any error-handling task.

**Fix:** Rename the trigger pattern to "adding unrequested error handling" and make the Scenario 7 distinction explicit in the description.

**2. Override section appears after the decision logic.**
The "When NOT to Guard Scope" section — which handles the "complete, production-ready" case — is at the bottom of the document. A model that applies the checklist before reading the overrides may constrain output unnecessarily on explicitly scoped requests.

**Fix:** Move override conditions to the top of the document, or add a pre-check before the checklist: "Is this explicitly a complete/production-ready request? If so, skip the guard."

**3. No prescribed action when the guard fires.**
Both skills tell Claude to *stop*, but neither specifies what to do instead. "Stop and explore that path" (think-twice) or "cut it" (surgical) leave a model with a compliance gap — it can satisfy the skill by doing nothing, which may be worse than doing the wrong thing.

**Fix:** Add a mandatory next step: "When the guard fires: surface the issue explicitly to the user, propose the correctly scoped alternative, and wait for confirmation before proceeding."

---

## Overall Assessment

Neither skill fails catastrophically, but both have a shared structural flaw: **the decision checklist and the override/exception logic are separated**, requiring a model to hold both in context simultaneously rather than following a single integrated decision tree. In practice, models apply checklists top-to-bottom and may not backtrack to apply overrides discovered later in the document.

think-twice is more brittle on the false-positive axis (Scenarios 1, 3, 6). surgical is more brittle on the trigger-description vs. body-content alignment (Scenario 7). Both are underspecified on what to do *after* the guard fires.
