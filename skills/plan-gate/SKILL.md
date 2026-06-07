---
name: plan-gate
description: >
  Forces Claude to write a short flat plan and wait for approval before starting any task that
  will touch more than two files, involves an architectural decision, or is described at a goal
  level rather than an implementation level. Triggers before refactors with unclear boundaries,
  multi-step feature work, or any task where building the wrong thing would be expensive to undo.
version: 1.0.0
---

# Plan Gate — Align Before You Build

> "Give me six hours to chop down a tree and I will spend the first four sharpening the axe." — Lincoln

The most expensive failure mode is implementing the right solution to the wrong problem.
A 10-line plan reviewed in 30 seconds prevents a 300-line implementation that gets thrown away.

---

## When to Gate

Write a plan first when **any** of these are true:

- The task touches 3 or more files
- There is an architectural choice open (where to put state, how to split responsibilities)
- The task is described at a goal level: "add auth", "refactor the service", "support multi-tenancy"
- A previous attempt at this task was rejected or redirected
- The task involves deleting or restructuring existing code in a non-trivial way

**Don't gate when:**
- The path is unambiguous and touches one or two files
- It's a bug fix with a known cause and a clear fix
- The user has already provided a detailed spec that leaves no decisions open

---

## The Plan Format

Write a short flat list. No prose paragraphs. No nested bullets. No headers inside the plan.
Each line is one concrete action that names the file and the specific change.

```
Plan:
1. Add `verifyToken(token: string): User | null` to src/auth/jwt.ts
2. Add `requireAuth` middleware in src/middleware/auth.ts — reads Authorization header, calls verifyToken, attaches user to req
3. Wrap /api/profile and /api/settings routes in requireAuth
4. Add one integration test in tests/auth.test.ts: valid token, expired token, missing header

Anything to change before I start?
```

**Rules:**
- Each step names the file and the specific thing being added or changed — never vague ("update the auth logic")
- Steps are ordered by dependency
- Cap at 6 steps. If more are needed, propose phases instead
- End with one open invitation to redirect

---

## Proposing Phases

If the task is genuinely large, split it and propose phases rather than a 12-step plan:

```
This is large enough to split. Proposed phases:
- Phase 1: Auth middleware (steps 1–3) — shippable independently
- Phase 2: Profile page using auth — depends on Phase 1

Start with Phase 1?
```

---

## After Approval

Once the user approves (any affirmative — "yes", "go ahead", "looks good", "+1"):

- Start the implementation immediately
- Don't restate the plan in prose
- Don't narrate which step is being executed

If the user modifies the plan, confirm the change in one line then proceed:
> "Got it — skipping the test for now."

---

## Mid-Implementation Discovery

If a meaningful deviation from the plan is discovered mid-way, stop and surface it:

> "Hit a snag: `src/auth/jwt.ts` doesn't exist — the project uses `passport-jwt` instead.
> Work with that or create a thin wrapper?"

Don't silently improvise a different architecture than what was approved.

---

## The Rule

**For any task complex enough that building the wrong thing is expensive — plan first, build second.**
