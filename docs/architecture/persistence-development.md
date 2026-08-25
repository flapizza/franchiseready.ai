# Persistence development workflow

This is the focused operational companion to the production persistence plan. It does not replace the domain architecture.

## Modes and environment

`PERSISTENCE_MODE` is the explicit composition boundary:

- `demo`: deterministic repositories for local conference/demo development and Playwright. It is rejected when `NODE_ENV=production`.
- `supabase`: production persistence adapters as each domain is migrated. Database errors fail; they never fall back to demo data.

Configure the existing public Supabase URL/publishable key for user-scoped clients. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side and out of ordinary request repositories. Service-role access is limited to verified provider webhooks, controlled background jobs, and audited system operations.

## Local prerequisites

Docker Desktop is required. The repository pins the supported Supabase CLI as an exact npm dev dependency; invoke it through `npx`:

```text
npx supabase init
```

Do not commit environment secrets. The local stack applies every versioned file in `supabase/migrations` from a clean database.

## Apply and test migrations

From the repository root:

```text
npx supabase db start --debug
npx supabase db reset
npx supabase test db
```

`supabase db reset` proves clean repeatability. `supabase test db` runs pgTAP files under `supabase/tests/database`. Persistence 001 tests authenticate as anonymous, consultant, manager, owner, suspended member, and a second organization. They also exercise same-organization foreign keys, cycle prevention, recursive descendants, capabilities, reporting history, and RLS isolation.

For a linked non-production project, use the team's reviewed Supabase linking and migration workflow. Never run unreviewed migrations or destructive reset commands against production.

## Database type generation

The SQL migration is authoritative. Do not hand-maintain a broad fake `Database` interface. After applying migrations locally, generate types from the real schema:

```text
cmd /c "npx supabase gen types typescript --local --schema public > types\database.generated.ts"
```

On Windows, use `cmd /c` as shown so shell redirection preserves the CLI's UTF-8 bytes; Windows PowerShell redirection can produce a UTF-16 file. Then run `npx tsc --noEmit --incremental false` to prove the generated contract compiles through the application adapters.

For a linked project, the equivalent reviewed command may use `--project-id`. Regenerate and review the type diff whenever migrations change. The generated `types/database.generated.ts` schema is integrated into the browser, server, and admin Supabase client factories; application DTOs remain the domain boundary.

### Windows Docker image-store recovery

The accepted local stack is Supabase CLI `2.114.0` (the exact project pin) on Docker Desktop `4.87.0` / Engine `29.7.2`, WSL2, and the classic `overlay2` image store. On this workstation, containerd snapshot extraction produced corrupted but digest-valid image files: Realtime's `libapparmor.so.1.24.2` began with zero bytes and failed with `invalid ELF header`, while Postgres-meta and its Node base image had zero-byte entrypoints. Pulling the same tags again did not replace the retained corrupt snapshots.

The supported recovery is Docker Desktop **Settings > General**, clear **Use containerd for pulling and storing images**, then restart Docker Desktop. This switches `UseContainerdSnapshotter` to `false`; it does not delete the containerd-store images or containers, which remain available if that store is re-enabled. Do not casually prune images, volumes, or the Docker data store. Obtain explicit approval before deleting local database state or changing Docker/WSL configuration.

Distinguish infrastructure failure from schema failure by where it occurs. An invalid ELF header, empty entrypoint, or container crash before PostgreSQL applies migrations is an image/runtime problem. SQL migration errors and pgTAP failures after the database becomes healthy are schema/test problems. Confirm a recovery with the complete sequence above, including a clean reset, rather than treating a successful container start as database acceptance.

## Security boundaries

- Proxy performs optimistic session routing only. Authorization belongs in the server-only data-access layer and RLS.
- User-scoped server clients carry the authenticated session and remain subject to RLS.
- The admin client bypasses RLS and must not be imported by Client Components or normal user-scoped repositories. Its `server-only` marker makes such imports fail the build.
- Security-definer functions have explicit empty search paths, schema-qualified relations, no dynamic SQL, and organization-bound traversal.
- Membership hierarchy is a single-parent tree. Matrix management is not implemented.
- Reporting history is append-only to application roles and is populated by a database trigger.

