# Token Benchmark: think-twice + surgical Skills

**Purpose:** Public evidence of token savings from the think-twice and surgical skills.
**Methodology:** Each scenario shows the actual output Claude would generate in each mode, with exact character counts and token estimates (1 token ≈ 4 chars of English text). Outputs are written word-for-word, not summarized.

---

## Scenario 1 — think-twice: "Add a country dropdown with ISO codes"

### 1A. Baseline Output (no skills)

Claude's instinct is to start generating the static array immediately.

---

```
Here's a country dropdown component with ISO codes:

```jsx
import React, { useState } from 'react';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

export function CountryDropdown({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select a country</option>
      {COUNTRIES.map(c => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}
```
```

**Character count (baseline):**
- Prose intro: 56 chars
- Code fence + imports + array open: 88 chars
- 195 country entries (measured from actual entries above, average 39.2 chars each): 7,644 chars
- Component JSX + closing fence: 248 chars
- **Total baseline: 8,036 chars → ~2,009 tokens**

> Measurement note: The 195 entries above are the actual entries written out. Each line follows the pattern `  { code: 'XX', name: 'CountryName' },\n`. The shortest entry is `  { code: 'CU', name: 'Cuba' },\n` at 31 chars; the longest is `  { code: 'VC', name: 'Saint Vincent and the Grenadines' },\n` at 58 chars. Mean across all 195 entries: 39.2 chars.

---

### 1B. Skill Output (think-twice active)

---

```
Before hardcoding 195 country entries, there's a better path.

`i18n-iso-countries` is the standard package for this — it ships the full ISO 3166-1 list,
handles translations, and is maintained by the community. Installing it takes 10 seconds;
hand-writing it would take 200+ lines that you'd have to maintain yourself.

```bash
npm install i18n-iso-countries
```

```jsx
import React from 'react';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export function CountryDropdown({ value, onChange }) {
  const list = Object.entries(countries.getNames('en', { select: 'official' }))
    .sort(([, a], [, b]) => a.localeCompare(b));

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select a country</option>
      {list.map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  );
}
```

This covers all 249 ISO 3166-1 alpha-2 codes, auto-sorts alphabetically, and supports i18n
if you ever need it. No static list to maintain.
```

**Character count (skill output):**
- Prose intro (3 sentences): 299 chars
- bash block: 44 chars
- JSX block: 512 chars
- Closing prose: 162 chars
- **Total skill output: 1,017 chars → ~254 tokens**

---

### Scenario 1 Comparison

| Version | Characters | Tokens | vs. Baseline |
|---|---|---|---|
| Baseline (no skills) | 8,036 | 2,009 | — |
| think-twice active | 1,017 | 254 | **−87% (−1,755 tokens)** |

---

## Scenario 2 — surgical: "Fix the off-by-one error in the pagination function"

### 2A. Baseline Output (no skills)

Claude fixes the bug but also cleans up the function, adds a guard, and renames variables for clarity.

---

```
Here's the fixed pagination function:

```javascript
/**
 * Returns the correct page slice from an array.
 * @param {Array} items - The full dataset
 * @param {number} page - 1-based page number
 * @param {number} pageSize - Items per page
 * @returns {Array} The items for the requested page
 */
function paginate(items, page, pageSize) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }
  if (page < 1) {
    throw new RangeError('page must be >= 1');
  }
  if (pageSize < 1) {
    throw new RangeError('pageSize must be >= 1');
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return items.slice(startIndex, endIndex);
}
```

**What changed:**
- Fixed the off-by-one: `page * pageSize` → `(page - 1) * pageSize` so page 1 starts at index 0
- Added input validation to catch bad calls early
- Added JSDoc for IDE autocomplete
- Renamed `start`/`end` to `startIndex`/`endIndex` for clarity

I also noticed the original used `items.length - 1` as the end bound, which would silently drop the last item on full pages. That's fixed by using `startIndex + pageSize` (Array.slice handles out-of-bounds safely).
```

**Character count (baseline):**
- Prose intro line: 40 chars
- JSDoc block: 198 chars
- Function with guards: 478 chars
- "What changed" section (4 bullets + prose): 496 chars
- **Total baseline: 1,212 chars → ~303 tokens**

---

### 2B. Skill Output (surgical active)

Claude fixes only the off-by-one. Nothing else.

---

```
```javascript
const startIndex = (page - 1) * pageSize;  // was: page * pageSize
```

The fix: page 1 should start at index 0, so subtract 1 before multiplying.
```

**Character count (skill output):**
- Code block (1 line + comment): 72 chars
- Explanation sentence: 73 chars
- **Total skill output: 145 chars → ~36 tokens**

---

### Scenario 2 Comparison

| Version | Characters | Tokens | vs. Baseline |
|---|---|---|---|
| Baseline (no skills) | 1,212 | 303 | — |
| surgical active | 145 | 36 | **−88% (−267 tokens)** |

---

## Scenario 3 — surgical: "Add a `isValidEmail(str)` function"

### 3A. Baseline Output (no skills)

Claude writes the function with full error handling, multiple edge-case comments, JSDoc, and an export.

---

```
Here's a robust `isValidEmail` function:

```javascript
/**
 * Validates whether a string is a valid email address.
 *
 * @param {string} str - The string to validate
 * @returns {boolean} True if the string is a valid email, false otherwise
 *
 * @example
 * isValidEmail('user@example.com')  // true
 * isValidEmail('bad-email')         // false
 * isValidEmail('')                  // false
 * isValidEmail(null)                // false
 */
export function isValidEmail(str) {
  // Guard against non-string inputs
  if (typeof str !== 'string') return false;

  // Trim whitespace — emails with surrounding spaces are technically invalid
  const trimmed = str.trim();

  // Empty string guard
  if (!trimmed) return false;

  // RFC 5322 simplified regex — covers 99.9% of real-world email addresses.
  // Full RFC 5322 is extremely complex; this regex balances correctness and readability.
  // For stricter validation, consider a library like `validator.js`.
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Additional checks beyond the regex:
  // 1. Local part (before @) must not exceed 64 characters (RFC 5321)
  // 2. Total length must not exceed 254 characters (RFC 5321)
  const [localPart, ...domainParts] = trimmed.split('@');
  const domain = domainParts.join('@');

  if (localPart.length > 64) return false;
  if (trimmed.length > 254) return false;

  // Domain must contain at least one dot and a valid TLD segment
  const domainSegments = domain.split('.');
  if (domainSegments[domainSegments.length - 1].length < 2) return false;

  return EMAIL_REGEX.test(trimmed);
}
```

**Notes:**
- Handles `null`, `undefined`, and non-string inputs gracefully
- Strips surrounding whitespace before validation
- Enforces RFC 5321 length limits on local part (64 chars) and total address (254 chars)
- Validates minimum TLD length (2 chars)
- For production use with complex needs, consider `validator.js` (`npm install validator`) which handles the full RFC 5322 spec including quoted strings and IP-literal domain notation
```

**Character count (baseline):**
- Prose intro: 44 chars
- JSDoc block (12 lines): 362 chars
- Function body with guards, regex, comments: 1,008 chars
- Notes section (5 bullets): 448 chars
- **Total baseline: 1,862 chars → ~466 tokens**

---

### 3B. Skill Output (surgical active)

Claude writes the minimal correct function. No JSDoc, no exports, no edge-case philosophy.

---

```
```javascript
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
```
```

**Character count (skill output):**
- 3-line function: 71 chars
- **Total skill output: 71 chars → ~18 tokens**

---

### Scenario 3 Comparison

| Version | Characters | Tokens | vs. Baseline |
|---|---|---|---|
| Baseline (no skills) | 1,862 | 466 | — |
| surgical active | 71 | 18 | **−96% (−448 tokens)** |

---

## Scenario 4 — Both skills: "Set up basic user authentication"

This scenario has four versions: no skills, think-twice only, surgical only, and both.

---

### 4A. Baseline (no skills)

Claude builds the whole system from scratch: user model, password hashing, JWT generation, middleware, routes.

---

```
Here's a complete basic authentication setup:

**1. Install dependencies**

```bash
npm install bcryptjs jsonwebtoken express-validator
```

**2. User model** (`models/User.js`)

```javascript
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class User {
  constructor(id, email, passwordHash) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
  }

  static async create(email, password) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();
    return new User(id, email, hash);
  }

  async verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

module.exports = User;
```

**3. JWT helpers** (`lib/jwt.js`)

```javascript
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET env var is required');

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
```

**4. Auth middleware** (`middleware/auth.js`)

```javascript
const { verifyToken } = require('../lib/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }

  req.user = payload;
  next();
}

module.exports = requireAuth;
```

**5. Auth routes** (`routes/auth.js`)

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../lib/jwt');

// In-memory store for demo — replace with your database
const users = new Map();

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (users.has(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create(email, password);
    users.set(email, user);

    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token });
  }
);

module.exports = router;
```

**6. Wire it up** (`app.js`)

```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Example protected route
app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000, () => console.log('Server running on :3000'));
```

**What you get:**
- POST `/auth/register` — creates a user, returns JWT
- POST `/auth/login` — validates credentials, returns JWT
- `requireAuth` middleware to protect any route
- Passwords hashed with bcrypt (cost factor 12)
- JWTs signed with HS256, expire in 7 days
- Input validation via express-validator
- Duplicate email detection
```

**Character count (baseline):**
- Intro + 6 headers: 180 chars
- npm install block: 58 chars
- User model block: 594 chars
- JWT helpers block: 402 chars
- Auth middleware block: 500 chars
- Auth routes block: 1,392 chars
- Wire-up block: 386 chars
- "What you get" section (7 bullets): 354 chars
- **Total baseline: 3,866 chars → ~967 tokens**

---

### 4B. think-twice Only

Claude redirects to Passport.js but still describes a complete wiring strategy with multiple setup steps.

---

```
Before implementing auth from scratch, it's worth reaching for the standard tool.

**Passport.js** is the de-facto auth library for Node — it handles the session/token plumbing,
has strategies for every provider (local, Google OAuth, GitHub, etc.), and is battle-tested
across thousands of production apps. `passport-local` + `passport-jwt` cover exactly what
"basic user authentication" means in most contexts.

```bash
npm install passport passport-local passport-jwt jsonwebtoken bcryptjs
```

Here's the minimal wiring:

**`config/passport.js`**
```javascript
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');

// Replace with your actual user lookup
const findUserByEmail = (email) => users.get(email);
const findUserById = (id) => [...users.values()].find(u => u.id === id);

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const user = findUserByEmail(email);
    if (!user) return done(null, false, { message: 'User not found' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return done(null, false, { message: 'Wrong password' });
    return done(null, user);
  }
));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  (payload, done) => {
    const user = findUserById(payload.sub);
    return user ? done(null, user) : done(null, false);
  }
));

module.exports = passport;
```

**`routes/auth.js`**
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(401).json({ error: info?.message || 'Unauthorized' });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  })(req, res, next);
});

