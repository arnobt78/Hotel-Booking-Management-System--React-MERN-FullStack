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
| REQ-0032 | Reviews + Analytics API | done [C1] |
| REQ-0033 | Educational README + SECURITY.md | done [C1] |
| REQ-0034 | Health CWE-200 / VulDB fix + RQ invalidation | done [C1] |
| REQ-0035 | Playbook §0 + PROJECT_PLAN T1–T4 | done [C1] |
| REQ-0036 | My Hotels booking counts + dynamic rating | done [C1] |
| REQ-0037 | Review REST API (create/list) + guest form | done [C1] |
| REQ-0038 | Edit hotel Save / Cancel / Back | done [C1] |
| REQ-0039 | Skeletons; dropdown scroll; scrollbar-gutter; RQ reviews | done [C1] |
| REQ-0040 | Persist Stripe PaymentIntent id on booking | done [C1] |
| REQ-0041 | Cancel API + Stripe full refund + authz | done [C1] |
| REQ-0042 | Guest/owner cancel UI + invalidateBookingQueries | done [C1] |
| REQ-0043 | Admin APIs: users/reviews list + Analytics snapshots | done [C1] |
| REQ-0044 | Admin shell UI `/admin/*` | done [C1] |
| REQ-0045 | Admin invalidation + T2 cancel-path harden | done [C1] |
| REQ-0046 | AI suggest API (env-gated) | done [C1] |
| REQ-0047 | AI draft-and-approve UI | done [C1] |
| REQ-0048 | Mongoose seed script | done [C1] |
| REQ-0049 | Multi-provider LLM failover (Groq/OpenAI/OpenRouter/stub) | done [C1] |
| REQ-0050 | Auth/TLS harden + SECURITY HTTPS note | done [C1] |
| REQ-0051 | Full-field Mongoose seed | done [C1] |
| REQ-0052 | Admin role PATCH + hotel isActive toggle | done [C1] |

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
- **Constraint:** Must not break live insights aggregates; authz for write paths; traceable ART/TC before merge. Analytics snapshot endpoints deferred to T3 admin.
- **Verification Criteria:** CRUD or documented read endpoints return valid JSON; unauthorized writes rejected; Red Team suite green.
- **Done Criteria:** [x] Review routes · [x] FE list/create · [x] Analytics snapshot routes (T3) · [ ] Tests
- **Status:** done [C1] — Reviews (REQ-0037) + Analytics snapshots (REQ-0043)
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

## REQ-0035 — Vite SPA playbook + PROJECT_PLAN roadmap

- **Requirement:** Rewrite `docs/PROJECT_IDEA.md` §0 for this Vite SPA monorepo (not Next.js); fill `docs/PROJECT_PLAN.md` with T1–T4 phases, DoD, out-of-scope.
- **Constraint:** Authority remains `.agile-v/` + CLAUDE.md + §0; no Next migration assumed.
- **Verification Criteria:** §0 lists Instant UI / invalidation / reuse rules; PLAN has T1–T4 with halt-before-next gates.
- **Done Criteria:** [x] PROJECT_IDEA §0 · [x] PROJECT_PLAN.md
- **Status:** done [C1]

## REQ-0036 — My Hotels enrichment (booking counts + rating)

- **Requirement:** Owner My Hotels cards show upcoming / completed / cancelled booking counts and live average rating from Review aggregates (fallback starRating).
- **Constraint:** Enrich `GET /api/my-hotels`; extend shared `HotelType`.
- **Verification Criteria:** Response includes count fields; FE cards render without empty flash while loading.
- **Done Criteria:** [x] Backend aggregate · [x] MyHotels UI · [x] shared types
- **Status:** done [C1]

## REQ-0037 — Review REST API + consumption

