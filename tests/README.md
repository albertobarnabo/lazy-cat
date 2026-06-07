# Benchmarks

Measures real token savings by running each scenario twice against the Anthropic API — once without any skill (baseline) and once with the skill injected as the system prompt — and comparing output token counts.

## What it measures

**Output tokens** — where the savings actually come from.

- **Baseline**: Claude with a plain system prompt, no skill loaded
- **With skill**: same prompt, SKILL.md injected as system prompt
- **Multiplier**: `baseline_output_tokens / lean_output_tokens`

The benchmark also checks whether the skill visibly fired (e.g. Claude suggested an API instead of hardcoding data) and whether the greedy behavior was avoided.

## Prerequisites

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-...
```

## Usage

```bash
# Run all scenarios
python tests/benchmark.py

# Run a single scenario
python tests/benchmark.py --scenario country-list

# Use a different model (default: claude-haiku-4-5-20251001)
python tests/benchmark.py --model claude-sonnet-4-6
```

Results are printed to stdout and saved as JSON in `tests/results/`.

## Scenarios

| File | Skill tested | What it measures |
|---|---|---|
| `country-list.json` | think-twice | Hardcoded JSON vs API suggestion |
| `user-profiles.json` | think-twice | 500 inline records vs faker script |
| `currency-conversion.json` | think-twice | Hardcoded rates vs exchange rate API |
| `pdf-invoice.json` | think-twice | From-scratch PDF code vs library suggestion |
| `rate-limiting.json` | think-twice | Custom Redis implementation vs library |
| `scope-guard-bugfix.json` | scope-guard | Bug fix + extras vs bug fix only |
| `plan-gate-refactor.json` | plan-gate | Immediate code vs plan-first |

## Adding a scenario

Create a new JSON file in `tests/scenarios/`:

```json
{
  "name": "Human-readable name",
  "skill": "think-twice",
  "prompt": "The exact prompt to send to Claude",
  "greedy_pattern": "regex that appears in the greedy (bad) response",
  "lean_pattern": "regex that appears in the lean (good) response"
}
```

`greedy_pattern` and `lean_pattern` are used to verify the skill actually changed Claude's behavior, not just the token count.

## Interpreting results

```
Scenario                         Baseline    Lean   Saved  Mult  Skill fired
------------------------------------------------------------------------
Country list generation             3,847      87   3,760  44x   YES (greedy avoided)
```

- **Skill fired: YES** — the lean response contained the expected pattern (e.g. suggested an API)
- **greedy avoided** — the greedy pattern did not appear in the lean response
- **Skill fired: NO** — the skill may not have triggered strongly enough; review the scenario prompt or skill description
