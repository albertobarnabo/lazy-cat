# Benchmark: Paginated Data Table

**Scenario:** "Add pagination to our user table — show 20 rows per page with prev/next buttons"
**Skills tested:** think-twice (library vs hand-rolled) + surgical (scope creep on a UI feature)
**Date:** 2026-06-07

---

## Starting point

```jsx
// src/components/UserTable.jsx
export function UserTable({ users }) {
  return (
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

The `users` prop is the full dataset — currently rendered all at once. The ask: show 20 rows per page, with
prev/next buttons. No mention of sorting, filtering, server-side fetching, column resizing, or selection.

---

## Greedy Output (no skills)

Claude interprets "add pagination" as an invitation to build a complete data-table infrastructure. It adds:
a `usePagination` hook with page state and derived slices, a `PaginationControls` component with full
accessibility attributes, a page-size selector, a jump-to-page input, a first/last page shortcut, a results
summary line ("Showing 21–40 of 347 users"), keyboard navigation, and a memoized sort layer "since you'll
probably want sorting later." The result spans three new files and modifies the original.

```jsx
// src/hooks/usePagination.js
import { useState, useMemo } from 'react';

/**
 * Generic pagination hook.
 * @param {Array} data - Full dataset
 * @param {Object} options
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialPageSize=20]
 * @param {number[]} [options.pageSizeOptions=[10, 20, 50, 100]]
 */
export function usePagination(data, {
  initialPage = 1,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp page when data or pageSize changes
  const safePage = Math.min(page, totalPages);

  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  function goTo(n) {
    setPage(Math.max(1, Math.min(n, totalPages)));
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize);
    setPage(1); // reset to first page on size change
  }

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
    slice,
    goTo,
    setPageSize: handlePageSizeChange,
    pageSizeOptions,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    startItem: totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1,
    endItem: Math.min(safePage * pageSize, totalItems),
  };
}
```

```jsx
// src/components/PaginationControls.jsx
import React from 'react';

/**
 * Accessible pagination controls.
 * Expects the return value of usePagination spread as props.
 */
