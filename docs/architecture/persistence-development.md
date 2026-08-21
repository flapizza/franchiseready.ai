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
npx supabase start
npx supabase db reset
npx supabase test db
```

`supabase db reset` proves clean repeatability. `supabase test db` runs pgTAP files under `supabase/tests/database`. Persistence 001 tests authenticate as anonymous, consultant, manager, owner, suspended member, and a second organization. They also exercise same-organization foreign keys, cycle prevention, recursive descendants, capabilities, reporting history, and RLS isolation.

For a linked non-production project, use the team's reviewed Supabase linking and migration workflow. Never run unreviewed migrations or destructive reset commands against production.

## Database type generation

The SQL migration is authoritative. Do not hand-maintain a broad fake `Database` interface. After applying migrations locally, generate types from the real schema:

```text
npx supabase gen types typescript --local --schema public > types/database.generated.ts
```

For a linked project, the equivalent reviewed command may use `--project-id`. Regenerate and review the type diff whenever migrations change. The generated `types/database.generated.ts` schema is integrated into the browser, server, and admin Supabase client factories; application DTOs remain the domain boundary.

### Windows Postgres-meta entrypoint anomaly

On Docker Desktop 4.87.0 with the containerd image store, the `linux/amd64`
`public.ecr.aws/supabase/postgres-meta:v0.97.0` and `v0.98.0` images reproduce an
`exec format error`. Their Node runtime and Postgres-meta server payload are
intact, but `/usr/local/bin/docker-entrypoint.sh` is extracted as a zero-byte
executable. The same behavior reproduces directly with the inherited
`node:22.23.2-bookworm-slim` image, while `node:22.22.0-bookworm-slim` contains
the expected 388-byte entrypoint and starts normally. This is an environment /
upstream tooling-image issue rather than a schema or CPU-architecture failure.

Pack 001B type generation was completed from the clean, migrated local schema
using the pinned project CLI and a local-only derived Postgres-meta image that
retained the official image payload but cleared its broken default entrypoint so
the existing `node dist/server/server.js` command could run. The derived image
and temporary Dockerfile are not repository artifacts. Do not hand-edit the
generated types; regenerate them from a validated local or linked schema when a
working upstream image is available.

## Security boundaries

- Proxy performs optimistic session routing only. Authorization belongs in the server-only data-access layer and RLS.
- User-scoped server clients carry the authenticated session and remain subject to RLS.
- The admin client bypasses RLS and must not be imported by Client Components or normal user-scoped repositories. Its `server-only` marker makes such imports fail the build.
- Security-definer functions have explicit empty search paths, schema-qualified relations, no dynamic SQL, and organization-bound traversal.
- Membership hierarchy is a single-parent tree. Matrix management is not implemented.
- Reporting history is append-only to application roles and is populated by a database trigger.

## Current validation boundary

Static TypeScript, lint, production build, and Playwright validation can run without the local Supabase stack because existing application domains remain explicit demo adapters. Runtime migration and RLS validation requires both the Supabase CLI and Docker. If either is unavailable, report database tests as not executed rather than inferred from application tests.

As of August 21, 2026, this workstation has a local environmental blocker in
the pinned Supabase CLI 2.114.0 initialization path. Both the standard and
database-only start commands invoke the Realtime schema migrator; its
`sudo -E -u nobody /app/bin/migrate` startup fails because the image's
`libapparmor.so.1` has an invalid ELF header. PostgreSQL is removed before
migrations or pgTAP can run. Pack 002 database runtime validation and type
regeneration therefore remain unexecuted here; application validation does not
substitute for those results.

## Persistence Pack 002 candidate boundary

`candidates` is the first production domain aggregate. It stores only tenant-bound root facts, a stable opaque `cand_...` routing ID, current membership assignment, creator membership, status, and the existing stable pipeline stage identifier. Candidate access is enforced by RLS through `can_access_candidate(uuid)`, which reuses active membership and recursive reporting-hierarchy authorization. Assignment changes are append-only in `candidate_assignment_history`.

Production candidate list, intake, and `/crm/candidates/[candidateId]` resolution use the user-scoped Supabase repository. They never fall back to seed candidates. Candidate 360 is intentionally root-only in Supabase mode: assessment, intelligence, email, meetings, tasks, activity, strategy, and referral modules are hidden until their own persistence packs. Demo mode retains the complete seeded experience.
