# Risk Register — hotel-booking-1

<!-- Append-only | Cycle-tagged | ISO 9001 6.1 -->

| RISK-ID | Cycle | Category | Description | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|---------|-------|----------|-------------|------------|--------|----------|------------|-------|--------|
| RISK-0001 | C1 | Security | JWT in localStorage (XSS token theft) | Med | High | High | Helmet CSP, sanitize UI, short-lived JWT, consider httpOnly migration via CR | security | open |
| RISK-0002 | C1 | Technical | Stripe live keys misconfigured → failed bookings | Med | High | High | Env validation fail-fast; test mode keys in non-prod | build | open |
| RISK-0003 | C1 | Technical | Cloudinary/Mongo outage breaks uploads/search | Low | High | Medium | Health endpoints; graceful UI errors | ops | open |
| RISK-0004 | C1 | Process | Gate 1 not approved → agents invent features | Med | Med | Medium | Halt without REQ; checkpoint INT-0001 | orchestrator | open |
| RISK-0005 | C1 | Compliance | Secrets committed to git | Low | High | Medium | POLICY R003; .gitignore env files | compliance | open |
| RISK-0006 | C1 | Technical | Analytics schema drift | Low | Low | Low | Snapshots shipped REQ-0043 | product | closed |
