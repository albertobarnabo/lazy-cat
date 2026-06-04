# lazy-agent

> "A great engineer is a lazy engineer. They find the clever shortcut." — Steve Jobs

A [Claude Code](https://claude.ai/code) skill that stops AI agents from doing work that's already been done.

---

## The Problem

When you ask a vibe-coding agent to "add all 151 Pokémon with their stats," it will start writing JSON. By hand. All 151 of them. One by one.

It's not stupid — it's *greedy*. It picks the most straightforward path available, which is often the most expensive one.

**~50,000 tokens** wasted on data that already exists at `https://pokeapi.co/api/v2/pokemon`.

This happens constantly:
- Implementing OAuth from scratch when NextAuth exists
- Handcrafting country lists when REST Countries API exists
- Building a chart renderer when Recharts exists
- Writing fake test data manually when Faker.js exists

## The Fix

`lazy-agent` teaches Claude a **search-before-generate** discipline. Before writing any significant chunk of code or data, it climbs a hierarchy:

```
Level 1  →  Is there a public API or hosted dataset?
Level 2  →  Is there an npm / PyPI / NuGet package?
Level 3  →  Is there a static open dataset to download?
Level 4  →  Can it be computed lazily / on-demand?
Level 5  →  Only then: write it from scratch
```

Stop at the first level that solves the problem.

## Before vs. After

| Without lazy-agent | With lazy-agent |
|---|---|
| Writes 151 Pokémon JSON entries (~50k tokens) | `fetch('https://pokeapi.co/api/v2/pokemon?limit=151')` (~10 tokens) |
| Implements JWT validation from scratch | `pip install PyJWT` |
| Hand-crafts all country ISO codes | `npm install i18n-iso-countries` |
| Builds a full-text search engine | `npm install fuse.js` |
| Generates 1,000 rows of test data manually | `from faker import Faker` |

## Install

```bash
# Via Claude Code CLI
claude skills install lazy-agent
```

Or manually: drop [`SKILL.md`](./SKILL.md) into `~/.claude/skills/lazy-agent/SKILL.md`.

Then invoke it in any Claude Code session:

```
/lazy-agent I need to show all countries with their ISO codes and flags
```

Claude will pause, search for an existing solution, and propose it before writing a single line of static data.

## How It Works

The skill loads a decision checklist into Claude's context before any heavy task:

- Am I writing >20 lines of repetitive data? → Red flag, stop
- Am I implementing something that has a name? (auth, payments, maps) → Find the standard solution
- Could this be computed on demand instead of precomputed? → Prefer lazy evaluation

When it finds a better option, it tells you explicitly: *"I found X which provides this. Using it instead of hardcoding."*

## When NOT to be lazy

The skill also teaches when to override — because sometimes the "lazy" option is wrong:

- Performance-critical paths where an external call adds unacceptable latency
- Offline-first apps with strict no-external-dependency requirements  
- Security-sensitive contexts where a vetted internal implementation is mandated

In those cases, Claude documents the reasoning instead of silently falling through.

## Token Math

This isn't just about good engineering. It's about cost.

| Task | Naive approach | Lazy approach | Savings |
|---|---|---|---|
| All 151 Gen-1 Pokémon | ~50,000 tokens | ~10 tokens | **99.98%** |
| All 250 countries + codes | ~8,000 tokens | ~15 tokens | **99.8%** |
| 500 fake user records | ~25,000 tokens | ~20 tokens | **99.9%** |

At scale, across a team using Claude Code daily, this compounds fast.

## The Concept

Lazy evaluation is a well-understood concept in computer science: defer computation until the result is actually needed. `lazy-agent` applies the same principle to AI-generated work: defer generation until you've confirmed nothing already exists.

The best code is code you don't write. The best tokens are tokens you don't spend.

---

## Contributing

Found a common pattern that `lazy-agent` misses? Open a PR adding it to the substitution table in `SKILL.md`. The more real-world examples, the sharper the skill gets.

## License

MIT