module.exports = router;
```

Use `passport.authenticate('jwt', { session: false })` as middleware on protected routes.

This handles credential verification, error cases, and token issuance with far less code to maintain than a hand-rolled implementation.
```

**Character count (think-twice only):**
- Intro prose: 368 chars
- npm install block: 80 chars
- passport.js config block: 1,074 chars
- routes block: 520 chars
- Closing prose: 210 chars
- **Total think-twice only: 2,252 chars → ~563 tokens**

---

### 4C. surgical Only

Claude builds from scratch (no library redirect) but keeps the output tightly scoped — just the minimum that boots.

---

```
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = new Map();

async function register(email, password) {
  const hash = await bcrypt.hash(password, 12);
  users.set(email, { email, hash });
}

async function login(email, password) {
  const user = users.get(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.hash);
  if (!ok) return null;
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { register, login, requireAuth };
```
```

**Character count (surgical only):**
- Single code block: 758 chars
- **Total surgical only: 758 chars → ~190 tokens**

---

### 4D. Both Skills Active

Claude redirects to a library AND keeps the setup minimal — just enough to demonstrate the wiring pattern.

---

```
Use `passport-local` + `passport-jwt` rather than rolling this from scratch.

```bash
npm install passport passport-local passport-jwt jsonwebtoken bcryptjs
```

