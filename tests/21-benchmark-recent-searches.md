# Benchmark: Store User's Recent Searches

**Scenario:** "Remember the user's last 5 searches so we can show them as suggestions"
**Skills tested:** think-twice (localStorage vs premature DB) + surgical
**Date:** 2026-06-07

---

## Greedy Output (no skills)

Claude reads "remember" as "persist to a database." No auth, no user model, and no mention of multi-device sync are present in the prompt — but the greedy path still wires up a full persistence stack: a SQLite schema, an ORM model via better-sqlite3, a repository class with CRUD methods, a service layer, and three REST endpoints. This is 160+ lines for something that should be 3 lines of localStorage.

---

```
Here's a complete search-history feature:

// db/schema.sql
CREATE TABLE IF NOT EXISTS search_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT    NOT NULL DEFAULT 'anonymous',
  query      TEXT    NOT NULL,
  searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id
  ON search_history(user_id);

// db/database.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/app.db'));

// Run migrations on startup
db.exec(require('fs').readFileSync(
  path.join(__dirname, 'schema.sql'),
  'utf8'
));

module.exports = db;

// repositories/SearchHistoryRepository.js
const db = require('../db/database');

class SearchHistoryRepository {
  /**
   * Persist a search query for a user.
   * Deduplicates by removing the same query if it already exists,
   * then inserts fresh so it bubbles to the top.
   */
  saveSearch(userId, query) {
    const trimmed = query.trim();
    if (!trimmed) return;

    const deleteStmt = db.prepare(
      'DELETE FROM search_history WHERE user_id = ? AND query = ?'
    );
    const insertStmt = db.prepare(
      'INSERT INTO search_history (user_id, query) VALUES (?, ?)'
    );

    const transaction = db.transaction(() => {
      deleteStmt.run(userId, trimmed);
      insertStmt.run(userId, trimmed);
    });

    transaction();
  }

  /**
   * Return the N most recent searches for a user, newest first.
   */
  getRecentSearches(userId, limit = 5) {
    return db
      .prepare(
        `SELECT id, query, searched_at
         FROM search_history
         WHERE user_id = ?
         ORDER BY searched_at DESC
         LIMIT ?`
      )
      .all(userId, limit);
  }

  /**
   * Delete a single search entry by id (for user-initiated removal).
   */
  deleteSearch(userId, id) {
    return db
      .prepare(
        'DELETE FROM search_history WHERE id = ? AND user_id = ?'
      )
      .run(id, userId);
  }

  /**
   * Wipe all history for a user.
   */
  clearHistory(userId) {
    return db
      .prepare('DELETE FROM search_history WHERE user_id = ?')
      .run(userId);
  }
}

module.exports = new SearchHistoryRepository();

// services/SearchHistoryService.js
const repo = require('../repositories/SearchHistoryRepository');

class SearchHistoryService {
  recordSearch(userId, query) {
    repo.saveSearch(userId, query);
  }

  getSuggestions(userId, limit = 5) {
    return repo.getRecentSearches(userId, limit).map(row => row.query);
  }

  removeEntry(userId, id) {
    repo.deleteSearch(userId, id);
  }

  clearAll(userId) {
    repo.clearHistory(userId);
  }
}

module.exports = new SearchHistoryService();

// routes/searchHistory.js
const express = require('express');
const router = express.Router();
const service = require('../services/SearchHistoryService');

// GET /api/search-history?userId=xxx&limit=5
router.get('/', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  const limit = parseInt(req.query.limit, 10) || 5;
  const suggestions = service.getSuggestions(userId, limit);
  res.json({ suggestions });
});

// POST /api/search-history
// Body: { userId: string, query: string }
router.post('/', (req, res) => {
  const { userId = 'anonymous', query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }
  service.recordSearch(userId, query);
  res.status(201).json({ ok: true });
});

// DELETE /api/search-history/:id
router.delete('/:id', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  service.removeEntry(userId, parseInt(req.params.id, 10));
  res.json({ ok: true });
});

// DELETE /api/search-history
router.delete('/', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  service.clearAll(userId);
  res.json({ ok: true });
});

module.exports = router;

// app.js (excerpt — wire up the route)
const searchHistoryRouter = require('./routes/searchHistory');
app.use('/api/search-history', searchHistoryRouter);
```

