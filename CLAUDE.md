# Hotel Booking MERN — agent memory

**Stack:** MongoDB · Express · React 18 (Vite) · TS · Tailwind · RQ v3 · Stripe · Cloudinary · JWT (+ Google OAuth)  
**Ports:** API `5001` · SPA `5174`  
**Live:** FE [Vercel](https://hotel-mern-booking.vercel.app) · BE [arnobmahmud.com](https://hotel-booking-backend.arnobmahmud.com)  
**No:** Next.js · Redis · Python · Clerk · Stripe webhooks (deferred)

## Roadmap
- **T1–T5 DONE** · Resume: `c1-t5-ai-auth-seed`
- Post-T5: Inter · SafeImage · Vercel · rollups path · focus/gutter
- UI shell 2026-07-24: `PageContainer` max-w-9xl · shadcn Select/Checkbox · TanStack `DataTable` · city Badge chips · Prev/Next pagination · no native `<select>`

## Security (REQ-0034)
- Public `GET /api/health` minimal · `/detailed` JWT
- Avoid URL: analytics / metrics / tracking / performance / analysis

## Agile V
- `.agile-v/STATE.md` · C1 · Gate 1 PENDING · REQ-0052

## Invariants
- JWT `localStorage.session_id` → Bearer  
- CRUD → `lib/invalidate-queries.ts`  
- Layout: `components/PageContainer.tsx` · Lists: `ui/data-table.tsx`  
- FE: `VITE_API_BASE_URL` + `VITE_STRIPE_PUB_KEY`

## Verify
`cd hotel-booking-backend && npm run build` · `cd hotel-booking-frontend && npm run lint && npm run build`
