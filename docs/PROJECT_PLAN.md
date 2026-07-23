# Hotel Booking — Project Plan (Vite SPA)

**Stack:** Vite React 18 SPA + Express TS + MongoDB  
**Decision:** Stay Vite (1A). Tranches **T1 → T2 → T3 → T4** sequential.  
**Playbook:** [`PROJECT_IDEA.md`](./PROJECT_IDEA.md) §0  
**VulDB CWE-200:** Closed on `main` (REQ-0034) — public `/api/health` minimal; `/detailed` JWT.

---

## Vite SPA ↔ playbook mapping

| Playbook (Next-flavored) | This repo |
|--------------------------|-----------|
| `page.tsx` SSR shell | `src/pages/*` + Layout chrome paints immediately |
| `"use client"` islands | Interactive `components/` / forms |
| Prefetch / dehydrate | React Query keys + `invalidate-queries.ts` |
| Redis / SSE | Deferred until measured need |

---

## T1 — Product hardening (**DONE**)

| ID | Work | Status |
|----|------|--------|
| REQ-0035 | Playbook §0 + this PLAN | done |
| REQ-0036 | My Hotels booking counts + dynamic rating | done |
| REQ-0037 | Review REST API (create/list) + FE | done |
| REQ-0038 | Edit hotel Save / Cancel / Back | done |
| REQ-0039 | Empty-state skeletons; dropdown scroll; scrollbar-gutter; RQ coverage | done |

**DoD T1:** FE lint+build · BE build · no empty flash on My Hotels · edit cancel/back · reviews API · invalidation on hotel/booking/review mutations. ✅

**Out of T1:** cancel/refund, admin shell, AI, Redis, Next.js.

---

## T2 — Booking lifecycle (**DONE** — halt before T3)

| ID | Work | Status |
|----|------|--------|
| REQ-0040 | Persist `stripePaymentIntentId` on book | done |
| REQ-0041 | `POST /api/bookings/:id/cancel` + Stripe full refund + authz | done |
| REQ-0042 | Guest My Bookings + owner Booking Log cancel UI + RQ invalidation | done |

- Guest cancel booking (status rules + My Bookings UI)
- Owner/admin cancel + Stripe refund
- Status badges aligned (upcoming / completed / cancelled)

**DoD T2:** FE lint+build · BE build · cancel refreshes My Bookings / My Hotels without reload. ✅

**Out of T2:** admin shell (T3), AI (T4), Redis, Next.js, partial refunds, webhooks.

---

## T3 — Admin shell (**DONE** — halt before T4)

| ID | Work | Status |
|----|------|--------|
| REQ-0043 | `requireAdmin` + users/reviews list + Analytics snapshots | done |
| REQ-0044 | AdminLayout + AdminRoute + `/admin/*` pages + nav | done |
| REQ-0045 | Admin RQ invalidation + T2 PATCH/DELETE micro-fixes | done |

- Role `admin`: `/admin/*` sidebar layout
- Dashboard, hotels, users, reviews, bookings, activity
- Analytics model snapshots (not invoices/orgs/tickets)

**DoD T3:** FE lint+build · BE build · non-admin blocked · snapshot create works. ✅

**Out of T3:** AI (T4), Redis, Next.js, ERP domains.

---

## T4 — AI assist (**DONE** — roadmap complete)

| ID | Work | Status |
|----|------|--------|
| REQ-0046 | `POST /api/ai/suggest` env-gated OpenAI-or-stub | done |
| REQ-0047 | Description polish + admin insights draft-and-approve | done |
| REQ-0048 | Mongoose wipe+seed (`test@user.com` admin + status matrix) | done |

- Env-gated suggestions (description polish / insights copy)
- No client secrets; draft-and-approve for destructive actions
- Seed: `cd hotel-booking-backend && npm run seed` (destroys local Mongo data; **not Prisma**)

**DoD T4:** FE lint+build · BE build · seed OK. ✅

---

## T5 — Multi-model AI + auth harden + full seed (**DONE**)

Post-roadmap hardening (not redoing T1–T4). **No Prisma.**

| ID | Work | Status |
|----|------|--------|
| REQ-0049 | Multi-provider LLM chain (Groq → OpenAI → OpenRouter → stub) with 429/5xx failover | done |
| REQ-0050 | Auth/TLS harden: trust proxy, secure cookies, Mongo TLS, SECURITY note | done |
| REQ-0051 | Full-field Mongoose seed (every schema property) | done |
| REQ-0052 | Admin PATCH user role + hotel `isActive` toggle + RQ | done |

- AI: `lib/llm.ts` — never deprecated Groq llama; draft-only response includes `provider` / `model` / `usedFallback`
- Cookies: `secure` + `sameSite=none` in production; Mongo Atlas TLS on connect
- Seed still `npm run seed` wipe+reseed (`test@user.com` admin)
- Admin Users role select; Admin Hotels activate/deactivate

**DoD T5:** FE lint+build · BE build · seed OK. ✅

**Out of T5:** Redis, Next.js, Clerk, ERP.

---

## Post-T5 polish (**DONE**)

| Work | Status |
|------|--------|
| API Docs/Status moved to profile menu (logged-in); red Logout | done |
| Self-hosted Inter (`public/fonts`) + preload | done |
| Quiet guest `validateToken`; strip debug console noise | done |
| `SafeImage` + hotel media surfaces | done |
| Vercel security headers + immutable `/assets`/`/fonts` + `robots.txt` | done |
| Production API → `https://hotel-booking-backend.arnobmahmud.com` | done |

**DoD polish:** FE lint+build · BE build. ✅

---

## Explicit later / never without new REQ

Next.js migration · Redis · SSE multi-tab · ERP invoices/orgs/support tickets · Clerk

---

## Verify commands

```bash
cd hotel-booking-backend && npm run build && npm run seed
cd hotel-booking-frontend && npm run lint && npm run build
```
