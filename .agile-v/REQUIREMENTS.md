# Requirements (Blueprint) — Hotel Booking MERN

<!-- Revision: C1 | Date: 2026-07-23 | Project: hotel-booking-1 | Gate 1: PENDING -->
<!-- Source: docs/PROJECT_WALKTHROUGH.md + shipped codebase HEAD 408e572 -->

**Status legend:** `done [C1]` shipped baseline · `planned [C1]` extension · `approved [Cn]` after Gate 1

---

## Traceability index

| Range | Theme | Status |
|-------|-------|--------|
| REQ-0001…0004 | Authentication | done [C1] |
| REQ-0005…0008 | Hotels discovery | done [C1] |
| REQ-0009…0011 | Booking + Stripe | done [C1] |
| REQ-0012…0015 | Owner hotel CRUD | done [C1] |
| REQ-0016…0018 | Bookings management | done [C1] |
| REQ-0019…0021 | Business insights | done [C1] |
| REQ-0022…0026 | Frontend platform | done [C1] |
| REQ-0027…0028 | Deployment | done [C1] |
| REQ-0029…0031 | Types, e2e, docs | done [C1] |
| REQ-0032 | Reviews + Analytics API | planned [C1] |
| REQ-0033 | Educational README + SECURITY.md | done [C1] |
| REQ-0034 | Health CWE-200 / VulDB fix + RQ invalidation | done [C1] |

---

## REQ-0001 — Email/password registration

- **Requirement:** Guests can register with email, password, first/last name; password hashed (bcrypt); JWT/session established.
- **Constraint:** `POST /api/users/register`; User model pre-save hash; no plaintext password storage.
- **Verification Criteria:** Register succeeds; `/api/users/me` returns profile with JWT; duplicate email rejected.
- **Done Criteria:** [x] Route · [x] Model · [x] Frontend Register page
- **Status:** done [C1]

## REQ-0002 — Email/password login

- **Requirement:** Users sign in with email/password and receive JWT for subsequent API calls.
- **Constraint:** `POST /api/auth/login`; JWT signed with `JWT_SECRET_KEY`; frontend stores `localStorage.session_id`.
- **Verification Criteria:** Valid credentials → token; invalid → 4xx; `validate-token` succeeds after login.
- **Done Criteria:** [x] Login API · [x] SignIn page · [x] React Query invalidate `validateToken`
- **Status:** done [C1]

## REQ-0003 — Google OAuth login

- **Requirement:** Users can authenticate via Google OAuth; backend creates/finds user and redirects to frontend with token.
- **Constraint:** `/api/auth/google` + `/api/auth/callback/google`; `GOOGLE_ID`/`GOOGLE_SECRET`; redirect uses `FRONTEND_URL`.
- **Verification Criteria:** OAuth round-trip lands on `/auth/callback` with token; user persisted.
- **Done Criteria:** [x] Backend OAuth · [x] AuthCallback page · [x] Navbar Google entry
- **Status:** done [C1]

## REQ-0004 — JWT validation, logout, protected middleware

- **Requirement:** Protected routes require valid JWT (Bearer or cookie); logout clears session cookie; frontend clears localStorage.
- **Constraint:** `verifyToken` middleware; `GET /api/auth/validate-token`; `POST /api/auth/logout`.
- **Verification Criteria:** Missing/invalid JWT → 401; logout clears cookie; UI updates `isLoggedIn`.
- **Done Criteria:** [x] Middleware · [x] Axios Bearer interceptor · [x] SignOutButton
- **Status:** done [C1]

## REQ-0005 — List and fetch hotels

- **Requirement:** Public API returns all hotels and a single hotel by id.
- **Constraint:** `GET /api/hotels`, `GET /api/hotels/:id`.
- **Verification Criteria:** List non-empty when seeded; 404 for unknown id.
- **Done Criteria:** [x] Routes · [x] Home featured · [x] Detail page
- **Status:** done [C1]

## REQ-0006 — Hotel search with filters and pagination

- **Requirement:** Users search hotels by destination, guests, facilities, types, stars, maxPrice, sort, page.
- **Constraint:** `GET /api/hotels/search`; page size 5; query param arrays for facilities/types/stars.
- **Verification Criteria:** Filters narrow results; pagination metadata correct.
- **Done Criteria:** [x] Search API · [x] Search page + AdvancedSearch · [x] SearchContext
- **Status:** done [C1]

