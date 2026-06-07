# Benchmark: Bug Fix (parse_date off-by-one)

**Scenario:** "Fix the off-by-one error in parse_date"  
**Skills tested:** surgical v1.0 (think-twice does not fire — task is trivially scoped, <10 lines)  
**Date:** 2026-06-07

---

## Original function

```python
def parse_date(date_str):
    parts = date_str.split('-')
    year = int(parts[0])
    month = int(parts[1])
    day = int(parts[2]) + 1  # BUG: off-by-one here
    return datetime(year, month, day)
```

---

## Greedy Output (no skills)

Claude fixes the bug and adds everything it can think of while it's "already there":
input validation, docstring, unit tests, logging, type annotations.

```python
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse a date string in YYYY-MM-DD format into a datetime object.

    Args:
        date_str: A date string in YYYY-MM-DD format.

    Returns:
        A datetime object representing the parsed date.

    Raises:
        TypeError: If date_str is not a string.
        ValueError: If date_str is not in the expected format or contains
            invalid date values.

    Examples:
        >>> parse_date("2024-01-15")
        datetime.datetime(2024, 1, 15, 0, 0)
        >>> parse_date("2024-13-01")
        Raises ValueError: Month must be 1-12, got 13
    """
    if not isinstance(date_str, str):
        raise TypeError(f"Expected str, got {type(date_str).__name__}")

    date_str = date_str.strip()

    if not date_str:
        raise ValueError("date_str cannot be empty")

    parts = date_str.split('-')

    if len(parts) != 3:
        raise ValueError(
            f"Expected format YYYY-MM-DD, got: {date_str!r}"
        )

    try:
        year = int(parts[0])
        month = int(parts[1])
        day = int(parts[2])  # Fixed: removed erroneous + 1
    except ValueError:
        raise ValueError(
            f"Non-integer component in date string: {date_str!r}"
        )

    if not (1 <= month <= 12):
        raise ValueError(f"Month must be 1-12, got {month}")

    if not (1 <= day <= 31):
        raise ValueError(f"Day must be 1-31, got {day}")

    try:
        result = datetime(year, month, day)
    except ValueError as e:
        raise ValueError(f"Invalid date {date_str!r}: {e}")

    logger.debug("Parsed date string %r → %s", date_str, result.date())
    return result
```

```python
import unittest
from datetime import datetime
from your_module import parse_date


class TestParseDateValid(unittest.TestCase):
    def test_standard_date(self):
        result = parse_date("2024-01-15")
        self.assertEqual(result, datetime(2024, 1, 15))

    def test_year_boundary(self):
        self.assertEqual(parse_date("2000-01-01"), datetime(2000, 1, 1))

    def test_end_of_month(self):
        self.assertEqual(parse_date("2024-01-31"), datetime(2024, 1, 31))

    def test_leap_day(self):
        self.assertEqual(parse_date("2024-02-29"), datetime(2024, 2, 29))

    def test_strips_whitespace(self):
        self.assertEqual(parse_date("  2024-01-15  "), datetime(2024, 1, 15))


class TestParseDateInvalid(unittest.TestCase):
    def test_non_string_input(self):
        with self.assertRaises(TypeError):
            parse_date(20240115)

    def test_none_input(self):
        with self.assertRaises(TypeError):
            parse_date(None)

    def test_empty_string(self):
        with self.assertRaises(ValueError):
            parse_date("")

    def test_wrong_separator(self):
        with self.assertRaises(ValueError):
            parse_date("15/01/2024")

    def test_wrong_order(self):
        with self.assertRaises(ValueError):
            parse_date("15-01-2024")

    def test_invalid_month(self):
        with self.assertRaises(ValueError):
            parse_date("2024-13-01")

    def test_invalid_day(self):
        with self.assertRaises(ValueError):
            parse_date("2024-02-30")

    def test_non_numeric_component(self):
        with self.assertRaises(ValueError):
            parse_date("2024-AB-15")


if __name__ == '__main__':
    unittest.main()
```

**Character count (code output):** 3,847 chars → ~962 tokens

---

## Lean Output (surgical active)

### surgical fires

Before each block, surgical asks: "Did the user explicitly ask for this?"

| Addition | Asked? | Decision |
|---|---|---|
| Type annotation `str` | No | **Cut** |
| `Optional[datetime]` return type | No | **Cut** |
| `isinstance` type guard | No | **Cut** — caller controls input |
| Empty string check | No | **Cut** — not a described case |
| Format validation (`len(parts) != 3`) | No | **Cut** |
| Month range check | No | **Cut** |
| Day range check | No | **Cut** |
| `logger.debug(...)` | No | **Cut** |
| Docstring with Args/Returns/Raises/Examples | No | **Cut** |
| 13 unit tests | No | **Cut** |
| `import logging` | No | **Cut** (logging removed) |

The fix itself, and the `datetime` import already present in the file: **kept**.

### Final response

```python
def parse_date(date_str):
    parts = date_str.split('-')
    year = int(parts[0])
    month = int(parts[1])
    day = int(parts[2])  # Fixed: removed erroneous + 1
    return datetime(year, month, day)
```

*Fixed the off-by-one on line 5 — removed the `+ 1`. Didn't add input validation or tests; let me know if you want those.*

**Character count (code output + note):** 243 chars → ~61 tokens

---

## Results

| | Greedy | Lean (surgical) |
|---|---|---|
| Characters | 3,847 | 243 |
| Est. tokens | ~962 | ~61 |
| Reduction | — | **−94% (16x fewer)** |

---

## Analysis

This is the clearest demonstration of surgical's value. The user said "fix the off-by-one error." That is a one-line change. Claude's greedy response produced 962 tokens of additions the user never requested: a full validation suite, a docstring longer than the function, 13 unit tests, and logging infrastructure. None of it was asked for. All of it must be reviewed.

The reviewability cost is the real issue. When a PR contains only the requested change, review takes seconds. When it contains 60 lines of unrequested additions, the reviewer must audit each one: "Did we need this? Is this correct? Does this change behavior? Why is the logger here?" That cognitive load is the hidden tax on every greedy response.

surgical's output is the correct response to "fix the off-by-one": the fix, and an explicit note about what was deliberately left out. The user now has the option to ask for validation or tests — as a deliberate choice, not as something they have to find and delete.

Note on think-twice: this scenario correctly does not trigger think-twice. The task is trivially scoped — one line, no data, no new dependencies. think-twice's skip condition ("trivially small, <10 lines") fires exactly here.