- **Requirement:** `GET/POST /api/reviews` for hotel list/create; public read; JWT write; Detail lists reviews; My Bookings write form; invalidate hotel/review queries.
- **Constraint:** One review per booking/user; sync hotel.averageRating/reviewCount on create.
- **Verification Criteria:** Unauth POST → 401; list returns JSON; create updates aggregates; FE invalidation refreshes My Hotels.
- **Done Criteria:** [x] routes/reviews.ts · [x] api-client · [x] Detail + WriteReviewForm · [x] invalidateReviewQueries
- **Status:** done [C1]

## REQ-0038 — Edit hotel Save / Cancel / Back

- **Requirement:** ManageHotelForm exposes Save/Update, Cancel (discard + navigate), Back to `/my-hotels`; consistent with AddHotel.
- **Constraint:** Reuse `components/ui` Button; Cancel only on Edit.
- **Verification Criteria:** Edit Cancel returns to My Hotels without saving; Back link present on Add/Edit.
- **Done Criteria:** [x] ManageHotelForm · [x] EditHotel · [x] AddHotel showBack
- **Status:** done [C1]

## REQ-0039 — Loading skeletons + scroll lock + RQ coverage

- **Requirement:** Skeleton cards on My Hotels / My Bookings / Search / Detail while loading; DropdownMenu `modal={false}` default; `html { scrollbar-gutter: stable }`; document RQ keys including reviews.
- **Constraint:** No empty-state flash while `isLoading`; no Redis/SSE.
- **Verification Criteria:** FE lint+build PASS; BE build PASS.
- **Done Criteria:** [x] skeletons · [x] dropdown modal=false · [x] index.css gutter · [x] invalidate-queries comments
- **Status:** done [C1]

## REQ-0040 — Persist Stripe PaymentIntent on booking

- **Requirement:** Store `stripePaymentIntentId` on Booking at create time so cancel can refund via Stripe.
- **Constraint:** Value always from retrieved PaymentIntent server-side; extend shared `BookingType`.
- **Verification Criteria:** New paid bookings have PI id; legacy without id still cancellable without fake refund.
- **Done Criteria:** [x] booking model · [x] shared types · [x] hotels book path
- **Status:** done [C1]

## REQ-0041 — Cancel booking API + Stripe refund

- **Requirement:** `POST /api/bookings/:id/cancel` for guest (own), hotel owner, or admin; upcoming pending/confirmed only; full Stripe refund when paid+PI; harden status/payment/delete authz.
- **Constraint:** Same `STRIPE_API_KEY`; no secrets in repo; decrement hotel/user analytics when cancelling paid bookings.
- **Verification Criteria:** Unauth → 401; wrong user → 403; Stripe failure → 502; BE build PASS.
- **Done Criteria:** [x] routes/bookings.ts cancel · [x] authz · [x] stripe.refunds.create · [x] .env.example note
- **Status:** done [C1]

## REQ-0042 — Cancel UI + React Query invalidation

- **Requirement:** Cancel control on My Bookings (guest) and Booking Log (owner); call cancel API; `invalidateBookingQueries` so My Hotels counts update without reload; status badge alignment.
- **Constraint:** Reuse Button/ui; no full page refresh.
- **Verification Criteria:** FE lint+build PASS; cancellable only for upcoming.
- **Done Criteria:** [x] CancelBookingButton · [x] MyBookings · [x] BookingLogModal · [x] api-client.cancelBooking
- **Status:** done [C1]

## REQ-0043 — Admin APIs (users, reviews, analytics snapshots)

- **Requirement:** Admin-only `GET /api/users`, `GET /api/reviews`, `GET/POST /api/analytics/snapshots` with `requireAdmin` middleware; reuse bookings list.
- **Constraint:** JWT stays userId-only; role from DB; no ERP domains.
- **Verification Criteria:** Non-admin → 403; snapshot create persists Analytics model; BE build PASS.
- **Done Criteria:** [x] requireAdmin · [x] users list · [x] reviews list · [x] analytics routes
- **Status:** done [C1]

## REQ-0044 — Admin shell UI

