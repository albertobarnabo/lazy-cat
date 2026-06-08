# Benchmark: Phone Number Input with Country Code

**Scenario:** "Add a phone number input with country code prefix to our checkout form"
**Skills tested:** think-twice (libphonenumber-js / react-phone-number-input) + surgical
**Date:** 2026-06-07

---

## Greedy Output (no skills)

Claude's instinct is to build a custom phone input from scratch. It hardcodes ~35 country dial codes, writes per-country validation regexes (notoriously incorrect — digit counts, area codes, and mobile/landline rules differ per country and change over time), builds a custom styled dropdown for country selection, and adds formatting-as-you-type logic. The result looks polished but covers only ~15% of countries and will silently reject valid numbers from the other 85%.

---

```
Here's a phone number input component with country code prefix for your checkout form:

```jsx
import React, { useState, useRef, useEffect } from 'react';

// Country dial codes
const COUNTRY_CODES = [
  { name: 'Afghanistan',            code: 'AF', dial: '+93'  },
  { name: 'Albania',                code: 'AL', dial: '+355' },
  { name: 'Argentina',              code: 'AR', dial: '+54'  },
  { name: 'Australia',              code: 'AU', dial: '+61'  },
  { name: 'Austria',                code: 'AT', dial: '+43'  },
  { name: 'Belgium',                code: 'BE', dial: '+32'  },
  { name: 'Brazil',                 code: 'BR', dial: '+55'  },
  { name: 'Canada',                 code: 'CA', dial: '+1'   },
  { name: 'Chile',                  code: 'CL', dial: '+56'  },
  { name: 'China',                  code: 'CN', dial: '+86'  },
  { name: 'Colombia',               code: 'CO', dial: '+57'  },
  { name: 'Denmark',                code: 'DK', dial: '+45'  },
  { name: 'Egypt',                  code: 'EG', dial: '+20'  },
  { name: 'Finland',                code: 'FI', dial: '+358' },
  { name: 'France',                 code: 'FR', dial: '+33'  },
  { name: 'Germany',                code: 'DE', dial: '+49'  },
  { name: 'Greece',                 code: 'GR', dial: '+30'  },
  { name: 'India',                  code: 'IN', dial: '+91'  },
  { name: 'Indonesia',              code: 'ID', dial: '+62'  },
  { name: 'Ireland',                code: 'IE', dial: '+353' },
  { name: 'Israel',                 code: 'IL', dial: '+972' },
  { name: 'Italy',                  code: 'IT', dial: '+39'  },
  { name: 'Japan',                  code: 'JP', dial: '+81'  },
  { name: 'Mexico',                 code: 'MX', dial: '+52'  },
  { name: 'Netherlands',            code: 'NL', dial: '+31'  },
  { name: 'New Zealand',            code: 'NZ', dial: '+64'  },
  { name: 'Nigeria',                code: 'NG', dial: '+234' },
  { name: 'Norway',                 code: 'NO', dial: '+47'  },
  { name: 'Pakistan',               code: 'PK', dial: '+92'  },
  { name: 'Philippines',            code: 'PH', dial: '+63'  },
  { name: 'Poland',                 code: 'PL', dial: '+48'  },
  { name: 'Portugal',               code: 'PT', dial: '+351' },
  { name: 'Russia',                 code: 'RU', dial: '+7'   },
  { name: 'Saudi Arabia',           code: 'SA', dial: '+966' },
  { name: 'Singapore',              code: 'SG', dial: '+65'  },
  { name: 'South Africa',           code: 'ZA', dial: '+27'  },
  { name: 'South Korea',            code: 'KR', dial: '+82'  },
  { name: 'Spain',                  code: 'ES', dial: '+34'  },
  { name: 'Sweden',                 code: 'SE', dial: '+46'  },
  { name: 'Switzerland',            code: 'CH', dial: '+41'  },
  { name: 'Turkey',                 code: 'TR', dial: '+90'  },
  { name: 'Ukraine',                code: 'UA', dial: '+380' },
  { name: 'United Arab Emirates',   code: 'AE', dial: '+971' },
  { name: 'United Kingdom',         code: 'GB', dial: '+44'  },
  { name: 'United States',          code: 'US', dial: '+1'   },
  { name: 'Vietnam',                code: 'VN', dial: '+84'  },
];

