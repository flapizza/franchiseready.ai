# Candidate CRM architecture

`CandidateCRMRuntime` is the replaceable query boundary for the candidate directory. It reads canonical `CandidateRecord` values from `CandidateRepository` and joins demo-only presentation metadata from the shared `DemoScenarioRepository`; React only owns local search, filter, and view state.

## Demo writes and identity resolution

`DemoCandidateOverlayStore` is the only mutable demo boundary. `SeedCandidateRepository` composes this process-local overlay over the immutable conference scenario, so created candidates and lifecycle updates survive navigation in the active development process without changing `conferenceScenario.ts`. Calling `demoCandidateOverlayStore.reset()` or restarting the development server discards the overlay and restores the baseline.

`CandidateIntakeService` and `DemoAssessmentCompletionService` both invoke `CandidateResolutionService` before creation. Normalized email is an exact intake match; phone-only and ambiguous matches require review. Assessment completion evaluates invitation identity, trusted identity, normalized email, and normalized phone, and only creates a candidate after `not-found`.

Invitations use an opaque token plus candidate and email context. Completion still runs identity resolution, so the token is not treated as permission to bypass the canonical resolver. `AssessmentCompletionSink` owns attaching the assessment, advancing `PipelineStage`, recording activity, and supplying the existing intelligence output.

## Production replacement

Replace `DemoCandidateOverlayStore`, `SeedCandidateRepository`, `AssessmentInvitationService`, and `DemoAssessmentCompletionService` with Supabase-backed repository/service adapters. The React forms, CRM runtime, `CandidateResolutionService`, and `AssessmentCompletionSink` contracts should remain unchanged. A production invitation sender should persist hashed tokens and delegate delivery to an email provider.

## Canonical lifecycle orchestration

`CandidateLifecycleService` is the sole owner of post-intake `PipelineStage` movement. Its explicit graph is:

```text
lead -> assessment-started -> assessment-completed -> discovery
lead --------------------------> assessment-completed (assessment-first only)
discovery -> validation -> brand-matching -> referral -> awarded
discovery -----------------> brand-matching (when no validation items remain)
```

Each explicit lifecycle transition is restricted to its matching transition context. Invalid jumps return `invalid-transition`; missing candidates return `candidate-not-found`. Referral preparation and introduction do not implicitly request a lifecycle transition: readiness is advisory and out-of-sequence consultant actions preserve the actual stage. Awarding still changes candidate status to `won`.

Successful transitions save through `CandidateRepository` and add typed activities through `CandidateActivityRepository`. The demo adapter writes that contract into the existing overlay. Server Actions delegate to the service; React receives only runtime-derived action labels and never writes stages. Candidate CRM and Candidate 360 reload from `SeedCandidateRepository`. Mission Control merges those canonical records over immutable scenario presentation metadata, so overlay stage/status changes propagate without direct UI mutation.

For Supabase, replace repository and activity adapters while retaining `CandidateLifecycleService`, `CandidateResolutionService`, `AssessmentCompletionSink`, and the presentation runtimes.

## Conference E2E reset

Playwright uses `POST /crm/test-reset` after entering the authenticated conference demo. The endpoint is available only when conference access is explicitly enabled in development or by the dedicated `PLAYWRIGHT_TEST_MODE=true` server environment, and the request carries a valid demo session cookie. It calls the overlay's existing `reset()` method and never changes seed fixtures. Normal production starts do not set the test-mode variable, so the endpoint responds as not found.

## End-to-end test server

Run `npm run test:e2e` from the repository root. The cross-platform Node runner creates the standard production build, then Playwright starts one production Next.js server on `127.0.0.1:3100`, runs Chromium serially, and owns server shutdown. `reuseExistingServer` is disabled so stale code can never satisfy the run. Development uses `.next-dev`, while production/E2E uses `.next`; this keeps build output and ports independent when a developer server is already running.

The runner injects `PLAYWRIGHT_TEST_MODE=true` and `CONFERENCE_DEMO_ACCESS=true`; neither variable needs to be added to `.env.local`. Tests enter through the real conference-demo login action before calling the authenticated reset endpoint. A single worker is intentional because the demo overlay is process-local and mutable. Failure screenshots, traces, and reports remain in gitignored Playwright output directories.

Interactive variants are `npm run test:e2e:ui` and `npm run test:e2e:headed`. A future CI job can run `npm ci` followed by `npm run test:e2e`; the E2E runner performs its isolated production build automatically. If port 3100 is occupied, the run fails rather than attaching to or terminating that process.

## Candidate Brand Strategy

