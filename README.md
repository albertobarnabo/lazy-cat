<div align="center">

# think-twice

### *Before you work hard, make sure you can't work smart.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-blueviolet)](https://claude.ai/code)
[![Version](https://img.shields.io/badge/version-2.0.0-orange)](https://github.com/albertobarnabo/think-twice)
[![Works with Cursor](https://img.shields.io/badge/Cursor-compatible-blue)](https://cursor.sh)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-compatible-green)](https://github.com/openai/codex)
[![Tokens saved](https://img.shields.io/badge/tokens%20saved-up%20to%2099%25-brightgreen)](#token-cost-at-a-glance)

<br/>

> *"A great engineer is a lazy engineer. They find the clever shortcut."* — Steve Jobs

**think-twice** is a Claude Code plugin with five skills — one for each moment where tokens get wasted.

</div>

---

## The Problem: AI Agents Are Greedy

LLMs default to the most obvious path. When given a task, they start executing immediately — thoroughly, from scratch, at full cost — without stopping to ask whether a better approach exists.

This greediness wastes tokens on work that didn't need to happen, implementations that could've been one-liners, plans that should've been aligned before the first keystroke, and prose that restates what the diff already shows.

**The fix is one beat of reflection — at every stage.**

---

## Five Skills, Five Moments

Token waste happens at five distinct moments. Each skill targets exactly one.

```
User request arrives
       │
       ▼
[clarify-first] ── ambiguous fork? ──────────► ask one question, save the redo
       │
       ▼
[plan-gate] ── 3+ files or unclear arch? ────► write plan, wait for approval
       │
       ▼
[think-twice] ── expensive approach? ────────► find cheaper path first
       │
       ▼
[scope-guard] ── writing code ───────────────► match scope exactly to request
       │
       ▼
[minimal-prose] ── writing response ─────────► cut every unnecessary sentence
```

| Skill | Fires when | What it prevents |
|---|---|---|
| **think-twice** | Before picking an approach | Reaching for a complex implementation when an API, package, or one-liner already exists |
| **scope-guard** | Before writing code | Adding error handling, abstractions, and tests nobody asked for |
| **clarify-first** | Before assuming | Picking one interpretation of an ambiguous task, building the wrong thing, having to redo it |
| **plan-gate** | Before a complex task | Diving into a multi-file implementation without alignment, building the wrong architecture |
| **minimal-prose** | On every response | Wrapping answers in preambles, summaries, and narration that add no information |

---

## Token Cost at a Glance

| Task | Greedy | Smart | Saved | Multiplier |
|---|---|---|---|---|
| City autocomplete (worldwide) | ~201,000 tokens | ~400 tokens | ~200,600 | **500x** |
| 500 fake staging user profiles | ~50,500 tokens | ~200 tokens | ~50,300 | **250x** |
| Live currency conversion | ~5,500 tokens | ~350 tokens | ~5,150 | **16x** |
| PDF invoice generation | ~6,000 tokens | ~650 tokens | ~5,350 | **9x** |
| Sliding window rate limiter | ~3,500 tokens | ~300 tokens | ~3,200 | **12x** |

---

## Real-World Examples

These were tested by running each scenario through the skill checklist and comparing both paths.

<details>
<summary><strong>"Build city autocomplete for our shipping form — all major cities worldwide"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Hardcodes 10,000 cities as a JSON array | `npm install world-cities` + 25-line component |
| **Tokens** | ~201,000 | ~400 — **500x fewer** |
| **Accuracy** | Frozen at generation time | 130,000 cities, maintained upstream |
| **Diacritics** | Broken (Córdoba, Zürich fail) | Handled |
| **Bundle size** | +1.6MB raw data | +1.2MB gzipped |
| **Checkpoint fired** | — | Checkpoint 2 — existing package |

</details>

<details>
<summary><strong>"Generate 500 realistic user profiles for our staging database"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Writes 500 JSON records inline | 15-line `faker` script, seeded |
| **Tokens** | ~50,500 | ~200 — **250x fewer** |
| **Data quality** | Repetitive (~30 names recycled) | Statistically varied, 50+ locales |
| **Bcrypt hashes** | Structurally valid, not login-usable | Real, login-usable |
| **Re-runnability** | Zero — ephemeral output | Parameterized, version-controlled |
| **Checkpoints fired** | — | Checkpoint 3 (scope) + Checkpoint 2 (faker) |

</details>

<details>
<summary><strong>"Add live currency conversion to our checkout — we sell in 15 countries"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Hardcodes ~150 exchange rate pairs | Open Exchange Rates API, cached hourly |
| **Tokens** | ~5,500 | ~350 — **16x fewer** |
| **Rate accuracy** | Stale from the moment it's written | Always live |
| **Coverage** | Incomplete, manually curated | 170+ currencies, maintained |
| **Architecture** | Rates baked into code | Cron job + cache, rates never in repo |
| **Checkpoints fired** | — | Checkpoint 1 (right problem?) + Checkpoint 2 (API) |

</details>

<details>
<summary><strong>"Generate branded PDF invoices — logo, line items, totals, payment terms. Node.js."</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | 300–500 lines of PDFKit coordinate arithmetic | `pdfmake` declarative document definition |
| **Tokens** | ~6,000 | ~650 — **9x fewer** |
| **Pagination** | Manual — added after first bug report | Automatic |
| **Cell overflow** | Manual — added after first bug report | Automatic |
| **Lines of code** | 300–500 | ~40 |
| **Checkpoint fired** | — | Checkpoint 2 — existing package |

</details>

<details>
<summary><strong>"Implement rate limiting — 100 req per 15-min sliding window, per user per endpoint"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Custom Redis sorted sets + Lua script | `rate-limiter-flexible` or `express-rate-limit` |
| **Tokens** | ~3,500 | ~300 — **12x fewer** |
| **Lines of code** | ~250 | 5–15 |
| **Clock skew handling** | Manual (commonly missed) | Built-in |
| **Redis failopen** | Manual (commonly missed) | Built-in |
| **Rate-limit headers** | Manual | Automatic |
| **Checkpoints fired** | — | Checkpoint 1 (sliding vs fixed?) + Checkpoint 2 (package) + Checkpoint 4 (simpler approach) |

</details>

---

## Examples — New Skills

<details>
<summary><strong>scope-guard: "Fix the off-by-one error in parse_date"</strong></summary>
<br/>

| | Without scope-guard | With scope-guard |
|---|---|---|
| **Output** | Bug fix + input validation + docstring + 3 unit tests + variable renames | The off-by-one fix, nothing else |
| **Tokens** | ~800 | ~120 — **7x fewer** |
| **Reviewability** | User must audit changes they never requested | User reviews exactly what they asked for |

Result: `"Fixed the off-by-one on line 14. Didn't add tests or validation — let me know if you want those."`

</details>

<details>
<summary><strong>clarify-first: "Add authentication to the app"</strong></summary>
<br/>

| | Without clarify-first | With clarify-first |
|---|---|---|
| **Approach** | Builds full JWT middleware across 5 files | Asks one question first |
| **Tokens** | ~4,500 (wrong implementation, full redo) | ~15 for the question + ~1,200 for the right implementation |
| **Outcome** | User replies "we use Passport sessions, this is wrong" | User replies "sessions" → correct code on first attempt |

Question asked: `"Before I start: JWT tokens or server-side sessions? The middleware and storage differ completely."`

</details>

<details>
<summary><strong>plan-gate: "Refactor the user service to support multi-tenancy"</strong></summary>
<br/>

| | Without plan-gate | With plan-gate |
|---|---|---|
| **First action** | Starts touching 8 files immediately | Writes a 5-step plan, waits for approval |
| **Tokens before alignment** | ~6,000 (wrong architecture, partial redo) | ~200 for the plan |
| **Outcome** | User says "that's not what I meant by multi-tenancy" at line 400 | User redirects at line 0 |

Plan written:
```
1. Add tenant_id column to users — migration in db/migrations/
2. Add TenantMiddleware in src/middleware/tenant.ts — reads header, attaches to req
3. Scope all User queries in src/services/user.ts to req.tenantId
4. Update src/routes/auth.ts to pass tenantId through login flow
5. Add cross-tenant isolation test in tests/tenant.test.ts

Anything to change before I start?
```

</details>

<details>
<summary><strong>minimal-prose: "What does Array.flat() do?"</strong></summary>
<br/>

| | Without minimal-prose | With minimal-prose |
|---|---|---|
| **Response** | "Great question! `Array.flat()` is a very useful JavaScript method introduced in ES2019. Let me explain... In summary, it's a powerful tool for working with nested arrays." | Flattens a nested array one level deep. `[1, [2, 3]].flat() // [1, 2, 3]` |
| **Tokens** | ~120 | ~25 — **5x fewer** |
| **Information** | Identical | Identical |

</details>

---

## Install

**Via Claude Code plugin system** (recommended):
```
/plugin install albertobarnabo/think-twice
```

**One-liner curl** (installs all five skills):
```bash
BASE="https://raw.githubusercontent.com/albertobarnabo/think-twice/main/skills"
for skill in think-twice scope-guard clarify-first plan-gate minimal-prose; do
  curl -sL "$BASE/$skill/SKILL.md" -o ~/.claude/skills/$skill/SKILL.md --create-dirs
done
```

**Single skill only:**
```bash
curl -sL https://raw.githubusercontent.com/albertobarnabo/think-twice/main/skills/think-twice/SKILL.md \
  -o ~/.claude/skills/think-twice/SKILL.md --create-dirs
```

Skills load automatically when relevant — no slash commands needed.

**Explicit commands** (when you want to force a skill manually):

| Command | What it does |
|---|---|
| `/think-twice:think-twice <task>` | Force the checklist on a specific task |
| `/think-twice:plan-gate <task>` | Write a plan and wait for approval before any code |
| `/think-twice:clarify-first <task>` | Surface the single most important ambiguity before starting |
| `/think-twice:scope-guard <task>` | Implement with zero scope creep — exactly what was asked |
| `/think-twice:minimal-prose <question>` | Get a direct answer with no preamble or filler |

Commands and skills complement each other: skills fire automatically in the background, commands let you invoke the same behavior explicitly when you need it.

---

## When NOT to apply these skills

| Situation | Why to override |
|---|---|
| Security-critical code | Needs a vetted, audited internal implementation — not a shortcut |
| Latency-sensitive hot path | A runtime API call adds unacceptable delay |
| Offline-first / zero-dependency env | External solutions not allowed |
| The shortcut is overkill | Don't add a library for 5 lines of trivial code |
| User provided a full spec | No need to plan-gate or clarify-first when scope is already locked |

In all cases, Claude proceeds — but **states why** it's not applying the skill.

---

## The Idea

Productive laziness is a principle in both engineering and human performance: the best workers aren't the ones who work the hardest — they're the ones who identify the clever path and take it.

These five skills give Claude that instinct — not just before picking an approach, but at every stage where tokens get wasted: before assuming, before planning, before coding, and before writing.

> *The best code is code you didn't write. The best tokens are tokens you didn't spend.*

---

## Contributing

Found a pattern where Claude defaults to the greedy approach? Open a PR:
- Add a shortcut to an existing skill's table
- Propose a new skill with a clear trigger and a before/after example
- Share a real token-cost comparison

---

<div align="center">

MIT License

</div>
