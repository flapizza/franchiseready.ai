# Marketing Studio 001A

001A introduces visual campaign drafts and previews. It does not activate V2
delivery, hosted migrations, image uploads, Storage, templates, scheduling, AI,
or test-email sending. The certified showroom remains on its existing deployment.

## Document and editor

Tiptap/ProseMirror packages are pinned to 3.31.3. The React package supports React
19, and the implementation is built against React 19.2.4 / Next.js 16.2.12.
`CampaignEditor` lazy-loads the studio inside a Client Component. Tiptap uses
`immediatelyRender: false`; no editor instance crosses the server boundary.

`studio/document.ts` owns the strict V2 contract. It is a versioned JSON envelope
with a theme and a constrained document. Tiptap JSON is accepted only if it
matches that contract. Supported content includes paragraphs, three heading
levels, line breaks, non-nested lists, formatting marks, typed merge fields,
buttons, dividers, spacers, signatures, image references and image/text rows.
The image/text row has exactly one image followed by one text column.

Font identifiers map to Arial, Verdana, Tahoma, Trebuchet, Georgia and Times
fallback stacks. Sizes are 14, 16, 18, 20, 24, 28, 32 and 36px; the body default
is 16px. Text colors come from a fixed palette. There is no arbitrary CSS field.
Limits include 100 top-level blocks, 256 KiB serialized JSON, bounded inline/list
arrays, and a traversal depth/node budget before validation. Invalid edits remain
visible for correction/undo and cannot be saved or previewed.

Pasting deliberately inserts plain text and explains the formatting reset. HTML
fallback paste removes active elements before extracting text. File/HTML drop
import is blocked. Image placeholders carry asset reference, alt text, width,
alignment and optional HTTPS destination, with property/removal controls. Media
selection and replacement are explicitly forthcoming. There is no upload route,
base64 adapter, external-image fetch, or asset persistence.

## Rendering and preview

`studio/render.ts` is a pure renderer invoked through the workspace-authorized
`previewStudioAction`. It validates again, escapes text and personalization, and
maps nodes to fixed HTML templates with inline styles. It never reads browser
HTML or calls Tiptap's HTML exporter. No React Email or sanitizer dependency is
needed for these fixed templates: the accepted inputs cannot contain markup,
CSS or unvalidated attributes. Text output is a separate document walk.

The HTML uses a fluid 600px container, presentation tables, a fixed responsive
rule for stacking image/text columns, and a conditional Outlook width wrapper.
Output is limited to 100,000 bytes. Fonts use the same fallback stacks as the
editor. These are browser previews, not a certification of all mailbox clients.

Compliance context is supplied separately from editable content: sender,
postal address and unsubscribe URL are required by the renderer. The preview
action supplies representative recipient data and a clearly labeled postal
address placeholder. A sandboxed iframe with restrictive CSP displays the server
output. Preview rendering replaces anchors with inert spans, so unsubscribe and
other destination links cannot execute. A stale preview is explicitly labeled.
Non-preview image rendering fails until an authorized media resolver exists.

V2 remains blocked at server save validation (draft only), delivery repository
entry points, worker rendering dispatch, and the database V2 draft constraint.
No V2 provider submissions, send-run changes, or unsubscribe-architecture changes
are part of this pack. The legacy renderer is unchanged.

## Persistence and legacy history

`20260911164031_marketing_studio_001a.sql` is additive and is tested locally only.
Do not deploy this application change to a database lacking that migration.
It allows V2 JSONB drafts, embeds the same JSON Schema generated from Zod, and
adds an atomic save RPC. A unit test checks the embedded schema against the
application schema to prevent divergence. It uses the existing local
`pg_jsonschema` extension; hosted extension availability must be checked during
the separately authorized hosted integration checkpoint.

Existing campaigns are not converted or rewritten. Supported V1 campaigns keep
the classic editor. Unknown versions/documents display read-only recovery JSON.
The explicit visual-copy action reads the saved V1 record and creates a separate
V2 draft, preserving its envelope/audience and content. HTTP-only legacy CTAs
block conversion with an explanation rather than being silently upgraded or
discarded. V1 footer copy becomes ordinary text; protected compliance is added
separately. Template/media/brand snapshots for future V2 sends are deferred.

Sent/sending content is read-only in the UI, actions, repositories and a database
trigger. Authenticated direct UPDATE privilege is revoked; edits go through the
save RPC with an expected `updated_at` revision. The RPC locks the campaign,
checks active tenant membership and creator ownership, rejects sent/sending
campaigns, and compares revisions atomically. The trigger advances revisions
monotonically and permits delivery status progression without permitting content
changes. Duplication creates an independent draft. Demo sends also freeze their
content and transition the source into read-only history.

The migration changes neither existing recipient snapshots nor provider events,
consent state or unsubscribe tokens. No immutable V2 sent-payload table is added
because V2 delivery is outside 001A.

## Audience authorization

`private.campaign_audience_contacts` now explicitly applies
`can_view_membership(assigned_membership_id)` in addition to organization and
archive checks. Both the invoker preview and the existing security-definer send
confirmation use this helper. The explicit membership predicate remains effective
inside the definer boundary. Preview's eligible count uses normalized distinct
emails over the full authorized population. Historical recipients remain fixed.

## Validation

- `node --experimental-strip-types --test-concurrency=1 --test tests/unit/*.test.mjs`:
  editor contract/rendering/persistence tests and existing suites. Bounded
  concurrency avoids exhausting local memory when running the full suite.
- `npx tsc --noEmit`, `npm run lint`, `git diff --check`.
- `node scripts/local-marketing-studio.mjs`: optimized build and focused browser
  tests. The runner overrides hosted credentials, forces local demo composition,
  clears delivery secrets, and binds the test server to loopback.
- `node scripts/local-marketing-studio-persistence.mjs`: optimized Supabase-mode
  build and real repository save/reload plus provider-unavailable browser checks.
  The runner verifies the local Docker API port, uses local-only credentials,
  creates confirmed test users without sending email, and clears provider secrets.
- Local rollback-only pgTAP suites 015–019 and
  `026_marketing_studio_001a.test.sql`: V2 validation, revision conflicts,
  cross-tenant/inactive-member denial, sent-history protection, and list/segment
  preview versus confirmation under ordinary-consultant authorization.
- Browser coverage includes desktop and 390px editing, formatting/fonts, node
  properties, hostile paste, inert preview links, stacked columns, duplicate,
  V1 conversion, stale tabs, lists/history, and existing simulated V1 delivery.

Local screenshots are written under `.next-dev/marketing-studio-001a/`.
These tests send no external email. The V1 delivery browser regression uses only
the local simulated provider and local unsubscribe state.

Verified locally on 2026-09-11: 288 unit tests, eight focused demo browser tests,
two Supabase-mode browser tests, and 111 database assertions across suites
015-019 and 026 passed. Optimized builds passed in demo and local Supabase modes,
including TypeScript compilation. Browser checks cover 390px mobile without
horizontal overflow and preservation of successive inserted blocks after reload.

The dependency audit reports pre-existing findings in unchanged Next.js 16.2.12,
Sharp, PostCSS and Nano ID packages. No Tiptap findings were reported. Remediating
the existing framework dependency baseline is a separate checkpoint; this pack
does not imply production security certification or mailbox-client certification.
