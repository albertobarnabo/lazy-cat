# Integration Test: think-twice + surgical

**Date:** 2026-06-07  
**Skills tested:** think-twice v1.0, surgical v1.0  
**Method:** Simulated Claude outputs for each condition; no live inference calls. Outputs represent characteristic behavior based on skill instruction sets.

---

## How the Two Skills Relate (Structural Analysis)

Before the scenarios: the skills operate at different altitudes.

- **think-twice** fires at **task-planning time** — before Claude commits to an approach. It redirects to a library, questions scope at the strategy level, or defers work.
- **surgical** fires at **code-writing time** — before each function or block. It enforces that only what was asked gets written.

They are sequential, not competitive: think-twice shapes *what* gets built, surgical shapes *how much* of it gets written. When both fire, think-twice runs first. surgical then operates on the already-narrowed implementation plan.

This is a natural pipeline. The key risk is overlap: think-twice Question 3 ("Am I doing too much?") partially duplicates surgical's entire purpose. This matters in the edge cases below.

---

## Scenario 1: "Add authentication to our Express app"

### Baseline (no skills)

Claude produces:
- Full custom auth system: password hashing with bcrypt, JWT generation, session management
- Middleware for protected routes
- A User model with email/password fields
- Likely: refresh token rotation, role middleware, password reset flow
- Possibly: 2FA stub, audit log comment

Token cost: high. The question was open-ended, so Claude defaults to production-ready.

### With think-twice only

think-twice fires on "add authentication" — this is a solved domain (explicitly called out in the Common Shortcuts table: "Implementing auth, payments, maps from scratch → Using the standard library for that domain").

Claude pauses and recommends Passport.js or a hosted solution (Auth0, Clerk). It explains the choice and implements a minimal Passport local strategy setup — maybe 40 lines instead of 200.

**But**: think-twice does not reliably prevent role management, refresh token logic, or audit logs from appearing. It fixed the *approach* (library vs. scratch) but left the *scope* unconstrained. If Claude decides "Passport is the right tool", it may then build a full Passport integration including every feature it knows Passport supports.

### With surgical only

surgical fires before each code block and asks "did the user ask for this?" It strips role middleware, 2FA, audit logs, and password reset flow — correctly. But it does not redirect Claude away from a custom implementation. Claude still builds JWT from scratch, but at least it's minimal.

Blind spot: surgical has no opinion on *how* auth is implemented, only on what features are included. A from-scratch bcrypt+JWT implementation is in-scope by its rules — the user did ask for authentication.

### With both skills

Pipeline:
1. think-twice redirects: "use Passport.js, not scratch"
2. surgical trims: "no roles, no 2FA, no audit logs — just login/logout"

Result: Passport local strategy, session middleware, login route, a `isAuthenticated` guard. ~30 lines. Clear offer to extend.

**Combined output is meaningfully better than either alone.** think-twice gets the right tool; surgical gets the right amount of that tool.

### Conflicts / Redundancy

Mild redundancy: think-twice Question 3 ("Does the user need all of this, or just a slice?") overlaps surgical's core rule. In practice this is harmless — two checks at different levels both catching scope creep is not a problem. No conflict found.

**Verdict: Strong complementarity. Neither skill undermines the other.**

---

## Scenario 2: "Build a search feature for our product catalog (500 items)"

### Baseline (no skills)

Claude builds:
- Inverted index or trie from scratch
- Tokenizer, stop-word filter, TF-IDF scoring
- Filter sidebar (category, price range)
- Search analytics logging
- Debounced input component

500 items is small, but Claude doesn't know that changes the calculus — it builds for scale.

### With think-twice only

think-twice fires hard here. 500 items is tiny. The checklist question "Is there an existing solution?" surfaces Fuse.js immediately. Claude recommends: `npm install fuse.js`, configure with the catalog array, done in 15 lines.

