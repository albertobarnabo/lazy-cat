# Benchmark 25 — Scalpel: Add Logging to Existing Route Handler

**Scenario:** "Add error logging to the catch block in the checkout route"  
**Skills tested:** scalpel  
**Date:** 2026-06-08

---

## Existing Code

```javascript
router.post('/checkout', async (req, res) => {
    try {
        const order = await processOrder(req.body);
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        res.status(500).json({ error: 'Checkout failed' });
    }
});
```

---

## Greedy Output (no skills)

```javascript
const logger = require('./logger');

router.post('/checkout', async (req, res) => {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items?.length || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const order = await processOrder(req.body);
        logger.info('Checkout successful', {
            orderId: order.id,
            userId,
            itemCount: items.length,
        });
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        logger.error('Checkout failed', {
            error: err.message,
            stack: err.stack,
            userId,
            itemCount: items?.length,
        });
        res.status(500).json({
            error: 'Checkout failed',
            requestId: req.id,
        });
    }
});
```

**Character count:** ~830 chars → **~208 tokens**

Added unrequested: `require('./logger')` at top of file, destructuring of `req.body`,
input validation guard returning 400, `logger.info()` on success path, `requestId` in
error response. The validation guard is new runtime behaviour — requests that previously
reached `processOrder()` now return 400 if fields are missing.

---

## Scalpel Output

Two lines needed inside the catch block: one `logger.error()` call. The require
must be added at the top of the file if not already present — that is the minimum
necessary addition.

```javascript
const logger = require('./logger');

router.post('/checkout', async (req, res) => {
    try {
        const order = await processOrder(req.body);
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        logger.error('Checkout failed', { error: err.message, stack: err.stack });
        res.status(500).json({ error: 'Checkout failed' });
    }
});
```

**Character count:** ~295 chars → **~74 tokens**

---

## Results

| Condition | Tokens | vs Greedy |
|---|---|---|
| Greedy | ~208 | baseline |
| scalpel | ~74 | **2.8× fewer** |

## Analysis

The greedy output changed behaviour on the success path (added info logging) and the
entry path (added 400 validation). Neither was asked for. The `requestId: req.id` in
the error response is also new — if `req.id` is not set by middleware, this returns
`undefined` in the response body.

Scalpel delivers what was asked: error logging in the catch block. The require import
is a legitimate necessary addition (the minimum to make the change work). Everything
else — validation, success logging, restructured response — is untouched.
