# FranGroove Cloud Deployment Runbook

This is the authoritative deployment manual for FranGroove. It contains no
secret values. Cloud resources, hosted configuration, DNS, migrations, and
production secrets require an explicit approval before they are changed.

## 1. Target architecture

| Surface | Canonical URL | Owner |
| --- | --- | --- |
| Marketing | `https://frangroove.com` | Marketing deployment (future) |
| Marketing alias | `https://www.frangroove.com` redirects to apex | DNS/Vercel |
| Consultant application | `https://app.frangroove.com` | Vercel Next.js project |
| Candidate assessments | `https://app.frangroove.com/assessment/invitation/{opaque-token}` | Next.js + Supabase |
| Authentication and production data | Supabase project for the environment | Supabase |

Use a normal Vercel Next.js deployment with the Node.js runtime. Route handlers,
Server Actions, Supabase SSR cookies, and in-memory PDF generation are compatible
with this model. No application route writes to the deployment filesystem.

`APP_URL` is the canonical application origin for each environment. Production
must set it explicitly to `https://app.frangroove.com`. A Vercel Preview may
derive its origin from the deployment-specific `VERCEL_URL` when `APP_URL` is
absent; manual Preview deployments therefore use their exact generated
deployment URL. Never use `VERCEL_PROJECT_PRODUCTION_URL` as the Preview
canonical origin. Invitation paths remain relative inside the application and
become absolute only at the browser or delivery boundary.

## 2. Runtime and persistence matrix

"Hosted demo" below means the code as it exists now on stateless Vercel
functions. It is an audit result, not an approved deployment.

| Feature | Local demo | Hosted demo today | Production | Persistence owner / dependency | Serverless safe? |
| --- | --- | --- | --- | --- | --- |
| Authentication | Demo cookie or local Supabase | Demo is intentionally disabled in production | Supabase Auth + SSR cookies | Supabase | Production: yes |
| Mission Control | Seed fixtures + overlay | Reads deterministic fixtures; mutations may disappear | Partial production composition remains | Process memory / Supabase where implemented | Demo mutations: no |
| Jared / Sarah | Deterministic fixtures | Reads stable; mutations are instance-local | Demo-only personas | Repository fixtures | Reads only |
| Conference assessment | Process-local record map | Results can disappear or land on another invocation | Isolated from production | `ConferenceAssessmentStore` | No |
| Production assessment | Supabase sessions/submissions/analysis | Same as production when configured | Durable opaque-token workflow | Supabase + RLS/RPC | Yes |
| Candidate 360 | Demo aggregate or production root | Demo mutations unstable | Production candidate/assessment roots available; several secondary workspaces remain demo-backed | Mixed | Partial |
| Discovery | Demo UI state or Supabase production repository | Demo mutations unstable | Supabase sessions/observations/intelligence | Supabase + RLS/RPC | Production: yes |
| Brand Strategy | Seed evidence + overlay decisions | Decisions unstable | Production persistence not implemented | Process memory | No |
| Presentation reactions | Overlay | Unstable | Production persistence not implemented | Process memory | No |
| Engagement Playbook | Deterministic synthesis + overlay decisions | Decisions unstable | Production persistence not implemented | Process memory | No |
| Tasks | Seeds + overlay | Mutations unstable | Production persistence not implemented | Process memory | No |
| Calendar | Seeds + overlay | Mutations unstable | Production persistence not implemented | Process memory | No |
| Communications | Seeds + overlay or production Gmail send path | Demo mutations unstable | Canonical outbound email tables + Gmail provider | Mixed Supabase/Gmail | Production path: yes |
| Gmail | Optional in demo | Core demo must not require it | OAuth/send architecture exists but production KMS cipher is not implemented | Google APIs + Supabase + KMS | Blocked for production |
| Referral / handoff | Seeds + overlay | Mutations and selections unstable | Production persistence not implemented | Process memory | No |
| Assessment reports | Generated in memory | Conference source record can disappear | Regenerated from Supabase snapshots | Node.js + Supabase | Production: yes |
| Team Command Center | Deterministic hierarchy fixtures | Read-only story stable | Production aggregate incomplete | Mixed fixtures/Supabase | Partial |
| Demo reset | Clears one process instance | Cannot reset all Vercel instances | Must remain unavailable | Process memory | No |

