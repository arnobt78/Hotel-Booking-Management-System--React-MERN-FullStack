# Agile V Bootstrap — Hotel Booking MERN

<!-- Framework initialization | Agile V v1.4 | 2026-07-23 -->

## Infinity Loop (SCOPE-V)

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify
         ↑___________________________________________|
```

| SCOPE-V Phase | Pipeline Stage | Primary agents | Living artifact |
|---------------|----------------|----------------|-----------------|
| Specify | 1 — Requirements | requirement-architect, discovery-analyst, threat-modeler, ux-spec-author | `REQUIREMENTS.md`, `phases/01-specify/` |
| Constrain | 2 — Validation | logic-gatekeeper | `phases/02-constrain/`, Gate 1 → `APPROVALS.md` |
| Orchestrate | 3 — Synthesis | build-agent-js, test-designer | `BUILD_MANIFEST.md`, `TEST_SPEC.md`, `phases/03-synthesize/` |
| Prove | 3–4 | build-agent, compliance-auditor | `BUILD_MANIFEST.md`, `TRACE_LOG.md` |
| Evolve | All | compliance-auditor, agile-v-lifecycle | `DECISION_LOG.md`, `CHANGE_LOG.md` |
| Verify | 4 — Verification | red-team-verifier | `VALIDATION_SUMMARY.md`, `EVAL_RESULTS.md`, `phases/04-verify/` |

**Load order:** `agile-v-core` → `agile-v-pipeline` (+ `lifecycle` on C2+) → role skill → `compliance` at gates. Registry: `SKILLS.md` (24).

---

## Framework Initialization Checklist

| # | Artifact / directory | Purpose | Status |
|---|----------------------|---------|--------|
| 1 | `.agile-v/` root | AQMS living workspace | ✓ |
| 2 | `config.json` | Metadata, cycle, verification commands | ✓ |
| 3 | `POLICY.yaml` | Policy-as-code v1.0.0 | ✓ |
| 4 | `STATE.md` | Resume first | ✓ |
| 5 | `REQUIREMENTS.md` | REQ-0001…0032 | ✓ |
| 6 | `BUILD_MANIFEST.md` | ART-0001…0032 | ✓ |
| 7 | `TEST_SPEC.md` | TC-0001…0005 | ✓ |
| 8 | `VALIDATION_SUMMARY.md` | VER + EvalGate | ✓ |
| 9 | `ATM.md` | REQ→ART→TC→VER | ✓ |
| 10 | `DECISION_LOG.md` | Append-only | ✓ |
| 11 | `CHANGE_LOG.md` | CR-XXXX | ✓ |
| 12 | `EVAL_RESULTS.md` | Gate 2 prereq | ✓ WAIVED bootstrap |
| 13 | `CHECKPOINTS.md` | HITL INT-0001 PENDING | ✓ |
| 14 | `TRACE_LOG.md` | Spans | ✓ |
| 15 | `APPROVALS.md` | Gate records | ✓ (empty) |
| 16 | `RISK_REGISTER.md` | Risks | ✓ |
| 17 | `CAPA_LOG.md` | CAPA | ✓ |
| 18 | `REVALIDATION_LOG.md` | Reval | ✓ |
| 19 | `BOOTSTRAP.md` | This file | ✓ |
| 20 | `README.md` | Quick start | ✓ |
| 21 | `SKILLS.md` + `skills/` 01–24 | Skills registry | ✓ |
| 22 | `PLAYBOOK.md` / `ACTIVATION.md` | Session protocol | ✓ |
| 23 | `BACKLOG.md` + `sprints/C1/` | PO artifacts | ✓ |
| 24 | `phases/01`…`05` | PLAN/SUMMARY/CONTEXT | ✓ |
| 25 | `cycles/C1/` | Archive scaffold (freeze at Gate 2) | ✓ |
| 26 | `agile-v-core.md` | Project-local core binding | ✓ |
| 27 | `.cursor/rules/agile-v-infinity-loop.mdc` | Always-on Cursor rule | ✓ |
| 28 | `AGENTS.md` (repo root) | Agent load order | ✓ |

---

## C1 Bootstrap (2026-07-23) — AQMS + Baseline Sync

| Step | Artifact | Status |
|------|----------|--------|
| 1 | Directory + POLICY + config | ✓ |
| 2 | Living docs + runtime contracts | ✓ |
| 3 | Skills 01–24 stubs + SKILLS.md | ✓ |
| 4 | Baseline REQs from walkthrough/code | ✓ done [C1] |
| 5 | Planned REQ-0032 | ✓ planned |
| 6 | Phases 01–05 scaffold | ✓ |
| 7 | Gate 1 checkpoint INT-0001 | ✓ PENDING human |
| 8 | Archive cycles/C1 | scaffold only — freeze after Gate 2 |

**Prior session:** none (first Agile V init for this repo).  
**Resume:** Human Gate 1 → then your next feature/fix instruction.
