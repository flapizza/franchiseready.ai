# Canonical Feature Paths

Status: Active architectural decision for the conference-demo foundation.

## Purpose

This document defines which existing feature owns each application concern. Parallel packages remain available for compatibility, but new application code must follow the canonical paths below.

## Canonical dependency flow

```text
App Router page
  -> feature presentation component
  -> feature runtime
  -> domain engine or service
  -> repository interface
  -> seed repository (demo) / future persistent adapter
```

Pages may compose presentation components, but business decisions belong in engines and screen-state assembly belongs in runtimes. During the demo phase, repositories remain seed-backed.

## Ownership decisions

| Concern | Canonical path | Compatibility boundary |
| --- | --- | --- |
| Assessment | `feature/assessment-engine` | `feature/assessment` is an experimental predecessor. Keep it buildable, but do not add routed flows or new scoring behavior there. |
| Candidate intelligence | `feature/intelligence` for the current CRM application model and engines | `feature/candidate-intelligence` is the typed integration model used by the newer AI/evidence pipeline. Cross the boundary through an explicit adapter or merge service; do not import both model families into one component. |
| Discovery | `feature/discovery` for session state, rules, and workspace orchestration | `feature/discovery-copilot` is a supporting live-meeting analysis module. It consumes meeting intelligence and produces copilot presentation state; it does not own the candidate discovery lifecycle. |
| Candidate workspace | `feature/candidate-workspace` for screen orchestration and workspace-level state | `feature/crm/components` remains the established presentation library while components migrate incrementally. CRM pages should obtain state through the candidate-workspace runtime instead of creating another workspace runtime. |
| Candidate resolution | `feature/crm/services/CandidateResolutionService.ts` | Every assessment completion resolves inside consultant/tenant scope before update or creation. Assessment never owns candidate identity. |
| UI and layout | `feature/layout` for the authenticated application shell; `feature/ui` for reusable primitives and content layouts | The unused `feature/ui/components/Sidebar` is a compatibility component. New shells and navigation belong in `feature/layout`. |
| Conference demo data | `feature/demo` for the deterministic scenario and its repository contract | Product features consume the scenario through repositories and runtimes. UI components must not import the candidate fixture directly. See `Conference-Demo-Spine.md`. |

## Platform and AI boundary

`feature/platform` owns shared service registration and domain events. `feature/ai` is the recommendation facade over reasoning and evidence. Neither currently represents an external model provider. Deterministic engines remain the canonical demo implementation until a later AI-integration feature pack.

## Route ownership

Product route constants live in `lib/auth/constants.ts`. Mission Control is `/crm` and is rendered inside the canonical authenticated shell. Placeholder destinations remain mapped to their existing CRM routes; this stabilization pack does not implement those screens.

Protected application prefixes include `/crm`, `/assessment`, and `/settings`, alongside the reserved role-specific prefixes.

## Rules for future work

1. Extend the canonical package before creating a new feature root.
2. Preserve old packages through adapters or re-exports until every consumer has migrated.
3. Do not share similarly named models implicitly; write a named adapter at the feature boundary.
4. Keep React out of engines and repositories.
5. Keep persistence behind repository interfaces.
6. Record any change to canonical ownership in this document.