## REQ-0007 — Hotel detail view

- **Requirement:** Detail page shows hotel media, amenities, pricing, and booking entry.
- **Constraint:** Route `/detail/:hotelId`; uses shared `HotelType`.
- **Verification Criteria:** Detail matches API payload; book CTA navigates when logged in.
- **Done Criteria:** [x] Detail.tsx · [x] API client fetch by id
- **Status:** done [C1]

## REQ-0008 — Search criteria persistence

- **Requirement:** Search destination, dates, guest counts persist across navigation via sessionStorage.
- **Constraint:** `SearchContextProvider`.
- **Verification Criteria:** Reload/search navigation restores criteria.
- **Done Criteria:** [x] SearchContext
- **Status:** done [C1]

## REQ-0009 — Stripe PaymentIntent creation

- **Requirement:** Authenticated user can create a PaymentIntent for a hotel stay (nights × pricePerNight, GBP).
- **Constraint:** `POST /api/hotels/:hotelId/bookings/payment-intent`; requires JWT; amount in pence.
- **Verification Criteria:** Returns `clientSecret`; unauthorized → 401.
- **Done Criteria:** [x] Backend · [x] Booking page createPaymentIntent
- **Status:** done [C1]

## REQ-0010 — Confirm booking after successful payment

- **Requirement:** Booking created only when PaymentIntent status is `succeeded`; hotel/user totals updated.
- **Constraint:** `POST /api/hotels/:hotelId/bookings`; Booking collection separate from Hotel.
- **Verification Criteria:** Succeeded PI → Booking row; failed/pending PI rejected.
- **Done Criteria:** [x] Confirm route · [x] BookingForm stripe.confirmCardPayment
- **Status:** done [C1]

## REQ-0011 — Guest my-bookings view

- **Requirement:** Logged-in guests view their bookings with hotel populated.
- **Constraint:** `GET /api/my-bookings`; route `/my-bookings`.
- **Verification Criteria:** Only current user's bookings returned.
- **Done Criteria:** [x] API · [x] MyBookings page
- **Status:** done [C1]

## REQ-0012 — Owner create hotel with images

- **Requirement:** Authenticated owners create hotels with up to 6 images uploaded to Cloudinary.
- **Constraint:** `POST /api/my-hotels`; multer memory; 5MB/file; Cloudinary env required.
- **Verification Criteria:** Hotel persisted with `imageUrls`; ownership = `userId`.
- **Done Criteria:** [x] Route · [x] AddHotel + ManageHotelForm
- **Status:** done [C1]

## REQ-0013 — Owner list and get hotel

- **Requirement:** Owners list their hotels and fetch one by id (ownership enforced).
- **Constraint:** `GET /api/my-hotels`, `GET /api/my-hotels/:id`.
- **Verification Criteria:** Non-owner cannot fetch others' hotel.
- **Done Criteria:** [x] Routes · [x] MyHotels page
- **Status:** done [C1]

## REQ-0014 — Owner update hotel

- **Requirement:** Owners update hotel fields and optionally add images.
- **Constraint:** `PUT /api/my-hotels/:hotelId`.
- **Verification Criteria:** Update persists; unauthorized owner rejected.
- **Done Criteria:** [x] Route · [x] EditHotel page
- **Status:** done [C1]

## REQ-0015 — Owner booking log per hotel

- **Requirement:** Owners can view bookings for a hotel they own.
- **Constraint:** `GET /api/bookings/hotel/:hotelId`; UI BookingLogModal.
- **Verification Criteria:** Returns bookings for owned hotel only.
- **Done Criteria:** [x] Route · [x] Modal on MyHotels
- **Status:** done [C1]

## REQ-0016 — Booking CRUD management API

- **Requirement:** Authenticated users can list, get, update status/payment, and delete bookings (analytics adjusted on delete).
- **Constraint:** `/api/bookings` routes per walkthrough.
- **Verification Criteria:** Status/payment patches persist; delete removes booking.
- **Done Criteria:** [x] bookings.ts routes
- **Status:** done [C1]

## REQ-0017 — Current user profile API

- **Requirement:** Authenticated user can fetch own profile.
- **Constraint:** `GET /api/users/me`.
- **Verification Criteria:** Returns user without password hash exposure.
- **Done Criteria:** [x] Route · [x] Frontend usage
- **Status:** done [C1]