**But**: Fuse.js is installed, and then Claude may still build filters, facets, and an analytics hook "since we're building search." think-twice killed the algorithmic overengineering but left the feature-scope open.

### With surgical only

surgical asks "did the user ask for filters?" No. Strips them. "Did the user ask for analytics?" No. Strips it. But Claude still builds a custom search algorithm — just a minimal one. For 500 items that might be a simple `.filter()` scan, which is fine, but it didn't catch the "there's a library for this" insight.

### With both skills

Pipeline:
1. think-twice: "500 items is tiny — Fuse.js in 10 lines, don't build a search engine"
2. surgical: "no filters, no facets, no analytics — just the search box and results"

Result: Fuse.js installed, a single search function, a minimal results list. The user gets exactly what they asked for with no invented complexity.

**This is the scenario where combination value is highest.** The problem has both a strategy shortcut (library) and a scope risk (feature creep). Neither skill alone catches both.

### Conflicts / Redundancy

None. The skills address genuinely different axes: *how* (algorithm vs. library) and *what* (search-only vs. search+filters+analytics).

**Verdict: Best-case scenario for dual-skill usage. Significant improvement over either alone.**

---

## Scenario 3: "Fix the typo in the error message on line 42"

### Baseline (no skills)

Claude opens the file, changes the typo, done. One line changed.

### With think-twice only

**False positive risk: moderate.**

think-twice's trigger description says it fires before "high-cost tasks" and "heavy work." A one-line typo fix is not high-cost. The skill's own text says "stop at the first question that reveals a better path" — and for a typo, no question in the lazy check reveals anything. Claude should run the check mentally and immediately conclude: proceed.

In practice though, Claude may over-apply the checklist. If it runs think-twice mechanically on a typo, it wastes a sentence or two on "checked for existing solutions — this is a one-character fix, proceeding." That's friction without value.

Risk level: the skill says "run this before any task that feels heavy" — a typo does not feel heavy. The word "feels" is doing important work here. Disciplined application avoids false positives.

### With surgical only

**False positive risk: low.**

surgical's trigger description is more precise: it fires before "adding error handling for impossible cases, extracting one-time abstractions, writing unrequested tests, refactoring surrounding code." None of those are happening in a typo fix. surgical should not fire.

If it does fire anyway, the checklist passes cleanly: "Is this in the task description? Yes (it's literally the task). Would removing this break what was asked? Yes. Would a reviewer ask 'why is this here'? No." Clears in one pass.

### With both skills

Both should silently pass. Neither interrupts a one-line fix. Claude changes the string, done.

**Risk**: if both skills have verbose "checking..." preambles, a typo fix generates two paragraphs of meta-commentary before the single-line change. That's a failure mode of implementation style, not skill logic.

### Conflicts / Redundancy

The main risk here is compound false positives: two skills that each have a small chance of over-triggering have a higher combined chance. Neither fires correctly, but both might fire incorrectly. The probability is low given well-scoped trigger descriptions, but it's worth monitoring.

**Verdict: Both skills correctly abstain. Combined false-positive risk is additive but small.**

---

## Scenario 4: "Set up a cron job that sends a weekly email summary"

### Baseline (no skills)

Claude builds:
- A custom scheduler using `setInterval` or a node daemon pattern
- A raw SMTP implementation or an overly configured transactional email setup (SendGrid with templates, API keys)
- Email HTML with inline CSS, header, footer
- Unsubscribe logic ("best practice")
- Open/click tracking pixel
- Error handling for all SMTP edge cases

This is a genuinely complex task where Claude's defaults produce significant overengineering.

### With think-twice only

think-twice fires on both sub-problems:

1. **Scheduling**: "Does a package already do this? Yes — `node-cron` (or `cron`, or if serverless: a cloud scheduler). Use it."
2. **Email**: "Does a package already do this? Yes — `nodemailer`. Don't implement SMTP."

