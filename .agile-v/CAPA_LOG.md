# CAPA Log — hotel-booking-1

<!-- ISO 13485 8.5 / ISO 9001 10.x | Append-only -->

### CAPA-0001
**Cycle:** C1 · **Trigger:** VulDB CNA #c891c0 · **Status:** corrective-complete  
**Nonconformity:** Unauthenticated `GET /api/health/detailed` disclosed OS/Node/PID/memory and Mongo host/port/name (CWE-200).  
**Root Cause:** Detailed health route shipped without auth and without response redaction; public `/api/health` also over-exposed.  
**Corrective:** JWT on `/detailed`; minimal public probe; strip infra fields; sanitize `system-stats/public`.  
**Preventive:** SECURITY.md private reporting; REQ-0034; avoid returning connection topology in any public API.  
**Effectiveness:** Unauth detailed → 401; FE lint + BE/FE build PASS (2026-07-23).  
**Owner:** product_owner · **Evidence:** REQ-0034 · ART-0034 · health.ts  
**PoC ref:** https://github.com/sudo-secure/security-research/blob/main/Hotel-Booking-Management-System/sensitive-information-disclosure/PoC.md
