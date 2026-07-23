# Agile V Playbook — hotel-booking-1

**Project:** Hotel Booking Management System (MERN)  
**Cycle:** C1 active (Gate 1 PENDING)  
**Stack:** Vite SPA + Express (no Next/Redis) · **Resume:** `c1-t5-ai-auth-seed`  
**Live:** Frontend [Vercel](https://hotel-mern-booking.vercel.app) · API [Coolify](https://hotel-booking-backend.arnobmahmud.com)

---

## Session start (every chat)

1. Read `STATE.md` → cycle, gate, resume token, open backlog
2. Read `CHECKPOINTS.md` → halt on PENDING without matching approval
3. Read `REQUIREMENTS.md` → map work to `REQ-XXXX` (halt if missing)
4. Load skills: `skills/SKILLS_INDEX.md` → **01** always; **02** pipeline; **17** for JS/TS build; **19** before done
5. Cursor rule: `.cursor/rules/agile-v-infinity-loop.mdc` (`alwaysApply: true`)
6. On material change: write-through `DECISION_LOG.md`, `BUILD_MANIFEST.md`, `VALIDATION_SUMMARY.md`

---

## Infinity Loop (SCOPE-V)

```
Specify → Constrain → Orchestrate → Prove → Verify → Evolve
```

| Stage | Agent skills | Artifacts |
|-------|--------------|-----------|
| 1 Specify | 13, 14, 21, 22 | `REQUIREMENTS.md` |
| 2 Constrain | 15, 09 | Logic validation, impact |
| 3 Orchestrate | 16, 17, 18 | Code + `BUILD_MANIFEST.md` |
| 4 Prove | 17, 18, 23 | Tests, manifests, logs |
| 5 Verify | 19, 20, 07 | `VALIDATION_SUMMARY.md`, Red Team |
| Evolve | 03, 06 | `CHANGE_LOG.md`, `DECISION_LOG.md` |

**Red Team protocol:** Build agent does not self-verify. Run independently:

```bash
cd hotel-booking-backend && npm run build
cd hotel-booking-frontend && npm run build && npm run lint
# Journey changes:
cd e2e-tests && npx playwright test
```

---

## Human gates

| Gate | Status (C1) | Prerequisite |
|------|-------------|--------------|
| Gate 1 (Blueprint) | **PENDING** | Approve `REQUIREMENTS.md` baseline |
| Gate 2 (Release) | Not opened | `VALIDATION_SUMMARY.md` + `EVAL_RESULTS.md` PASS |

On pause: append `CHECKPOINTS.md` with `resume_token`; resume only from `STATE.md` + matching `APPROVALS.md`.

---

## REQ workflow

1. **New work** → add `REQ-XXXX` in `REQUIREMENTS.md` before code
2. **Bug fix, no REQ change** → Stage 3 re-entry (lifecycle skill 03)
3. **REQ change** → `CHANGE_LOG.md` CR → Gate 1 → full affected pipeline
4. Tag status: `done` | `verify` | `planned` | `approved [Cn]` | `new [Cn]`

---

## Architecture conventions (match codebase)

| Area | Rule |
|------|------|
| Layout | Monorepo packages; Docker build from repo root (includes `shared/`) |
| Auth | JWT Bearer from `localStorage.session_id`; Google OAuth via backend callback |
| API client | `lib/api-client.ts` Axios + `api-client.ts` named functions |
| Cache | React Query; invalidate/refetch `validateToken` on auth transitions |
| Search | `SearchContext` → `sessionStorage`; filters via query params |
| Payments | Stripe PaymentIntent GBP → confirm booking only if `succeeded` |
| Owner media | Multer memory → Cloudinary → `imageUrls[]` (max 6) |
| UI | Existing Tailwind + shadcn; preserve `Layout` / `AuthLayout` |
| Types | Prefer `shared/types.ts` for cross-package contracts |
| Ports | Backend **5001**, frontend **5174** locally |

See `docs/PROJECT_WALKTHROUGH.md` for A–Z detail.

---

## Cycle rules

- **C1:** Bootstrap AQMS + baseline REQs; Gate 1 then extend via planned/new REQs
- Living docs: write-through. Archives under `cycles/CN/`: frozen, never edit
- `DECISION_LOG.md` / `CHANGE_LOG.md`: append-only forever

---

## Evidence summary format

```
Scope: [built/verified] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL]
Commands: backend build, frontend build+lint, e2e (if applicable)
```

---

## Quick reference

| File | Purpose |
|------|---------|
| `STATE.md` | Resume point, backlog, gate status |
| `ACTIVATION.md` | Per-prompt load order |
| `REQUIREMENTS.md` | Canonical REQs |
| `BUILD_MANIFEST.md` | REQ → code mapping |
| `VALIDATION_SUMMARY.md` | Red Team + QA |
| `DECISION_LOG.md` | Append-only decisions |
| `POLICY.yaml` | Policy-as-code |
| `skills/SKILLS_INDEX.md` | 24 agent skills |

**Upstream skills:** https://github.com/Agile-V/agile_v_skills