Claude reduces to `node-cron` + `nodemailer`. Maybe 30 lines. Good.

**But**: with the library decision made, think-twice does not prevent Claude from adding template systems, unsubscribe links, or tracking. These feel "natural" as part of email setup. think-twice Question 3 might catch it, but it's at the strategy level — it's easy to rationalize "email summaries naturally have unsubscribe."

### With surgical only

surgical fires before "add unsubscribe handler." Did the user ask for it? No. Strips it. Same for open tracking, HTML templates, error retry logic. 

But surgical doesn't redirect away from custom SMTP. Claude might implement a raw SMTP connection with `net.createConnection` and surgical lets it through — because building a cron+email system is in scope, only the extras are out.

### With both skills

Pipeline:
1. think-twice: "`node-cron` for scheduling, `nodemailer` for email — don't build either"
2. surgical: "no unsubscribe, no templates, no tracking — just the scheduled send"

Result: ~20 lines. `node-cron` schedule, `nodemailer` transport, one `sendMail()` call with a plain-text body. Clear note: "I left out unsubscribe logic, HTML templates, and delivery tracking — add any of these?"

**This is a strong case for both skills.** The task is complex enough that both axes (strategy and scope) have real work to do.

### Conflicts / Redundancy

One subtle tension: think-twice might recommend a fully-featured email service (SendGrid/Mailgun with their SDKs) on the grounds that those services handle deliverability, unsubscribe, and tracking "for free." surgical then has to fight harder — the SendGrid SDK enables those features and Claude may feel compelled to use them since they're in the SDK.

This is a mild conflict: think-twice pointing to a feature-rich library can increase the surface area that surgical has to trim. Not a fundamental problem, but worth noting: if think-twice recommends a library, surgical should apply equally strictly regardless of what the library enables.

**Verdict: Strong complementarity with one caveat — feature-rich libraries recommended by think-twice create more surgical work.**

---

## Scenario 5: "Implement rate limiting on the login endpoint"

### Baseline (no skills)

Claude builds:
- A custom in-memory store with sliding window algorithm
- IP tracking and block list
- Progressive delay logic
- CAPTCHA integration hook
- Account lockout after N failures
- Redis adapter for multi-instance support

Security tasks trigger Claude's defensive instincts hardest. Baseline output is maximally complete.

### With think-twice only

think-twice fires on "rate limiting" immediately — `express-rate-limit` is the obvious answer, explicitly in the domain of "standard library for that domain." 

Claude recommends and installs `express-rate-limit`. Sets up `windowMs`, `max`, and the handler. 10 lines.

**But then**: Claude may add IP blocking (think-twice doesn't prevent this — it's security-related and could be rationalized as "necessary"), account lockout, and CAPTCHA hooks. think-twice Question 3 asks "does the user need all of this?" — for security, Claude's answer is often "yes, they do, they just don't know it yet."

think-twice has an explicit escape hatch: "When NOT to be lazy — correctness requires it: security-critical code needs a vetted internal implementation." Rate limiting touches security, so think-twice may partially stand down. This is the right behavior on the strategy level (use `express-rate-limit`, not scratch) but it can leave scope unchecked.

### With surgical only

surgical fires before "add IP blocking." Did the user ask for it? No. Strips it. Same for CAPTCHA, account lockout. But Claude still implements rate limiting from scratch — surgical doesn't prevent that.

### With both skills

Pipeline:
1. think-twice: "`express-rate-limit` — don't implement sliding window manually"
2. surgical: "no IP blocking, no CAPTCHA, no account lockout — just the rate limit"

Result: `express-rate-limit` on the login route. `windowMs: 15 * 60 * 1000`, `max: 10`. Applied as middleware. 8 lines. Note: "IP blocking and account lockout not included — want either?"

**Important edge case**: surgical correctly trims extras even after think-twice redirected to a library. The pipeline holds. think-twice does not short-circuit surgical.

