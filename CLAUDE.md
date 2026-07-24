# Hotel Booking MERN — agent memory

**Stack:** MongoDB · Express · React 18 (Vite) · TS · Tailwind · RQ v3 · Stripe · Cloudinary · JWT (+ Google OAuth)  
**Ports:** API `5001` · SPA `5174`  
**Live:** FE [Vercel](https://hotel-mern-booking.vercel.app) · BE [arnobmahmud.com](https://hotel-booking-backend.arnobmahmud.com)  
**No:** Next.js · Redis · Python · Clerk · Stripe webhooks (deferred)

## Roadmap
- **T1–T5 DONE** · Resume: `c1-t5-ai-auth-seed`
- Post-T5: Inter · SafeImage · Vercel · rollups path · focus/gutter
- UI shell 2026-07-24: `PageContainer` · shadcn Select/Checkbox · `DataTable` · city chips · pagination · no native `<select>`
- UI polish 2026-07-24b: SelectOptionLabel · menu py-2 · scroll-lock · AdvancedSearch · useHotelPlaces
- UX 2026-07-24c: Sonner (`showToast`) · auth welcome/goodbye · content-only stagger · static Header/hero bg · optimistic `isLoggedIn` · Home dest skeletons
- Insights 2026-07-24d: denser BE KPIs (LOS/ADR/cancel/refund/reviews) · Quality tab · `MetricStatCard`/`InsightsCardHeader` · value right + MoM left · public nav · `invalidateBusinessInsightsQueries` via hotel chain · nav prefetch · `keepPreviousData`

## Security (REQ-0034)
- Public `GET /api/health` minimal · `/detailed` JWT
- Avoid URL: analytics / metrics / tracking / performance / analysis

## Agile V
- `.agile-v/STATE.md` · C1 · Gate 1 PENDING · REQ-0052

## Invariants
- JWT `localStorage.session_id` → Bearer  
- CRUD → `lib/invalidate-queries.ts` (insights once via `invalidateHotelQueries`)  
- Insights keys: `business-insights-dashboard` | `-forecast` | `-ops` · prefetch on nav hover  

- Layout: `PageContainer` · Lists: `ui/data-table.tsx` · Select opts: `SelectOptionLabel` + `lib/select-option-maps.ts`  
- Scroll lock: `lib/scroll-lock-fix.ts` · Toasts: Sonner + `lib/toast-messages.ts`  
- Auth chrome: `session_id` → optimistic logged-in nav until validate fails  
- FE: `VITE_API_BASE_URL` + `VITE_STRIPE_PUB_KEY` (Vite SPA; no Next SSR/Redis)

## Verify
`cd hotel-booking-backend && npm run build` · `cd hotel-booking-frontend && npm run lint && npm run build`
