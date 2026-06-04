---
name: lazy-agent
description: >
  Teaches Claude to be "productively lazy" before doing heavy work: always check for existing APIs,
  libraries, datasets, caches, or prebuilt solutions before generating content or performing calculations
  from scratch. Trigger this skill whenever Claude Code is about to write a lot of boilerplate, manually
  generate structured data (JSON, CSV, lists), implement something that sounds like a solved problem
  (authentication, payment, maps, game data, translations, icons, charts), or re-derive facts that
  likely exist in a public dataset or API. Examples: writing Pokémon stats manually, implementing OAuth
  from scratch, hand-crafting country lists, building a chart library from scratch. If you catch yourself
  about to write repetitive data or reinvent a wheel, STOP and consult this skill first.
---

# Lazy Agent — Do Less, Ship More

> "A great engineer is a lazy engineer. They find the clever shortcut." — inspired by Steve Jobs

This skill prevents token waste and brittle code by mandating a **search-before-generate** discipline.
Before doing any heavy lifting, Claude must ask: *"Does this already exist?"*

---

## The Lazy Hierarchy

Before writing any significant chunk of data, code, or logic, work through this checklist in order. Stop at the first level that solves the problem.

### Level 1 — Is there a public API or hosted dataset?
- Game data (Pokémon → PokéAPI, IGDB), sports stats, weather, currency rates, country/city lists, IP geolocation, dictionaries, stock prices, lyrics metadata, etc.
- Check: Does a REST API exist that returns exactly this data at runtime? Prefer it — no maintenance, always up to date.

### Level 2 — Is there an npm / PyPI / NuGet package?
- Authentication (Passport, NextAuth), payments (Stripe SDK), maps (Leaflet, MapLibre), charts (Recharts, Chart.js), UI components (shadcn, MUI), date handling (date-fns), etc.
- Check: Would `npm install <package>` or `pip install <package>` give this feature in 10 lines instead of 200?

### Level 3 — Is there a static open dataset?
- If runtime API calls are undesirable (latency, offline, no API key), check for a downloadable dataset (CSV, JSON, SQLite) from sources like Kaggle, HuggingFace datasets, GitHub awesome-lists, government open data.

### Level 4 — Can it be derived/computed lazily?
- Don't precompute all permutations. Generate on demand. Paginate. Cache results. Use memoization.
- Example: don't pre-render 10,000 items — render the visible window.

### Level 5 — Only then: generate / implement from scratch
- If no external source exists and generation is truly necessary, proceed — but scope it to only what's needed now (YAGNI).

---

## Decision Checklist (run before any significant code block)

```
[ ] Is this data someone else maintains? → Find the API/dataset
[ ] Is this a common pattern? → Find the library
[ ] Am I writing >20 lines of repetitive data? → Red flag, pause
[ ] Am I implementing auth/payments/maps/charts from scratch? → Red flag, pause
[ ] Could this be computed on-demand instead of precomputed? → Prefer lazy eval
[ ] Am I solving a problem that has a name? (OAuth, CRUD, pagination) → Find the standard solution
```

---

## Common Lazy Substitutions

| "About to do this..." | "Should instead..." |
|---|---|
| Write all Pokémon manually in JSON | Use [PokéAPI](https://pokeapi.co/) |
| Write all country names/codes | Use `i18n-iso-countries` npm package or REST Countries API |
| Implement JWT from scratch | Use `jsonwebtoken` (Node) or `PyJWT` (Python) |
| Build OAuth flow manually | Use NextAuth / Passport / django-allauth |
| Write a sorting algorithm | Use native `.sort()` or a well-known lib |
| Hand-craft icon SVGs | Use Lucide, Heroicons, or FontAwesome |
| Implement a chart from scratch | Use Recharts, Chart.js, or Plotly |
| Write city/timezone data manually | Use `cities.json`, `moment-timezone`, or WorldCities dataset |
| Generate fake data manually | Use Faker.js / Faker (Python) |
| Implement full-text search | Use Fuse.js, MiniSearch, or Meilisearch |
| Write currency conversion logic | Use Open Exchange Rates or `currency.js` |

---

## How to Research Before Acting

When about to generate a large block of data or implement a common feature:

1. **Name the thing**: What is this data/feature called generically? (e.g., "Pokémon stats" → "game data API")
2. **Search for it**: `<name> REST API`, `<name> npm package`, `<name> open dataset`
3. **Evaluate the option**: Is it free? Rate-limited? Does it need an API key the user might not have?
4. **Propose it to the user**: Don't silently switch strategies — briefly say "I found X which provides this data. Using it instead of hardcoding."
5. **Fallback gracefully**: If the API/package doesn't work out, document why and proceed to the next level.

---

## Token Budget Awareness

The lazy approach isn't just about good engineering — it's about token efficiency:

- Writing 500 Pokémon manually ≈ **~50,000 tokens wasted**
- A single `fetch('https://pokeapi.co/api/v2/pokemon')` call ≈ **~10 tokens**

When you notice yourself about to generate a large static dataset, treat it as a **smell** — pause and climb back up the lazy hierarchy.

---

## Anti-patterns to Avoid

- ❌ Generating exhaustive static JSON for data that has an official API
- ❌ Writing an entire auth system when a library exists
- ❌ Precomputing all combinations when lazy evaluation would do
- ❌ Copy-pasting documentation into code instead of linking to it
- ❌ Implementing a well-known algorithm from scratch without checking if stdlib covers it

---

## When NOT to be lazy

- Performance-critical paths where an external call would add unacceptable latency
- Offline-first apps with strict no-external-dependency requirements
- Security-sensitive contexts where a vetted internal implementation is mandated
- When the "lazy" solution is overengineered for the actual need (don't add Redis for 10 items)

In these cases, document the reasoning: *"I'm implementing this manually because X."*
