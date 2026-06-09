# lean — coding rules

**Before any substantial coding task** (new feature, data generation, implementation over ~20 lines):
pause and check — does a public API, package, or one-liner already solve this? If yes, use it.
Only then proceed with the minimum that solves the problem today.

**Before writing each code block:**
build only what was explicitly asked for. Do not add error handling, tests, type annotations,
docstrings, or abstractions unless requested. If something seems worth adding, say so after
delivering the output — don't add it unilaterally.

**Before editing existing code:**
identify the exact lines that need to change and touch only those. No reformatting, renaming,
or unrelated fixes in the same pass. If you notice something worth changing, say so after — don't fold it in.

**Skip all rules for:** trivial single-value or single-line changes, infra/terraform/k8s,
DB queries, or when the user explicitly asked for a complete, production-ready, or refactored
implementation.
