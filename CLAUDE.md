# Hotel Booking MERN — agent memory

**Stack:** MongoDB · Express · React 18 (Vite) · TS · Tailwind · RQ v3 · Stripe · Cloudinary · JWT (+ Google OAuth)  
**Ports:** API `5001` · SPA `5174`  
**Live:** FE [Vercel](https://hotel-mern-booking.vercel.app) · BE [arnobmahmud.com](https://hotel-booking-backend.arnobmahmud.com)  
**No:** Next.js · Redis · Python · Clerk · Stripe webhooks (deferred)

## Roadmap
- **T1–T5 DONE** · Resume: `c1-t5-ai-auth-seed`
- Post-T5: profile API links · Inter self-host · SafeImage · Vercel headers
- UI polish: stable `scrollbar-gutter` · single focus ring · `/api/business-insights/rollups` (not `/analytics`) · insights shell+pulse (no full-page spinner)

## Security (REQ-0034)
- Public `GET /api/health` minimal · `/detailed` JWT · VulDB CAPA-0001
- Avoid URL segments: analytics / metrics / tracking / performance / analysis (ad-block)

## Agile V
- `.agile-v/STATE.md` first · C1 · Gate 1 PENDING · Last REQ-0052  
- Skills: `.agile-v/skills/` · Rule: agile-v-infinity-loop

## Invariants
- JWT `localStorage.session_id` → Bearer · validateToken only if token present  
- CRUD → `lib/invalidate-queries.ts` (incl. `fetchBusinessInsightsRollups`)  
- AI: `AI_ASSIST_ENABLED` + Groq/OpenAI/OpenRouter → stub failover (`lib/llm.ts`)  
- Images: Cloudinary · UI: `components/ui/safe-image.tsx`  
- FE env: `VITE_API_BASE_URL` + `VITE_STRIPE_PUB_KEY` · BE fail-fast secrets

## Verify
`cd hotel-booking-backend && npm run build` · `cd hotel-booking-frontend && npm run lint && npm run build`
