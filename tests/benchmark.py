#!/usr/bin/env python3
"""
Benchmark token savings for each think-twice skill.

For each scenario, runs the prompt twice:
  1. Baseline  — no skill, plain system prompt
  2. With skill — SKILL.md injected as system prompt

Compares OUTPUT tokens (where real savings occur) and checks whether
the skill's expected behavior pattern appears in the response.

Usage:
    ANTHROPIC_API_KEY=sk-... python tests/benchmark.py
    ANTHROPIC_API_KEY=sk-... python tests/benchmark.py --scenario country-list
    ANTHROPIC_API_KEY=sk-... python tests/benchmark.py --model claude-haiku-4-5-20251001
"""

import anthropic
import argparse
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

SKILLS_DIR = Path(__file__).parent.parent / "skills"
SCENARIOS_DIR = Path(__file__).parent / "scenarios"
RESULTS_DIR = Path(__file__).parent / "results"

DEFAULT_MODEL = "claude-haiku-4-5-20251001"
BASELINE_SYSTEM = "You are a helpful assistant. Complete the task as requested."


def load_skill(skill_name: str) -> str:
    path = SKILLS_DIR / skill_name / "SKILL.md"
    if not path.exists():
        raise FileNotFoundError(f"Skill not found: {path}")
    return path.read_text()


def run_prompt(client, prompt: str, system: str, model: str) -> dict:
    response = client.messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text
    return {
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "text": text,
    }


def check_behavior(text: str, pattern: str) -> bool:
    """Returns True if the expected behavior pattern appears in the response."""
    return bool(re.search(pattern, text, re.IGNORECASE))


def run_scenario(client, scenario: dict, model: str) -> dict:
    name = scenario["name"]
    skill_name = scenario["skill"]
    prompt = scenario["prompt"]

    print(f"\n  Running baseline...")
    baseline = run_prompt(client, prompt, BASELINE_SYSTEM, model)
    time.sleep(1)

    print(f"  Running with skill '{skill_name}'...")
    skill_content = load_skill(skill_name)
    lean = run_prompt(client, prompt, skill_content, model)

    output_saved = baseline["output_tokens"] - lean["output_tokens"]
    multiplier = (
        round(baseline["output_tokens"] / lean["output_tokens"], 1)
        if lean["output_tokens"] > 0
        else float("inf")
    )

    skill_fired = check_behavior(lean["text"], scenario.get("lean_pattern", ""))
    greedy_avoided = not check_behavior(lean["text"], scenario.get("greedy_pattern", ""))

    return {
        "scenario": name,
        "skill": skill_name,
        "model": model,
        "baseline": {
            "input_tokens": baseline["input_tokens"],
            "output_tokens": baseline["output_tokens"],
            "preview": baseline["text"][:300].replace("\n", " "),
        },
        "lean": {
            "input_tokens": lean["input_tokens"],
            "output_tokens": lean["output_tokens"],
            "preview": lean["text"][:300].replace("\n", " "),
        },
        "output_tokens_saved": output_saved,
        "output_multiplier": multiplier,
        "skill_fired": skill_fired,
        "greedy_avoided": greedy_avoided,
    }


def print_results(results: list[dict]) -> None:
    print("\n" + "=" * 72)
    print("BENCHMARK RESULTS")
    print("=" * 72)

    header = f"{'Scenario':<32} {'Baseline':>9} {'Lean':>7} {'Saved':>7} {'Mult':>5}  {'Skill fired'}"
    print(header)
    print("-" * 72)

    for r in results:
        fired = "YES" if r["skill_fired"] else "NO "
        avoided = " (greedy avoided)" if r["greedy_avoided"] else ""
        print(
            f"{r['scenario']:<32} "
            f"{r['baseline']['output_tokens']:>9,} "
            f"{r['lean']['output_tokens']:>7,} "
            f"{r['output_tokens_saved']:>7,} "
            f"{r['output_multiplier']:>4}x  "
            f"{fired}{avoided}"
        )

    total_baseline = sum(r["baseline"]["output_tokens"] for r in results)
    total_lean = sum(r["lean"]["output_tokens"] for r in results)
    total_saved = total_baseline - total_lean
    overall_mult = round(total_baseline / total_lean, 1) if total_lean > 0 else float("inf")

    print("-" * 72)
    print(
        f"{'TOTAL':<32} "
        f"{total_baseline:>9,} "
        f"{total_lean:>7,} "
        f"{total_saved:>7,} "
        f"{overall_mult:>4}x"
    )
    print("=" * 72)

    print("\nResponse previews:\n")
    for r in results:
        print(f"[{r['scenario']}]")
        print(f"  Baseline : {r['baseline']['preview'][:120]}...")
        print(f"  With skill: {r['lean']['preview'][:120]}...")
        print()


def save_results(results: list[dict]) -> Path:
    RESULTS_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = RESULTS_DIR / f"benchmark_{ts}.json"
    path.write_text(json.dumps(results, indent=2))
    return path


def main():
    parser = argparse.ArgumentParser(description="Benchmark think-twice token savings")
    parser.add_argument("--scenario", help="Run a single scenario by filename stem (e.g. country-list)")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model to use (default: {DEFAULT_MODEL})")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        raise SystemExit(1)

    client = anthropic.Anthropic(api_key=api_key)

    if args.scenario:
        files = [SCENARIOS_DIR / f"{args.scenario}.json"]
    else:
        files = sorted(SCENARIOS_DIR.glob("*.json"))

    if not files or not files[0].exists():
        print(f"No scenarios found.")
        raise SystemExit(1)

    print(f"Model : {args.model}")
    print(f"Scenarios: {len(files)}")

    results = []
    for f in files:
        scenario = json.loads(f.read_text())
        print(f"\n[{scenario['name']}]")
        result = run_scenario(client, scenario, args.model)
        results.append(result)

    print_results(results)
    path = save_results(results)
    print(f"Full results saved to: {path}")


if __name__ == "__main__":
    main()