### IFPG recommendation

Do not host the current mutable demo on ordinary Vercel functions and call it
reliable. The narrow product-aligned solution is a dedicated Supabase-backed demo
tenant using the same authenticated application and durable repositories as
production, seeded with deterministic Jared/Sarah data and a tenant-scoped reset
operation. Until that small persistence slice exists, use a single long-lived
Node.js process for the IFPG demo (with access control and no production data),
not serverless process memory. Gmail, Google OAuth, and future AI calls must remain
optional; demo delivery providers and deterministic intelligence already support
the core story.

## 3. Environment model

Never copy production secrets into Preview. Vercel environment scopes must be
configured independently.

| Variable | Exposure | Timing | Local | Preview | Production |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public client value | Build/runtime | Local Supabase | Preview project | Production project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public client value | Build/runtime | Local anon key | Preview publishable key | Production publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Runtime | Local only if required | Preview-specific | Production-specific; narrowly scoped use |
| `APP_URL` | Server configuration | Runtime/build | `http://localhost:3000` | Explicit exact Preview origin or derived from deployment-specific `VERCEL_URL` | Required explicitly: `https://app.frangroove.com` |
| `PERSISTENCE_MODE` | Server configuration | Runtime | `demo` or `supabase` | `supabase` | Required: `supabase` |
| `CONFERENCE_DEMO_ACCESS` | Optional demo flag | Runtime/build | Explicit only | Off | Off; production code fails closed |
| `PLAYWRIGHT_TEST_MODE` | Test-only flag | Build/runtime | E2E runner only | Never | Never |
| `GOOGLE_CLIENT_ID` | Server secret/config | Runtime | Development client | Separate non-production client | Production client, later |
| `GOOGLE_CLIENT_SECRET` | Server secret | Runtime | Local secret | Preview secret | Production secret, later |
| `GOOGLE_OAUTH_REDIRECT_URI` | Server configuration | Runtime | Local callback | Preview callback | `https://app.frangroove.com/auth/google/callback` |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Server secret | Runtime | Local AES key | Do not enable Gmail | Do not use; replace with managed KMS |

There is no current AI-provider environment variable or runtime dependency.
Missing production persistence configuration fails closed. Public variables are
embedded at build time when referenced by browser bundles, so their Vercel scope
must be correct before building.

## 4. Public-hosting security classification

| Surface | Classification | Required disposition |
| --- | --- | --- |
| Login, auth callback, production invitation/results/report | Safe public boundary | Preserve token hashing, generic errors, and candidate-safe report projection |
| `/crm/**`, Candidate 360, consultant PDF, Gmail routes | Authenticated | Supabase session plus repository/RLS authorization |
| `/assessment/start/**`, conference candidate results | Demo-gated | Current production fail-closed behavior; do not enable on Vercel |
| `/crm/test-reset` | Demo-gated | Authenticated demo cookie; unsafe as a distributed reset |
| `/crm/test-email-engagement` | Demo-gated test fixture | Keep unavailable in production |
| `/crm/test-referral-delivery` | Demo-gated test fixture | Keep unavailable in production |
| `/assessment/start/test-legacy-assessment` | Test-only | Requires both Playwright mode and demo gate; never configure in hosted environments |
| Conference cleanup/action routes | Demo-gated | Never point at production persistence |
| Supabase service-role client | Server-only administrative boundary | Never use for normal user requests; never expose key |
| Google OAuth callbacks | Authenticated/state-bound | Exact redirect URI, PKCE, short-lived state, same-origin initiation |
| `/api/health` | Safe public | Returns only `{ "status": "ok" }`; no dependency, tenant, or secret detail |

Do not set `PLAYWRIGHT_TEST_MODE` in Preview or Production. Do not change the
demo gate to accept `NODE_ENV=production` without first implementing durable,
tenant-isolated demo state and secure cookies.

## 5. Vercel readiness and setup

- Framework: detected Next.js 16; no custom adapter or `vercel.json` required.
- Install: `npm install`/lockfile default. Build: `npm run build`.
- Runtime: Node.js 24.x, pinned in `package.json`; PDF generation needs Node.js,
  not Edge.
