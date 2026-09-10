# IFPG Demo Experience Pack 001

The current hosted presentation is documented in the [Pack 002 runbook](ifpg-demo-experience-pack-002.md). This document records the Pack 001 foundation.

This is the persisted FranGroove Demo Preview experience for Alex Morgan. The older `ifpg-demo-presenter-runbook.md` describes the separate temporary conference runtime and its simulated actions; it is not the runbook for this workspace.

## Product behavior and architecture

Mission Control composes authorized candidates, their latest assessment, and Discovery tied to that assessment. It uses the signed-in Supabase client, organization predicates and existing RLS. Reading Mission Control, Candidate 360, matching or a handoff does not create a Discovery session. Existing assessment and Discovery workflows retain their write contracts.

The implementation reuses workspace composition, candidate persistence, trusted assessment snapshots, current Discovery intelligence, canonical published Brand Intelligence and existing navigation. Legacy Mission Control and matching services depend on temporary demo intelligence and inferred percentages; the persisted read model uses their matching dimensions without consuming their demo repositories. No migration, dependency change or additional hosted synthetic records are required.

Mission Control presents open relationships, active/on-hold counts, assessment status, brand matching, validation/referral, pipeline links and dated activity. Attention rules cover unresolved Discovery, on-hold candidates, unfinished or expired invitations, 14 days without a recorded update, missing next steps and readiness for consultant brand review. Attention means a conversation is useful; it does not assert AI urgency. Activity is a view of current persisted record timestamps, not a comprehensive event audit.

Brand fit uses seven categories: finances, ownership model, operations, leadership/sales, lifestyle, timing/readiness, and motivation/customer relationships. Each factor is Supports fit, Validate, Potential conflict or Unknown. Available but unverified brand facts remain visibly provisional. Unknown/conflicting facts cannot become supported factors. Financial intervals preserve uncertainty; investment preference is distinct from liquid capital. Territory, financing approval and consent are not inferred.

Overall bands are Worth exploring, Resolve tradeoffs, Limited alignment and Insufficient evidence. The deterministic ordering compares band, financial conflict, conflict count, supported factor count, unknown count, then name/ID for stable ties. The UI explains the distinguishing ranking factor and alternative strengths. Comparison supports up to three brands; selection is browser component state. A handoff selects its brand through an authorized URL parameter and recomputes from accessible evidence. It creates no saved shortlist, approval, referral or transmission.

Candidate list labels now describe Assessment status. Candidate 360 explicitly labels Profile Confidence and explains its meaning. It does not repeat that confidence as a separate readiness score. Discovery readiness and fit bands remain distinct concepts.

## Current showroom story

Alex's workspace has 12 open relationships: 11 active and one on hold; eight completed trusted assessments, two in progress, three candidates in brand matching and two in validation/referral. Ten candidates have a review reason. Maya's three unresolved Discovery findings lead the queue, followed by Adrian's on-hold status and unfinished assessments for Ethan and Camila.

- **Daniel Reed:** ActionCOACH and Schooley Mitchell tie with seven supported factors and no conflicts. Sales appetite, active ownership, lean staffing and B2B relationships explain the story. Their alphabetical ordering is not a substantive preference. Brand net-worth requirements remain unknown.
- **Maya Bennett:** RouteWise has one conflict, the unresolved readiness review. Sales-intensive B2B options add an owner-selling conflict; BrightPath and Harbor & Hound add investment/staffing conflicts. Partner alignment, household runway and staffing preferences must be resolved before an introduction. RouteWise is a concept profile, not a verified live opportunity.
- **Olivia Chen:** ActionCOACH, BrightPath, ERA and Schooley Mitchell share Worth exploring with four supported factors. BrightPath supports staffing appetite; B2B alternatives support owner selling. Manager-led suitability and net-worth requirements remain unknown. Her recorded next step is a handoff review and evidence/consent validation, not transmission. BrightPath is a concept profile.

These results come from persisted profiles. No names, IDs or totals occur in product matching logic. Broadly similar bands for Olivia are an honest limit of the available brand evidence.

## Ten live-demo stops

1. Sign in as Alex Morgan using the existing Preview credential; open Mission Control.
2. Explain practice counts and the difference between active and open relationships.
3. Open Maya from attention; show the saved next conversation.
4. In Candidate 360, show Profile Confidence, Candidate Intelligence and existing Discovery findings.
5. Enter Brand Referral Engine; explain why staffing appetite and household constraints matter.
6. Compare RouteWise with a sales-intensive option; inspect factor evidence and unknowns.
7. Open Brand Intelligence, explain concept/provisional labels, and use its candidate return link.
8. Return through Mission Control/pipeline to Daniel; compare the B2B story and honest tie.
9. Open Olivia, review her intelligence, select BrightPath or a B2B alternative and prepare the handoff preview. State that nothing was transmitted.
10. Return to Mission Control/pipeline; optionally show the same journey at mobile width.

**Five minutes:** 45 seconds on Mission Control, 60 on Maya's intelligence, 90 on matching/comparison, 60 on Olivia's handoff and 45 for navigation/questions.

**Ten minutes:** one minute on Mission Control, two on Maya, two on comparison/evidence, two on Daniel, two on Olivia and one for return/questions.

**Fifteen minutes:** two minutes on Mission Control/pipeline, three on Maya/Discovery, three on comparison and Brand Intelligence, two on Daniel, three on Olivia/handoff and two for mobile/questions.

Use the product's candidate links. Do not reset this durable workspace or use the temporary Conference Demo entry. Rehearsals can remain read-only: avoid generating invitations, editing Discovery or invoking communication actions. Credentials and infrastructure details are not presentation material.

## Validation and remaining scope

Focused coverage exercises aggregation, attention, empty states, candidate links, financial ranges, unknown/conflicting evidence, candidate differentiation, deterministic ordering, comparison limits/explanations, handoff, repository scope and responsive navigation. The real local Supabase integration proves that a different authenticated user cannot obtain candidate or assessment/Discovery evidence using a forged organization context. Local assessment regression covers invitation/resume, trusted atomic completion, replay, tenant denial, public projection, PDF, expiry/revocation and browser secret exposure.

No durable shortlist, candidate reaction workflow, referral approval, outbound delivery or territory integration is introduced. Team Mission Control, tasks and calendar retain their existing availability. Financial statements are self-reported and brand evidence still needs diligence. Large-workspace pagination in the preexisting candidate repository remains a scaling limitation; the evidence read model pages and fails closed at its explicit limit. The certified showroom has 12 candidates.

Deployment and hosted verification evidence are recorded in the checkpoint's local certification artifacts and final report. Production promotion is outside this pack.