## REQ-0018 — Health endpoints

- **Requirement:** Ops can check API/DB health and detailed system stats.
- **Constraint:** `GET /api/health`, `/api/health/detailed`.
- **Verification Criteria:** Healthy response when Mongo connected.
- **Done Criteria:** [x] health.ts · [x] ApiStatus page
- **Status:** done [C1]

## REQ-0019 — Business insights dashboard metrics

- **Requirement:** Dashboard exposes aggregated metrics (public + auth variants).
- **Constraint:** `/api/business-insights/dashboard[/public]`; live aggregates from Hotel/User/Booking.
- **Verification Criteria:** Endpoints return chart-ready JSON without crashing on empty data.
- **Done Criteria:** [x] Routes · [x] AnalyticsDashboard
- **Status:** done [C1]

## REQ-0020 — Forecast and system-stats insights

- **Requirement:** Forecast and system-stats endpoints available (public + auth).
- **Constraint:** `/forecast`, `/system-stats` (+ `/public`).
- **Verification Criteria:** Stable JSON shape for Recharts consumers.
- **Done Criteria:** [x] Routes · [x] Dashboard charts
- **Status:** done [C1]

## REQ-0021 — Insights route naming

- **Requirement:** Frontend route for analytics is `/business-insights` (not legacy `/analytics`).
- **Constraint:** App.tsx route table.
- **Verification Criteria:** Navigation lands on AnalyticsDashboard.
- **Done Criteria:** [x] Route rename shipped
- **Status:** done [C1]

## REQ-0022 — SPA bootstrap providers

- **Requirement:** App boots with QueryClient, AppContext (auth/Stripe/toasts), SearchContext.
- **Constraint:** `main.tsx` provider tree; React Query `retry: 0`.
- **Verification Criteria:** App renders; contexts available to pages.
- **Done Criteria:** [x] main.tsx · [x] contexts
- **Status:** done [C1]

## REQ-0023 — Routing and layouts

- **Requirement:** Public/auth/protected routes as per walkthrough; Layout vs AuthLayout.
- **Constraint:** React Router in `App.tsx`; booking/add/edit hotel require `isLoggedIn` in UI; backend still enforces JWT.
- **Verification Criteria:** Unauthenticated cannot complete booking UI; deep links work via SPA rewrite.
- **Done Criteria:** [x] App.tsx · [x] Layouts
- **Status:** done [C1]

## REQ-0024 — API base URL resolution

- **Requirement:** Frontend resolves API origin from env / host heuristics / localhost:5001.
- **Constraint:** `getApiBaseUrl()` in `lib/api-client.ts`.
- **Verification Criteria:** Local and Vercel builds hit correct backend.
- **Done Criteria:** [x] getApiBaseUrl
- **Status:** done [C1]

## REQ-0025 — Auth UI (navbar, toasts, test credentials)

- **Requirement:** Sign-in UX includes test-credential dropdown (dev), avatar/profile menu, toast feedback without flicker regressions.
- **Constraint:** Follow existing Auth UI patterns in docs; JWT stack (not Clerk unless new REQ).
- **Verification Criteria:** Login/logout updates navbar without full reload; guest dropdown pre-fills when enabled.
- **Done Criteria:** [x] SignIn dropdown · [x] MainNav avatar · [x] toasts
- **Status:** done [C1]

## REQ-0026 — Swagger API docs

- **Requirement:** Backend exposes interactive OpenAPI at `/api-docs`; frontend may deep-link.
- **Constraint:** `swagger.ts` mount.
- **Verification Criteria:** `/api-docs` loads; documents core routes.
- **Done Criteria:** [x] Backend swagger · [x] ApiDocs page
- **Status:** done [C1]

## REQ-0027 — Frontend deploy on Vercel

- **Requirement:** SPA builds to `dist/` with rewrite to `index.html`; env `VITE_API_BASE_URL` / Stripe pub key.
- **Constraint:** `hotel-booking-frontend/vercel.json`.
- **Verification Criteria:** Production SPA routes resolve; API calls succeed with CORS.
- **Done Criteria:** [x] vercel.json · [x] Live demo
- **Status:** done [C1]

## REQ-0028 — Backend deploy on Coolify/Docker