**Character count:** ~4,050 chars → ~1,010 tokens

---

## think-twice only

### think-twice fires at checkpoint #4 ("Am I doing too much?") and checkpoint #5 ("Can I do this lazily?")

The prompt contains no mention of:
- Authentication or a user model
- Multi-device sync
- A server, an API, or a database
- Any backend at all

"Last 5 searches" is browser-local state. The correct tool is `localStorage` — it requires no server, no migrations, no ORM, and no deployment. JSON.stringify/parse handles the array. Three to five lines cover the full requirement.

---

```
// searchHistory.js — store and retrieve the user's last 5 searches

const STORAGE_KEY = 'recentSearches';
const MAX = 5;

export function saveSearch(query) {
  const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const next = [query, ...prev.filter(q => q !== query)].slice(0, MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getRecentSearches() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
```

**Character count:** ~380 chars → ~95 tokens

---

## surgical only

Surgical scans the greedy output and cuts every layer that wasn't asked for: the service abstraction, the repository pattern, and the REST API routes. What it cannot determine, without think-twice's strategic review, is that the entire persistence strategy is wrong. The task said "remember" — surgical interprets that as "there is supposed to be storage." It keeps the DB model because dropping it would be a strategy change, not a scope cut. The result: a trimmed DB approach with direct queries, no repository class, no service class, and no HTTP layer.

---

```
// db/database.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS search_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    query       TEXT    NOT NULL,
    searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;

// searchHistory.js — direct queries, no abstraction layers
const db = require('./db/database');

const deleteStmt = db.prepare(
  'DELETE FROM search_history WHERE query = ?'
);
const insertStmt = db.prepare(
  'INSERT INTO search_history (query) VALUES (?)'
);
const selectStmt = db.prepare(
  'SELECT query FROM search_history ORDER BY searched_at DESC LIMIT 5'
);

export function saveSearch(query) {
  db.transaction(() => {
    deleteStmt.run(query);
    insertStmt.run(query);
  })();
}

export function getRecentSearches() {
  return selectStmt.all().map(row => row.query);
}
```

**Character count:** ~850 chars → ~215 tokens

---

## Both skills

think-twice fires first and redirects the entire strategy to localStorage — no database, no server, no API. surgical then ensures the implementation contains only what was asked: store the last 5 searches, retrieve them. No class, no method grouping, no error-handling ceremony. The result is the same minimal implementation as think-twice alone, confirming surgical has nothing left to cut.

---

```
// searchHistory.js

const KEY = 'recentSearches';

export function saveSearch(query) {
  const prev = JSON.parse(localStorage.getItem(KEY) || '[]');
  const next = [query, ...prev.filter(q => q !== query)].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getRecentSearches() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}
```

**Character count:** ~290 chars → ~73 tokens

---

## Results

| | Greedy | think-twice only | surgical only | Both |
|---|---|---|---|---|
| Characters | ~4,050 | ~380 | ~850 | ~290 |
| Est. tokens | ~1,010 | ~95 | ~215 | ~73 |
| Infrastructure added | DB + ORM + Repository + Service + API | None | DB + ORM | None |
| vs Greedy | baseline | 14x smaller | 4.8x smaller | 14x smaller |

**Winner:** think-twice (alone or combined with surgical) — 14x reduction, zero infrastructure.

---

## Analysis

"Remember" is one of the most reliable triggers for premature database architecture: the greedy path added a SQLite schema, a repository class, a service layer, and three REST endpoints for a feature that requires exactly two localStorage calls. No auth, no user model, no multi-device sync, and no server were mentioned anywhere in the prompt — localStorage is the correct default for browser-local ephemeral state, and the 3-line implementation proves it. This is a clean think-twice win at checkpoint #4 ("Am I doing too much?") and checkpoint #5 ("Can I do this lazily?"): both fire together and redirect the entire strategy before a single line of DB code is written. Surgical alone is insufficient here because it can only trim surface-level abstraction layers — it has no basis for concluding that the entire persistence strategy was wrong, so it still ships a SQLite model with direct queries. This benchmark illustrates one of the most commonly cited LLM failure modes among senior engineers: the word "remember" automatically implies a database, even when the data is transient, browser-scoped, and trivially handled by a Web API that has existed since 2009.
