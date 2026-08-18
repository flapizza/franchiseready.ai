# Conference Demo Spine

Status: Canonical deterministic data architecture for the conference demo.

## Scenario source

The canonical scenario is owned by `feature/demo`:

- `data/demoConsultant.ts` contains the reusable Jim Wood consultant identity.
- `data/conferenceScenario.ts` contains the deterministic starting fixture.
- `models/DemoScenario.ts` defines the normalized demo projection.
- `repositories/DemoScenarioRepository.ts` is the replaceable read boundary.
- `repositories/SeedDemoScenarioRepository.ts` returns a fresh structured clone on every read.

The fixture uses fixed timestamps so identical application code always starts from the same state. No component imports the candidate fixture directly.

## Consultant

The canonical consultant is `consultant-demo`, Jim Wood (`JW`), Senior Franchise Consultant. Mission Control obtains the consultant through the scenario repository. Small consultant-only runtime surfaces may reuse `demoConsultant` until consultant persistence is introduced.

## Candidates and lifecycle

CRM owns lifecycle terminology through `PipelineStage`. The conference story uses this ordered subset:

```text
assessment-started
assessment-completed
discovery
validation
brand-matching
referral
awarded
```

`referral` was added to the existing CRM union rather than creating another stage type. `brand-matching` is the stored stage corresponding to the product label “Brand Strategy.”

The scenario contains ten candidates. `candidate-demo` remains John Smith for existing links and demos.

## Repository flow

Mission Control follows:

```text
/crm page -> MissionControlRuntime
  -> DemoScenarioRepository + BrandRepository
  -> MissionControlState -> existing presentation
```

Candidate Workspace and Discovery follow:

```text
/crm/[id] or /crm/[id]/discovery
  -> SeedCandidateRepository
  -> SeedDemoScenarioRepository
  -> CandidateRecord -> existing presentation/runtime
```

Candidate 360 and Consultant Briefing now use the same `CandidateRepository`, so selected candidate identity and scores come from the shared scenario.

## Mission Control aggregation

Mission Control presentation receives one prepared `MissionControlState` from `MissionControlRuntime`. The runtime loads `DemoScenarioRepository` and `BrandRepository`, then decides:

- Daily Brief counts and compact priority rows
- KPI values
- top opportunity by lifecycle and referral value
- priority candidates by momentum, unresolved risk, and lifecycle opportunity
- meeting agenda and briefing destinations
- AI recommended actions
- introduction-ready candidate/brand pairs
- deterministic intelligence events

React components render those view models and contain no candidate or brand selection rules. Existing links are used only for candidate workspace and consultant briefing. Brand Strategy and referral generation remain intentionally non-navigating controls until candidate-specific routes exist.

The persistent header remains the future FranGroove Copilot entry point. Mission Control does not render a second conversational input.

## Intelligence adapter

`feature/intelligence` remains the application-facing candidate intelligence model. `CandidateIntelligenceAdapter` explicitly converts its `CandidateIntelligenceProfile` into the newer `feature/candidate-intelligence` model, using scenario Discovery risks, signals, flags, and focus as adapter context.

`DemoScenarioRepository.getCandidateIntelligence()` is the entry point for AI/evidence consumers. Presentation components must not combine both intelligence model families.

## Brand identities

The canonical demo brand identities are in `feature/brand-library/data/demoBrands.ts` and are accessed through `BrandRepository` or `getDemoBrandById` inside seed/runtime construction. Existing ERA Group, Schooley Mitchell, and ActionCOACH references now share stable IDs and names.

## Candidate aggregate and assessment completion bridge

Candidate is the primary aggregate. Assessment is evidence attached to a candidate, not the owner of candidate identity or lifecycle state. `CandidateRecord.assessmentIds` allows one candidate to retain multiple assessment records over time.

The intended aggregate relationships are:

```text
Candidate
  -> profile and contact information
  -> assessments[]
  -> Candidate Intelligence
  -> Discovery sessions
  -> evidence
  -> activities
  -> brand matches
  -> referrals
  -> lifecycle state
```

`feature/assessment-engine/services/AssessmentCompletionSink.ts` defines the application boundary invoked after a completed session is scored. It carries participant identity, consultant scope, optional invitation/trusted candidate identifiers, session/version IDs, completion time, and the canonical `AssessmentResult`.

The sink does not expose an unconditional `createCandidate` method. It exposes `recordCompletion` and must delegate first to the CRM-owned `CandidateResolutionService`.

Possible completion outcomes are:

- `updated-existing-candidate`: attach the assessment ID and update intelligence on the resolved aggregate.
- `created-candidate`: allowed only after resolution returns a definitive no-match.
- `requires-review`: ambiguous candidates are returned for human review and no merge or creation occurs automatically.

The next feature pack should invoke this sink in an application service immediately after `AssessmentScoringService.score(session)` succeeds. The client-side assessment player must not construct or merge CRM records directly.

This pack intentionally provides no sink implementation and performs no write.

## Candidate resolution hierarchy

`feature/crm/services/CandidateResolutionService.ts` owns resolution policy. Implementations must evaluate identifiers in this order:

1. Secure assessment invitation identifier. The future invitation repository resolves the opaque invitation to a consultant/tenant-scoped candidate ID. A valid, unexpired binding is definitive.
2. Trusted candidate ID supplied by an authenticated internal workflow and verified within the same consultant/tenant scope.
3. Normalized unique email within the consultant/tenant scope.
4. Normalized phone within that scope when appropriate.
5. No match permits creation through `CandidateRepository.save()`.

Name is never a deterministic match key. Multiple email or phone matches produce `ambiguous`; they must not be merged, updated, or used as justification for creating another record automatically.

`CandidateRepository` now exposes scoped normalized-email and normalized-phone queries returning arrays so ambiguity remains visible rather than being hidden by a `getOne` API.

## Candidate-first and assessment-first workflows

Candidate-first workflow:

```text
Consultant creates Candidate
  -> invitation stores candidateId + consultant/tenant scope
  -> candidate receives opaque secure invitation identifier
  -> completion resolves invitation definitively
  -> assessment is appended to candidate.assessmentIds
  -> Candidate Intelligence is recalculated
```

Assessment-first workflow:

```text
Assessment completes without candidate binding
  -> scoped email/phone resolution
  -> unique match: update existing Candidate
  -> ambiguous match: require review
  -> no match: create Candidate, attach assessment, calculate intelligence
```

Secure token generation, invitation delivery, expiration, and persistence are deferred. The architecture requires the future invitation store to bind an opaque invitation identifier to exactly one candidate inside one tenant scope; candidate identity must not be encoded in a client-trusted query parameter.

The persistent **New Candidate** control is reserved for the candidate-first workflow and must not be connected to a disposable demo form. Its future application service will create the minimal Candidate aggregate through `CandidateRepository`, then create a scoped assessment invitation. Assessment-first entry continues through the public assessment and the same resolution-first completion boundary. Both paths converge on Candidate Intelligence without creating duplicate candidates.

## Supabase transition

Persistence will replace repository implementations, not screen contracts:

- `SeedDemoScenarioRepository` becomes a Supabase-backed scenario/query adapter.
- `SeedCandidateRepository` becomes a Supabase candidate repository.
- Mission Control continues depending on runtime-ready repository interfaces.
- Candidate pages continue resolving `CandidateRecord` by ID.

The fixture remains valuable for local development, automated tests, and conference reset.

## Future conference reset

A reset command will copy the immutable canonical fixture into the persistent demo tenant. Because seed reads currently return fresh clones, the fixture already represents a deterministic reset baseline. Reset must be implemented as an explicit administrative command; product components must never mutate the exported fixture.

## Development conference access

Conference access is an explicit development-only session layered alongside Supabase authentication. It is disabled by default.

Enable it in the untracked local environment file:

```dotenv
CONFERENCE_DEMO_ACCESS=true
```

Then run the application with `npm run dev` and use **Enter Conference Demo as Jim Wood** on `/login`. The action creates an HTTP-only, same-site cookie containing the canonical `consultant-demo` ID and redirects to `/crm`.

The cookie is recognized only when both conditions are true:

```text
NODE_ENV === development
CONFERENCE_DEMO_ACCESS === true
```

Production mode rejects the demo cookie even if the environment flag is accidentally present. The control is not rendered when disabled, and the server action independently verifies the guard before setting a cookie. Real Supabase login remains available and unchanged.

The sole exception is the isolated Playwright server: `npm run test:e2e` starts a production build with both `PLAYWRIGHT_TEST_MODE=true` and `CONFERENCE_DEMO_ACCESS=true`. This explicit pair enables the same guarded demo session and authenticated reset route only inside the E2E-owned process. Ordinary production starts set neither variable and continue to reject demo access.

Disable access by removing the variable or setting:

```dotenv
CONFERENCE_DEMO_ACCESS=false
```

This session is a local demonstration abstraction only. It does not create a Supabase user or persist a fake production identity.