- **Requirement:** Docker image builds from repo root (includes `shared/`); healthcheckable; CORS allows Vercel/Netlify + FRONTEND_URL.
- **Constraint:** Dockerfile; PORT configurable; fail-fast on missing secrets.
- **Verification Criteria:** Container serves `/api/health`; OAuth redirect_uri matches BACKEND_URL.
- **Done Criteria:** [x] Dockerfile · [x] CORS · [x] Live API
- **Status:** done [C1]

## REQ-0029 — Shared TypeScript contracts

- **Requirement:** Frontend and backend share types for User/Hotel/Booking/search/payment.
- **Constraint:** `shared/types.ts` copied in Docker build.
- **Verification Criteria:** Types compile in both packages.
- **Done Criteria:** [x] shared/types.ts
- **Status:** done [C1]

## REQ-0030 — Playwright e2e coverage (auth, search, manage)

- **Requirement:** E2E specs cover sign-in/register, search, add hotel against local UI.
- **Constraint:** `e2e-tests/`; fixtures in `data/`.
- **Verification Criteria:** Specs pass with BE+FE running locally.
- **Done Criteria:** [x] auth/search/manage specs present
- **Status:** done [C1]

## REQ-0031 — Project walkthrough documentation

- **Requirement:** Maintain A–Z architecture walkthrough aligned with ports, auth, deploy.
- **Constraint:** `docs/PROJECT_WALKTHROUGH.md`.
- **Verification Criteria:** Doc matches current routes/ports (5001/5174).
- **Done Criteria:** [x] Walkthrough shipped (`408e572`)
- **Status:** done [C1]

---

## Planned extensions (await Gate 1 + explicit instruction)

## REQ-0032 — Reviews and Analytics REST surfaces

- **Requirement:** Expose REST APIs for existing `Review` and `Analytics` Mongoose models (currently schema-only), with frontend consumption paths defined in a follow-on UX REQ if needed.
- **Constraint:** Must not break live insights aggregates; authz for write paths; traceable ART/TC before merge.
- **Verification Criteria:** CRUD or documented read endpoints return valid JSON; unauthorized writes rejected; Red Team suite green.
- **Done Criteria:** [ ] Routes · [ ] Tests · [ ] Manifest/ATM updated
- **Status:** planned [C1]
- **Priority:** MEDIUM · **Risk:** R2

## REQ-0033 — Educational README + SECURITY.md

- **Requirement:** Replace root README with complete learner-oriented documentation (stack badges, structure, APIs, env setup, reuse guidance, Diploi-optional deploy section) and add root `SECURITY.md` for private vulnerability reporting linked from README.
- **Constraint:** Match real stack (Vite React + Express, not Next.js); preserve Diploi launch URL; env docs must match fail-fast backend required vars; no secrets in docs.
- **Verification Criteria:** README has badges + `---` sections + License/Happy Coding endings; SECURITY.md lists contact@arnobmahmud.com; deploy section uses Optional Diploi then Coolify then Vercel.
- **Done Criteria:** [x] README rewritten · [x] SECURITY.md · [x] Linked from README
- **Status:** done [C1]
- **Priority:** HIGH · **Risk:** R0

## REQ-0034 — Health endpoint information disclosure (VulDB / CWE-200)

- **Requirement:** Close unauthenticated disclosure of infrastructure details via `/api/health` and `/api/health/detailed` (VulDB #c891c0 / PoC sensitive-information-disclosure). Public probe must stay load-balancer safe; detailed metrics require JWT and must not return host/port/pid/Node/platform/raw CPU.
- **Constraint:** Docker/Coolify healthcheck continues to use public `GET /api/health`. Do not remove ApiStatus UI — adapt to sanitized shapes. Public `system-stats` must not leak process telemetry.
- **Verification Criteria:** Unauth `GET /api/health/detailed` → 401; unauth `/api/health` returns only status/timestamp/db.status; lint + FE/BE build PASS; hotel/booking mutations invalidate React Query keys.
- **Done Criteria:** [x] health.ts hardened · [x] ApiStatus JWT detailed · [x] system-stats/public sanitized · [x] invalidate-queries wired
- **Status:** done [C1]
- **Priority:** CRITICAL · **Risk:** R2

---

## Non-goals (C1)

- Clerk auth migration (guide exists; stack remains JWT unless CR approved)
- Python services
- Changing payment currency away from GBP without CR

---

## Hardware / physical constraints

N/A — software SaaS. External deps: MongoDB Atlas, Stripe, Cloudinary, Google OAuth, Vercel, Coolify VPS.