- **Requirement:** `/admin/*` with AdminLayout sidebar; AdminRoute via `/users/me` role; pages dashboard/hotels/users/reviews/bookings/activity; Admin link for admins only.
- **Constraint:** Reuse ui components + CancelBookingButton; Instant UI = layout + skeletons.
- **Verification Criteria:** Non-admin redirected; FE lint+build PASS.
- **Done Criteria:** [x] AdminLayout · [x] AdminRoute · [x] pages · [x] UsernameMenu Admin link
- **Status:** done [C1]

## REQ-0045 — Admin invalidation + cancel-path harden

- **Requirement:** invalidateAdminQueries keys; booking cancel invalidates admin bookings/insights; PATCH reject cancelled/refunded; DELETE skip double-decrement.
- **Done Criteria:** [x] invalidate-queries · [x] bookings PATCH/DELETE
- **Status:** done [C1]

## REQ-0046 — AI suggest API

- **Requirement:** `POST /api/ai/suggest` with JWT; `AI_ASSIST_ENABLED=true` required; OpenAI when key set else stub; returns `{ draft, provider }` only (no DB write).
- **Constraint:** Optional env only (not fail-fast); no client secrets.
- **Done Criteria:** [x] routes/ai.ts · [x] .env.example
- **Status:** done [C1]

## REQ-0047 — AI draft-and-approve UI

- **Requirement:** ManageHotelForm description Suggest polish + Apply/Discard; Admin Dashboard insights blurb notepad.
- **Done Criteria:** [x] DetailsSection · [x] AdminDashboard · [x] api-client.suggestAiAssist
- **Status:** done [C1]

## REQ-0048 — Mongoose wipe + seed

- **Requirement:** `npm run seed` wipes User/Hotel/Booking/Review/Analytics and seeds `test@user.com`/`12345678` as admin plus owner/guest, hotels, booking status matrix, reviews, snapshot. No Prisma.
- **Done Criteria:** [x] scripts/seed.ts · [x] package.json seed · [x] Analytics byHotelType schema fix
- **Status:** done [C1]

## REQ-0049 — Multi-provider LLM failover

- **Requirement:** `POST /api/ai/suggest` uses ordered chain Groq → OpenAI → OpenRouter → stub; on 429/5xx/timeout/empty try next immediately; no deprecated Groq llama models; response `{ draft, provider, model?, usedFallback? }` with no DB write.
- **Done Criteria:** [x] lib/llm.ts · [x] routes/ai.ts · [x] .env.example keys
- **Status:** done [C1]

## REQ-0050 — Auth / TLS harden

- **Requirement:** `trust proxy`; production cookies `secure` + `sameSite=none`; Mongo TLS when `mongodb+srv`/`tls=true`; SECURITY.md HTTPS + cookie note.
- **Done Criteria:** [x] index.ts connect · [x] cookie-options · [x] SECURITY.md
- **Status:** done [C1]

## REQ-0051 — Full-field Mongoose seed

- **Requirement:** Seed populates every documented User/Hotel/Booking/Review/Analytics field (location, contact, policies, amenities, preferences, address, specialRequests, helpfulCount, etc.).
- **Done Criteria:** [x] scripts/seed.ts full fields
- **Status:** done [C1]

## REQ-0052 — Admin role + hotel active

- **Requirement:** `PATCH /api/users/:id/role` (admin); `PATCH /api/hotels/:id/active` (admin) + `PATCH /api/my-hotels/:id/active` (owner); Admin Users/Hotels UI + invalidateAdminQueries.
- **Done Criteria:** [x] users/hotels/my-hotels routes · [x] AdminUsers · [x] AdminHotels · [x] api-client
- **Status:** done [C1]

---

## Non-goals (C1)

- Clerk auth migration (guide exists; stack remains JWT unless CR approved)
- Python services
- Changing payment currency away from GBP without CR

---

## Hardware / physical constraints

N/A — software SaaS. External deps: MongoDB Atlas, Stripe, Cloudinary, Google OAuth, Vercel, Coolify VPS.