// Per-country validation patterns
// NOTE: these are approximate and will reject valid numbers for many countries
const PHONE_PATTERNS = {
  US: /^\d{10}$/,
  CA: /^\d{10}$/,
  GB: /^\d{10,11}$/,
  AU: /^\d{9,10}$/,
  DE: /^\d{10,11}$/,
  FR: /^\d{9,10}$/,
  IN: /^\d{10}$/,
  CN: /^\d{11}$/,
  JP: /^\d{10,11}$/,
  BR: /^\d{10,11}$/,
  MX: /^\d{10}$/,
  RU: /^\d{10}$/,
  IT: /^\d{9,10}$/,
  ES: /^\d{9}$/,
  NL: /^\d{9,10}$/,
  SE: /^\d{7,10}$/,
  NO: /^\d{8}$/,
  DK: /^\d{8}$/,
  FI: /^\d{9,10}$/,
  PL: /^\d{9}$/,
  PT: /^\d{9}$/,
  CH: /^\d{9,10}$/,
  AT: /^\d{10,11}$/,
  BE: /^\d{9,10}$/,
  IE: /^\d{9,10}$/,
  GR: /^\d{10}$/,
  TR: /^\d{10}$/,
  SA: /^\d{9}$/,
  AE: /^\d{9}$/,
  ZA: /^\d{9,10}$/,
  SG: /^\d{8}$/,
  NZ: /^\d{8,10}$/,
  NG: /^\d{10,11}$/,
  KR: /^\d{9,10}$/,
  PH: /^\d{10}$/,
  PK: /^\d{10}$/,
};

