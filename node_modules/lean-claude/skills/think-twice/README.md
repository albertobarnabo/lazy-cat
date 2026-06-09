# think-twice

> Forces Claude to pause before any high-cost task and ask: "Is there a cleverer, cheaper way to do this?"

Part of the **lean** plugin — [albertobarnabo/lean](https://github.com/albertobarnabo/lean)

---

## What it does

LLMs default to the most obvious path. Given "generate 500 realistic user profiles for staging", Claude will write 500 inline JSON objects — when a 54-line faker script would do it in 178x fewer tokens, with better data quality.

think-twice rewires that instinct. Before any expensive implementation, Claude runs a 6-checkpoint checklist to find the cheap path first.

---

## The 6 Checkpoints

1. **Am I solving the right problem?** — Fully understood, or assuming?
2. **Is there an existing solution?** — Public API, npm/pip package, open dataset, stdlib?
3. **Am I doing too much?** — Does the user need all of this, or just a slice?
4. **Is my approach the most direct?** — Simpler data structure? One-liner replacement?
5. **Can I do this lazily?** — Generate on demand, paginate, cache, render visible-only?
6. **Only then: proceed** — Commit to the minimum that solves the problem today.

If any checkpoint reveals a better path — take it. Explain what was chosen and why.

---

## Token Savings

Measured from full code outputs, character-counted by independent test agents.

| Task | Without skill | With skill | Saved |
|---|---|---|---|
| 500 fake staging profiles | ~66,320 tokens | ~372 tokens | **178x** |
| Live currency conversion | ~1,795 tokens | ~134 tokens | **13x** |
| City autocomplete (175 cities) | ~2,460 tokens | ~410 tokens | **6x** |
| Sliding window rate limiter | ~2,152 tokens | ~414 tokens | **5x** |
| PDF invoice generation | ~4,281 tokens | ~2,281 tokens | **2x** |

---

## Examples

<details>
<summary><strong>"Build city autocomplete for our shipping form — all major cities worldwide"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Hardcodes cities as a static array | `npm install world-cities` + 40-line component |
| **Tokens** | ~2,460 (175 cities) | ~410 — **6x fewer** |
| **Accuracy** | Frozen at generation time | 23,000 cities from GeoNames, maintained upstream |
| **Checkpoint** | — | Checkpoint 2 — existing package |

</details>

<details>
<summary><strong>"Generate 500 realistic user profiles for our staging database"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Writes 500 JSON records inline | 54-line `@faker-js/faker` script, parameterized |
| **Tokens** | ~66,320 | ~372 — **178x fewer** |
| **Re-runnability** | Zero — ephemeral output | Seeded, `--count` flag, version-controlled |
| **Checkpoints** | — | Checkpoint 2 (faker) + Checkpoint 3 (500 static = wrong shape) |

</details>

<details>
<summary><strong>"Implement rate limiting — 100 req per 15-min sliding window"</strong></summary>
<br/>

| | Greedy | Think-Twice |
|---|---|---|
| **Approach** | Custom Redis sorted sets + Lua script | `rate-limiter-flexible` |
| **Tokens** | ~2,152 | ~414 — **5x fewer** |
| **Lines of code** | ~250 | ~18 |
| **Checkpoints** | — | Checkpoint 2 (library) + Checkpoint 4 (simpler approach) |

</details>

---

## Install

**This skill only:**
```bash
curl -sL https://raw.githubusercontent.com/albertobarnabo/lean/main/skills/think-twice/SKILL.md \
  -o ~/.claude/skills/think-twice/SKILL.md --create-dirs
```

**Full lean plugin (think-twice + surgical):**
```
/plugin install albertobarnabo/lean
```

---

## When NOT to apply

- Task is trivially small (under ~10 lines, no data, no new dependencies)
- User explicitly described custom logic no library could cover
- Security-critical code — always use stdlib or a widely-audited library, never hand-roll
- Adding a library would be overkill for 5 trivial lines
- Latency-sensitive hot path where a runtime API call is unacceptable
