# IFPG Demo Experience Pack 002

Preview showroom: https://demo.frangroove.com. Sign in normally as `alex.morgan@frangroove-demo.example` using Jim's selected password. Credentials are not part of this runbook. This pack does not change Production or deliver referrals externally.

## Five-minute presentation

1. Open Mission Control. Point to actual overdue/today/upcoming tasks and upcoming meetings.
2. Open Daniel from a candidate task or the pipeline. Explain the distinction between assessment evidence and current Candidate Intelligence.
3. Open Brand Referral Engine. Compare two brands and let the explanation show the strengths, tradeoffs, and unknowns.
4. Select a brand for referral, then open its preparation page. Show readiness items and the saved consultant recommendation.
5. Generate the Referral Packet PDF. Stop talking while the candidate overview, finances, ownership goals, fit rationale, and consultant recommendation become a concrete deliverable.

## Ten-minute presentation

Use the five-minute journey, adding:

- Candidate 360 → Assessments & Documents. Open Completed Assessment, Candidate Profile, and Consultant Intelligence Report. Each belongs to an identified submission and analysis version; historical answers and reports are not rewritten by Discovery.
- Open Maya's Discovery Copilot. Let the unresolved household alignment, runway, and staffing findings explain why an apparently capable candidate still needs careful discussion. Existing observations can be updated with confirmed/refined/contradicted/unclear status and follow-up requirements.
- Open Brand Intelligence from a comparison. Pause on the business summary, then expand Evidence & Confidence. Sourced does not mean independently verified, and concept profiles remain clearly identified.

## Fifteen-minute presentation

Add live task creation, completion/reopening, and candidate navigation. Open Calendar, switch week/month, select a day, inspect a meeting brief, and create or edit a meeting. Times use America/New_York; no external calendar synchronization is claimed.

Use Olivia to show advanced referral preparation: review her persisted Discovery next step, compare brands, retain a selected brand across navigation, save an explicitly shareable recommendation, and generate a packet. Return to Mission Control using the schedule navigation links.

## Strong visual pauses

- Mission Control: the next conversation comes from recorded work and evidence.
- Maya's Discovery findings: show the unresolved issues before explaining them.
- Side-by-side brand comparison: allow the reasons and unknowns to speak.
- Historical assessment versus current intelligence: show the provenance and audience labels.
- Referral Packet PDF: the endpoint is a real downloadable document, with no transmission or fabricated delivery status.

## Product boundaries and persistence

The schema migration adds `consultant_tasks`, `consultant_calendar_events`, `consultant_reminders`, `consultant_task_dismissals`, and `candidate_brand_considerations`. Records have organization and consultant ownership, same-workspace candidate foreign keys, forced RLS, and immutable identity/ownership. Atomic selection permits one selected brand per candidate while preserving other consideration records. Consultant recommendations are persisted with the consideration.

Assessment documents reuse immutable submissions and retained analysis versions. The completed document includes the final geographic/stakeholder/stage responses and ownership concerns. Candidate-oriented profiles exclude the internal consultant brief. Internal reports remain authenticated and tenant-authorized. Multiple submissions and analysis versions coexist.

Referral readiness identifies missing essentials separately from review obligations. Unknown finances, geography, and absent selection can prevent readiness. Candidate-reported financial ranges still need review; territory and funding approval remain unknown. There is no decorative percentage or claim of verified qualification. A packet can be generated for review even when it explicitly says Not ready; this never constitutes permission to introduce the candidate.

Packets use an explicit content allowlist. They exclude private Discovery notes and internal assessment commentary. The saved consultant recommendation is intentionally included. Packet generation recomputes from current authorized data and does not archive a historical referral snapshot or transmit anything. Downloaded PDFs are the retained deliverables. General uploads and storage are outside this pack.

Discovery continues through existing trusted persistence. Current observations influence the current workflow; completing Discovery creates the existing versioned current-intelligence refinement. Neither operation alters historical assessment documents. The accepted sixth session for Adrian Walsh is preserved.

Demo bootstrap adds 16 synthetic tasks and 12 meetings, identified by `ifpg002-demo-*` IDs. It inserts only missing records and does not reset edits or completion state. The September 10, 2026 showroom dates distinguish recent introductions, current reviews, and upcoming Discovery/referral preparation.

## Verification and remaining scope

Focused tests cover report provenance/audience/PDF content, unknown handling, timezone validation, Discovery prioritization, evidence summary semantics, real local RLS and CRUD, atomic brand selection, and browser document denial for unauthenticated/foreign users. Browser journeys cover desktop, tablet, and 390px mobile, including downloads and normal navigation.

The local concurrency pgTAP fixture needs the running Docker database's actual mapped port; the proof runner uses a temporary configured copy. The external-assessment pgTAP fixture now gives its independent concurrency session an explicitly older timestamp, avoiding tied `now()` values without changing product behavior.

Remaining destinations outside this pack: Team Command Center does not provide a persisted team dashboard (leadership can access the existing invitation form); Pipeline Settings remains unavailable in persisted workspaces; the direct Reports route remains a placeholder and is not the candidate document destination. Marketing Studio, Assessment Invitation/Send Assessment enhancements, external calendar sync, file uploads, and referral transmission remain deferred.

Production owner credentials, Production login, Production deployments/migrations, marketing hosting, Auth/SMTP, campaign transport, and DNS are outside this checkpoint. Hosted certification and exact source/deployment identifiers are recorded in the checkpoint completion report.