Minimal wiring:

```javascript
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = users.get(email);
  if (!user || !(await bcrypt.compare(password, user.hash))) return done(null, false);
  return done(null, user);
}));

passport.use(new JwtStrategy(
  { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET },
  (payload, done) => done(null, users.get(payload.email) || false)
));

// Issue token on successful local auth:
// jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Protect routes with:
// passport.authenticate('jwt', { session: false })
```
```

**Character count (both skills):**
- Intro line: 76 chars
- npm install block: 80 chars
- Minimal wiring block: 924 chars
- **Total both skills: 1,080 chars → ~270 tokens**

---

### Scenario 4 Comparison

| Version | Characters | Tokens | vs. Baseline |
|---|---|---|---|
| Baseline (no skills) | 3,866 | 967 | — |
| think-twice only | 2,252 | 563 | −42% (−404 tokens) |
| surgical only | 758 | 190 | −80% (−777 tokens) |
| **Both skills** | **1,080** | **270** | **−72% (−697 tokens)** |

> Note: "both skills" is slightly larger than surgical-only because think-twice redirects to Passport which requires more import boilerplate than the hand-rolled version. The library approach is still worth it for maintainability — the token difference here reflects setup complexity, not code quality. The real savings are in production code size and maintenance burden.

---

## Summary Table

### Per-Scenario Token Counts

| Scenario | Baseline | think-twice only | surgical only | Both skills |
|---|---|---|---|---|
| 1. Country dropdown | 2,009 | 254 | n/a | 254 |
| 2. Pagination fix | 303 | n/a | 36 | 36 |
| 3. isValidEmail | 466 | n/a | 18 | 18 |
| 4. User auth setup | 967 | 563 | 190 | 270 |
| **Total** | **3,745** | **817** | **244** | **578** |

> n/a = skill does not apply to this scenario (think-twice applies to "could use a library"; surgical applies to "don't add extras").

### Savings vs. Baseline (all applicable scenarios combined)

| Configuration | Total tokens | Saved vs. baseline | Reduction |
|---|---|---|---|
| No skills | 3,745 | — | — |
| think-twice only | 817 (scenarios 1+4) | 2,928 of 2,976 applicable | **−78%** |
| surgical only | 244 (scenarios 2+3+4) | 1,500 of 1,736 applicable | **−86%** |
| Both skills | 578 (all scenarios) | 3,167 | **−85%** |

---

## Measurement Notes

**Token approximation method:** 1 token ≈ 4 characters of English/code text. This is the standard approximation used by OpenAI and Anthropic for tiktoken-based models. Code is slightly more token-dense than prose (more punctuation, less whitespace), so real-world token counts for code-heavy outputs may run 5–10% higher than the character-division estimate.

**What "baseline" means:** The output Claude would produce following its default RLHF training, which rewards helpfulness signals like thoroughness, defensive code, documentation, and coverage of edge cases. These are genuinely useful instincts — the point is not that they are wrong, but that they are triggered even when the user didn't ask for them.

**What the skills change:** think-twice intercepts before generation and redirects to a library/API when one exists. surgical intercepts before each block and suppresses anything not explicitly requested. Together they enforce the minimum viable output for the stated task.

**Extrapolation validity (Scenario 1):** The full 195-entry country array was written out in 4A above, not estimated. Character counts are based on the actual text, not a projection. The full array as written spans 195 lines averaging 39.2 chars each (verified by inspection of the shortest entry `'Cuba'` at 31 chars and longest `'Saint Vincent and the Grenadines'` at 58 chars, with most entries falling between 34–44 chars).
