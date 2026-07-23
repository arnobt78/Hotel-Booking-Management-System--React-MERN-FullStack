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