### Conflicts / Redundancy

One structural tension: think-twice's security escape hatch ("security-critical code needs a vetted internal implementation") does not mean security-adjacent *features* are all in scope. think-twice fires correctly on the implementation choice (library vs. scratch). surgical fires correctly on the feature set (rate-limit-only vs. full auth hardening). 

There's no conflict, but there's a potential for Claude to misread think-twice's security exception as permission to add all security-adjacent features. That's a misapplication of think-twice's exception clause, not a skill conflict.

**Verdict: Combination works cleanly. surgical correctly operates on think-twice's output without interference.**

---

## Cross-Cutting Findings

### Where they complement each other (clearly additive)

| Scenario | think-twice contribution | surgical contribution | Combined gain |
|---|---|---|---|
| Auth | Redirects to Passport | Strips roles/2FA/audit logs | Both needed |
| Search (500 items) | Redirects to Fuse.js | Strips filters/facets/analytics | Strongest case |
| Cron + email | Redirects to node-cron + nodemailer | Strips templates/unsubscribe/tracking | Both needed |
| Rate limiting | Redirects to express-rate-limit | Strips IP blocking/CAPTCHA/lockout | Both needed |

### Where they overlap (mild redundancy, not conflict)

think-twice Question 3 ("Am I doing too much? Does the user need all of this?") covers the same ground as surgical's entire rule set. In practice:

- think-twice applies this at **task planning** level — "should I build feature X at all?"
- surgical applies this at **code block** level — "should I write this specific function?"

The levels are different enough that the overlap is not redundant in practice. think-twice catches strategic scope creep (building a search engine instead of using Fuse.js). surgical catches tactical scope creep (adding analytics to a Fuse.js integration). Both checks are needed.

If anything, the redundancy is healthy: a broad check at planning time, a narrow check at writing time. Defense in depth.

### Where they diverge (covering each other's blind spots)

- think-twice does not reliably prevent feature-level scope creep within a chosen library
- surgical does not redirect toward simpler tools or challenge the chosen approach
- They need each other for high-complexity tasks with both strategy and scope risk

### False positive risk

| Scenario complexity | think-twice false positive | surgical false positive | Combined |
|---|---|---|---|
| One-line fix (typo) | Low — "feels heavy" gate works | Very low — explicit trigger list | Low-moderate |
| Medium task | Very low | Very low | Negligible |
| Large task | Not applicable — correct to fire | Not applicable — correct to fire | — |

The one concern for small tasks: if implementations add verbose "running think-twice check..." meta-commentary for tasks where the check finds nothing, that's noise. The skills should fire silently when they find nothing actionable.

### Feature-rich libraries: one conflict to watch

When think-twice recommends a feature-rich library (SendGrid SDK, Auth0 SDK), the library itself surfaces more potential features than a minimal implementation would. surgical has to do more work, and Claude may feel the features are "enabled" by the library choice. 

Recommendation: surgical should apply regardless of library capability. "The library supports it" is not a reason to build it.

---

## Summary Verdict

**Do they complement? Yes, clearly.** They operate at different execution layers (planning vs. writing) and catch different classes of overengineering (wrong tool vs. too many features with the right tool).

**Do they conflict? No.** In all five scenarios, think-twice output feeds cleanly into surgical's input. No case where one skill undermined the other.

**Do they create confusion? Marginally, for small tasks.** Two skills with overlapping trigger descriptions may both fire (or both try to fire) on trivial tasks. The risk is meta-commentary noise, not wrong answers.

**Is the combination better than either alone?** Yes, for any task above trivial complexity. The two axes — *what approach* (think-twice) and *how much of that approach* (surgical) — are independent. A task can fail on either axis independently. You need both skills active to catch both failure modes.

**Recommendation:** Run both by default for feature-level tasks. For one-line fixes, the skills should correctly abstain — but watch for verbose self-commentary as an anti-pattern in implementation.