- Output: standard Next.js output; do not enable static export.
- Filesystem: no runtime writes identified.
- Function state: treat every invocation as stateless.
- Health: `GET /api/health` is liveness only. A separate authenticated operational
  check may later test Supabase without exposing diagnostics.

### Preview deployment checklist

1. Create a Vercel Preview project connected to the approved GitHub repository.
2. Select only the intended preview branch and Node.js 24.x.
3. Configure Preview-scoped Supabase and application variables; omit demo/test
   flags and Google secrets initially.
4. Deploy using the generated Vercel hostname.
5. Verify `/api/health`, login, auth callback, production assessment, protected
   Candidate 360, Discovery, both PDFs, and generic unauthorized responses.
6. Inspect function logs for serverless/runtime errors without logging tokens or
   sensitive financial answers.
7. Do not attach `frangroove.com` until this smoke test is green.

## 6. Supabase cloud procedure

The repository has eight ordered migrations: tenancy/hierarchy, candidates,
connected Gmail accounts, outbound email, assessment persistence, Discovery
persistence, Preview privilege hardening, and RPC runtime fixes. Local pgTAP
coverage validates tenant isolation, hierarchy, token boundaries, production
persistence, explicit privilege boundaries, and runtime RPC behavior.
Security-definer functions set an empty search path and explicit grants/revokes.

1. Create separate Preview and Production projects only after approval.
2. Record project reference, region, plan, database password ownership, and
   recovery contacts in the secret manager—not this repository.
3. Run `supabase login`, then `supabase link --project-ref <ref>` deliberately.
4. Confirm the linked target and inspect `supabase migration list`.
5. Run `supabase db push --dry-run`; review every pending timestamp.
6. Create a logical pre-change backup for any non-empty database.
7. With a single release operator, run `supabase db push`. Never use
   `--include-seed` or `db reset --linked` in production.
8. Compare generated remote types with `types/database.generated.ts`; review
   before replacing the committed file.
9. Run authenticated/anonymous RLS smoke tests, assessment invitation tests,
   cross-organization denial, and Discovery persistence tests.
10. Configure Supabase Auth Site URL and exact redirect allow-list only after
    approval, first for Preview and later for `app.frangroove.com`.

Migrations are forward changes and are not assumed reversible. A failed release
is recovered by restoring a backup or shipping a reviewed forward-fix migration;
never edit an already-applied migration.

## 7. Backup and recovery

Supabase Free has no automatic backups; export regularly with `supabase db dump`
and store encrypted copies off-site. Current Supabase documentation states that
Pro includes daily backups retained for seven days. PITR is an optional paid
add-on and replaces daily backups while enabled. Database backups do not restore
deleted Storage objects.

Before each production migration:

1. Record migration history and deployment SHA.
2. Take and verify an encrypted logical dump.
3. Confirm automatic backup/PITR status and recovery ownership.
4. Schedule downtime if restoration may be required.

Recovery: stop writes, identify the last known-good point, restore through the
Supabase dashboard (or restore an independently verified logical dump to a new
project), rotate affected credentials, compare migration history, run RLS and
workflow smoke tests, then restore traffic. Restores cause downtime and should be
rehearsed against non-production data.

References:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/deployment/database-migrations
- https://supabase.com/docs/guides/local-development/cli-workflows

## 8. Git and release workflow

- `main`: production-ready, protected, deployed to Vercel Production only.
- `develop` (optional while the team is small): shared integration and stable
  Preview environment.
- `feature/*`: short-lived work with per-branch Preview deployments.
- `hotfix/*`: branch from `main`, validate in Preview, merge by reviewed PR, then
  merge forward into active development.

The current `feature/fp002-interactive-runtime` branch should remain a feature
branch until reviewed and merged. Do not configure it as permanent production.
Require tests and review before merging to `main`; production should deploy only
from `main`. Roll back application code using Vercel's previous immutable
deployment, while evaluating database compatibility separately.

## 9. Domain and DNS plan

Do not guess record targets. Add the three domains to their intended Vercel
projects first, then apply exactly the DNS records Vercel supplies:

