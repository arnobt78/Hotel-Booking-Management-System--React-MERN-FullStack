# Agile V — Session Activation (every prompt)

<!-- Hotel Booking MERN | v1.4 | Sync: 2026-07-23 | Infinity Loop ACTIVE -->

## 1. Load skills (mandatory — every prompt)

| # | Skill | When |
|---|-------|------|
| 1 | `agile-v-core` | **Always first** |
| 2 | `agile-v-pipeline` | **Always** |
| 3 | `agile-v-lifecycle` | C2+ / archive / CR |
| 4 | Role from `SKILLS.md` / `skills/SKILLS_INDEX.md` | By pipeline stage |
| 5 | `agile-v-compliance` | Gates, risk, CAPA, Gate 2 close |
| 6 | `agile-v-quality-gates` | Constrain + Verify |
| 7 | `agile-v-product-owner` | Backlog / sprint |

**24 agents:** `.agile-v/skills/` + `SKILLS.md` · **Repo stack:** `build-agent-js` (Vite React + Express TS)

## 2. Read (resume — in order)

1. `STATE.md` — cycle, stage, resume token, open backlog
2. `CHECKPOINTS.md` — halt if any **PENDING** HITL
3. `REQUIREMENTS.md` — parent **REQ-XXXX** before any code

## 3. Before coding (mandatory gate)

1. Resolve parent `REQ-XXXX` — **halt if missing**
2. Pipeline: **Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept**
3. Match existing architecture (walkthrough + STATE invariants)
4. Verify: backend `npm run build` · frontend `npm run build` · frontend `npm run lint` · e2e when touching journeys
5. Gate 2: `EVAL_RESULTS.md` `eval_gate_status: PASS` (or WAIVED) required

## 4. Infinity Loop

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

## 5. Traceability

`REQ-XXXX` → `ART-XXXX` → `TC-XXXX` → `VER-XXXX` → append `DECISION_LOG.md`

## 6. Halt if

No parent REQ · ambiguous REQ · self-verify only · secrets in git · Gate 2 without EVAL · PENDING checkpoint without matching approval

## 7. Project hooks

| Hook | Path |
|------|------|
| Walkthrough | `docs/PROJECT_WALKTHROUGH.md` |
| Cursor rule | `.cursor/rules/agile-v-infinity-loop.mdc` |
| Skills index | `.agile-v/skills/SKILLS_INDEX.md` |
| Playbook | `.agile-v/PLAYBOOK.md` |

## 8. Default role map (this repo)

| Stage | Skill |
|-------|-------|
| Specify | `requirement-architect` (+ `ux-spec-author` if UI) |
| Constrain | `logic-gatekeeper` |
| Orchestrate | `build-agent-js` ∥ `test-designer` |
| Verify | `red-team-verifier` |
| Accept / gates | `agile-v-compliance` + `compliance-auditor` |

## 9. Session activation (2026-07-23) — **CURRENT**

- No prior `.agile-v/` found — **C1 bootstrap complete**
- Baseline REQs REQ-0001…0031 marked **done [C1]** from shipped codebase (HEAD `408e572`)
- Planned extensions start at **REQ-0032**
- **Human Gate 1 PENDING** — `resume_token: c1-gate1-baseline-blueprint`
- Awaiting your approval of Blueprint + first implementation instruction
