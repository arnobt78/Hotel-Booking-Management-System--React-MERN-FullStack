# Security Policy

## Supported versions

This open-source project is maintained on a best-effort basis. Security fixes are applied to the latest `main` branch.

| Version / branch | Supported |
|------------------|-----------|
| `main` (latest)  | Yes       |
| Older tags/forks | Best effort |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report privately by email:

- **Email:** [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com)
- **Subject line suggestion:** `[SECURITY] Hotel Booking MERN — short description`

Coordinated disclosure partners (e.g. VulDB CNA) may also contact this address. Health probes: public `GET /api/health` is liveness-only; `GET /api/health/detailed` requires JWT and does not return host/PID/Node version (REQ-0034 / CAPA-0001).

## Transport & cookies (production)

- Serve the API and SPA over **HTTPS** in production (Coolify / Vercel).
- The API sets `trust proxy` so secure cookies work behind reverse proxies.
- Auth cookies use `httpOnly`, `secure` in production, and `sameSite=none` for cross-origin FE/BE.
- MongoDB Atlas (`mongodb+srv`) connections use TLS (`tlsAllowInvalidCertificates: false`).

Include as much detail as you can:

1. Description of the issue and potential impact  
2. Steps to reproduce (PoC, screenshots, or request/response samples)  
3. Affected component (frontend, backend, auth, payments, deploy config)  
4. Suggested severity (if known)

## What to expect

- Acknowledgement when the report is received (usually within a few business days)
- A fix or mitigation plan when confirmed
- Credit in release notes if you want to be named (optional)

## Safe harbor

Good-faith research that stays within the law and avoids data destruction, privacy violations, or service disruption is appreciated. Do not attempt to access other users’ data or production payment systems beyond what is needed to demonstrate an issue.

## Non-security bugs

Feature requests and non-security bugs belong in GitHub Issues on this repository.

Thank you for helping keep learners and users safe.
