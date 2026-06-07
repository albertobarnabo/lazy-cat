---
name: clarify-first
description: >
  Forces Claude to ask one targeted question before starting any task where two reasonable
  interpretations exist and picking the wrong one would require a full redo. Triggers before
  ambiguous implementation tasks, underspecified architecture requests, or any prompt where
  assuming could waste significant work. A 15-token question beats a 5,000-token redo.
version: 1.0.0
---

# Clarify First — One Question Before a Wrong Assumption

> "If I had an hour to solve a problem, I'd spend 55 minutes thinking about the problem." — Einstein

The most expensive mistake is implementing the right solution to the wrong interpretation.
One targeted question before a long implementation is always the better trade.

---

## When to Ask vs When to Proceed

**Ask** when:
- Two reasonable interpretations exist and they lead to different code, different files, or different architecture
- The target environment is ambiguous (frontend vs backend, language, framework)
- The expected output format is unclear (JSON vs table, file vs stdout, sync vs async)
- The scope could mean "fix this function" or "redesign this module"

**Proceed without asking** when:
- Context makes one interpretation overwhelmingly obvious — take it
- The ambiguity is minor and a sensible default exists — use it and state it
- Reading the existing code would answer the question — read it first
- The task is exploratory ("show me options") — produce options, don't ask

---

## The One-Question Rule

Ask at most **one question** per task.

Multiple questions stall the user and signal muddled thinking.
To pick the right question:

1. List every fork in the task
2. Find the one whose answer resolves the most other forks downstream
3. Ask only that one

**Bad — multiple questions:**
> "Should this be TypeScript or JavaScript? Do you want tests? Should I use the existing client or a new one? What error handling approach do you prefer?"

**Good — one question that resolves the rest:**
> "Is this for the existing Express API or the new FastAPI service? That determines the language and client."

---

## How to Frame the Question

Make it answerable in one word or a short phrase. Offer both options explicitly.

**Template:**
> "Before I start: [the fork]. [Option A] or [Option B]?"

**Examples:**
> "Before I start: browser or Node? The bundling and import approach differ completely."

> "Staging or production?"

> "Should this replace the existing endpoint or run alongside it?"

---

## When a Default Beats a Question

For low-stakes forks, pick a default, state it, and proceed.
Reserve questions for forks where getting it wrong costs real rework.

> "Assuming UTF-8 — let me know if you need something else."

> "Using the existing `db.ts` client since it's already wired up."

**The test:** if getting the default wrong takes under 30 seconds to fix, proceed with the default.

---

## After the Answer

Once clarification is received, start the implementation immediately.
Don't restate the question, don't summarise the answer, don't explain the plan.
Just build it.

---

## The Rule

**When a wrong assumption would cost more to undo than a question costs to ask — ask the question.**
