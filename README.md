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

**think-twice** is a Claude Code plugin with two skills — one beat of reflection before picking an approach, and one guardrail against scope creep during implementation.

</div>

---

## The Problem: AI Agents Are Greedy

LLMs default to the most obvious path. When given a task, they start executing immediately — thoroughly, from scratch, at full cost — without stopping to ask whether a better approach exists. And once they're writing, they add everything they can think of: error handling, tests, abstractions, refactors — none of which was asked for.

**Two moments, two fixes.**

---

## Two Skills

| Skill | Fires when | What it prevents |
|---|---|---|
| **think-twice** | Before picking an approach | Reaching for a complex implementation when an API, package, or one-liner already exists |
| **scope-guard** | Before writing code | Adding error handling, abstractions, and tests nobody asked for |

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

## scope-guard in Action

<details>
<summary><strong>"Fix the off-by-one error in parse_date"</strong></summary>
<br/>

| | Without scope-guard | With scope-guard |
|---|---|---|
| **Output** | Bug fix + input validation + docstring + 3 unit tests + variable renames | The off-by-one fix, nothing else |
| **Tokens** | ~800 | ~120 — **7x fewer** |
| **Reviewability** | User must audit changes they never requested | User reviews exactly what they asked for |

Result: `"Fixed the off-by-one on line 14. Didn't add tests or validation — let me know if you want those."`

</details>

---

## Install

**Via Claude Code plugin system** (recommended):
```
/plugin install albertobarnabo/think-twice
```

**One-liner curl** (installs both skills):
```bash
BASE="https://raw.githubusercontent.com/albertobarnabo/think-twice/main/skills"
for skill in think-twice scope-guard; do
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
| `/think-twice:scope-guard <task>` | Implement with zero scope creep — exactly what was asked |

Commands and skills complement each other: skills fire automatically in the background, commands let you invoke the same behavior explicitly when you need it.

---

## When NOT to apply these skills

| Situation | Why to override |
|---|---|
| Security-critical code | Needs a vetted, audited internal implementation — not a shortcut |
| Latency-sensitive hot path | A runtime API call adds unacceptable delay |
| Offline-first / zero-dependency env | External solutions not allowed |
| The shortcut is overkill | Don't add a library for 5 lines of trivial code |
| Scope expansion was explicitly requested | No need for scope-guard when the user asked for extras |

In all cases, Claude proceeds — but **states why** it's not applying the skill.

---

## The Idea

Productive laziness is a principle in both engineering and human performance: the best workers aren't the ones who work the hardest — they're the ones who identify the clever path and take it.

These two skills give Claude that instinct: once before picking an approach, and once before writing code.

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
