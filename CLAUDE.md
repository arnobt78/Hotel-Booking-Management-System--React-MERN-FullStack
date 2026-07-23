# Hotel Booking MERN — agent memory

**Stack:** MongoDB · Express · React 18 (Vite) · TS · Tailwind · React Query v3 · Stripe · Cloudinary · JWT (+ optional Google OAuth)  
**Ports:** API `5001` · SPA `5174` · Live: Vercel FE + Coolify BE  
**No:** Next.js SSR · Redis · Python · Clerk (docs-only guide)

## Security (REQ-0034)
- Public `GET /api/health` → status + timestamp + db.status only  
- `GET /api/health/detailed` → JWT; memory MB + uptime only (no host/PID/Node)  
- VulDB #c891c0 ACCEPT · CAPA-0001

## Agile V
- Load: `agile-v-core` → `pipeline` → role · State: `.agile-v/STATE.md` first  
- Cycle **C1** · Gate 1 PENDING (`c1-gate1-baseline-blueprint`) · REQ-0033 docs done · next planned **REQ-0032** (Review/Analytics routes)  
- Skills: `.agile-v/skills/` · Rule: `.cursor/rules/agile-v-infinity-loop.mdc`

## Architecture invariants
- JWT: `localStorage.session_id` → Axios Bearer · invalidate `validateToken` on auth change  
- Search: `SearchContext` → sessionStorage  
- Payments: Stripe PaymentIntent GBP → booking only if `succeeded`  
- Images: multer → Cloudinary (max 6) · Shared: `shared/types.ts`  
- Env: BE **required** fail-fast (Mongo/JWT/Cloudinary×3/Stripe sk) · FE `VITE_API_BASE_URL` + `VITE_STRIPE_PUB_KEY`

## Docs
README (learner) · SECURITY.md (`contact@arnobmahmud.com`) · `docs/PROJECT_WALKTHROUGH.md` · Deploy: Diploi optional → Coolify → Vercel

## Verify
`cd hotel-booking-backend && npm run build` · `cd hotel-booking-frontend && npm run build && npm run lint`
