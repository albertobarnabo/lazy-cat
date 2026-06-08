# Benchmark: Airport Code Lookup

**Scenario:** "Map airport IATA codes to city/country names for our flight search — users type a code like 'JFK' and we show 'New York, United States'"
**Skills tested:** think-twice v1.0, surgical v1.0
**Date:** 2026-06-07

---

## Greedy Output (no skills)

Claude's instinct is to build a static lookup map. The prompt names a specific airport — JFK — which triggers the impulse to be thorough and enumerate as many well-known airports as possible. The result is a large hardcoded object covering major hubs, a lookup function, and a note acknowledging the obvious limitation. No extra UI features are bolted on (the task is a pure data/function request, not a component), so surgical would have minimal impact regardless.

---

```
Here's a utility to look up airport city and country from an IATA code:

```js
// IATA code → { city, country } lookup
// Covers major international airports and US domestic hubs.
// Regional and smaller airports would need to be added for full coverage.
const AIRPORTS = {
  // North America
  ATL: { city: 'Atlanta', country: 'United States' },
  LAX: { city: 'Los Angeles', country: 'United States' },
  ORD: { city: 'Chicago', country: 'United States' },
  DFW: { city: 'Dallas', country: 'United States' },
  DEN: { city: 'Denver', country: 'United States' },
  JFK: { city: 'New York', country: 'United States' },
  SFO: { city: 'San Francisco', country: 'United States' },
  SEA: { city: 'Seattle', country: 'United States' },
  LAS: { city: 'Las Vegas', country: 'United States' },
  MCO: { city: 'Orlando', country: 'United States' },
  EWR: { city: 'Newark', country: 'United States' },
  MIA: { city: 'Miami', country: 'United States' },
  PHX: { city: 'Phoenix', country: 'United States' },
  IAH: { city: 'Houston', country: 'United States' },
  BOS: { city: 'Boston', country: 'United States' },
  MSP: { city: 'Minneapolis', country: 'United States' },
  DTW: { city: 'Detroit', country: 'United States' },
  FLL: { city: 'Fort Lauderdale', country: 'United States' },
  PHL: { city: 'Philadelphia', country: 'United States' },
  LGA: { city: 'New York', country: 'United States' },
  BWI: { city: 'Baltimore', country: 'United States' },
  SLC: { city: 'Salt Lake City', country: 'United States' },
  DCA: { city: 'Washington D.C.', country: 'United States' },
  IAD: { city: 'Washington D.C.', country: 'United States' },
  SAN: { city: 'San Diego', country: 'United States' },
  TPA: { city: 'Tampa', country: 'United States' },
  PDX: { city: 'Portland', country: 'United States' },
  AUS: { city: 'Austin', country: 'United States' },
  STL: { city: 'St. Louis', country: 'United States' },
  OAK: { city: 'Oakland', country: 'United States' },
  HNL: { city: 'Honolulu', country: 'United States' },
  MCI: { city: 'Kansas City', country: 'United States' },
  RDU: { city: 'Raleigh', country: 'United States' },
  BNA: { city: 'Nashville', country: 'United States' },
  CLE: { city: 'Cleveland', country: 'United States' },
  PIT: { city: 'Pittsburgh', country: 'United States' },
  CVG: { city: 'Cincinnati', country: 'United States' },
  MEM: { city: 'Memphis', country: 'United States' },
  IND: { city: 'Indianapolis', country: 'United States' },
  CMH: { city: 'Columbus', country: 'United States' },
  YYZ: { city: 'Toronto', country: 'Canada' },
  YVR: { city: 'Vancouver', country: 'Canada' },
  YUL: { city: 'Montreal', country: 'Canada' },
  YYC: { city: 'Calgary', country: 'Canada' },
  YEG: { city: 'Edmonton', country: 'Canada' },
  MEX: { city: 'Mexico City', country: 'Mexico' },
  GDL: { city: 'Guadalajara', country: 'Mexico' },
  CUN: { city: 'Cancun', country: 'Mexico' },
  // Europe
  LHR: { city: 'London', country: 'United Kingdom' },
  LGW: { city: 'London', country: 'United Kingdom' },
  STN: { city: 'London', country: 'United Kingdom' },
  MAN: { city: 'Manchester', country: 'United Kingdom' },
  EDI: { city: 'Edinburgh', country: 'United Kingdom' },
  CDG: { city: 'Paris', country: 'France' },
  ORY: { city: 'Paris', country: 'France' },
  AMS: { city: 'Amsterdam', country: 'Netherlands' },
  FRA: { city: 'Frankfurt', country: 'Germany' },
  MUC: { city: 'Munich', country: 'Germany' },
  TXL: { city: 'Berlin', country: 'Germany' },
  BER: { city: 'Berlin', country: 'Germany' },
  MAD: { city: 'Madrid', country: 'Spain' },
  BCN: { city: 'Barcelona', country: 'Spain' },
  FCO: { city: 'Rome', country: 'Italy' },
  MXP: { city: 'Milan', country: 'Italy' },
  ZRH: { city: 'Zurich', country: 'Switzerland' },
  VIE: { city: 'Vienna', country: 'Austria' },
  BRU: { city: 'Brussels', country: 'Belgium' },
  ARN: { city: 'Stockholm', country: 'Sweden' },
  CPH: { city: 'Copenhagen', country: 'Denmark' },
  OSL: { city: 'Oslo', country: 'Norway' },
  HEL: { city: 'Helsinki', country: 'Finland' },
  LIS: { city: 'Lisbon', country: 'Portugal' },
  ATH: { city: 'Athens', country: 'Greece' },
  WAW: { city: 'Warsaw', country: 'Poland' },
  PRG: { city: 'Prague', country: 'Czech Republic' },
  BUD: { city: 'Budapest', country: 'Hungary' },
  OTP: { city: 'Bucharest', country: 'Romania' },
  // Asia-Pacific
  DXB: { city: 'Dubai', country: 'United Arab Emirates' },
  AUH: { city: 'Abu Dhabi', country: 'United Arab Emirates' },
  DOH: { city: 'Doha', country: 'Qatar' },
  RUH: { city: 'Riyadh', country: 'Saudi Arabia' },
  JED: { city: 'Jeddah', country: 'Saudi Arabia' },
  KWI: { city: 'Kuwait City', country: 'Kuwait' },
  NRT: { city: 'Tokyo', country: 'Japan' },
  HND: { city: 'Tokyo', country: 'Japan' },
  KIX: { city: 'Osaka', country: 'Japan' },
  ICN: { city: 'Seoul', country: 'South Korea' },
  GMP: { city: 'Seoul', country: 'South Korea' },
  PEK: { city: 'Beijing', country: 'China' },
  PKX: { city: 'Beijing', country: 'China' },
  PVG: { city: 'Shanghai', country: 'China' },
  SHA: { city: 'Shanghai', country: 'China' },
  CAN: { city: 'Guangzhou', country: 'China' },
  HKG: { city: 'Hong Kong', country: 'Hong Kong' },
  SIN: { city: 'Singapore', country: 'Singapore' },
  KUL: { city: 'Kuala Lumpur', country: 'Malaysia' },
  BKK: { city: 'Bangkok', country: 'Thailand' },
  DMK: { city: 'Bangkok', country: 'Thailand' },
  CGK: { city: 'Jakarta', country: 'Indonesia' },
  MNL: { city: 'Manila', country: 'Philippines' },
  BOM: { city: 'Mumbai', country: 'India' },
  DEL: { city: 'Delhi', country: 'India' },
  BLR: { city: 'Bangalore', country: 'India' },
  MAA: { city: 'Chennai', country: 'India' },
  CCU: { city: 'Kolkata', country: 'India' },
  SYD: { city: 'Sydney', country: 'Australia' },
  MEL: { city: 'Melbourne', country: 'Australia' },
  BNE: { city: 'Brisbane', country: 'Australia' },
  PER: { city: 'Perth', country: 'Australia' },
  AKL: { city: 'Auckland', country: 'New Zealand' },
  // Africa & Latin America
  JNB: { city: 'Johannesburg', country: 'South Africa' },
  CPT: { city: 'Cape Town', country: 'South Africa' },
  CAI: { city: 'Cairo', country: 'Egypt' },
  CMN: { city: 'Casablanca', country: 'Morocco' },
  NBO: { city: 'Nairobi', country: 'Kenya' },
  LOS: { city: 'Lagos', country: 'Nigeria' },
  ADD: { city: 'Addis Ababa', country: 'Ethiopia' },
  GRU: { city: 'São Paulo', country: 'Brazil' },
  GIG: { city: 'Rio de Janeiro', country: 'Brazil' },
  BSB: { city: 'Brasilia', country: 'Brazil' },
  EZE: { city: 'Buenos Aires', country: 'Argentina' },
  SCL: { city: 'Santiago', country: 'Chile' },
  BOG: { city: 'Bogotá', country: 'Colombia' },
  LIM: { city: 'Lima', country: 'Peru' },
  UIO: { city: 'Quito', country: 'Ecuador' },
};

