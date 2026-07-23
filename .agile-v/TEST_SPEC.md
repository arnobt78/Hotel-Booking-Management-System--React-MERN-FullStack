# Test Spec — hotel-booking-1 (C1)

<!-- TC origin cycle tagged | Derived from REQUIREMENTS.md -->

## Existing e2e (Playwright)

| TC-ID | REQ | Cycle | Spec | Intent |
|-------|-----|-------|------|--------|
| TC-0001 | REQ-0001…0004, REQ-0025 | C1 | `e2e-tests/tests/auth.spec.ts` | Sign-in / register |
| TC-0002 | REQ-0005…0008 | C1 | `e2e-tests/tests/search-hotels.spec.ts` | Search flow |
| TC-0003 | REQ-0009…0011 | C1 | — | Booking/pay (manual / gap — add when extending) |
| TC-0004 | REQ-0012…0015 | C1 | `e2e-tests/tests/manage-hotels.spec.ts` | Add hotel |
| TC-0005 | REQ-0032 | C1 | TBD | Reviews/Analytics API |

## Build / static gates (Red Team baseline)

| Gate | Command | Maps |
|------|---------|------|
| BE compile | `cd hotel-booking-backend && npm run build` | ART-0001…0028 |
| FE compile | `cd hotel-booking-frontend && npm run build` | ART-0022…0027 |
| FE lint | `cd hotel-booking-frontend && npm run lint` | quality |

## Fixtures

- `data/test-users.json`
- `data/test-hotel.json`

## Rules

1. Every new REQ needs ≥1 TC before Gate 2
2. Prefer external behavior (API response / UI outcome) over internal state
3. Stripe tests must not require live charges in CI without test keys
