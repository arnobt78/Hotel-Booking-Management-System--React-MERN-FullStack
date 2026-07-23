# Build Manifest — hotel-booking-1 (C1)

<!-- ART-XXXX map REQ → code paths | Baseline sync 2026-07-23 | HEAD 408e572 -->

| ART-ID | REQ | Cycle | Paths / notes | Status |
|--------|-----|-------|---------------|--------|
| ART-0001 | REQ-0001 | C1 | `hotel-booking-backend/src/routes/users.ts`, `models/user.ts`, `hotel-booking-frontend/src/pages/Register.tsx` | shipped |
| ART-0002 | REQ-0002 | C1 | `routes/auth.ts` login, `pages/SignIn.tsx`, `api-client.ts` signIn | shipped |
| ART-0003 | REQ-0003 | C1 | `routes/auth.ts` google/callback, `pages/AuthCallback.tsx` | shipped |
| ART-0004 | REQ-0004 | C1 | `middleware/auth.ts`, validate-token/logout, `lib/api-client.ts` interceptor, `SignOutButton.tsx` | shipped |
| ART-0005 | REQ-0005 | C1 | `routes/hotels.ts` GET `/`, `/:id`, Home/Detail pages | shipped |
| ART-0006 | REQ-0006 | C1 | `routes/hotels.ts` `/search`, `pages/Search.tsx`, AdvancedSearch | shipped |
| ART-0007 | REQ-0007 | C1 | `pages/Detail.tsx` | shipped |
| ART-0008 | REQ-0008 | C1 | `contexts/SearchContext.tsx` | shipped |
| ART-0009 | REQ-0009 | C1 | payment-intent in `routes/hotels.ts`, Booking page | shipped |
| ART-0010 | REQ-0010 | C1 | bookings confirm in `routes/hotels.ts`, `forms/BookingForm/` | shipped |
| ART-0011 | REQ-0011 | C1 | `routes/my-bookings.ts`, `pages/MyBookings.tsx` | shipped |
| ART-0012 | REQ-0012 | C1 | `routes/my-hotels.ts` POST, Cloudinary, `AddHotel.tsx`, ManageHotelForm | shipped |
| ART-0013 | REQ-0013 | C1 | `routes/my-hotels.ts` GET, `MyHotels.tsx` | shipped |
| ART-0014 | REQ-0014 | C1 | `routes/my-hotels.ts` PUT, `EditHotel.tsx` | shipped |
| ART-0015 | REQ-0015 | C1 | `routes/bookings.ts` hotel/:hotelId, BookingLogModal | shipped |
| ART-0016 | REQ-0016 | C1 | `routes/bookings.ts` full CRUD/status/payment | shipped |
| ART-0017 | REQ-0017 | C1 | `routes/users.ts` `/me` | shipped |
| ART-0018 | REQ-0018 | C1 | `routes/health.ts`, `pages/ApiStatus.tsx` | shipped |
| ART-0019 | REQ-0019 | C1 | `routes/business-insights.ts` dashboard, AnalyticsDashboard | shipped |
| ART-0020 | REQ-0020 | C1 | forecast + system-stats routes | shipped |
| ART-0021 | REQ-0021 | C1 | `App.tsx` `/business-insights` | shipped |
| ART-0022 | REQ-0022 | C1 | `main.tsx`, AppContext, SearchContext | shipped |
| ART-0023 | REQ-0023 | C1 | `App.tsx`, Layout, AuthLayout | shipped |
| ART-0024 | REQ-0024 | C1 | `lib/api-client.ts` getApiBaseUrl | shipped |
| ART-0025 | REQ-0025 | C1 | SignIn credentials dropdown, MainNav, toasts | shipped |
| ART-0026 | REQ-0026 | C1 | `swagger.ts`, ApiDocs page | shipped |
| ART-0027 | REQ-0027 | C1 | `hotel-booking-frontend/vercel.json` | shipped |
| ART-0028 | REQ-0028 | C1 | `hotel-booking-backend/Dockerfile`, CORS in index | shipped |
| ART-0029 | REQ-0029 | C1 | `shared/types.ts` | shipped |
| ART-0030 | REQ-0030 | C1 | `e2e-tests/tests/*.spec.ts`, `data/*` | shipped |
| ART-0031 | REQ-0031 | C1 | `docs/PROJECT_WALKTHROUGH.md` | shipped |
| ART-0032 | REQ-0032 | C1 | `models/review.ts`, `models/analytics.ts` (schema only — routes TBD) | planned |
| ART-0033 | REQ-0033 | C1 | `README.md` (educational rewrite), `SECURITY.md`, `hotel-booking-frontend/.env.local.example` (Stripe note) | done |
| ART-0034 | REQ-0034 | C1 | `routes/health.ts`, `business-insights.ts` system-stats, `ApiStatus.tsx`, `invalidate-queries.ts`, Add/Edit hotel + BookingForm | done |

**Rule:** New implementation appends ART-XXXX.N on revision; never orphan code without REQ.