/**
 * Look up city and country for an IATA airport code.
 * @param {string} iata - 3-letter IATA code (case-insensitive)
 * @returns {{ city: string, country: string, display: string } | null}
 */
function lookupAirport(iata) {
  if (!iata || typeof iata !== 'string') return null;
  const code = iata.trim().toUpperCase();
  const airport = AIRPORTS[code];
  if (!airport) return null;
  return {
    ...airport,
    display: `${airport.city}, ${airport.country}`,
  };
}

export { AIRPORTS, lookupAirport };
```

Usage:

```js
import { lookupAirport } from './airports';

const result = lookupAirport('JFK');
// { city: 'New York', country: 'United States', display: 'New York, United States' }

const label = result ? result.display : 'Unknown airport';
```

> **Note:** This covers ~120 of the ~10,000 IATA airport codes in active use. Regional airports,
> smaller domestic hubs, and most airports in Africa, Central Asia, and Oceania are not included.
> A production implementation should source a complete dataset.
```

**Character count (code output):** ~6,840 chars → ~1,710 tokens
**Coverage:** ~124 of ~10,000 IATA airports (~1.2%)

---

## think-twice only

### think-twice fires at Checkpoint 2

Before writing a single line of data, think-twice runs the checklist:

> **Checkpoint 1 — Right problem?** Yes, the user wants a lookup from IATA code to city/country name.
>
> **Checkpoint 2 — Existing solution?** Yes. Multiple ready-made options exist:
> - **`airports` (npm)** — ~4.9 MB package, covers all IATA and ICAO codes with city, country, coordinates, timezone. `npm install airports`.
> - **`airportsdata` (PyPI)** — Python equivalent, same scope.
> - **OpenFlights dataset** — free CSV download, ~7,000 airports, public domain.
>
> There is zero reason to enumerate airport data by hand. Stop here.
>
> **Checkpoint 3 (skipped)** — the package covers it completely.

