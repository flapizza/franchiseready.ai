# External assessment trust boundary

Candidates possess a random 256-bit invitation token. Only its SHA-256 hash is
stored. The exact invitation route and its results/PDF children are public;
other assessment routes remain authenticated. Invalid, expired and revoked
tokens yield no assessment data. Completion access also expires with the token.

The candidate controls intake, answer arrays, consent and bounded progress state.
The database owns tenant/candidate association, timestamps and completion state.
The existing deterministic `ConferenceAssessmentAnalysisService` owns analysis;
this is not a new AI engine or a change to questionnaire scoring.

## Persistence contracts

`load_assessment_by_token(text)` returns only public assessment identity/state,
resume progress and the existing candidate-facing ownership profile and
candidate-reported financial summary. It excludes consultant briefs, internal
dimensions, tensions, Discovery priorities, tenant IDs and token hashes.
`save_assessment_progress(text,jsonb)` validates exact top-level fields, intake
keys/enums, array types/cardinality, answer keys/options, exclusive choices,
primary selections, bounded size and timestamp shape. It returns the same safe DTO.

The old analysis-bearing `submit_assessment(text,jsonb,jsonb,jsonb,integer)` is
dropped, not retained as a callable compatibility overload. Anonymous submission
uses the existing Next.js server action. It validates candidate input, computes
analysis, and calls `finalize_assessment_trusted(text,jsonb,jsonb)` using the
existing server-only administrative client. Only `service_role` can execute that
operation. No public client receives that credential.

The finalizer checks the evidence contract again, locks the token's session and
atomically inserts immutable submission evidence, analysis, and completed state.
This avoids both a second SQL scoring engine and a partially completed state
requiring a worker. A failed transaction leaves no completed assessment. An exact
intake/answers retry returns completion without updating any evidence or analysis;
an altered retry is rejected. Candidate progress cannot mutate a completed session.
Existing authenticated report access remains subject to candidate authorization.

The SQL answer contract is a versioned snapshot of the existing questionnaire's
allowed values; it does not score them. Changes to questionnaire values must keep
the TypeScript and SQL validation contract synchronized through a migration.

## Adjacent workflow repairs

Production candidate resolution uses the injected tenant/RLS-scoped repository,
normalized email before phone, and explicit ambiguity handling. The normal create
operation is serialized per workspace/email to prevent concurrent retry duplicates.
It is security-invoker, uses the authenticated membership and preserves RLS.
Public assessment intake remains a submission snapshot associated with the
already-invited candidate; opening an invitation does not create a new candidate.

Invitation URLs use `APP_URL`. Controls describe generating/copying a link, not
sending mail. The persisted assessment explains section-boundary saving rather
than temporary conference storage. Candidate completion exposes the existing
ownership profile and candidate report; consultant intelligence stays in CRM.

## Local validation and promotion boundary

Run `node scripts/local-external-assessment.mjs` with local Supabase running and
the migration applied locally. It refuses a non-loopback Supabase URL, uses
local-only fixture credentials, bootstraps a local workspace, and runs the
browser journey. No hosted credentials or hosted fixtures are used.

`FG_LOCAL_SUPABASE_WORKDIR` optionally selects a local CLI work directory when
Windows reserves the default ports. The September 9 local certification reused
the existing project ID and backed-up database volumes on ports 55320–55324 and
55327 through ignored `.next-dev/checkpoint14a/local` configuration. The source
`supabase/config.toml` and `.env.local` remain unchanged. Its copied legacy
hierarchy concurrency test uses port 55322; the source test remains unchanged.

Completion navigates to the candidate results route after the atomic commit.
It does not revalidate the submitting component mid-transition; dynamic token
pages and consultant reads obtain current persisted state on their next request.

The migration tolerates the interrupted local RPC installation: unsafe functions
are dropped if present, and private/trusted definitions are replaced explicitly.
Its SQL evidence contract is checked against the TypeScript questionnaire in the
unit suite. Database tests include failure after evidence insertion to prove
rollback, and the browser proof exercises simultaneous normalized-email creation
requests, save/resume, submission replay, candidate reports and consultant reads.

Migration: `20260908190607_harden_external_assessment_submission.sql`.
This checkpoint does not apply it to hosted databases or deploy source. Promotion
must coordinate the new RPC contracts and application commit: old application
submission code cannot call the removed RPC after the migration.
