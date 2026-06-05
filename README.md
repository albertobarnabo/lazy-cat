<div align="center">

# think-twice

### *Before you work hard, make sure you can't work smart.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-blueviolet)](https://claude.ai/code)
[![Works with Cursor](https://img.shields.io/badge/Cursor-compatible-blue)](https://cursor.sh)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-compatible-green)](https://github.com/openai/codex)
[![Tokens saved](https://img.shields.io/badge/tokens%20saved-up%20to%2099%25-brightgreen)](#token-cost-at-a-glance)

<br/>

> *"A great engineer is a lazy engineer. They find the clever shortcut."* — Steve Jobs

**Caveman** makes Claude talk less. **Superpowers** makes Claude think first.  
**think-twice** makes Claude ask *"is there a smarter way?"* before doing anything expensive.

</div>

---

## The Problem: AI Agents Are Greedy

LLMs default to the most obvious path. When given a task, they start executing immediately — thoroughly, from scratch, at full cost — without stopping to ask whether a better approach exists.

This greediness wastes tokens on work that didn't need to happen, implementations that could've been one-liners, and complexity that could've been avoided entirely.

**The fix is one beat of reflection before execution.**

---

## What This Skill Does

`think-twice` forces Claude to pause before any heavy task and climb a checklist — stopping the moment a smarter path is found:

```
┌─────────────────────────────────────────────────────────┐
│  🛑  About to do something expensive?  Think twice.     │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │  Am I solving the right problem?   │ ──✓──▶ Clarify first, save everything else
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  Does an existing solution exist?  │ ──✓──▶ API / package / dataset / stdlib
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  Am I doing more than needed?      │ ──✓──▶ Reduce scope, YAGNI
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  Is there a simpler approach?      │ ──✓──▶ Reframe the problem
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  Can it be done lazily / on-demand?│ ──✓──▶ Defer, paginate, memoize
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  ✅ Proceed — minimum scope only   │
         └────────────────────────────────────┘
```

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

## Install

**One-liner** — works with Claude Code, Cursor, Codex CLI, Gemini CLI:
```bash
curl -sL https://raw.githubusercontent.com/albertobarnabo/think-twice/main/SKILL.md \
  -o ~/.claude/skills/think-twice/SKILL.md --create-dirs
```

**Or clone and copy manually:**
```bash
git clone https://github.com/albertobarnabo/think-twice
cp think-twice/SKILL.md ~/.claude/skills/think-twice/SKILL.md
```

Then invoke before any heavy task:
```
/think-twice I need to implement full-text search across 10,000 records
```

---

## When NOT to think twice

| Situation | Why to override |
|---|---|
| Security-critical code | Needs a vetted, audited internal implementation |
| Latency-sensitive hot path | A runtime call adds unacceptable delay |
| Offline-first / zero-dependency env | External solutions not allowed |
| The shortcut is overkill | Don't add a library for 5 lines of trivial code |

In all cases, Claude proceeds — but **states why** it's not taking the smart path.

---

## The Idea

Productive laziness is a principle in both engineering and human performance: the best workers aren't the ones who work the hardest — they're the ones who identify the clever path and take it.

`think-twice` gives Claude that instinct. One beat of reflection before execution. That beat is the difference between a solution that costs 50,000 tokens and one that costs 50.

> *The best code is code you didn't write. The best tokens are tokens you didn't spend.*

---

## Contributing

Found a pattern where Claude defaults to the greedy approach? Open a PR adding it to the shortcuts table in [`SKILL.md`](./SKILL.md).

---

<div align="center">

MIT License

</div>