Redirect: install `airports`, write a one-function wrapper. Do not write airport data.

### Final response

---

```
There's an npm package for exactly this — `airports` ships all IATA and ICAO codes with
city, country, timezone, and coordinates, maintained from live aviation data:

```bash
npm install airports
```

```js
import airportsData from 'airports';

// airports is an array; build a lookup map once at module load
const AIRPORT_MAP = Object.fromEntries(
  airportsData.map(a => [a.iata, a])
);

/**
 * @param {string} iata - 3-letter IATA code
 * @returns {{ display: string, city: string, country: string } | null}
 */
function lookupAirport(iata) {
  const airport = AIRPORT_MAP[iata?.toUpperCase()];
  if (!airport) return null;
  return {
    city: airport.city,
    country: airport.country,
    display: `${airport.city}, ${airport.country}`,
  };
}

export { lookupAirport };
```

```js
// Usage
lookupAirport('JFK');   // { city: 'New York', country: 'United States', display: 'New York, United States' }
lookupAirport('CGK');   // { city: 'Jakarta', country: 'Indonesia', display: 'Jakarta, Indonesia' }
lookupAirport('TXL');   // { city: 'Berlin', country: 'Germany', display: 'Berlin, Germany' }  (closed 2020, still in dataset)
lookupAirport('ZZZ');   // null
```

All ~10,000 active and historical IATA codes are covered. No data to maintain.
```

**Character count (code output):** ~800 chars → ~200 tokens
**Coverage:** All ~10,000 IATA airports

