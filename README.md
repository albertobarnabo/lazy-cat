<div align="center">

# 🧠 lazy-agent

### *Before you work hard, make sure you can't work smart.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-blueviolet)](https://claude.ai/code)
[![Works with Cursor](https://img.shields.io/badge/Cursor-compatible-blue)](https://cursor.sh)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-compatible-green)](https://github.com/openai/codex)
[![Tokens saved](https://img.shields.io/badge/tokens%20saved-up%20to%2099%25-brightgreen)](#-token-cost-at-a-glance)

<br/>

> *"A great engineer is a lazy engineer. They find the clever shortcut."* — Steve Jobs

**Caveman** makes Claude talk less. **Superpowers** makes Claude think first.  
**lazy-agent** makes Claude ask *"is there a smarter way?"* before doing anything expensive.

</div>

---

## 🔥 The Problem: AI Agents Are Greedy

LLMs default to the most obvious path. When given a task, they start executing immediately — thoroughly, from scratch, at full cost — without pausing to ask whether a better approach exists.

This greediness wastes tokens on work that didn't need to happen, implementations that could've been one-liners, and complexity that could've been avoided entirely.

**The fix is one beat of reflection before execution.**

---

## 💡 What This Skill Does

`lazy-agent` forces Claude to pause before any heavy task and run a checklist:

```
┌─────────────────────────────────────────────────────────┐
│  🛑  About to do something expensive?  Run this first.  │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │  Am I solving the right problem?   │ ──✓──▶ Clarify first, then proceed
         └─────────────────┬──────────────────┘
                           │ ✗
         ┌─────────────────▼──────────────────┐
         │  Does an existing solution exist?  │ ──✓──▶ API / package / dataset
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
         │  Proceed — minimum scope only      │
         └────────────────────────────────────┘
```

Stop at the first checkpoint that reveals a better path.

---

## 💸 Token Cost at a Glance

| Task | Greedy approach | Lazy approach | Saved |
|---|---|---|---|
| Country selector with ISO codes | Hardcoded JSON, written by hand | `i18n-iso-countries` package | **~12,000 tokens** |
| JWT auth flow | Custom implementation from scratch | `jsonwebtoken` / NextAuth | **~18,000 tokens** |
| 500 fake user records | Written out one by one | `faker` — 2 lines | **~30,000 tokens** |
| Timezone data for a scheduler | Full IANA lookup table, hardcoded | `moment-timezone` | **~20,000 tokens** |
| Fuzzy search | Custom Levenshtein algorithm | `fuse.js` | **~8,000 tokens** |

---

## 🔎 Real-World Examples

<details>
<summary><strong>"Add a country selector to the form"</strong></summary>
<br/>

**Greedy:** Writes all 195 countries with names, ISO codes, phone prefixes as a hardcoded array. ~12,000 tokens.

**Lazy:** `npm install i18n-iso-countries` — 4KB package, done in 2 lines.

</details>

<details>
<summary><strong>"Set up user authentication"</strong></summary>
<br/>

**Greedy:** Implements token signing, expiry, refresh, and error handling from scratch across 300+ lines. ~18,000 tokens.

**Lazy:** `npm install jsonwebtoken` or `pip install PyJWT`. Full flow with NextAuth in minutes.

</details>

<details>
<summary><strong>"Generate test data for the staging environment"</strong></summary>
<br/>

**Greedy:** Writes hundreds of user records manually — names, emails, addresses varied by hand. ~30,000 tokens.

**Lazy:** `from faker import Faker` — realistic, locale-aware data in 2 lines.

</details>

<details>
<summary><strong>"Build a search feature"</strong></summary>
<br/>

**Greedy:** Implements Levenshtein distance, scoring, and ranking from scratch. ~8,000 tokens.

**Lazy:** `fuse.js` or `minisearch` — battle-tested, drop-in, took years to tune.

</details>

<details>
<summary><strong>"We need pagination for this list"</strong></summary>
<br/>

**Greedy:** Loads and renders all records, then slices client-side. Expensive, fragile.

**Lazy:** Fetches only the visible page. Defers the rest until actually needed.

</details>

---

## 🚀 Install

**Claude Code**
```bash
claude skills install lazy-agent
```

**Manual** — works with Claude Code, Cursor, Codex CLI, Gemini CLI:
```bash
# Claude Code
cp SKILL.md ~/.claude/skills/lazy-agent/SKILL.md

# Cursor
cp SKILL.md ~/.cursor/skills/lazy-agent/SKILL.md
```

Then invoke before any heavy task:
```
/lazy-agent I need to implement full-text search across 10,000 records
```

---

## 🚫 When NOT to be lazy

| Situation | Why to override |
|---|---|
| Security-critical code | Needs a vetted, audited implementation |
| Latency-sensitive hot path | Runtime API call adds unacceptable delay |
| Offline-first / zero-dependency env | No external solutions allowed |
| The shortcut is overkill | Don't add a library for 5 lines of trivial code |

In all cases, Claude proceeds — but **states why** it's not taking the lazy path.

---

## 💡 The Idea

Productive laziness is a principle in both engineering and human performance: the best workers aren't the ones who work the hardest — they're the ones who identify the clever path and take it.

`lazy-agent` gives Claude that instinct. One beat of reflection before execution. That beat is the difference between a solution that costs 50,000 tokens and one that costs 50.

> *The best code is code you didn't write. The best tokens are tokens you didn't spend.*

---

## 🤝 Contributing

Found a pattern where Claude defaults to the greedy approach? Open a PR adding it to the shortcuts table in [`SKILL.md`](./SKILL.md).

---

<div align="center">

MIT License · Made with 💤 and good taste

</div>
