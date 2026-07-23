# Agent instructions — hotel-booking-1

## Agile V (mandatory)

This repo uses the **Agile V Infinity Loop**. Living AQMS state is in `.agile-v/`.

### Every session / every prompt

1. Read `.agile-v/ACTIVATION.md`
2. Read `.agile-v/STATE.md` and `.agile-v/CHECKPOINTS.md`
3. Load skills: `agile-v-core` → `agile-v-pipeline` → role skill → `agile-v-compliance` at gates
4. Map all work to a parent `REQ-XXXX` in `.agile-v/REQUIREMENTS.md` — **halt if missing**
5. Follow conventions in `.agile-v/PLAYBOOK.md` and `docs/PROJECT_WALKTHROUGH.md`

### Stack

- Backend: Express + Mongoose + TypeScript (`hotel-booking-backend/`)
- Frontend: React 18 + Vite + React Query + Tailwind (`hotel-booking-frontend/`)
- Shared: `shared/types.ts`
- E2E: Playwright (`e2e-tests/`)
- Build skill: `build-agent-js`

### Verify

```bash
cd hotel-booking-backend && npm run build
cd hotel-booking-frontend && npm run build && npm run lint
```

### Human gates

Do not start Stage 3 synthesis while Gate 1 is PENDING (`resume_token` in STATE.md) unless the user explicitly approves Gate 1 or assigns a new REQ after approval.