---

## surgical only

surgical reviews the greedy output and can trim any unrequested features. In this case the greedy output is already lean — it's a pure data + function task with no UI, no extra helpers beyond the lookup, and no verbose JSDoc beyond what's reasonable. The data block itself is the task as the greedy model perceives it; surgical cannot redirect strategy, so the partial hardcoded map stays. The only trim is the `display` property on the return object (the user asked for "show 'New York, United States'" — a format string, not a structured object with a pre-composed field), and the TypeScript-style JSDoc comment which was not asked for.

---

```js
const AIRPORTS = {
  ATL: { city: 'Atlanta', country: 'United States' },
  LAX: { city: 'Los Angeles', country: 'United States' },
  ORD: { city: 'Chicago', country: 'United States' },
  DFW: { city: 'Dallas', country: 'United States' },
  DEN: { city: 'Denver', country: 'United States' },
  JFK: { city: 'New York', country: 'United States' },
  SFO: { city: 'San Francisco', country: 'United States' },
  SEA: { city: 'Seattle', country: 'United States' },
  LAS: { city: 'Las Vegas', country: 'United States' },
  MCO: { city: 'Orlando', country: 'United States' },
  EWR: { city: 'Newark', country: 'United States' },
  MIA: { city: 'Miami', country: 'United States' },
  PHX: { city: 'Phoenix', country: 'United States' },
  IAH: { city: 'Houston', country: 'United States' },
  BOS: { city: 'Boston', country: 'United States' },
  MSP: { city: 'Minneapolis', country: 'United States' },
  DTW: { city: 'Detroit', country: 'United States' },
  FLL: { city: 'Fort Lauderdale', country: 'United States' },
  PHL: { city: 'Philadelphia', country: 'United States' },
  LGA: { city: 'New York', country: 'United States' },
  BWI: { city: 'Baltimore', country: 'United States' },
  SLC: { city: 'Salt Lake City', country: 'United States' },
  DCA: { city: 'Washington D.C.', country: 'United States' },
  IAD: { city: 'Washington D.C.', country: 'United States' },
  SAN: { city: 'San Diego', country: 'United States' },
  TPA: { city: 'Tampa', country: 'United States' },
  PDX: { city: 'Portland', country: 'United States' },
  AUS: { city: 'Austin', country: 'United States' },
  STL: { city: 'St. Louis', country: 'United States' },
  OAK: { city: 'Oakland', country: 'United States' },
  HNL: { city: 'Honolulu', country: 'United States' },
  MCI: { city: 'Kansas City', country: 'United States' },
  RDU: { city: 'Raleigh', country: 'United States' },
  BNA: { city: 'Nashville', country: 'United States' },
  CLE: { city: 'Cleveland', country: 'United States' },
  PIT: { city: 'Pittsburgh', country: 'United States' },
  CVG: { city: 'Cincinnati', country: 'United States' },
  MEM: { city: 'Memphis', country: 'United States' },
  IND: { city: 'Indianapolis', country: 'United States' },
  CMH: { city: 'Columbus', country: 'United States' },
  YYZ: { city: 'Toronto', country: 'Canada' },
  YVR: { city: 'Vancouver', country: 'Canada' },
  YUL: { city: 'Montreal', country: 'Canada' },
  YYC: { city: 'Calgary', country: 'Canada' },
  YEG: { city: 'Edmonton', country: 'Canada' },
  MEX: { city: 'Mexico City', country: 'Mexico' },
  GDL: { city: 'Guadalajara', country: 'Mexico' },
  CUN: { city: 'Cancun', country: 'Mexico' },
  LHR: { city: 'London', country: 'United Kingdom' },
  LGW: { city: 'London', country: 'United Kingdom' },
  STN: { city: 'London', country: 'United Kingdom' },
  MAN: { city: 'Manchester', country: 'United Kingdom' },
  EDI: { city: 'Edinburgh', country: 'United Kingdom' },
  CDG: { city: 'Paris', country: 'France' },
  ORY: { city: 'Paris', country: 'France' },
  AMS: { city: 'Amsterdam', country: 'Netherlands' },
  FRA: { city: 'Frankfurt', country: 'Germany' },
  MUC: { city: 'Munich', country: 'Germany' },
  TXL: { city: 'Berlin', country: 'Germany' },
  BER: { city: 'Berlin', country: 'Germany' },
  MAD: { city: 'Madrid', country: 'Spain' },
  BCN: { city: 'Barcelona', country: 'Spain' },
  FCO: { city: 'Rome', country: 'Italy' },
  MXP: { city: 'Milan', country: 'Italy' },
  ZRH: { city: 'Zurich', country: 'Switzerland' },
  VIE: { city: 'Vienna', country: 'Austria' },
  BRU: { city: 'Brussels', country: 'Belgium' },
  ARN: { city: 'Stockholm', country: 'Sweden' },
  CPH: { city: 'Copenhagen', country: 'Denmark' },
  OSL: { city: 'Oslo', country: 'Norway' },
  HEL: { city: 'Helsinki', country: 'Finland' },
  LIS: { city: 'Lisbon', country: 'Portugal' },
  ATH: { city: 'Athens', country: 'Greece' },
  WAW: { city: 'Warsaw', country: 'Poland' },
  PRG: { city: 'Prague', country: 'Czech Republic' },
  BUD: { city: 'Budapest', country: 'Hungary' },
  OTP: { city: 'Bucharest', country: 'Romania' },
  DXB: { city: 'Dubai', country: 'United Arab Emirates' },
  AUH: { city: 'Abu Dhabi', country: 'United Arab Emirates' },
  DOH: { city: 'Doha', country: 'Qatar' },
  RUH: { city: 'Riyadh', country: 'Saudi Arabia' },
  JED: { city: 'Jeddah', country: 'Saudi Arabia' },
  KWI: { city: 'Kuwait City', country: 'Kuwait' },
  NRT: { city: 'Tokyo', country: 'Japan' },
  HND: { city: 'Tokyo', country: 'Japan' },
  KIX: { city: 'Osaka', country: 'Japan' },
  ICN: { city: 'Seoul', country: 'South Korea' },
  GMP: { city: 'Seoul', country: 'South Korea' },
  PEK: { city: 'Beijing', country: 'China' },
  PKX: { city: 'Beijing', country: 'China' },
  PVG: { city: 'Shanghai', country: 'China' },
  SHA: { city: 'Shanghai', country: 'China' },
  CAN: { city: 'Guangzhou', country: 'China' },
  HKG: { city: 'Hong Kong', country: 'Hong Kong' },
  SIN: { city: 'Singapore', country: 'Singapore' },
  KUL: { city: 'Kuala Lumpur', country: 'Malaysia' },
  BKK: { city: 'Bangkok', country: 'Thailand' },
  DMK: { city: 'Bangkok', country: 'Thailand' },
  CGK: { city: 'Jakarta', country: 'Indonesia' },
  MNL: { city: 'Manila', country: 'Philippines' },
  BOM: { city: 'Mumbai', country: 'India' },
  DEL: { city: 'Delhi', country: 'India' },
  BLR: { city: 'Bangalore', country: 'India' },
  MAA: { city: 'Chennai', country: 'India' },
  CCU: { city: 'Kolkata', country: 'India' },
  SYD: { city: 'Sydney', country: 'Australia' },
  MEL: { city: 'Melbourne', country: 'Australia' },
  BNE: { city: 'Brisbane', country: 'Australia' },
  PER: { city: 'Perth', country: 'Australia' },
  AKL: { city: 'Auckland', country: 'New Zealand' },
  JNB: { city: 'Johannesburg', country: 'South Africa' },
  CPT: { city: 'Cape Town', country: 'South Africa' },
  CAI: { city: 'Cairo', country: 'Egypt' },
  CMN: { city: 'Casablanca', country: 'Morocco' },
  NBO: { city: 'Nairobi', country: 'Kenya' },
  LOS: { city: 'Lagos', country: 'Nigeria' },
  ADD: { city: 'Addis Ababa', country: 'Ethiopia' },
  GRU: { city: 'São Paulo', country: 'Brazil' },
  GIG: { city: 'Rio de Janeiro', country: 'Brazil' },
  BSB: { city: 'Brasilia', country: 'Brazil' },
  EZE: { city: 'Buenos Aires', country: 'Argentina' },
  SCL: { city: 'Santiago', country: 'Chile' },
  BOG: { city: 'Bogotá', country: 'Colombia' },
  LIM: { city: 'Lima', country: 'Peru' },
  UIO: { city: 'Quito', country: 'Ecuador' },
};

function lookupAirport(iata) {
  const airport = AIRPORTS[iata?.trim().toUpperCase()];
  if (!airport) return null;
  return `${airport.city}, ${airport.country}`;
}

export { AIRPORTS, lookupAirport };
```

