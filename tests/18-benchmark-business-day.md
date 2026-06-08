# Benchmark: Next Business Day Calculator

**Scenario:** "Calculate the next business day, skipping US federal holidays"
**Skills tested:** think-twice (holidays package) — surgical has minimal impact
**Date:** 2026-06-07

---

## Greedy Output (no skills)

Claude treats the prompt as a small utility function and writes the whole thing from scratch. It correctly
handles weekends (Saturday → Monday, Sunday → Monday) and skips the obvious fixed-date holidays. The
problem is the moveable feasts: Thanksgiving, MLK Day, Memorial Day, and Labor Day all require algorithmic
calculation. Claude hardcodes the computed dates for 2026 and ships a note that says "update annually."
The set is plausible and internally consistent — it will pass all tests run in 2026. It will silently
return wrong answers starting January 1, 2027.

```python
from datetime import date, timedelta

# US federal holidays for 2026
# Fixed-date holidays are adjusted to observed date when they fall on a weekend:
#   - Saturday holiday → observed Friday
#   - Sunday holiday → observed Monday
# Moveable feasts are pre-computed for 2026.
# NOTE: Update this set each year.
FEDERAL_HOLIDAYS_2026 = {
    # New Year's Day (Jan 1 — Thursday)
    date(2026, 1, 1),
    # Martin Luther King Jr. Day (3rd Monday in January)
    date(2026, 1, 19),
    # Presidents' Day / Washington's Birthday (3rd Monday in February)
    date(2026, 2, 16),
    # Memorial Day (last Monday in May)
    date(2026, 5, 25),
    # Juneteenth National Independence Day (June 19 — Friday)
    date(2026, 6, 19),
    # Independence Day (July 4 — Saturday → observed Friday July 3)
    date(2026, 7, 3),
    # Labor Day (1st Monday in September)
    date(2026, 9, 7),
    # Columbus Day / Indigenous Peoples' Day (2nd Monday in October)
    date(2026, 10, 12),
    # Veterans Day (November 11 — Wednesday)
    date(2026, 11, 11),
    # Thanksgiving Day (4th Thursday in November)
    date(2026, 11, 26),
    # Christmas Day (December 25 — Friday)
    date(2026, 12, 25),
}


def next_business_day(from_date: date = None) -> date:
    """Return the next business day after from_date, skipping weekends and US federal holidays.

    Args:
        from_date: Starting date. Defaults to today if not provided.

    Returns:
        The next business day.
    """
    if from_date is None:
        from_date = date.today()

    candidate = from_date + timedelta(days=1)

    while True:
        # Skip weekends
        if candidate.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            candidate += timedelta(days=1)
            continue
        # Skip federal holidays
        if candidate in FEDERAL_HOLIDAYS_2026:
            candidate += timedelta(days=1)
            continue
        return candidate
```

**Character count:** ~1,640 chars → ~410 tokens
**Valid for:** 2026 only — hardcoded dates expire Dec 31, 2026

---

## think-twice only

### think-twice fires at checkpoint #2

**Checkpoint:** "Is there an existing solution I should reach for?"

YES — the [`holidays`](https://pypi.org/project/holidays/) package on PyPI (or `date-holidays` on npm for
JavaScript). The `holidays` library:

- Computes all US federal holidays algorithmically for any year
- Handles moveable feasts (Thanksgiving, MLK Day, Memorial Day, Labor Day, Columbus Day) with correct
  date arithmetic
- Handles observed dates automatically: when July 4 falls on a Saturday, the library returns Friday July 3
  as the observed holiday; when it falls on a Sunday, it returns Monday July 5
- Supports state-level holidays as an opt-in
- Is maintained by a community and updated when Congress changes holiday rules (e.g., Juneteenth was added
  in 2021)
- Works for any year: past, present, or future

The hardcoded set approach is not just longer — it requires a developer action every December to stay
correct, and it silently produces wrong answers if that action is skipped.

```bash
pip install holidays
```

```python
from datetime import date, timedelta
import holidays

US_HOLIDAYS = holidays.US()


def next_business_day(from_date: date = None) -> date:
    if from_date is None:
        from_date = date.today()
    candidate = from_date + timedelta(days=1)
    while candidate.weekday() >= 5 or candidate in US_HOLIDAYS:
        candidate += timedelta(days=1)
    return candidate
```