`CandidateBrandStrategyRuntime` is the candidate-specific strategy boundary behind `/crm/candidates/[candidateId]/strategy`. It joins canonical candidate intelligence, canonical brand profiles, and conference discovery evidence into ranked recommendation state before React renders it. The scoring remains deterministic and explainable: competency-to-operating-model alignment, existing assessment recommendations, evidence confidence, and explicit investment and liquid-capital qualification all contribute to the presentation state.

Strategy is unavailable before Candidate Intelligence and the configured strategy lifecycle stages exist. An unqualified brand remains visibly scored and financially flagged; consultant selection does not alter that evidence. `ReferralReadinessEvaluator` supplies advisory status and considerations rather than referral permission. `ReferralHandoffState` is the stable downstream contract consumed by Referral Studio, containing the selected canonical brand, rationale, evidence, concerns, readiness, and presentation context.

## Candidate Referral Studio

`/crm/candidates/[candidateId]/referral` is the candidate-level command center for many independent candidate-brand referrals. It consumes `ReferralStrategyHandoffState`, the multi-brand contract produced by Brand Strategy from its existing ranked recommendations. `CandidateReferralService` never selects or re-scores brands. Bulk preparation is an idempotent convenience command that creates or reuses one stable `CandidateBrandReferral` and brand-specific `CandidateReferralPackage` per selected recommendation. Every referral snapshots AI readiness, unresolved considerations, lifecycle stage, and whether the decision was consultant-directed. Ownership and package integrity remain hard requirements; readiness, financial fit, and sequence are advisory.

## Strategy Builder boundary

Candidate Brand Strategy preserves four separate facts: the immutable evidence-backed AI recommendation/rank, consultant-controlled Presentation Set/order, candidate reaction, and consultant shortlist/referral disposition. Candidate reactions and notes are traceable downstream evidence but never rewrite AI Match or Candidate Readiness. When referral intents exist, `ReferralStrategyHandoffState` contains those selected canonical brands; Referral Studio remains responsible for packages, approval, and introductions and retains its unscored “Refer to Another Brand” path.

`StrategyBuilderRecord` is persistence-neutral. The conference implementation stores it in the process-local demo overlay and never mutates scenario fixtures. Mutations are idempotent on state changes and meaningful activities are emitted only when selection, reaction, or disposition changes. A future repository can persist the same candidate/brand decisions, timestamps, AI rank provenance, consultant presentation order, reactions, notes, and dispositions.

The retained analytics chain is: AI recommended → consultant presented → candidate reacted → consultant selected for referral → franchisor outcome → award. Future AI may learn from those distinct events, but deterministic demo scoring does not self-modify. The demo brand universe remains at three enriched canonical profiles because expanding it would require unsupported business/financial claims; recommendation collections and UI rendering are unbounded.

Each referral independently owns its source (`recommended` or `other-brand`), recommendation metadata when applicable, consultant-decision provenance, package, edits, approval, and delivery status. These statuses are deliberately distinct from `PipelineStage`: one candidate can have a sent ERA Group referral, a failed approved Schooley Mitchell referral, and an ActionCOACH package ready for review. Referral actions preserve the current lifecycle stage; an explicit consultant lifecycle action is required to move it. Legacy introduction records remain readable history. Future brand-specific outcomes such as reviewing, declined, territory unavailable, validation day, or awarded extend `CandidateBrandReferral`, not `PipelineStage`.

The process-local referral collection is stored inside `DemoCandidateOverlayStore`. Preparation records brand-specific activity once. Individual approval preserves advisory readiness, atomically claims one delivery attempt, and invokes the delivery provider. Failed approved deliveries can be retried without another approval. Consultant-selected outside brands receive a generic candidate-intelligence package with nullable recommendation fields—never a fabricated fit score or AI recommendation—and are not inserted into the canonical brand library.

`ReferralDeliveryService` remains the per-referral delivery boundary, ensuring each franchisor receives only its own package. Its demo adapter deterministically returns a delivery result and explicitly reports that no external email was delivered; the referral service persists that result and auditable activity. A production adapter can send email, attach a generated PDF, publish a secure package link, record brand acknowledgement, and persist delivery results without coupling those systems to React or rebuilding Brand Strategy.

Production persistence maps naturally to `candidates`, `candidate_brand_referrals`, `referral_packages`, optional package versions, `referral_deliveries`, and `candidate_activities`. Future candidate qualification should add explicit canonical net worth, liquid capital, preferred investment range, and financing-intent fields; the demo continues to render absent net worth as unavailable. PDF, secure links, delivery, acknowledgement, and post-referral outcomes consume the existing structured package and referral contracts rather than reconstructing content.

Conference flow: Mission Control or Candidate 360 opens Brand Strategy, `Prepare Referral` opens the candidate Referral Studio, FranGroove prepares the evidence-backed package, and `Approve & Send Referral` records consultant authorization before automatically invoking delivery. Delivery does not mutate lifecycle, readiness, or AI Match.
