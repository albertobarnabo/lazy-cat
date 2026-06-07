# Benchmark: Email Validation

**Scenario:** "Write me a function that validates email addresses"
**Skills tested:** surgical v1.0 (think-twice does not fire — task is implementable locally; no data-heavy API or pre-built dataset makes this cheaper or more correct)
**Date:** 2026-06-07

---

## Greedy Output (no skills)

Claude interprets "validates email addresses" as an invitation to cover every edge case in the email specification plus every real-world concern it can anticipate: RFC 5321 compliance, MX-record lookups, disposable-domain blocklisting, internationalized addresses, a compiled-regex cache, and a full suite of explanatory comments. The user asked for a function; they receive a module.

```python
import re
import smtplib
import socket
import logging
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# RFC 5321 / RFC 5322 compliant pattern.
# Covers: quoted local parts, IP address literals, international domains (punycode),
# subdomains, and the full range of allowed special characters in the local part.
_EMAIL_PATTERN = re.compile(
    r"""
    (?x)                        # verbose mode
    ^
    (?P<local>
        (?:                     # unquoted local part
            [a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+
            (?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*
        )
        |
        (?:                     # quoted local part
            "(?:[^"\\]|\\.)*"
        )
    )
    @
    (?P<domain>
        (?:
            (?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+
            [a-zA-Z]{2,}
        )
        |
        (?:                     # IP address literal
            \[(?:\d{1,3}\.){3}\d{1,3}\]
        )
    )
    $
    """,
    re.VERBOSE,
)

# Well-known disposable / throwaway email providers.
# This list covers the most commonly abused domains but is not exhaustive.
# In production, consider a maintained dataset (e.g. the open-source
# disposable-email-domains repo on GitHub) and cache it at startup.
_DISPOSABLE_DOMAINS = frozenset({
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamail.biz",
    "guerrillamail.de",
    "guerrillamail.info",
    "sharklasers.com",
    "spam4.me",
    "trashmail.com",
    "trashmail.at",
    "trashmail.me",
    "trashmail.net",
    "trashmail.io",
    "yopmail.com",
    "yopmail.fr",
    "cool.fr.nf",
    "jetable.fr.nf",
    "nospam.ze.tc",
    "nomail.xl.cx",
    "mega.zik.dj",
    "speed.1s.fr",
    "courriel.fr.nf",
    "moncourrier.fr.nf",
    "monemail.fr.nf",
    "monmail.fr.nf",
    "dispostable.com",
    "mailnull.com",
    "spamgourmet.com",
    "spamgourmet.net",
    "spamgourmet.org",
    "mailnull.com",
    "tempr.email",
    "tempmail.com",
    "tempmail.net",
    "temp-mail.org",
    "throwam.com",
    "throwaway.email",
    "fakeinbox.com",
    "mailsac.com",
    "maildrop.cc",
    "harakirimail.com",
    "getairmail.com",
    "filzmail.com",
    "discard.email",
    "drdrb.com",
    "drdrb.net",
    "objectmail.com",
    "opskins.gift",
    "rcpt.at",
    "spamfree24.org",
    "spam.la",
    "binkmail.com",
    "bobmail.info",
    "chammy.info",
    "devnullmail.com",
    "letthemeatspam.com",
    "maileater.com",
    "mailexpire.com",
    "mailme.ir",
    "neverbox.com",
    "noclickemail.com",
    "shieldedmail.com",
    "spamgob.com",
    "zippymail.info",
})


@lru_cache(maxsize=512)
def _has_mx_record(domain: str) -> bool:
    """Return True if *domain* has at least one MX record, False otherwise.

    Results are cached via lru_cache to avoid redundant DNS lookups within
    a single process lifetime. This is a best-effort check — DNS failures
    are treated as inconclusive and return True to avoid false negatives.
    """
    try:
        # Attempt an MX lookup via a dummy SMTP connection probe.
        # socket.getaddrinfo with SOCK_STREAM is an alternative if
        # dnspython is not available and you only need A/AAAA.
        socket.setdefaulttimeout(5)
        smtp = smtplib.SMTP()
        smtp.connect(domain)
        smtp.quit()
        return True
    except (smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected):
        # Server responded — it exists
        return True
    except (socket.gaierror, socket.timeout, OSError):
        logger.debug("MX check inconclusive for %r", domain)
        return False


def validate_email(
    email: str,
    *,
    check_mx: bool = False,
    block_disposable: bool = False,
    allow_ip_literal: bool = False,
    max_length: int = 254,
) -> tuple[bool, Optional[str]]:
    """Validate an email address.

    Args:
        email: The email address string to validate.
        check_mx: If True, perform a live DNS/MX lookup to confirm the domain
            accepts mail. Adds latency; safe to disable for bulk offline checks.
        block_disposable: If True, reject addresses from known disposable
            email providers (see _DISPOSABLE_DOMAINS).
        allow_ip_literal: If True, accept addresses with an IP literal as the
            domain part, e.g. user@[192.168.1.1]. Defaults to False because
            these are almost never valid in a web-facing signup context.
        max_length: Maximum total length of the address. RFC 5321 §4.5.3.1
            sets this at 254. Override only if you have a specific reason.

    Returns:
        A (valid: bool, reason: Optional[str]) tuple. When valid is True,
        reason is None. When valid is False, reason is a human-readable string
        describing the first failure encountered.

    Examples:
        >>> validate_email("user@example.com")
        (True, None)
        >>> validate_email("not-an-email")
        (False, 'Failed regex: not-an-email')
        >>> validate_email("user@mailinator.com", block_disposable=True)
        (False, 'Disposable domain: mailinator.com')
    """
    if not isinstance(email, str):
        return False, f"Expected str, got {type(email).__name__}"

    email = email.strip()

    if not email:
        return False, "Empty string"

    if len(email) > max_length:
        return False, f"Exceeds max length ({max_length}): {len(email)} chars"

    if email.count("@") != 1:
        return False, f"Must contain exactly one '@', found {email.count('@')}"

    local, domain = email.rsplit("@", 1)

    if len(local) > 64:
        return False, f"Local part exceeds 64 chars: {len(local)}"

    if not _EMAIL_PATTERN.match(email):
        return False, f"Failed regex: {email!r}"

    if not allow_ip_literal and domain.startswith("["):
        return False, f"IP literal domains not allowed: {domain!r}"

    domain_lower = domain.lower()

    if block_disposable and domain_lower in _DISPOSABLE_DOMAINS:
        return False, f"Disposable domain: {domain_lower}"

    if check_mx and not _has_mx_record(domain):
        return False, f"No MX record found for domain: {domain!r}"

    logger.debug("Email validated: %r", email)
    return True, None
```

