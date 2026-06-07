# Benchmark: Console.log for Debugging

**Scenario:** "Add a console.log so I can see what's happening when userType is unexpected"
**Skills tested:** surgical (think-twice does not fire — trivial, single-line addition)
**Date:** 2026-06-07

---

## Original function

```javascript
function calculateDiscount(price, userType) {
  const rates = { premium: 0.2, standard: 0.1, guest: 0.05 };
  return price * (1 - rates[userType]);
}
```

---

## Greedy Output (no skills)

Claude interprets "add a console.log" as an invitation to improve the whole function. It introduces Winston for structured logging with timestamps and log levels, adds a `VALID_USER_TYPES` constant, validates the `price` argument, replaces the unknown `userType` with a guest fallback, and wraps everything in debug/warn/error calls. The user asked for one line; they receive a logger dependency and an architectural opinion.

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const VALID_USER_TYPES = ['premium', 'standard', 'guest'];

function calculateDiscount(price, userType) {
  if (typeof price !== 'number' || price < 0) {
    logger.error('Invalid price', { price });
    throw new Error(`Invalid price: ${price}`);
  }

  if (!VALID_USER_TYPES.includes(userType)) {
    logger.warn('Unknown userType — falling back to guest rate', {
      userType,
      expected: VALID_USER_TYPES,
      fallback: 'guest',
    });
    userType = 'guest';
  }

  const rates = { premium: 0.2, standard: 0.1, guest: 0.05 };

  logger.debug('Calculating discount', { price, userType, rate: rates[userType] });

  return price * (1 - rates[userType]);
}
```

This gives you structured JSON logs with timestamps, a warning with context when `userType` is unexpected (including what values are valid and what fallback was used), an error if `price` is invalid, and a debug-level trace on every call you can silence in prod by setting `LOG_LEVEL=warn`. Install Winston with `npm install winston`.

**Character count (full response):** 1 676 chars → ~419 tokens

---

## Lean Output (surgical active)

### surgical fires

surgical scans the request against the output and cuts:

| Removed | Reason |
|---|---|
| `winston` import and `createLogger` setup | User asked for `console.log`, not a logger library |
| `VALID_USER_TYPES` constant | Not requested; can be derived from `rates` keys already in scope |
| `price` validation + `throw` | Completely out of scope — price was never mentioned |
| `userType = 'guest'` fallback | User asked to *see* what's happening, not to silently reassign |
| `logger.debug` on every call | Not requested; adds noise to every invocation |
| Outro install instructions | No new dependency was introduced |

What remains: one `if` + one `console.log`, inserted where the unexpected case would be detected.

### Final response

```javascript
function calculateDiscount(price, userType) {
  const rates = { premium: 0.2, standard: 0.1, guest: 0.05 };
  if (!(userType in rates)) {
    console.log(`Unexpected userType: "${userType}". Known types: ${Object.keys(rates).join(', ')}`);
  }
  return price * (1 - rates[userType]);
}
```

Added a `console.log` that fires when `userType` isn't in the rates table, showing the unexpected value and the valid options.

**Character count (full response):** 423 chars → ~106 tokens

---

## Results

| | Greedy | Lean (surgical) |
|---|---|---|
| Characters | 1 676 | 423 |
| Est. tokens | ~419 | ~106 |
| Reduction | — | **−75% (1 253 fewer)** |

---

## Analysis

The task was a mathematical constant: one `console.log` statement costs the same characters regardless of what else gets added around it. The greedy version doesn't make the log better — it buries it inside a Winston pipeline the user didn't ask for, adding an npm dependency and a new architectural pattern to a four-line utility. think-twice correctly does not fire here because there is no smarter approach to evaluate: a console.log is a console.log, and no external API or library makes it cheaper or more correct. surgical fires precisely because the delta between what was asked (one log line) and what greedy produces (a structured logging framework) is not ambiguous — every added line is traceable to a decision the user never made. The real-world cost compounds: a codebase where every micro-task like this gets padded with infra nobody asked for gradually becomes one nobody wants to touch.
