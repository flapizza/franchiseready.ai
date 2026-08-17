# Conference Demo Product, UX, and Architecture Audit

Date: 2026-08-17

## Executive summary

The canonical consultant journey is coherent at the service/runtime level: candidate identity, assessment completion, lifecycle movement, Brand Strategy, and candidate-brand referrals all propagate through repositories. The largest conference risks are presentation seams rather than missing domain architecture. Candidate-specific tools are exposed as misleading global sidebar destinations, several visible controls are inert, route-aware header copy collapses distinct workspaces into “Candidate pipeline,” and some implementation/demo terminology is visible to consultants. Candidate CRM Pipeline is operational and canonical but benefits from a clearer stage rail and stronger column/card depth.

## Classification by product area

| Area | Finding | Classification |
| --- | --- | --- |
| A. Navigation / routing | `/crm/brands`, `/crm/reports`, and `/crm/tasks` are placeholder pages; sidebar labels them as Brand Strategy, Referral Studio, Insights, and AI Studio. | Critical before conference |
| A. Navigation / routing | `/crm/[id]` is a useful compatibility redirect to Candidate 360. `/crm/pipeline` safely redirects to the canonical Candidates surface. | Safe to defer |
| A. Navigation / routing | Discovery and briefing remain established compatibility-style candidate routes under `/crm/[id]/*`; replacing them now would add risk without user value. | Safe to defer |
| B. Product terminology | `brand-matching` is variously shown as Brand Matching and Brand Strategy. Consultant UI should use Brand Strategy; enum remains unchanged. | High-value polish |
| B. Product terminology | Referral Ready, Ready for Referral, and Ready for Introduction overlap. Use Referral Gate for eligibility, Ready for Introduction for the passed conclusion, and Referral / Introduction for pipeline stage. | High-value polish |
| C. Lifecycle presentation | The canonical graph is sound. Per-brand referral statuses correctly remain separate from `PipelineStage`. | No issue |
| C. Lifecycle presentation | Candidate 360 can expose both the generic lifecycle action and referral-specific action, producing competing calls to action. | High-value polish |
| D. Candidate 360 | Identity, stage, assessment, intelligence, referrals, activity, and next action are present. It functions as candidate home. | No issue |
| D. Candidate 360 | Header confidence labels are less clear than Candidate Readiness / Match Confidence terminology used downstream. | Safe to defer |
| E. Mission Control | Introduction-ready buttons ignore their real action href. Some fallback actions render inert future-workflow buttons. | Critical before conference |
| E. Mission Control | “Deterministic conference events” exposes implementation language. | Critical before conference |
| E. Mission Control | Multi-brand referral counts are already runtime-derived in primary actions; compact summaries should remain candidate-level. | No issue |
| F. CRM List | Search, stage filters, quick filters, neutral intelligence states, newly created candidates, and referral summaries are operational. | No issue |
| F. CRM List | Awarded candidates remain understandable but the primary table emphasizes “Best Brand” rather than referral/outcome summary. | Safe to defer |
| G. CRM Pipeline | Canonical stages and horizontal navigation work. Column progression is visually flat and stage grouping is not immediately legible. | High-value polish |
| G. CRM Pipeline | Drag-and-drop is intentionally absent. | Production-only concern |
| H. Assessment | Consultant-first and assessment-first entry converge through resolution and completion sinks. | No issue |
| H. Assessment | Some assessment/results copy still uses FranchiseReady AI. | High-value polish |
| I. Candidate Intelligence | Canonical intelligence is withheld until assessment completion and reused downstream. | No issue |
| I. Candidate Intelligence | Older dashboards/models remain beside the canonical profile used by Candidate 360. | Safe to defer |
| J. Discovery | Assessment Complete → Discovery → Validation/Brand Strategy uses lifecycle orchestration and records activities. | No issue |
| J. Discovery | The Discovery page contains presentation-level seeded objectives/recommendation content and older workspace components. | Safe to defer |
| K. Brand Strategy | Header, readiness, lead recommendation, comparison, alternatives, gate, and multi-brand handoff are coherent. | No issue |
| K. Brand Strategy | Only three enriched brands exist; they are sufficiently differentiated for the current demo. | High-value future depth |
| L. Referral Studio | Candidate-level multi-select, bulk preparation, independent status, generic referral, approval, introduction, activities, and summaries are coherent. | No issue |
| L. Referral Studio | Introduction preview, amber considerations, supporting-evidence language, and explicit financial labels already match product direction. | No issue |
| M. Shell / header / sidebar | Candidate 360, Discovery, and Briefing receive incorrect generic header context. | Critical before conference |
| M. Shell / header / sidebar | Search, notification, and sparkle controls in the header are visually actionable but have no behavior. | Critical before conference |
| M. Shell / header / sidebar | Brand lockup fits the sidebar width but vertical density is high on shorter screens. | Safe to defer |
| N. Demo data consistency | CandidateRepository overlays lifecycle/status consistently across CRM, Candidate 360, and Mission Control. | No issue |
| N. Demo data consistency | Mission Control presentation metadata remains scenario-backed, so future fields must continue to prefer canonical overlay values. | Safe to defer |
| O. Empty / unavailable / blocked | New, assessment-pending, no-intelligence, empty activity, empty pipeline stage, and blocked referral states have explicit messaging. | No issue |
| O. Empty / unavailable / blocked | Blocked Referral Studio explains why and points back to Brand Strategy; unavailable Brand Strategy explains prerequisites. | No issue |
| P. Legacy / duplicate architecture | Legacy generic `ReferralPackageEngine` and preview are not the canonical Referral Studio. | Dead but defer removal |
| P. Legacy / duplicate architecture | Older Brand Strategy engines remain separate from `CandidateBrandStrategyRuntime`. | Deferred technical debt |
| P. Legacy / duplicate architecture | `/crm/[id]` is an active compatibility boundary, not dead code. | Compatibility boundary |
| Q. Conference reliability | Development-only session and reset endpoint provide deterministic full and fast paths; seven E2E journeys cover the spine. | No issue |
| Q. Conference reliability | Process-local state is lost on server restart. | Production-only concern |
| R. Accessibility / interaction | Referral checkboxes and form fields are labeled; CRM search/filter controls are labeled. | No issue |
| R. Accessibility / interaction | Inert header and Mission Control buttons violate expected affordance. | Critical before conference |
| S. Persistence-deferred debt | Durable candidates, invitations, activities, referral packages, edits, and deliveries remain unimplemented. | Production-only concern |
| T. Missing CRM essentials | Follow-up tasks/reminders and next-contact dates are the highest-value missing consultant capabilities. | Post-conference high value |