```python
# Usage examples
valid, reason = validate_email("alice@example.com")
# (True, None)

valid, reason = validate_email("bad@@example.com")
# (False, "Must contain exactly one '@', found 2")

valid, reason = validate_email("throwaway@mailinator.com", block_disposable=True)
# (False, 'Disposable domain: mailinator.com')

valid, reason = validate_email("alice@example.com", check_mx=True)
# (True, None)  — if example.com has MX records
```

**Character count (code output):** ~6,700 chars → ~1,675 tokens

---

## Lean Output (surgical active)

### surgical fires

surgical scans every addition against what the user actually requested:

| Addition | Asked? | Decision |
|---|---|---|
| Verbose RFC 5322 regex with 14 named groups | No — a basic pattern suffices | **Cut** |
| 65-entry `_DISPOSABLE_DOMAINS` frozenset | No | **Cut** |
| `_has_mx_record()` with live SMTP probe | No | **Cut** |
| `@lru_cache` on DNS lookup | No (DNS removed) | **Cut** |
| `check_mx` parameter | No | **Cut** |
| `block_disposable` parameter | No | **Cut** |
| `allow_ip_literal` parameter | No | **Cut** |
| `max_length` parameter | No | **Cut** |
| `(bool, Optional[str])` tuple return | No — a plain bool is simpler | **Cut** |
| `isinstance` type guard | No | **Cut** |
| `logger.debug(...)` | No | **Cut** |
| `import smtplib`, `import socket`, `import logging`, `import lru_cache` | No (all tied to removed features) | **Cut** |
| Full docstring with Args/Returns/Examples | No | **Cut** |
| Four usage example blocks | No | **Cut** |

What was asked for: a function that validates an email address. A simple regex covering the common case, returning a bool. Write that.

### Final response

```python
import re

_EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def validate_email(email: str) -> bool:
    """Return True if email looks like a valid address, False otherwise."""
    return bool(_EMAIL_RE.match(email.strip()))
```

Simple regex: requires a local part, an `@`, a domain with at least one dot, and no whitespace anywhere. Handles the common case. If you need stricter RFC compliance, disposable-domain blocking, or MX verification, let me know and I'll add those specifically.

**Character count (code output + note):** ~370 chars → ~93 tokens

---

## Results

| | Greedy | Lean (surgical) |
|---|---|---|
| Characters | ~6,700 | ~370 |
| Est. tokens | ~1,675 | ~93 |
| Reduction | — | **−94% (~1,582 fewer tokens)** |
| Ratio | — | **~18× leaner** |

---

## Analysis

Email validation is a classic over-engineering magnet. Every developer has heard "email validation is hard" — the RFC is famously complex, edge cases are real, and there is a long tail of discussion about what "valid" even means. The greedy model absorbs this ambient knowledge and produces a module: a disposable-domain blocklist, a live DNS probe, four keyword parameters, a tuple return type, an LRU cache, and a 14-group regex. The user asked for a function.

The ~18× gap is the surgical intervention working at its most decisive. The user said "validates email addresses" — that sentence contains zero references to disposable domains, MX records, RFC compliance level, or caching strategy. Every addition is traceable to a decision the user never made. surgical cuts them all and closes with an explicit offer: "If you need stricter RFC compliance, disposable-domain blocking, or MX verification, let me know and I'll add those specifically." That sentence does more work than the 65-entry blocklist — it surfaces the options without imposing them.

Note on think-twice: this scenario correctly does not trigger think-twice. Email validation is not a data problem — there is no external API or pre-built dataset that makes a regex cheaper or more correct. The `validator` PyPI package exists, but importing a dependency for a four-line utility that ships with stdlib `re` is a net negative, not a shortcut. think-twice's skip condition ("no existing solution is meaningfully cheaper or more correct") applies here. surgical is the right and only intervention.

The lean output is also the better default for maintainability. A 4-line function is readable in 5 seconds, has no dependencies, and makes its limitations explicit via the closing offer. The greedy version introduces `smtplib` connections into a utility function, adds 65 string literals to maintain, and buries the actual check inside a 120-line module. The reviewer who receives the greedy PR must audit all of it. The reviewer who receives the surgical PR is done in one pass.
