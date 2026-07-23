# Agile V Agent Skills Registry — Hotel Booking MERN

<!-- 24 companion skills | Pipeline + SCOPE-V phase mapping | v1.4 -->

## Orchestration & Lifecycle (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 1 | `agile-v-core` | Apex | All | All — load first |
| 2 | `agile-v-pipeline` | Apex | Orchestrate | Waves, handoffs, checkpoints |
| 3 | `agile-v-lifecycle` | Apex | Evolve | Cycles, CR, archival |
| 4 | `agile-v-compliance` | Right | Verify, Evolve | Risk, CAPA, gates, revalidation |

## Quality & Product (2)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 5 | `agile-v-quality-gates` | Right | Constrain, Verify | Gate criteria, interface validation |
| 6 | `agile-v-product-owner` | Left | Specify | Backlog, REQ prioritization, INVEST |

## Left — Decomposition (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 7 | `requirement-architect` | Left | Specify | 1 — Requirements |
| 8 | `discovery-analyst` | Left | Specify | 1 — Discovery → hypotheses |
| 9 | `threat-modeler` | Left | Specify, Constrain | 1–2 — STRIDE / privacy REQs |
| 10 | `ux-spec-author` | Left | Specify | 1 — Design constraints → REQs |

## Apex — Constrain & Orchestrate (8)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 11 | `logic-gatekeeper` | Apex | Constrain | 2 — Validation |
| 12 | `build-agent` | Apex | Orchestrate, Prove | 3 — Synthesis (generic) |
| 13 | `build-agent-js` | Apex | Orchestrate, Prove | 3 — Vite React + Express TS |
| 14 | `build-agent-nestjs` | Apex | Orchestrate, Prove | 3 — NestJS (N/A default) |
| 15 | `build-agent-python` | Apex | Orchestrate, Prove | 3 — Python (N/A this repo) |
| 16 | `build-agent-dart` | Apex | Orchestrate, Prove | 3 — Flutter (N/A) |
| 17 | `build-agent-embedded` | Apex | Orchestrate, Prove | 3 — Firmware (N/A) |
| 18 | `schematic-generator` | Apex | Orchestrate | 3 — Hardware (N/A) |

## Right — Prove & Verify (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 19 | `test-designer` | Right | Orchestrate, Prove | 3 — TEST_SPEC.md |
| 20 | `red-team-verifier` | Right | Verify | 4 — Independent verification |
| 21 | `compliance-auditor` | Right | Verify, Evolve | All stages — DECISION_LOG, ATM |
| 22 | `documentation-agent` | Right | Prove | 5 — docs/ suite (on request) |

## Release & Observability (2)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 23 | `observability-planner` | Right | Specify, Prove | Metrics, health, logging |
| 24 | `release-manager` | Right | Verify | 5 — Vercel / Coolify rollout |

## Default Stack for This Repo

| Layer | Primary skill |
|-------|----------------|
| React 18 + Vite SPA | `build-agent-js` |
| Express + Mongoose API | `build-agent-js` |
| Playwright e2e | `test-designer` + `red-team-verifier` |
| Vercel / Coolify deploy | `release-manager` |

## Project-local skill stubs

Numbered stubs (01–24) live in `.agile-v/skills/` with index `skills/SKILLS_INDEX.md`.  
Upstream full skills: user Claude/Cursor skills dir + https://github.com/Agile-V/agile_v_skills

## Load Order (Infinity Loop)

```
1. agile-v-core
2. agile-v-pipeline (+ lifecycle on C2+)
3. Role skill for current stage
4. agile-v-compliance on gate pause / close
5. agile-v-quality-gates during Constrain + Verify
```

## Active this session (C1 bootstrap)

`agile-v-core` · `agile-v-pipeline` · `agile-v-lifecycle` · `agile-v-compliance` · `agile-v-quality-gates` · `agile-v-product-owner` · `requirement-architect` · `logic-gatekeeper` · `build-agent-js` · `red-team-verifier`
