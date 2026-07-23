# Decision Log — hotel-booking-1

<!-- Append-only | Never overwrite -->

## [C1] 2026-07-23T11:18:00Z | ORCH | BOOTSTRAP_AQMS

- **Decision:** Initialize `.agile-v/` for C1 on brownfield MERN hotel booking; sync shipped features as REQ-0001…0031 `done [C1]`; open REQ-0032 planned; pause at Human Gate 1.
- **Rationale:** No prior `.agile-v/` found; user requested full Agile V Infinity Loop activation + resume-from-last (none) → bootstrap.
- **Linked REQ:** REQ-0001…0032
- **Evidence:** HEAD `408e572`, `docs/PROJECT_WALKTHROUGH.md`, live demos

## [C1] 2026-07-23T11:18:00Z | REQ_ARCH | BASELINE_FROM_WALKTHROUGH

- **Decision:** Use `docs/PROJECT_WALKTHROUGH.md` + package layout as Single Source for baseline Blueprint.
- **Rationale:** Principle #2 Traceability; avoid inventing undeployed features.
- **Linked REQ:** REQ-0001…0031

## [C1] 2026-07-23T11:18:00Z | REQ_ARCH | CLERK_NON_GOAL

- **Decision:** Clerk migration guides remain documentation-only; JWT + Google OAuth stay current auth stack unless CR approved.
- **Rationale:** Clerk guide is portable Next.js material; this repo is Vite SPA + Express JWT.
- **Linked REQ:** REQ-0001…0004 · Non-goals C1

## [C1] 2026-07-23T11:18:00Z | BUILD | STACK_SKILL

- **Decision:** Primary build skill = `build-agent-js` for both Vite React frontend and Express TypeScript backend.
- **Rationale:** No NestJS/Python in repo (walkthrough §4).
- **Linked REQ:** REQ-0022…0028

## [C1] 2026-07-23T13:46:00Z | DOCS | REQ-0033_README_SECURITY

- **Decision:** Rewrite root README as educational learner guide; add SECURITY.md (contact@arnobmahmud.com); Diploi as Optional deploy section; badges for real MERN/Vite stack (not Next.js).
- **Rationale:** Explicit user instruction; Stage 3 docs re-entry with parent REQ-0033.
- **Linked REQ:** REQ-0033 · ART-0033

## [C1] 2026-07-23T13:40:00Z | RELEASE | DIPLOI_PR7_MERGED

- **Decision:** Squash-merge PR #7 (Launch with Diploi README button); keep Coolify/Vercel as primary production path.
- **Rationale:** README-only; GitGuardian clean; Vercel fail = fork auth only.
- **Linked REQ:** REQ-0027 · REQ-0031 · REQ-0033

## [C1] 2026-07-23T13:53:00Z | AUDIT | DOCS_SCOPE_ONLY

- **Decision:** Pre-commit audit: docs/AQMS OK; FE lint + BE build PASS. No Redis/SSR/global invalidation work claimed — gaps pre-existing, not regressions from REQ-0033.
- **Rationale:** Session deliverables were documentation + Agile V bootstrap only.
- **Linked REQ:** REQ-0033

## [C1] 2026-07-23T14:05:00Z | SECURITY | REQ-0034_VULDB_HEALTH

- **Decision:** ACCEPT VulDB #c891c0. Harden `/api/health` (minimal public) + JWT `/detailed` without host/port/pid/Node/platform; sanitize `system-stats/public`; wire React Query invalidation for hotel/booking CRUD.
- **Rationale:** Confirmed CWE-200 information disclosure; coordinated disclosure with CNA.
- **Linked REQ:** REQ-0034 · CAPA-0001
- **VulDB reply stance:** ACCEPT — patch on main; disclosure OK after release.

## [C1] 2026-07-23T14:45:00Z | PRODUCT | T1_VITE_SPA_HARDENING

- **Decision:** Stay Vite SPA (1A). Ship T1 only (REQ-0035…0039): playbook/plan, My Hotels stats, Review API+FE, Edit Cancel/Back, skeletons/scroll/RQ. Halt before T2 cancel/refund.
- **Rationale:** Approved phased roadmap; sequential gates; Analytics snapshots deferred to T3.
- **Linked REQ:** REQ-0035…0039 · ART-0035…0039 · VER-0013
- **Resume:** `c1-t1-complete-halt-t2`

## [C1] 2026-07-23T15:20:00Z | PRODUCT | T2_CANCEL_STRIPE_REFUND

- **Decision:** Ship T2 (REQ-0040…0042): persist PI id; POST /bookings/:id/cancel with guest/owner/admin authz; full Stripe refund when paid; Cancel UI on My Bookings + Booking Log; halt before T3 admin shell.
- **Rationale:** Roadmap gate after T1; legacy bookings without PI cancel without fake refund.
- **Linked REQ:** REQ-0040…0042 · ART-0040…0042 · VER-0014
- **Resume:** `c1-t2-complete-halt-t3`

## [C1] 2026-07-23T16:00:00Z | PRODUCT | T3_ADMIN_SHELL

- **Decision:** Ship T3 (REQ-0043…0045): requireAdmin APIs, Analytics snapshots, `/admin/*` shell gated by `/users/me` role, admin RQ invalidation; T2 PATCH/DELETE harden. Halt before T4 AI.
- **Rationale:** Roadmap sequential gate; hotel-domain only (no ERP).
- **Linked REQ:** REQ-0043…0045 · ART-0043…0045 · VER-0015
- **Resume:** `c1-t3-complete-halt-t4`

## [C1] 2026-07-23T16:15:00Z | PRODUCT | T4_AI_AND_SEED

- **Decision:** Ship T4 (REQ-0046…0048): env-gated AI suggest (OpenAI or stub), draft-and-approve UI, Mongoose wipe+seed for test@user.com admin. No Prisma. Roadmap T1–T4 complete.
- **Rationale:** Approved plan; seed uses real booking enums only.
- **Linked REQ:** REQ-0046…0048 · ART-0046…0048 · VER-0016
- **Resume:** `c1-t4-complete-roadmap-done`

## [C1] 2026-07-23T16:30:00Z | PRODUCT | T5_AI_AUTH_SEED

- **Decision:** Ship T5 (REQ-0049…0052): multi-provider LLM failover (Groq→OpenAI→OpenRouter→stub), auth/TLS harden, full-field Mongoose seed, admin role PATCH + hotel isActive toggle. No Prisma/Redis/Clerk.
- **Rationale:** Post-roadmap hardening per approved T5 plan; copy/polish models only (no deprecated Groq llama).
- **Linked REQ:** REQ-0049…0052
- **Resume:** `c1-t5-ai-auth-seed`

## [C1] 2026-07-23T16:50:00Z | PRODUCT | POST_T5_POLISH

- **Decision:** Ship post-T5 polish: API links in profile menu; self-hosted Inter; SafeImage; Vercel security headers + robots.txt; production API host `hotel-booking-backend.arnobmahmud.com` (retire DuckDNS).
- **Rationale:** Prod console/FOUT/crawl guardrails; Coolify custom domain live.
- **Resume:** `c1-t5-ai-auth-seed`