## Current validation boundary

Static TypeScript, lint, production build, and Playwright validation do not substitute for database acceptance. A persistence pack is locally accepted only when the pinned CLI starts the stack, a clean `db reset` applies every migration in order, the complete pgTAP suite passes, generated types come from that validated schema, and the application compiles against them. If Docker or the CLI is unavailable, report those checks as not executed rather than inferring success from application tests.

As of August 25, 2026, this workstation has completed that acceptance boundary: all six migrations apply from a clean database and all 126 pgTAP assertions pass.

## Persistence Pack 002 candidate boundary

`candidates` is the first production domain aggregate. It stores only tenant-bound root facts, a stable opaque `cand_...` routing ID, current membership assignment, creator membership, status, and the existing stable pipeline stage identifier. Candidate access is enforced by RLS through `can_access_candidate(uuid)`, which reuses active membership and recursive reporting-hierarchy authorization. Assignment changes are append-only in `candidate_assignment_history`.

Production candidate list, intake, and `/crm/candidates/[candidateId]` resolution use the user-scoped Supabase repository. They never fall back to seed candidates. Candidate 360 is intentionally root-only in Supabase mode: assessment, intelligence, email, meetings, tasks, activity, strategy, and referral modules are hidden until their own persistence packs. Demo mode retains the complete seeded experience.

## Production Pack 003 assessment boundary

Production assessment sessions are candidate- and organization-bound and are composed only when `PERSISTENCE_MODE=supabase`. Conference mode keeps its process-local store and frozen `conference-assessment-v1` instrument. Production uses `franchise-ownership-assessment-v1` while sharing the same question definitions, validation, and deterministic Analysis v2 service.

Consultant invitation creates or reuses the Pack 002 candidate root first, then creates a session with a 256-bit opaque URL token. Only its SHA-256 hash is stored. Reissue cancels the prior active attempt; expiration and revocation do not delete submitted evidence. Public routes are server-mediated through narrow security-definer functions and anon receives no direct table privileges.

Progress is saved at section boundaries as a typed JSONB working snapshot. Final submission atomically writes immutable intake/response evidence and a separately versioned derived analysis. Submitted rows reject updates/deletes; regeneration supersedes only analysis rows. The schema permits historical attempts, while the MVP maintains one active session per candidate/instrument through invitation behavior rather than a future-hostile uniqueness constraint.

Candidate-provided discovery and financial answers are retained as source evidence; financial values remain self-reported. Opportunity Characteristics are persisted inside the reproducible analysis snapshot for Discovery and later Brand Strategy, but completion never produces brand recommendations. Abandoned-session cleanup, retention automation, candidate reassessment UI, and deeper Discovery outcome persistence remain deferred.

## Production Pack 004 Discovery boundary

Production Discovery is a consultant-only, tenant-owned evidence layer. A session references its source assessment but never edits assessment answers, submissions, or Analysis v2. Assessment priorities seed a four-to-six topic agenda. Structured observations record `confirmed`, `refined`, `contradicted`, or `unclear` findings, candidate paraphrases, consultant significance, follow-up state, and Discovery provenance. Private consultant notes remain separate and are never exposed through public assessment RPCs.

Completion deterministically composes a versioned current-intelligence snapshot containing validated/refined patterns, contextual mixed evidence, unresolved questions, a current Consultant Brief, refined Opportunity Characteristics with their previous assessment disposition, and explainable Brand Strategy readiness. The assessment-derived brief and characteristics remain historical source intelligence. Completion does not automatically schedule work, create tasks, or enter Brand Strategy; those stay consultant-controlled links into their existing boundaries.

Discovery tables use candidate hierarchy authorization and no anonymous grants. Multiple sessions are schema-compatible. Retention automation, stakeholder CRM records, production task/calendar persistence, and transcript ingestion remain deferred.
