# Product Backlog — hotel-booking-1

<!-- BL-XXXX → REQ-XXXX | Product Owner -->

## BL-0001: Approve C1 baseline Blueprint
**Type:** Process · **Priority:** CRITICAL · **REQ:** REQ-0001…0031
**Story:** As product owner, I want the baseline REQs approved at Gate 1, so that Stage 3 synthesis can proceed with traceability.
**Acceptance:** 1) APPROVALS.md GATE-0001 Approved · 2) CHECKPOINTS INT-0001 RESOLVED · 3) resume_token matched
**Effort:** XS · **Dependencies:** none · **Status:** In-Sprint (Gate 1) · **Cycle:** C1

## BL-0002: Reviews REST API
**Type:** Feature · **Priority:** MEDIUM · **REQ:** REQ-0032
**Story:** As a guest, I want to read/write hotel reviews via API, so that social proof is available beyond schema-only models.
**Acceptance:** From REQ-0032 Verification Criteria
**Effort:** M · **Dependencies:** BL-0001 · **Status:** Backlog · **Cycle:** C1

## BL-0003: Analytics model REST / persistence
**Type:** Feature · **Priority:** MEDIUM · **REQ:** REQ-0032
**Story:** As an owner, I want analytics documents persisted/queried, so that insights are not only live aggregates.
**Acceptance:** From REQ-0032 Verification Criteria
**Effort:** M · **Dependencies:** BL-0001 · **Status:** Backlog · **Cycle:** C1

## BL-0004: Booking payment e2e coverage
**Type:** Technical · **Priority:** HIGH · **REQ:** REQ-0009, REQ-0010, TC-0003
**Story:** As a developer, I want Playwright (or API) coverage for Stripe booking happy-path with test keys, so that payment regressions are caught.
**Acceptance:** TC-0003 implemented and documented in TEST_SPEC
**Effort:** M · **Dependencies:** BL-0001 · **Status:** Backlog · **Cycle:** C1

## Notes
- Clerk migration is **not** a backlog item until CR + REQ approved (non-goal C1).