function formatPhoneNumber(value, countryCode) {
  // Strip non-digits
  const digits = value.replace(/\D/g, '');

  if (countryCode === 'US' || countryCode === 'CA') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  if (countryCode === 'GB') {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }

  // Generic: insert space every 3 digits
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function validatePhone(rawDigits, countryCode) {
  const pattern = PHONE_PATTERNS[countryCode];
  if (!pattern) return true; // unknown country — skip validation
  return pattern.test(rawDigits);
}

export default function PhoneInput({ value, onChange, error }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[44]); // US
  const [rawInput, setRawInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleCountrySelect(country) {
    setSelectedCountry(country);
    setRawInput('');
    setDropdownOpen(false);
    onChange('');
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, '');
    const formatted = formatPhoneNumber(digits, selectedCountry.code);
    setRawInput(formatted);
    onChange(`${selectedCountry.dial}${digits}`);
  }

  const isValid = !touched || validatePhone(rawInput.replace(/\D/g, ''), selectedCountry.code);

  return (
    <div className="phone-input-wrapper">
      <label className="phone-input-label">Phone Number</label>

      <div className="phone-input-row">
        {/* Country code dropdown */}
        <div className="country-selector" ref={dropdownRef}>
          <button
            type="button"
            className="country-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className="country-dial">{selectedCountry.dial}</span>
            <span className="country-code">{selectedCountry.code}</span>
            <span className="chevron" aria-hidden="true">▾</span>
          </button>

          {dropdownOpen && (
            <ul
              className="country-dropdown"
              role="listbox"
              aria-label="Select country code"
            >
              {COUNTRY_CODES.map((country) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={country.code === selectedCountry.code}
                  className={`country-option${country.code === selectedCountry.code ? ' selected' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <span className="option-name">{country.name}</span>
                  <span className="option-dial">{country.dial}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phone number field */}
        <input
          type="tel"
          className={`phone-number-input${!isValid ? ' invalid' : ''}`}
          value={rawInput}
          onChange={handlePhoneChange}
          onBlur={() => setTouched(true)}
          placeholder="Enter phone number"
          autoComplete="tel-national"
          aria-label="Phone number"
          aria-invalid={!isValid}
          aria-describedby={!isValid ? 'phone-error' : undefined}
        />
      </div>

      {!isValid && (
        <p id="phone-error" className="phone-error" role="alert">
          Please enter a valid phone number for {selectedCountry.name}.
        </p>
      )}
    </div>
  );
}
```
```

**Character count:** ~6,100 chars → ~1,525 tokens
**Country coverage:** ~35 of 240+ countries (regex coverage); remaining 205 countries skip validation silently or fail outright

---

## think-twice only

### think-twice fires at checkpoint #2: "Is there an existing solution?"

The prompt is "add a phone number input with country code prefix." Before writing anything, think-twice asks: has this problem been solved?

**Findings:**
- `react-phone-number-input` (npm, 450k+ weekly downloads) — React component wrapping `libphonenumber-js`
- `libphonenumber-js` — JavaScript port of Google's libphonenumber, which Google built specifically because per-country phone regexes are unmaintainable by hand
- Covers all 240+ ITU-assigned country codes with correct validation
- Handles number formatting per locale (national vs. international format)
- Tracks the IANA/Google phone number database; upstream updates automatically via npm

**Decision:** use `react-phone-number-input`. Do not write a custom component.

---

```
Add a phone input to your checkout form:

```bash
npm install react-phone-number-input
```

```jsx
import { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CheckoutPhoneField({ value, onChange }) {
  return (
    <PhoneInput
      international
      defaultCountry="US"
      value={value}
      onChange={onChange}
      placeholder="Enter phone number"
    />
  );
}
```

`react-phone-number-input` wraps `libphonenumber-js` (Google's phone number library).
It handles country selection, dial codes, and validation for all 240+ countries automatically.
```
```

**Character count:** ~570 chars → ~143 tokens
**Country coverage:** All 240+ countries, validation database maintained by Google

---

## surgical only

Surgical examines the greedy output and cuts everything that was not asked for: the click-outside effect, the `touched`/`onBlur` state for deferred validation, the separate error paragraph with `role="alert"` and `aria-describedby` wiring, the `aria-haspopup`/`aria-expanded`/`aria-label`/`aria-selected`/`aria-invalid` attributes, and the per-country `formatPhoneNumber` formatter (formatting-as-you-type was not requested). It cannot eliminate the root problem: 35 hardcoded countries and incorrect regexes for each.

---

```
Here's a phone number input component with country code prefix for your checkout form:

```jsx
import React, { useState } from 'react';

const COUNTRY_CODES = [
  { name: 'Afghanistan',            code: 'AF', dial: '+93'  },
  { name: 'Albania',                code: 'AL', dial: '+355' },
  { name: 'Argentina',              code: 'AR', dial: '+54'  },
  { name: 'Australia',              code: 'AU', dial: '+61'  },
  { name: 'Austria',                code: 'AT', dial: '+43'  },
  { name: 'Belgium',                code: 'BE', dial: '+32'  },
  { name: 'Brazil',                 code: 'BR', dial: '+55'  },
  { name: 'Canada',                 code: 'CA', dial: '+1'   },
  { name: 'Chile',                  code: 'CL', dial: '+56'  },
  { name: 'China',                  code: 'CN', dial: '+86'  },
  { name: 'Colombia',               code: 'CO', dial: '+57'  },
  { name: 'Denmark',                code: 'DK', dial: '+45'  },
  { name: 'Egypt',                  code: 'EG', dial: '+20'  },
  { name: 'Finland',                code: 'FI', dial: '+358' },
  { name: 'France',                 code: 'FR', dial: '+33'  },
  { name: 'Germany',                code: 'DE', dial: '+49'  },
  { name: 'Greece',                 code: 'GR', dial: '+30'  },
  { name: 'India',                  code: 'IN', dial: '+91'  },
  { name: 'Indonesia',              code: 'ID', dial: '+62'  },
  { name: 'Ireland',                code: 'IE', dial: '+353' },
  { name: 'Israel',                 code: 'IL', dial: '+972' },
  { name: 'Italy',                  code: 'IT', dial: '+39'  },
  { name: 'Japan',                  code: 'JP', dial: '+81'  },
  { name: 'Mexico',                 code: 'MX', dial: '+52'  },
  { name: 'Netherlands',            code: 'NL', dial: '+31'  },
  { name: 'New Zealand',            code: 'NZ', dial: '+64'  },
  { name: 'Nigeria',                code: 'NG', dial: '+234' },
  { name: 'Norway',                 code: 'NO', dial: '+47'  },
  { name: 'Pakistan',               code: 'PK', dial: '+92'  },
  { name: 'Philippines',            code: 'PH', dial: '+63'  },
  { name: 'Poland',                 code: 'PL', dial: '+48'  },
  { name: 'Portugal',               code: 'PT', dial: '+351' },
  { name: 'Russia',                 code: 'RU', dial: '+7'   },
  { name: 'Saudi Arabia',           code: 'SA', dial: '+966' },
  { name: 'Singapore',              code: 'SG', dial: '+65'  },
  { name: 'South Africa',           code: 'ZA', dial: '+27'  },
  { name: 'South Korea',            code: 'KR', dial: '+82'  },
  { name: 'Spain',                  code: 'ES', dial: '+34'  },
  { name: 'Sweden',                 code: 'SE', dial: '+46'  },
  { name: 'Switzerland',            code: 'CH', dial: '+41'  },
  { name: 'Turkey',                 code: 'TR', dial: '+90'  },
  { name: 'Ukraine',                code: 'UA', dial: '+380' },
  { name: 'United Arab Emirates',   code: 'AE', dial: '+971' },
  { name: 'United Kingdom',         code: 'GB', dial: '+44'  },
  { name: 'United States',          code: 'US', dial: '+1'   },
  { name: 'Vietnam',                code: 'VN', dial: '+84'  },
];

const PHONE_PATTERNS = {
  US: /^\d{10}$/,
  CA: /^\d{10}$/,
  GB: /^\d{10,11}$/,
  AU: /^\d{9,10}$/,
  DE: /^\d{10,11}$/,
  FR: /^\d{9,10}$/,
  IN: /^\d{10}$/,
  CN: /^\d{11}$/,
  JP: /^\d{10,11}$/,
  BR: /^\d{10,11}$/,
  MX: /^\d{10}$/,
  RU: /^\d{10}$/,
  IT: /^\d{9,10}$/,
  ES: /^\d{9}$/,
  NL: /^\d{9,10}$/,
  SE: /^\d{7,10}$/,
  NO: /^\d{8}$/,
  DK: /^\d{8}$/,
  FI: /^\d{9,10}$/,
  PL: /^\d{9}$/,
  PT: /^\d{9}$/,
  CH: /^\d{9,10}$/,
  AT: /^\d{10,11}$/,
  BE: /^\d{9,10}$/,
  IE: /^\d{9,10}$/,
  GR: /^\d{10}$/,
  TR: /^\d{10}$/,
  SA: /^\d{9}$/,
  AE: /^\d{9}$/,
  ZA: /^\d{9,10}$/,
  SG: /^\d{8}$/,
  NZ: /^\d{8,10}$/,
  NG: /^\d{10,11}$/,
  KR: /^\d{9,10}$/,
  PH: /^\d{10}$/,
  PK: /^\d{10}$/,
};

export default function PhoneInput({ value, onChange }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[44]); // US
  const [phone, setPhone] = useState('');

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, '');
    setPhone(digits);
    onChange(`${selectedCountry.dial}${digits}`);
  }

  return (
    <div className="phone-input-wrapper">
      <label>Phone Number</label>
      <div className="phone-input-row">
        <select
          value={selectedCountry.code}
          onChange={(e) => {
            const country = COUNTRY_CODES.find((c) => c.code === e.target.value);
            setSelectedCountry(country);
            onChange(`${country.dial}${phone}`);
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.dial} {country.name}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Enter phone number"
        />
      </div>
    </div>
  );
}
```
```

**What surgical removed vs. greedy:** click-outside `useEffect`, `touched`/`onBlur` deferred-validation state, `formatPhoneNumber` formatter, separate error `<p>` with `role="alert"`, all `aria-*` wiring, custom `<ul>`/`<li>` dropdown replaced with native `<select>`. Saved ~1,600 chars.

**What surgical could not fix:** the hardcoded 35-country list and the approximate regexes. Those are architectural, not scope creep.

**Character count:** ~4,500 chars → ~1,125 tokens
**Country coverage:** ~35 of 240+ countries — same as greedy

---

## Both skills

think-twice finds `react-phone-number-input`. surgical keeps only what was asked: a controlled input with country prefix. No custom error display, no styling hooks, no separate validation utility exported.

---

```
Install the library:

```bash
npm install react-phone-number-input
```

```jsx
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CheckoutPhoneField({ value, onChange }) {
  return (
    <PhoneInput
      international
      defaultCountry="US"
      value={value}
      onChange={onChange}
      placeholder="Enter phone number"
    />
  );
}
```
```

**Character count:** ~390 chars → ~98 tokens
**Country coverage:** All 240+ countries, validation database maintained by Google

---

## Results

| | Greedy | think-twice only | surgical only | Both |
|---|---|---|---|---|
| Characters | ~6,100 | ~570 | ~4,500 | ~390 |
| Est. tokens | ~1,525 | ~143 | ~1,125 | ~98 |
| Country coverage | ~35 / 240+ | All 240+ | ~35 / 240+ | All 240+ |
| vs. Greedy (chars) | baseline | 10.7x smaller | 1.4x smaller | 15.6x smaller |
| Validation correct | No | Yes | No | Yes |

**Winner:** Both skills — 15.6x smaller and actually correct.

---

## Analysis

Per-country phone number regexes are notoriously wrong — digit counts differ between mobile and landline, area codes change, and country-level rules are revised without notice. Google built libphonenumber specifically because the problem is genuinely unsolvable by hand at scale: the library has hundreds of contributors and a dedicated release process to track ITU changes. The greedy output covers roughly 35 countries and will silently skip validation or reject valid numbers for the remaining 205 — a real user impact, not a theoretical one. This benchmark is primarily a correctness argument, not a token savings argument: 200 lines of wrong code versus 10 lines of correct code is a different category of failure than over-engineering. `react-phone-number-input` wraps libphonenumber-js behind a single controlled React component, making the right answer also the shortest answer. surgical alone improves structure but cannot fix the architectural choice to hardcode country data; only think-twice catches that before a single line is written.