## Canonical route map

| Route | Classification | Purpose |
| --- | --- | --- |
| `/crm` | Canonical | Mission Control |
| `/crm/candidates` | Canonical | Candidate CRM List and Pipeline views |
| `/crm/candidates/new` | Canonical | Consultant-first candidate intake |
| `/crm/candidates/[candidateId]` | Canonical | Candidate 360 / candidate home |
| `/crm/candidates/[candidateId]/strategy` | Canonical | Candidate Brand Strategy |
| `/crm/candidates/[candidateId]/referral` | Canonical | Candidate-level multi-brand Referral Studio |
| `/crm/[id]/discovery` | Established candidate workflow | Discovery Copilot workspace |
| `/crm/[id]/briefing` | Established candidate workflow | Consultant meeting briefing |
| `/crm/[id]` | Compatibility redirect | Redirects to canonical Candidate 360 |
| `/crm/pipeline` | Compatibility redirect | Redirects to Candidates, where Pipeline is a view |
| `/assessment/[id]` | Canonical assessment flow | Assessment player; optional invitation identity |
| `/assessment/[id]/results` | Legacy/secondary | Assessment results presentation |
| `/crm/brands` | Placeholder | Misleading when exposed as Brand Strategy |
| `/crm/reports` | Placeholder | Misleading when exposed as Referral Studio / AI Studio |
| `/crm/tasks` | Placeholder | Misleading when exposed as Insights |
| `/settings/profile` | Useful destination | Consultant profile settings |

## Canonical consultant-facing terminology

- Person/entity: **Candidate**; use **New Candidate** only for the first lifecycle stage.
- Assessment states: **Assessment Not Started**, **Assessment Pending**, **Assessment Complete**.
- Candidate evaluation: **Candidate Intelligence** and **Candidate Readiness**.
- Conversation workflow: **Discovery**, followed by **Validation** only when unresolved evidence requires it.
- Matching workspace: **Brand Strategy**; underlying enum remains `brand-matching`.
- Recommendation metric: **Evidence-Backed Fit**; use **Match Confidence** only for confidence.
- Eligibility: **Referral Gate — Passed / Not Yet Ready**.
- Candidate lifecycle stage: **Referral / Introduction**.
- Brand-specific workflow: **Ready for Review**, **Approved**, **Introduced**.
- Demo-safe external action: **Record Introduction**.
- Terminal candidate outcome: **Awarded**; underlying status may remain `won`.
- Visible product identity: **FranGroove AI**.

## Financial data audit

- Candidate intake does not capture financial fields.
- Candidate Intelligence contains liquid capital, investable capital, candidate investment range, and financing likelihood.
- It does not contain canonical net worth or explicit financing intent.
- Brand profiles contain minimum/maximum investment and liquid-capital minimum.
- Brand Strategy applies explicit capital compatibility.
- Referral Studio labels Candidate Preferred Investment Range and Brand Investment Range separately and renders net worth as unavailable.
- Production should add explicit net worth, preferred investment range, and financing-intent fields at the candidate/intelligence boundary rather than infer them downstream.

## Legacy architecture classification

- **Actively canonical:** Candidate repositories, overlay, lifecycle service, resolution service, completion sink, Candidate 360 runtime, Candidate Brand Strategy runtime, multi-brand referral runtime/service.
- **Compatibility:** `/crm/[id]`, `/crm/pipeline`, older discovery/briefing route shape.
- **Dead but low-priority removal:** legacy generic referral package engine/preview if confirmed unused by all entry points.
- **Deferred technical debt:** older Brand Strategy engines, older intelligence dashboards/models, duplicated sidebar/top-bar implementations, seeded Discovery presentation content.

## Missing CRM essentials

- **Conference-critical:** none; current deterministic workflows are demonstrable.
- **Post-conference high value:** follow-up tasks, reminders, next-contact date, consultant notes/history, pipeline aging.
- **Production-scale value:** calendar/email history, ownership/assignment, tags, bulk actions, lead-source reporting, deeper search, audit/version history.

## Canonical conference walkthroughs

Full story: Conference login → Mission Control → Candidates List/Pipeline → New Candidate → Send Assessment → Complete Assessment → Candidate 360 intelligence → Start/Complete Discovery → Brand Strategy → select multiple brands → prepare packages → approve one → record one introduction → verify the second remains active → Candidate 360/CRM/Mission Control propagation.

Fast story: Conference login → Mission Control → open pre-staged Jared Wirsig → Brand Strategy → Referral Studio → multi-brand preparation → individual approval/introduction → return to Candidate 360 and CRM. Pre-staged candidates provide speed without production shortcuts.
