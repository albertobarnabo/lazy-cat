# Benchmark: Dark Mode Toggle

**Scenario:** "Add a dark mode toggle button to the header"
**Skills tested:** surgical (scope creep on a UI feature)
**Date:** 2026-06-07

---

## Original header component

```jsx
export function Header() {
  return (
    <header className="header">
      <h1>MyApp</h1>
      <nav>...</nav>
    </header>
  );
}
```

The ask is a single button in an existing component. Total surface area of the request: one element added to one file.

---

## Greedy Output (no skills)

Claude interprets "dark mode toggle" as an invitation to build a complete theming system: a React Context with a `ThemeProvider`, a `useTheme` hook, localStorage persistence, `prefers-color-scheme` system detection, smooth CSS transitions across all color properties, a full CSS custom property token set for both themes, a dedicated `ThemeToggle` component, TypeScript types, and a wrapper in `main.tsx`. This is technically correct and production-quality. It is also roughly 12x more code than the task required.

```tsx
// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored) return stored;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// src/theme/ThemeToggle.tsx
import React from "react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}

// src/components/Header.tsx
import React from "react";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Header() {
  return (
    <header className="header">
      <h1>MyApp</h1>
      <nav>...</nav>
      <ThemeToggle />
    </header>
  );
}

// src/main.tsx  (wrap app in provider)
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./theme/ThemeContext";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

/* src/theme/theme.css */
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-primary: #0070f3;
  --color-primary-hover: #005dd1;
  --color-muted: #666666;
  --color-header-bg: #ffffff;
  --color-header-shadow: rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #ededed;
  --color-surface: #1a1a1a;
  --color-border: #2e2e2e;
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
  --color-muted: #a0a0a0;
  --color-header-bg: #111111;
  --color-header-shadow: rgba(0, 0, 0, 0.4);
}

*,
*::before,
*::after {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.header {
  background-color: var(--color-header-bg);
  box-shadow: 0 1px 4px var(--color-header-shadow);
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  padding: 6px 8px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background-color: var(--color-surface);
}
```

**Character count:** 3,847 chars → ~962 tokens

---

## think-twice only

think-twice fires and surveys the solution space before writing code. It asks: is there an existing library that handles this better? Candidates: `next-themes` (Next.js-specific, not applicable), `react-use-dark-mode` (adds a dependency for ~15 lines of logic), `use-dark-mode` (same story). Conclusion: the CSS custom property + `data-theme` attribute pattern is already the standard minimal approach for plain React — no library is warranted. think-twice validates the strategy but does not cut scope. Claude proceeds with the same full theme system — ThemeProvider, useTheme, persistence, system detection — because think-twice optimizes *approach*, not *volume*.

```tsx
// think-twice evaluated: next-themes (Next.js only — skip), react-use-dark-mode
// (dep for 15 lines — skip), CSS class/data-attr toggle (standard, no dep — proceed).

// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored) return stored;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// src/theme/ThemeToggle.tsx
import React from "react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

// src/components/Header.tsx
import React from "react";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Header() {
  return (
    <header className="header">
      <h1>MyApp</h1>
      <nav>...</nav>
      <ThemeToggle />
    </header>
  );
}

// Wrap App in ThemeProvider in src/main.tsx:
// <ThemeProvider><App /></ThemeProvider>

/* src/theme/theme.css */
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-primary: #0070f3;
}

[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #ededed;
  --color-surface: #1a1a1a;
  --color-border: #2e2e2e;
  --color-primary: #3b82f6;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  padding: 6px 10px;
  font-size: 16px;
}
```

**Character count:** 2,891 chars → ~723 tokens

---

## Lean Output (surgical active)

### surgical fires

surgical reads the request literally: "add a dark mode toggle button to the header." It identifies what was asked vs. what Claude was about to build:

| What was asked | What greedy adds | Cut? |
|---|---|---|
| A button in the header | ThemeContext + ThemeProvider | Cut |
| Toggle dark/light | useTheme custom hook | Cut |
| Dark mode CSS | localStorage persistence | Cut |
| — | System `prefers-color-scheme` detection | Cut |
| — | CSS transitions on all properties | Cut |
| — | Full CSS token system (18 variables) | Cut |
| — | Separate ThemeToggle component | Cut |
| — | TypeScript types for Theme | Cut |
| — | Changes to main.tsx / provider wrap | Cut |

Everything kept: state for dark/light, effect to apply a class, the button, minimal CSS for dark colors.

### Minimal implementation

```jsx
// src/components/Header.jsx  (only file changed)
import { useState, useEffect } from "react";

export function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="header">
      <h1>MyApp</h1>
      <nav>...</nav>
      <button onClick={() => setDark(!dark)}>
        {dark ? "Light mode" : "Dark mode"}
      </button>
    </header>
  );
}

/* Add to your existing CSS */
.dark {
  background: #111;
  color: #eee;
}

.dark .header {
  background: #1a1a1a;
}
```

**Character count:** 469 chars → ~117 tokens

---

## Both skills

think-twice confirms: toggling a class on `document.body` is already the smartest minimal approach — no library improves on it for a plain React app. surgical confirms: scope stays at the header file plus four CSS lines. Both skills converge on the same answer as surgical alone.

```jsx
// think-twice: CSS class toggle on body is the standard minimal approach — no library warranted.
// surgical: no Context, no hook file, no persistence, no transitions, no separate component.

// src/components/Header.jsx  (only file changed)
import { useState, useEffect } from "react";

export function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="header">
      <h1>MyApp</h1>
      <nav>...</nav>
      <button onClick={() => setDark(!dark)}>
        {dark ? "Light mode" : "Dark mode"}
      </button>
    </header>
  );
}

/* Add to your existing CSS */
.dark {
  background: #111;
  color: #eee;
}

.dark .header {
  background: #1a1a1a;
}
```

**Character count:** 607 chars → ~152 tokens

---

## Results

| | Greedy | think-twice only | surgical only | Both |
|---|---|---|---|---|
| Characters | 3,847 | 2,891 | 469 | 607 |
| Est. tokens | ~962 | ~723 | ~117 | ~152 |
| vs Greedy | baseline | 0.75x | **0.12x** | **0.16x** |
| Files touched | 5 | 5 | 1 | 1 |
| Winner | — | — | surgical | both |

**Winner: surgical** (and both-skills, which converges with surgical).

---

## Analysis

The user said "add a dark mode toggle button to the header" — a request with a clear, bounded surface area: one element in one existing component. The greedy output is 3,847 characters across five files; the surgical output is 469 characters in one file, and it works correctly. The minimal version is not a compromise: it toggles dark mode, it applies correct colors, and it is trivially extensible — if the user later wants localStorage persistence they ask for it and Claude adds the one `useEffect` line. The greedy output, by contrast, forces the user to understand a Context/Provider pattern, modify `main.tsx`, and maintain a separate `theme/` directory, none of which they requested. think-twice does not help here because the problem is not strategic (there is no wrong library to avoid) — it is scope: Claude inflated a 12-line answer into a 160-line theme system. surgical is the correct intervention for this class of request, where the ask is a UI element and the risk is an architecture response.
