# Contributing to lazy-cat

Thanks for being here. This project lives or dies on real evidence, so the contribution bar is simple: **real outputs, real numbers, nothing simulated.**

By contributing you agree to our [code of conduct](CODE_OF_CONDUCT.md). We respond to issues and PRs within 5 working days.

---

## The most useful contribution: a benchmark

A benchmark is a real task where Claude defaulted to the expensive path when a better one existed. If you've seen it happen in your own sessions, it belongs here.

1. **Run the task twice in a real session** — once without lazy-cat, once with. Interactive sessions, not `claude -p` one-shots: the failure modes lazy-cat fixes (wrong strategy, scope creep) barely show up in print mode, so print-mode comparisons under-measure.
2. **Save the actual outputs** — full code, not summaries or pseudocode.
3. **Count characters, estimate tokens** at chars ÷ 4.
4. **Copy the format** from any file in [`tests/`](tests/) and open a PR with `tests/NN-benchmark-your-scenario.md` (NN = next free number).

A good benchmark has: a task someone would actually give Claude, real code for both conditions, and a clear winner with a reason. Check [`tests/summary.md`](tests/summary.md) for what's already covered — duplicates of an existing scenario are only interesting if they contradict it.

**Negative results are welcome.** A task where lazy-cat made things worse (or did nothing) is as valuable as a win — we publish those too, like the dark-mode case where surgical alone beat both skills combined.

---

## Contributing a skill

New skills carry a real cost: every installed skill adds input tokens to every session. So the bar is higher than "it seems useful":

1. **Target a failure mode the current skills don't cover.** Open an issue first describing the failure mode with at least one real transcript — let's agree it's real before you write the skill.
2. **Write the SKILL.md** following the existing two as templates. The `description` field decides when your skill fires — make trigger and non-trigger conditions concrete (request shapes, size thresholds), not vibes.
3. **Benchmark it in real sessions**: at least 3 benchmark files showing ≥2× median improvement on its target failure mode, plus a check that existing benchmarks don't regress when your skill is installed alongside think-twice and surgical.
4. **Include the trivial-task negative test**: show your skill correctly does nothing on a task below its threshold. A skill that fires on everything is a tax, not a tool.

---

## Code contributions (installer, stats, tooling)

```bash
git clone https://github.com/albertobarnabo/lazy-cat
cd lazy-cat
npm test          # installer + stats test suites, no network needed
```

Keep diffs minimal — this repo eats its own dog food. Build exactly what the issue asks for, note what you deliberately left out in the PR description.

---

## Other ways to help

- Verified results in a language we haven't tested (Go, Rust, Swift, Java)
- Platform-specific install instructions (Cursor, Codex CLI, Gemini CLI)
- A real-world saving from your own codebase — even a one-liner in an issue
- Your `lazy-cat stats` week-over-week numbers (see the README) — real-world usage data beats benchmarks

---

The best contributions, like the best code, do exactly what's needed — nothing more.
