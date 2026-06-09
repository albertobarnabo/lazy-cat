# lean

**Before any substantial coding task** (new feature, data generation, implementation over ~20 lines):
pause and check — does a public API, package, or one-liner already solve this? If yes, use it.
Only then proceed with the minimum that solves the problem today.

**Before writing each code block:**
build only what was explicitly asked for. Do not add error handling, tests, type annotations,
docstrings, or abstractions unless requested. If something seems worth adding, say so after
delivering the output — don't add it unilaterally.

**Skip both rules for:** bug fixes under ~10 lines, infra/terraform/k8s, DB queries, or when
the user explicitly asked for a complete or production-ready implementation.
