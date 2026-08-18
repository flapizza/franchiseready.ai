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

Each edge is restricted to its matching transition context. Invalid jumps return `invalid-transition`; missing candidates return `candidate-not-found`. Brand Strategy can advance to Referral only when the existing `ReferralReadinessEvaluator` returns `ready`. Awarding also changes candidate status to `won`.

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

Strategy is unavailable before Candidate Intelligence and the appropriate lifecycle stage exist. An unqualified brand is score-capped and excluded from the presentation order; the interface does not invent missing intelligence or override the financial constraint. Referral advancement delegates to `CandidateLifecycleService` and its existing `ReferralReadinessEvaluator` gate. `ReferralHandoffState` is the stable downstream contract consumed by Referral Studio, containing the selected canonical brand, rationale, evidence, concerns, readiness, and presentation context.

## Candidate Referral Studio

`/crm/candidates/[candidateId]/referral` is the candidate-level command center for many independent candidate-brand referrals. It consumes `ReferralStrategyHandoffState`, the multi-brand contract produced by Brand Strategy from its existing ranked recommendations. `CandidateReferralService` never selects or re-scores brands. Bulk preparation is an idempotent convenience command that creates or reuses one stable `CandidateBrandReferral` and brand-specific `CandidateReferralPackage` per selected recommendation.

Each referral independently owns its source (`recommended` or `other-brand`), recommendation metadata when applicable, package, consultant edits, approval, introduction, and delivery status. These statuses are deliberately distinct from `PipelineStage`: one candidate can have an introduced ERA Group referral, an approved Schooley Mitchell referral, and an ActionCOACH package ready for review. The first recorded introduction may move the broadly eligible candidate from `brand-matching` to `referral` through `CandidateLifecycleService`; subsequent brand outcomes never overload the candidate lifecycle. Future brand-specific outcomes such as reviewing, declined, territory unavailable, validation day, or awarded extend `CandidateBrandReferral`, not `PipelineStage`.

The process-local referral collection is stored inside `DemoCandidateOverlayStore`. Preparation records brand-specific activity once; individual approval re-evaluates the canonical referral gate; individual introduction requires approval and records the brand through the canonical activity repository. Consultant-selected outside brands receive a generic candidate-intelligence package with nullable recommendation fields—never a fabricated fit score or AI recommendation—and are not inserted into the canonical brand library.

`ReferralDeliveryService` remains the per-referral delivery boundary, ensuring each franchisor receives only its own package. Its demo adapter records the introduction and explicitly reports that no external email was delivered. A production adapter can send email, attach a generated PDF, publish a secure package link, record brand acknowledgement, and persist delivery results without coupling those systems to React or rebuilding Brand Strategy.

Production persistence maps naturally to `candidates`, `candidate_brand_referrals`, `referral_packages`, optional package versions, `referral_deliveries`, and `candidate_activities`. Future candidate qualification should add explicit canonical net worth, liquid capital, preferred investment range, and financing-intent fields; the demo continues to render absent net worth as unavailable. PDF, secure links, delivery, acknowledgement, and post-referral outcomes consume the existing structured package and referral contracts rather than reconstructing content.

Conference flow: Mission Control or Candidate 360 opens Brand Strategy, `Prepare Referral` opens the candidate Referral Studio, FranGroove prepares the evidence-backed package, the consultant reviews and approves it, and `Introduce Candidate` records the guarded lifecycle and activity updates consumed by Candidate CRM, Candidate 360, and Mission Control.
