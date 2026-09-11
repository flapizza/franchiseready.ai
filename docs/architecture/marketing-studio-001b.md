# Marketing Studio 001B

Preview-only hosted integration of the 001A visual editor. V2 remains draft and
preview only; all existing V1 delivery and unsubscribe boundaries remain in place.
No Production operations, outbound email, scheduling, templates, remote image
imports, analytics expansion or Brand Presentation Studio are included.

## Media

`/api/marketing/media` resolves the authenticated active workspace before listing
or accepting uploads. Uploads require a matching public request origin, have a
streamed 3 MiB byte limit, and ignore filenames entirely. Sharp is an explicit,
pinned dependency at 0.35.4. MIME must match decoded JPEG/PNG/WebP, animated input
is rejected, edges are capped at 6000px and decoded pixels at 24 million. Sharp
applies orientation, strips metadata, resizes inside 1200px, re-encodes PNG and
generates a 240px thumbnail. No input URLs, SVG, data URLs or browser HTML are used.
The media route explicitly includes Sharp's platform binary and libvips packages
in its Next.js output trace so the hosted function retains native dependencies.

The server generates `organization/asset_id/1/variant` paths. Private originals
use `studio-originals` (3 MiB; JPEG/PNG/WebP); public normalized email/thumbnail
PNGs use `studio-delivery` (8 MiB; PNG only). Public delivery URLs intentionally
remain readable without a session for email compatibility. Metadata enumeration,
original downloads, editor lookup and insertion authorization remain tenant-scoped.
No authenticated client upload/update/delete or public-list policy is granted.
Private source download policy matches exact durable metadata and active tenant
membership, rather than trusting an organization path prefix.

Only the server's guarded upload path crosses the service-role boundary. The new
media table grants that role SELECT/INSERT only, with a private trigger checking
the active creator. Metadata includes tenant, creator, asset ID/version, source
and output MIME, dimensions, byte sizes, checksums, exact variant paths, status,
timestamps and default alt text. Placements own alt text, width/alignment and an
optional HTTPS destination. Replacement selects a different immutable asset;
existing published objects are never overwritten. Metadata versions cannot be
changed or deleted; archive status supports retaining historical references.

The library provides upload, thumbnails, reuse and placement replacement.
Authenticated editor image routes resolve metadata before redirecting to a stable
variant. The server email renderer receives only tenant-resolved media, uses the
same variants in desktop/mobile previews, and disables all preview links.

## Branding and persistence

Existing `organization_settings` and `consultant_profiles` remain authoritative
for company display name/website and consultant name/title/email/phone/LinkedIn/
scheduling links. The studio links to the existing profile settings editor.
New one-to-one branding tables add organization logo, controlled primary/accent
colors, default font and postal address, plus an optional own-consultant headshot.
Organization branding writes require owner/admin; headshot writes require the
active owning membership. Composite asset/organization foreign keys reject
cross-tenant branding references.

`resolveBranding` produces one validated snapshot for the studio, signature
insertion, compliance renderer and future presentation consumers. A campaign's
separate `branding_snapshot` is frozen when created/saved. Later settings changes
do not alter it. Explicit Refresh campaign branding updates governed defaults
and compliance for the next save; authored content remains under editor control.
Logo/headshot insertion uses snapshot asset IDs. Protected compliance content is
outside the editable document. Future delivery eligibility requires sender name,
professional email, company identity and postal address; V2 delivery is currently
blocked regardless of those fields.

The existing atomic save RPC retains revision/ownership/history checks and adds
the snapshot. A database trigger independently rejects foreign-tenant image and
branding references. V1 snapshots remain SQL NULL. There is no bulk conversion,
recipient snapshot rewrite, token change or consent/suppression change.

## Migrations and validation

- `20260911164031_marketing_studio_001a.sql`: reviewed 001A migration, unchanged.
- `20260911174034_marketing_studio_001b.sql`: media metadata, branding, snapshot
  constraints, tenant checks and original-object read policy.
- Storage buckets are configured through the Storage API, not table manipulation.
- Baseline fingerprints: `marketing-studio-001b-baseline.json`. Comparisons of
  pre-existing campaigns omit only the newly added NULL snapshot column.
- Local checks: `node scripts/local-marketing-media.mjs`,
  `node scripts/local-marketing-studio.mjs`, bounded-concurrency unit suite,
  TypeScript, ESLint, optimized build, pgTAP suites 015-019/026/027 and advisors.

Local release validation on 2026-09-11 passed: 304 unit/public-unsubscribe tests,
125 database assertions, 11 browser tests, TypeScript, ESLint, optimized builds,
and whitespace checks. Local security advisors reported no issues.

The local media runner derives loopback Docker ports and keys, clears external
provider credentials, creates synthetic confirmed local users without email and
configures only local buckets. Hosted acceptance must use Alex Morgan's existing
normal login and only synthetic new campaigns/media on `demo.frangroove.com`.
Deployment must be an exact committed-source export to the existing Preview
project. Local evidence and credentials are excluded from the uploaded source.

Implementation references: [Supabase Storage access model](https://supabase.com/docs/guides/storage/buckets/fundamentals)
and [Sharp input safeguards](https://sharp.pixelplumbing.com/api-constructor/).
