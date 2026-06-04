# lazy-agent

> "A great engineer is a lazy engineer. They find the clever shortcut." — Steve Jobs

A [Claude Code](https://claude.ai/code) skill that teaches AI agents to **stop and think before they compute**.

---

## The Problem: LLMs Are Greedy

LLMs are trained to be helpful by producing output. So when you ask them to do something, their instinct is to *start doing it* — immediately, thoroughly, from scratch.

That instinct is often wrong.

An AI agent doesn't stop to ask "does this already exist?" It just starts generating. It picks the most direct path to an answer, not the most efficient one. This is the **greedy problem**: optimizing for immediate output at the expense of actual cost.

The result is thousands of tokens spent on work that didn't need to happen.

---

## Real Examples

**"Add a country selector to the form"**

The agent writes out all 195 countries with their names, ISO codes, phone prefixes, and flags — as a hardcoded JSON array. ~12,000 tokens. The REST Countries API returns all of this in one fetch call. The `i18n-iso-countries` npm package ships it as a 4KB file.

**"Set up JWT authentication"**

The agent implements token signing, expiry validation, refresh logic, and error handling from scratch — across 300+ lines. ~18,000 tokens. `jsonwebtoken` (Node) or `PyJWT` (Python) do exactly this. NextAuth or Passport handle the full flow.

**"Generate test data for 500 users"**

The agent starts writing user records. Name, email, address, phone, avatar URL — one by one, manually varied. ~30,000 tokens. `faker` generates statistically realistic data for any locale in two lines of code.

**"Add timezone support to the scheduler"**

The agent writes out a lookup table of all ~400 IANA timezones with UTC offsets and DST rules. ~20,000 tokens. `moment-timezone` or the native `Intl.supportedValuesOf('timeZone')` already have this.

**"Build a search box with fuzzy matching"**

The agent implements a Levenshtein distance algorithm, a scoring function, and a result ranker from scratch. ~8,000 tokens. `fuse.js` or `minisearch` are drop-in solutions that took years to tune.

---

## The Fix

`lazy-agent` interrupts the greedy reflex. Before Claude writes any significant block of code or data, it climbs a hierarchy:

```
Level 1  →  Is there a public API or hosted dataset?
Level 2  →  Is there an npm / PyPI / NuGet package?
Level 3  →  Is there a static open dataset to download?
Level 4  →  Can it be computed lazily / on-demand instead of precomputed?
Level 5  →  Only then: generate from scratch
```

Stop at the first level that solves the problem.

When a better option exists, Claude says so explicitly before writing a line: *"I found X which already handles this — using it instead of implementing from scratch."*

---

## Token Cost at a Glance

| Task | Greedy approach | Lazy approach | Tokens saved |
|---|---|---|---|
| 195 countries + ISO codes | Hardcoded JSON array | `i18n-iso-countries` package | ~12,000 |
| JWT auth flow | Custom implementation | `jsonwebtoken` / NextAuth | ~18,000 |
| 500 fake user records | Written manually | `faker` (2 lines) | ~30,000 |
| All IANA timezones + offsets | Lookup table | `moment-timezone` | ~20,000 |
| Fuzzy search | Custom algorithm | `fuse.js` | ~8,000 |

At scale, across a team using Claude Code daily, this compounds into real money.

---

## Install

```bash
# Via Claude Code CLI
claude skills install lazy-agent
```

Or manually: drop [`SKILL.md`](./SKILL.md) into `~/.claude/skills/lazy-agent/SKILL.md`.

Then invoke it before any heavy task:

```
/lazy-agent I need to add timezone support to the booking form
```

---

## When NOT to be lazy

The skill also teaches when the lazy option is the wrong one:

- **Latency-sensitive paths** where a runtime API call is unacceptable
- **Offline-first apps** with strict no-external-dependency requirements
- **Security-critical code** where a vetted internal implementation is mandated
- **Trivial cases** where adding a dependency would be more complexity than the 5 lines it saves

In those cases, Claude documents the reasoning and proceeds — instead of blindly falling through to "use a library."

---

## The Idea

Lazy evaluation is a well-understood concept in computer science: defer computation until the result is actually needed, and never compute what you can reuse.

`lazy-agent` applies the same discipline to AI agents: defer generation until you've verified that nothing already exists.

The best code is code you didn't write. The best tokens are tokens you didn't spend.

---

## Contributing

Found a common pattern the skill misses? Open a PR adding it to the substitution table in [`SKILL.md`](./SKILL.md). Real-world examples make the skill sharper.

## License

MIT
