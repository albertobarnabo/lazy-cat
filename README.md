<div align="center">

# lean

### *The best tokens are the ones you never spent.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-blueviolet)](https://claude.ai/code)
[![Version](https://img.shields.io/badge/version-2.0.0-orange)](https://github.com/albertobarnabo/lean)
[![Works with Cursor](https://img.shields.io/badge/Cursor-compatible-blue)](https://cursor.sh)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-compatible-green)](https://github.com/openai/codex)
[![Tokens saved](https://img.shields.io/badge/tokens%20saved-up%20to%20178x-brightgreen)](#token-cost-at-a-glance)

<br/>

> *"A great engineer is a lazy engineer. They find the clever shortcut."* — Steve Jobs

**lean** is a Claude Code plugin that gives your AI the instinct great engineers are known for:<br/>pause before working hard, and make sure you can't work smart instead.

</div>

---

## The Problem: AI Agents Are Wasteful

Lean manufacturing has a word for unnecessary work: *muda*. Waste. Toyota built the world's most efficient production system by obsessing over eliminating it.

AI agents have a muda problem. Given any task, Claude charges ahead with the most obvious implementation — thorough, from scratch, at full cost — without stopping to ask: *is there a smarter path?* And once it's writing, it adds everything it can think of: error handling, tests, abstractions, refactors — none of which was asked for.

The result: thousands of unnecessary tokens. Work that didn't need to happen. Waste.

**lean fixes this at the only two moments that matter.**

---

## Two Skills. Two Moments.

| Skill | When it fires | What it prevents |
|---|---|---|
| [**think-twice**](skills/think-twice/) | Before picking an approach | Implementing from scratch when an API, package, or one-liner already exists |
| [**surgical**](skills/surgical/) | Before writing each block | Adding error handling, tests, and abstractions nobody asked for |

think-twice asks: *is there a smarter path?*
surgical asks: *did the user actually ask for this?*

Together they enforce lean at every level — strategy and execution.

---

## Token Cost at a Glance

Ask Claude to generate 500 staging user profiles. Without lean, it writes every profile inline — all 500, field by field, 66,320 tokens of output. With lean, it writes a 54-line faker script instead. 372 tokens.

> **Without lean:** ~66,320 tokens — about **$1.00** at Claude Sonnet API pricing.
> **With lean:** ~372 tokens — about **half a cent.**
> Same result. 178× the cost.

That's not an edge case. That's the default behavior of every AI that hasn't been taught to think first.

| Task | Greedy | Lean | Multiplier |
|---|---|---|---|
| 500 fake user profiles | ~66,320 tok | ~372 tok | **178×** |
| Bug fix — parse_date | ~962 tok | ~61 tok | **16×** |
| Live currency conversion | ~1,795 tok | ~134 tok | **13×** |
| City autocomplete | ~2,460 tok | ~410 tok | **6×** |
| Rate limiter — sliding window | ~2,152 tok | ~414 tok | **5×** |
| PDF invoice generation | ~4,281 tok | ~2,281 tok | **2×** |

These six tasks — a normal vibe-coding afternoon — cost **77,970 tokens greedy vs. 3,672 tokens lean**. That's a $1.10 difference, every time, without changing a single prompt.

*Real outputs from 11 independent test agents. Full code, character-counted. Each scenario tested think-twice only, surgical only, and both — to show which skill drives savings and when one beats the other. [Three-way breakdown →](tests/summary.md)*

---

## Real-World Examples

<details>
<summary><strong>"Build city autocomplete for our shipping form — all major cities worldwide"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Approach** | Hardcodes cities as a static array | `npm install world-cities` + 40-line component |
| **Tokens** | ~2,460 (175 cities) | ~410 — **6x fewer** |
| **Accuracy** | Frozen at generation time | 23,000 cities from GeoNames, maintained upstream |
| **Diacritics** | Broken (Córdoba, Zürich fail) | Handled |
| **Checkpoint** | — | think-twice #2 — existing package |

</details>

<details>
<summary><strong>"Generate 500 realistic user profiles for our staging database"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Approach** | Writes 500 JSON records inline | 54-line `@faker-js/faker` script, parameterized |
| **Tokens** | ~66,320 | ~372 — **178x fewer** |
| **Data quality** | Repetitive (~30 names recycled) | Statistically varied, 50+ locales |
| **Bcrypt hashes** | Fake hashes — not login-usable | Real hashes — login-usable |
| **Re-runnability** | Zero — ephemeral output | Seeded, version-controlled, `--count` flag |
| **Checkpoints** | — | think-twice #2 (faker) + #3 (500 static = wrong shape) |

</details>

<details>
<summary><strong>"Add live currency conversion to our checkout — we sell in 15 countries"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Approach** | Hardcodes 60+ exchange rate pairs | Frankfurter free API + hourly in-memory cache |
| **Tokens** | ~1,795 | ~134 — **13x fewer** |
| **Rate accuracy** | Stale from the moment it's written | Always live |
| **Coverage** | Incomplete, manually curated | 170+ currencies, ECB-maintained |
| **Architecture** | Rates baked into code | Fetched at runtime, never in repo |
| **Checkpoints** | — | think-twice #2 (API exists) + #5 (lazy fetch) |

</details>

<details>
<summary><strong>"Generate branded PDF invoices — logo, line items, totals, payment terms"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Approach** | ~310 lines of PDFKit coordinate arithmetic | `pdfmake` declarative document definition |
| **Tokens** | ~4,281 | ~2,281 — **2x fewer** |
| **Pagination** | Manual — added after first bug report | Automatic |
| **Cell overflow** | Manual — added after first bug report | Automatic |
| **`y` cursor** | Tracked manually through every section | Does not exist |
| **Checkpoint** | — | think-twice #2 — existing package |

</details>

<details>
<summary><strong>"Implement rate limiting — 100 req per 15-min sliding window, per user per endpoint"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Approach** | Custom Redis sorted sets + Lua atomicity script | `rate-limiter-flexible` |
| **Tokens** | ~2,152 | ~414 — **5x fewer** |
| **Lines of code** | ~250 | ~18 |
| **Clock skew handling** | Manual (commonly missed) | Built-in |
| **Redis failopen** | Manual (commonly missed) | Built-in |
| **Rate-limit headers** | Manual | Automatic |
| **Checkpoints** | — | think-twice #2 (library) + #4 (simpler approach) |

</details>

<details>
<summary><strong>"Fix the off-by-one error in parse_date"</strong></summary>
<br/>

| | Greedy | Lean |
|---|---|---|
| **Output** | Bug fix + type annotations + input validation + docstring + 13 unit tests + logging | The one-line fix, nothing else |
| **Tokens** | ~962 | ~61 — **16x fewer** |
| **Reviewability** | User must audit 3,847 chars they never requested | User reviews exactly what they asked for |

Result: *"Fixed the off-by-one on line 5 — removed the `+ 1`. Didn't add validation or tests; let me know if you want those."*

</details>

---

## Install

**Via Claude Code plugin system** (recommended):
```
/plugin install albertobarnabo/lean
```

**One-liner curl** (installs both skills):
```bash
BASE="https://raw.githubusercontent.com/albertobarnabo/lean/main/skills"
for skill in think-twice surgical; do
  curl -sL "$BASE/$skill/SKILL.md" -o ~/.claude/skills/$skill/SKILL.md --create-dirs
done
```

**Single skill only:**
```bash
# think-twice only
curl -sL https://raw.githubusercontent.com/albertobarnabo/lean/main/skills/think-twice/SKILL.md \
  -o ~/.claude/skills/think-twice/SKILL.md --create-dirs

# surgical only
curl -sL https://raw.githubusercontent.com/albertobarnabo/lean/main/skills/surgical/SKILL.md \
  -o ~/.claude/skills/surgical/SKILL.md --create-dirs
```

Skills fire automatically when relevant — no slash commands needed.

**Explicit commands** (force a skill on a specific task):

| Command | What it does |
|---|---|
| `/lean:think-twice <task>` | Run the full lean checklist before starting |
| `/lean:surgical <task>` | Implement with zero scope creep — exactly what was asked |

---

## When NOT to apply

These skills are not dogma. Override them when:

| Situation | Why to override |
|---|---|
| Security-critical code | Always use stdlib or a widely-audited library — never a shortcut |
| Latency-sensitive hot path | A runtime API call adds unacceptable delay |
| Offline-first / zero-dependency env | External solutions not available |
| The shortcut is the overkill | Don't add a library for 5 trivial lines |
| You explicitly asked for extras | surgical doesn't apply when scope expansion is the request |

In all cases, Claude proceeds — and **states why** it's overriding.

---

## The Philosophy

Lean thinking is not about doing less carelessly. It's about doing *exactly what creates value* — and cutting everything else before it costs you.

Steve Jobs wasn't romanticizing laziness. He was describing the highest form of engineering judgment: the discipline to stop before the obvious path, find the clever one, and take only that.

Most AI coding tools optimize for *doing more*. They generate thoroughly, completely, defensively — because generating is what they're good at.

lean optimizes for *doing right*. Two questions, two moments, before the tokens flow:

> *Is there a smarter path?*
> *Is this exactly what was asked?*

That's it. The rest follows.

---

## Contributors

- [@albertobarnabo](https://github.com/albertobarnabo) — author
- [@ayoubighissou99](https://github.com/ayoubighissou99) — co-author

---

## Contributing

Found a new waste pattern — a task where Claude defaults to the expensive path when a better one exists? Open a PR:

- A new shortcut row in an existing skill's table
- A new skill for a pattern not yet covered
- A real token-cost comparison from your own usage

The best contributions, like the best code, are the ones that do exactly what's needed — nothing more.

---

<div align="center">

MIT License

</div>