- `frangroove.com`: marketing deployment apex.
- `www.frangroove.com`: redirect to the apex marketing URL.
- `app.frangroove.com`: consultant application deployment.

Keep authoritative DNS at the chosen provider unless a nameserver migration is
separately approved. Preserve MX, SPF, DKIM, DMARC, and verification records.
Vercel provisions SSL after DNS validation. Validate apex, `www` redirect,
application TLS, cookie scope, auth redirects, and assessment links. Rollback is
to restore the recorded previous DNS values; account for TTL propagation.

Reference: https://vercel.com/docs/domains/working-with-domains

## 10. Google OAuth and email domain

After the final application domain is live, Google configuration will need the
exact production redirect URI, relevant authorized origins, homepage, privacy
policy, terms, verified domain, and consent-screen publishing/verification.
Do not change it during Preview setup. Production Gmail remains blocked until a
managed KMS/envelope-encryption implementation replaces the local AES key.

Consultant-connected Gmail is user-delegated sending and is separate from future
FranGroove transactional mail. Addresses such as `hello@frangroove.com` and
`support@frangroove.com` require a chosen mail provider plus MX. Transactional
delivery requires a provider and aligned SPF/DKIM; publish DMARC gradually after
observing reports. Domain application changes must not overwrite mail records.

## 11. AI-provider boundary

No OpenAI, Anthropic, Gemini, or other model API is currently called. Current
assessment analysis, demo intelligence, and recommendations are deterministic.
Future inference belongs behind a server-only `IntelligenceProvider` interface
with provider adapters, immutable prompt/model versions, input/output provenance,
tenant quotas, usage/cost metering, bounded retries, timeouts, audit events, and
an explicit deterministic fallback. Provider keys never enter browser bundles.

## 12. Observability and incident response

Start with Vercel deployment/function logs and Supabase database/Auth logs plus
budget alerts. Emit structured events for deployment SHA, route category,
correlation ID, tenant-safe identifiers, outcome, latency, and sanitized error
class. Monitor authentication, assessment save/complete, PDF generation,
database/RLS failures, Gmail delivery, and future provider failures.

Never log invitation/OAuth/access/refresh tokens, service-role keys, mailbox
content, full assessment answers, or sensitive financial values. Add a paid error
tracker only after native logs prove insufficient and data handling is reviewed.

Emergency response: disable the affected integration, roll back the immutable
application deployment when schema-compatible, revoke/rotate exposed credentials,
preserve sanitized evidence, restore data if necessary, validate tenant isolation,
and document the incident.

## 13. Production release and secret rotation

1. Promote only a green, reviewed SHA from `main`.
2. Run the Preview smoke suite against production-like non-production data.
3. Back up and apply reviewed migrations before code only when backward-compatible;
   otherwise use an expand/migrate/contract release sequence.
4. Configure Production-scoped environment variables and deploy.
5. Validate health, login, authorization denials, core workflow, PDFs, and logs.
6. Attach custom domains only after generated-hostname validation.
7. Rotate secrets one integration at a time: create replacement, deploy, verify,
   revoke old credential, and record completion. Database/service-role rotation
   requires coordinated Supabase and Vercel updates.

## 14. Expected costs and approval gate

Current public pricing lists Vercel Pro at approximately USD 20/month for one
deploying seat with usage credit, and Supabase Pro at approximately USD 25/month
before overages/add-ons. A business production baseline is therefore about USD
45/month, excluding domains already purchased, taxes, overages, additional
projects, email, KMS, and monitoring. A second paid Supabase project adds compute
cost; current Supabase guidance says additional default-compute projects start at
about USD 10/month within a paid organization. PITR currently starts near USD
100/month for seven-day retention. Verify pricing at approval time:

- https://vercel.com/pricing
- https://supabase.com/pricing

Optional future costs: transactional email, managed KMS, error tracking, AI model
usage, additional Vercel seats, Supabase Preview project/branching, PITR, and
extended log retention.

The next consequential action is to create one hosted Supabase Preview project.
That may start recurring billing depending on the selected organization/plan and
must not occur without explicit approval. Rollback is deletion of the empty
Preview project after exporting any needed configuration; project deletion is
destructive and also requires explicit approval.