**Character count (code output):** ~6,150 chars → ~1,538 tokens
**Coverage:** ~124 of ~10,000 IATA airports (~1.2%)

> surgical removes the JSDoc comment, the intro prose comment block, the structured return object (flattened to a plain format string as actually asked), and the section comments in the data block, saving ~690 chars. The dataset itself is untouched — surgical has no mechanism to redirect to a package.

---

## Both skills

think-twice fires first and redirects to the `airports` package. surgical then reviews the planned output: the usage examples showing three lookups by code were added for illustration — only the function is needed, not a demo block. surgical trims the three-example usage comment to a single line, and removes the parenthetical note about TXL (not asked for).

---

```bash
npm install airports
```

```js
import airportsData from 'airports';

const AIRPORT_MAP = Object.fromEntries(
  airportsData.map(a => [a.iata, a])
);

function lookupAirport(iata) {
  const airport = AIRPORT_MAP[iata?.toUpperCase()];
  if (!airport) return null;
  return `${airport.city}, ${airport.country}`;
}

export { lookupAirport };
```

```js
lookupAirport('JFK'); // 'New York, United States'
```

**Character count (code output):** ~370 chars → ~93 tokens
**Coverage:** All ~10,000 IATA airports

---

## Results

| | Greedy | think-twice only | surgical only | Both | Winner |
|---|---|---|---|---|---|
| Characters | ~6,840 | ~800 | ~6,150 | ~370 | Both |
| Est. tokens | ~1,710 | ~200 | ~1,538 | ~93 | Both |
| Airport coverage | ~124/10,000 | All | ~124/10,000 | All | think-twice / Both |
| vs Greedy | baseline | 8.6x leaner | 1.1x leaner | 18.5x leaner | Both |