export function PaginationControls({
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  hasPrev,
  hasNext,
  goTo,
  pageSize,
  setPageSize,
  pageSizeOptions,
}) {
  function handleJump(e) {
    if (e.key === 'Enter') {
      const n = parseInt(e.target.value, 10);
      if (!isNaN(n)) goTo(n);
    }
  }

  return (
    <nav aria-label="Pagination" className="pagination-controls">
      <span className="pagination-summary">
        {totalItems === 0
          ? 'No results'
          : `Showing ${startItem}–${endItem} of ${totalItems}`}
      </span>

      <div className="pagination-actions">
        <select
          aria-label="Rows per page"
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map(n => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>

        <button
          onClick={() => goTo(1)}
          disabled={!hasPrev}
          aria-label="First page"
          title="First page"
        >
          «
        </button>
        <button
          onClick={() => goTo(page - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        <label className="pagination-jump" aria-label="Go to page">
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={page}
            key={page}  // reset input when page changes externally
            onKeyDown={handleJump}
            style={{ width: '4ch' }}
          />
          <span>/ {totalPages}</span>
        </label>

        <button
          onClick={() => goTo(page + 1)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          Next ›
        </button>
        <button
          onClick={() => goTo(totalPages)}
          disabled={!hasNext}
          aria-label="Last page"
          title="Last page"
        >
          »
        </button>
      </div>
    </nav>
  );
}
```

```jsx
// src/components/UserTable.jsx  (modified)
import React, { useMemo, useState } from 'react';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';

const SORT_DIRECTIONS = { ASC: 'asc', DESC: 'desc' };

export function UserTable({ users }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(SORT_DIRECTIONS.ASC);

  // Memoized sort — added in case sorting is needed later
  const sorted = useMemo(() => {
    if (!sortKey) return users;
    return [...users].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === SORT_DIRECTIONS.ASC ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  const pagination = usePagination(sorted, { initialPageSize: 20 });

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC);
    } else {
      setSortKey(key);
      setSortDir(SORT_DIRECTIONS.ASC);
    }
    pagination.goTo(1); // reset page on sort change
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span aria-hidden> ↕</span>;
    return <span aria-hidden>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>;
  }

  return (
    <div className="user-table-wrapper">
      <table aria-label={`Users, page ${pagination.page} of ${pagination.totalPages}`}>
        <thead>
          <tr>
            {['name', 'email', 'role', 'joinedAt'].map(col => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                style={{ cursor: 'pointer' }}
                aria-sort={
                  sortKey === col
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                <SortIcon col={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagination.slice.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {pagination.slice.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <PaginationControls {...pagination} />
    </div>
  );
}
```

**Character count:** ~3,980 chars → ~995 tokens

---

## think-twice only

### think-twice fires at checkpoint #1

**Checkpoint:** "Is there an existing solution I should reach for?"

YES — **TanStack Table** (formerly react-table) is the established library for exactly this. It is headless
(you supply the markup), handles pagination, sorting, filtering, and column definitions in a composable way,
and is used in production by thousands of teams. It ships its own `getPaginationRowModel()`, page state, and
navigation helpers.

The hand-rolled `usePagination` + `PaginationControls` approach isn't wrong, but it reinvents what TanStack
Table already provides — and reinvents it with less test coverage, no TypeScript generics, and no
row-selection or filtering hooks for when the user inevitably asks for those next.

think-twice redirects to TanStack Table. The output is longer than the surgical output because library
wiring has unavoidable boilerplate, but the code is on the maintained side of the dependency boundary.

```bash
npm install @tanstack/react-table
```

```jsx
// src/components/UserTable.jsx  (complete replacement)
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

const columns = [
  { accessorKey: 'name',     header: 'Name' },
  { accessorKey: 'email',    header: 'Email' },
  { accessorKey: 'role',     header: 'Role' },
  {
    accessorKey: 'joinedAt',
    header: 'Joined',
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
];

export function UserTable({ users }) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.def, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          ‹ Prev
        </button>
        <span>
          Page {pageIndex + 1} of {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next ›
        </button>
      </div>
    </div>
  );
}
```

**Character count:** ~1,580 chars → ~395 tokens

---

## surgical only

### surgical fires

surgical reads the request literally: "add pagination to our user table — show 20 rows per page with prev/next buttons."

| What was asked | What greedy adds | Cut? |
|---|---|---|
| 20 rows per page | `usePagination` generic hook | Cut |
| Prev / Next buttons | Page-size selector (10/20/50/100) | Cut |
| — | Jump-to-page input | Cut |
| — | First / Last page shortcuts | Cut |
| — | "Showing X–Y of Z" summary line | Cut |
| — | `PaginationControls` as a separate file | Cut |
| — | Sortable column headers | Cut |
| — | `useMemo` sort layer "for later" | Cut |
| — | Accessible `aria-sort` attributes | Cut |
| — | Empty-state row | Cut |
| — | Keyboard navigation on jump input | Cut |

Everything kept: page state, the slice computation, the two buttons. The result modifies one file.

```jsx
// src/components/UserTable.jsx  (only file changed)
import { useState } from 'react';

const PAGE_SIZE = 20;

export function UserTable({ users }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const slice = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
        </thead>
        <tbody>
          {slice.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
          ‹ Prev
        </button>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
          Next ›
        </button>
      </div>
    </div>
  );
}
```

**Character count:** ~810 chars → ~203 tokens

---

## Both skills

think-twice confirms TanStack Table is the right library. surgical suppresses the page-size selector, jump
input, first/last shortcuts, summary line, and sorting layer. The wiring is minimal — just enough to hook
the library's pagination state to two buttons.

```bash
npm install @tanstack/react-table
```

```jsx
// think-twice: TanStack Table handles pagination state and slicing — no hand-rolled hook needed.
// surgical: no page-size dropdown, no jump input, no sort layer, no PaginationControls file.

// src/components/UserTable.jsx  (only file changed)
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

const columns = [
  { accessorKey: 'name',     header: 'Name' },
  { accessorKey: 'email',    header: 'Email' },
  { accessorKey: 'role',     header: 'Role' },
  {
    accessorKey: 'joinedAt',
    header: 'Joined',
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
];

export function UserTable({ users }) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          ‹ Prev
        </button>
        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next ›
        </button>
      </div>
    </div>
  );
}
```

**Character count:** ~1,440 chars → ~360 tokens

---

## Results

| | Greedy | think-twice only | surgical only | Both | Winner |
|---|---|---|---|---|---|
| Characters | ~3,980 | ~1,580 | ~810 | ~1,440 | surgical |
| Est. tokens | ~995 | ~395 | ~203 | ~360 | surgical |
| vs Greedy | baseline | 2.5x fewer | **4.9x fewer** | 2.8x fewer | surgical |
| Files touched | 3 new + 1 modified | 1 (+ package.json) | 1 | 1 (+ package.json) | surgical |

---

## Analysis

The user asked for prev/next buttons with 20 rows per page. That is a 15-line change to one existing file.
The greedy output is 995 tokens spread across four files and includes: a generic reusable hook (parametric
`pageSizeOptions`, configurable `initialPage`), a standalone `PaginationControls` component with full ARIA
labeling, keyboard navigation on a jump-to-page input, a results summary line, and a memoized sort layer
that was never requested and is explicitly tagged "in case sorting is needed later."

The sort layer is the clearest marker of greedy thinking. It is code added because the developer imagines
a future requirement, not because the user stated one. When the user later asks for sorting, adding it
takes five minutes. Pre-building it takes 40 lines of code the reviewer must read and understand today.

think-twice fires correctly: TanStack Table is the maintained standard for this class of component. Its
`getPaginationRowModel()` handles slicing, page clamping, and out-of-bounds safety — all the same concerns
the hand-rolled `usePagination` hook is solving, but with test coverage the hand-rolled version lacks.
think-twice reduces tokens significantly (995 → 395) but not maximally, because library wiring has
unavoidable boilerplate (imports, `flexRender`, column definitions).

surgical fires correctly too: it cuts the summary line, the page-size dropdown, the jump input, and the
sort layer, leaving only what was asked. The surgical output is the smallest and produces the fastest code
review: one file changed, 15 lines added, nothing to argue about.

The "both skills" result is larger than surgical alone (360 vs 203 tokens) because think-twice's library
recommendation adds import boilerplate that the hand-rolled slice doesn't need. The tradeoff is real —
TanStack Table's column definition DSL adds ~8 lines the raw map approach skips. For a standalone component
that will stay small, surgical alone wins on tokens. For a table that will grow (sorting, filtering,
server-side fetching, row selection), think-twice's redirect pays off in maintenance, not in output size.

This is the one benchmark in this suite where the two skills partially trade off against each other in
token terms: think-twice recommends a library that has more upfront wiring, surgical wants the minimum
wiring possible. The right call depends on growth trajectory. What both skills agree on: no sort layer
pre-built for a future nobody mentioned, no jump-to-page nobody asked for, no page-size dropdown nobody
requested.
