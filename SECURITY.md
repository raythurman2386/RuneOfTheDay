# Security Policy

## Supported Versions

Rune of the Day is an offline-first mobile app with no backend or data
collection. Security updates are applied to the latest release only.

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email **ravenwood.creations07@gmail.com** with:

1. A description of the vulnerability
2. Steps to reproduce (if applicable)
3. The potential impact
4. Any suggested fixes

You should receive a response within 48 hours. If the vulnerability is
confirmed, we will work on a fix and coordinate disclosure with you.

## Security Posture

Rune of the Day is designed with privacy and security as core principles:

- **No data collection** — the app has no servers, no databases, and no
  backend. All user data (theme, notification time, daily rune) is stored
  locally on the device via AsyncStorage.
- **No third-party tracking** — no analytics SDKs, ad networks, or
  tracking libraries are included.
- **No network requests** — the app works entirely offline after
  installation. The only network-adjacent feature is local scheduled
  notifications, which are handled by the operating system.
- **Open source** — all code is publicly auditable at
  [github.com/raythurman2386/RuneOfTheDay](https://github.com/raythurman2386/RuneOfTheDay).

## Dependency Security

We monitor dependencies for known vulnerabilities. To check the current
state:

```bash
npm audit
```

If you find a vulnerable dependency, please report it using the process
above.