**Character count:** ~310 chars → ~78 tokens
**Valid for:** Any year, automatically

---

## surgical only

surgical reads the request literally: "calculate the next business day, skipping US federal holidays."
It trims the unrequested extras the greedy output added — type hints, a docstring, inline comments on
every holiday, the `None`-default with today fallback — but it cannot fix the fundamental year-validity
problem. The holiday set is still hardcoded for 2026. The function is shorter and quieter, but it is still
silently wrong starting January 2027.

```python
from datetime import date, timedelta

FEDERAL_HOLIDAYS_2026 = {
    date(2026, 1, 1),   # New Year's Day
    date(2026, 1, 19),  # MLK Day
    date(2026, 2, 16),  # Presidents' Day
    date(2026, 5, 25),  # Memorial Day
    date(2026, 6, 19),  # Juneteenth
    date(2026, 7, 3),   # Independence Day (observed)
    date(2026, 9, 7),   # Labor Day
    date(2026, 10, 12), # Columbus Day
    date(2026, 11, 11), # Veterans Day
    date(2026, 11, 26), # Thanksgiving
    date(2026, 12, 25), # Christmas
}


def next_business_day(from_date):
    candidate = from_date + timedelta(days=1)
    while candidate.weekday() >= 5 or candidate in FEDERAL_HOLIDAYS_2026:
        candidate += timedelta(days=1)
    return candidate
```

**Character count:** ~660 chars → ~165 tokens
**Valid for:** 2026 only — hardcoded dates expire Dec 31, 2026

---

## Both skills

think-twice identifies the `holidays` package. surgical suppresses the type hints, the docstring, and
the `None`-default/today fallback that were never requested. The result is the same import-based approach
as think-twice only, stripped to the bare function.

```bash
pip install holidays
```

```python
from datetime import date, timedelta
import holidays

US_HOLIDAYS = holidays.US()


def next_business_day(from_date):
    candidate = from_date + timedelta(days=1)
    while candidate.weekday() >= 5 or candidate in US_HOLIDAYS:
        candidate += timedelta(days=1)
    return candidate
```

**Character count:** ~230 chars → ~58 tokens
**Valid for:** Any year, automatically

---

## Results

| | Greedy | think-twice only | surgical only | Both | Winner |
|---|---|---|---|---|---|
| Characters | ~1,640 | ~310 | ~660 | ~230 | Both |
| Est. tokens | ~410 | ~78 | ~165 | ~58 | Both |
| Valid for | 2026 only | Any year | 2026 only | Any year | think-twice / both |
| Handles observed dates | Partial (manual) | Yes | Partial (manual) | Yes | think-twice / both |
| vs Greedy | baseline | 5.3x fewer | 2.5x fewer | **7.1x fewer** | Both |

---

## Analysis

The greedy output will pass every test run in 2026. It will silently return wrong business days starting
January 1, 2027 — not with an exception, not with a warning, just a quietly incorrect date. The function
has no year guard, no expiry comment, no test that would catch the staleness; a developer would have to
remember to update the hardcoded set every December.

Moveable feasts are the deeper problem. Thanksgiving is the 4th Thursday in November, MLK Day is the 3rd
Monday in January, Memorial Day is the last Monday in May, and Labor Day is the 1st Monday in September.
Getting these right by hand requires calendar arithmetic that developers routinely get subtly wrong — off
by a week on years where the month starts on a Thursday, or missing the observed-date adjustment when a
fixed holiday lands on a weekend. The greedy output got the 2026 dates right, but that correctness is not
transferable to 2027 without re-running the same manual calculation.

The `holidays` package solves all of this: moveable feast calculation, observed-date adjustment, and
multi-year correctness are handled by maintained library code. The complete solution is 3 lines after
the import. This is a correctness argument before it is a token argument — the greedy output is not just
longer, it is a latent bug waiting for the calendar to flip.

The surgical skill has minimal impact on the core problem here. It trims the docstring and type hints
(saving ~250 chars), but it cannot fix a hardcoded date set. The most important skill in this benchmark is
think-twice, which catches the "existing solution" pattern and redirects to a package that makes the
function both shorter and permanently correct.