---

## Analysis

The greedy output is not just longer than the lean output — it is functionally wrong for 98.8% of the airports it will ever be asked about. A user typing "IST" (Istanbul) gets `null`. A user typing "KTM" (Kathmandu) or "TAS" (Tashkent) gets `null`. The ~124 hardcoded entries represent Claude's intuition about "major airports," not the actual distribution of queries a flight search will receive. This makes greedy the rare case where the shorter output is simultaneously more correct, more maintainable, and more token-efficient — there is no trade-off to argue about.

The dataset size makes this problem structurally different from cases where hardcoding might be defensible. With ~10,000 IATA codes at roughly 45 characters per entry, a complete inline map would be ~450,000 characters — clearly impossible to generate. Greedy is therefore doomed to produce a partial list by necessity, not by choice. This is the core argument for think-twice on data tasks: whenever the full dataset is too large to inline, the partial dataset is wrong by construction, and the package is the only correct answer.

think-twice is the only skill that actually solves the problem. It intercepts at Checkpoint 2 — "does this dataset already exist?" — and redirects to `airports` (npm) before any code is written. The result is 3 lines of setup, a 5-line function, and complete coverage of every airport code a user could type. surgical's contribution in the think-twice path is modest: it trims the illustrative usage examples and a parenthetical note, shaving another ~450 chars. In the greedy path, surgical saves ~310 chars by removing the JSDoc and flattening the return object, but cannot touch the data block itself.

The 18.5x character reduction from both skills active versus greedy understates the real-world benefit. The `airports` package is versioned and updated when airlines open new routes or airports change codes; the hardcoded map is frozen at generation time and will silently return `null` for any airport that opened, renamed, or changed code since Claude's training data was collected. The lean implementation is also 0 bytes in the application bundle's source tree — the data lives in `node_modules` where it belongs, not in a file a developer might be tempted to "just add a few more" to over time.
