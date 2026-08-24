# Google Workspace / Gmail integration architecture

Status: proposed architecture for the Gmail implementation packs. This document does not implement OAuth, persistence, synchronization, sending, or Google Cloud configuration.

## Decision summary

Gmail is the first adapter behind a provider-neutral email boundary. FranGroove owns canonical messages and evidence; Gmail owns mailbox transport, provider identifiers, and its history cursor. Production composition must be explicit and fail closed. It must never fall back to demo data after an authentication, database, token, or provider failure.

The connection foundation uses Google's server-side OAuth 2.0 authorization-code flow with offline access, a one-time state record, PKCE, and incremental authorization. GMAIL-001 asks only for `openid email profile` and `gmail.send`. The inbound synchronization pack adds `gmail.readonly` incrementally after its restricted-scope verification and security work is ready. `gmail.modify` is deferred until a user-visible mailbox-state feature exists. A connected account belongs to both an organization and the connecting organization membership, but mailbox authorization is owner-only; candidate visibility or manager hierarchy does not grant mailbox access.

Initial synchronization is deliberately bounded: 90 days, at most 2,000 message candidates inspected per account, and only messages that either match an exact email address of a candidate assigned to the account owner or belong to a thread already known to FranGroove. Messages that cannot be matched safely are not inserted into candidate communications. Their provider IDs may be retained in a short-lived, owner-only sync triage record so a later history event can be processed without repeatedly scanning the mailbox.

Refresh tokens are encrypted with envelope encryption before storage in a server-only credential table that has no browser-facing grants or ordinary Supabase client access. A managed KMS key is the preferred key-encryption key. Only narrowly scoped background/provider operations may cross the service-role boundary. Decrypted credentials live only in process memory for the duration of a provider call and are never logged.

## Existing repository assessment

The repository is ready for an adapter boundary but is not yet ready for real mailbox data.

- `AuthenticatedWorkspaceContext` is a server-only DAL that resolves the authenticated Supabase user, active organization, membership, reporting relationship, and capabilities. It correctly treats an organization identifier as a selection hint rather than authority.
- Supabase persistence packs 001 and 002 provide organization/membership tenancy, candidate assignment, RLS helpers, and an explicit `PERSISTENCE_MODE`. Candidate access currently includes manager descendants and owner/admin organization-wide visibility.
- `EmailMessage` already has a useful canonical nucleus: internal message ID, candidate and consultant IDs, optional thread ID, direction, sender/recipients, subject, one body representation, timestamps, provider message ID, delivery status/failure, tracking choices, links, business context, idempotency, and demo-delivery disclosure.
- `EmailDelivery` separates transport attempts from engagement, although production needs multiple durable attempts and more precise provider acceptance/error semantics.
- `EmailEngagementEvent` is append-oriented and supports provider-event deduplication, but it currently combines provider facts (`reply`) with FranGroove tracking (`open`, `link-click`) and other delivery/recipient outcomes.
- `DemoEmailRepository` combines seeded messages with a process-local overlay and provides message/event access, idempotency, and follow-up dismissal. It is a concrete class, not an interface.
- `EmailMessageService`, `EmailCommunicationRuntime`, `CommunicationsWorkspaceRuntime`, Candidate 360, Mission Control, meeting briefs, playbooks, task recommendations, and communication actions instantiate demo repositories directly. These composition points must be moved to a server-side factory/container before production use.
- Retry is safe for the deterministic demo because it updates one preserved message. A real provider retry needs a durable attempt record and a stable send operation key; ambiguous provider timeouts must reconcile before resending to avoid duplicates.
- `/crm/communications` and Candidate 360 consume local view models rather than Gmail objects. This is the right UI boundary and should be preserved.
- Playbook, Mission Control, and task intelligence consume derived email views/events, but several rules interpret opens and replies as one engagement stream. Those rules need evidence type and provenance awareness.
- Server actions validate form values and revalidate relevant pages, but their current authorization is demo-consultant identity. Production actions must resolve `AuthenticatedWorkspaceContext` and authorize account, candidate, and message ownership on every request.
- Route handlers exist for Supabase auth and test-only demo events. There is no OAuth/provider/webhook implementation or token material today.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and the documented persistence boundary already reserves service-role use for verified webhooks and controlled jobs. The admin client must not become a general communications repository.

### Required refactoring boundary

Use repository names consistent with existing features:

```text
CommunicationRepository (canonical persistence/query contract)
  |- DemoEmailRepository adapter
  `- SupabaseCommunicationRepository adapter

EmailProviderClient (provider operations for one connected account)
  `- GmailEmailProviderClient

EmailSyncService (orchestration: cursor -> provider changes -> normalization -> match -> persist)
EmailMessageService (authorization and send/reply use case)
CommunicationsEvidenceService (provider facts + tracking facts -> safe read models)
```

`EmailProviderClient` should expose only capabilities Gmail and foreseeable Microsoft Graph share: get account profile, list a bounded initial page/search, read a message, send a MIME message, send a reply in a provider conversation, read incremental changes, start/renew/stop a subscription, refresh authorization, and revoke/disconnect. Provider payload types stay inside the adapter. Do not force Gmail history IDs and Graph delta links into one typed value; store an opaque provider cursor plus provider-specific versioned metadata.

## OAuth and scopes

### Flow

Use a confidential web application's authorization-code flow. All authorization URL generation and token exchange occur on the server. The callback URI is an exact configured HTTPS URL such as `https://app.frangroove.com/api/integrations/google/callback`; localhost callback URIs are separate development credentials/configuration.

Although PKCE is most critical for public clients, use S256 PKCE as defense in depth if the selected Google library supports it cleanly. The client secret remains server-side. PKCE does not replace state, authenticated-session binding, or exact redirect-URI validation.

Use:

- `access_type=offline`, because history synchronization and watch renewal run without the consultant present;
- `include_granted_scopes=true`, following Google's incremental-authorization guidance;
- a cryptographically random, single-use state value bound to organization ID, membership ID, user ID, intended return path, PKCE verifier, creation time, and expiration;
- an authorization prompt that does not force consent on every connection. Google commonly returns a refresh token only on the first offline grant, so reconnect must preserve an existing refresh token if a successful token response omits a new one. A deliberate recovery flow may use renewed consent when the stored refresh token is absent or invalid.

### Scope decision

| Need | Scope | MVP decision |
| --- | --- | --- |
| Stable sign-in subject and account presentation | `openid`, `email`, `profile` | Request. Treat the OIDC `sub` as the provider account identifier; email is display/routing data and may change. |
| Read message metadata and bodies | `https://www.googleapis.com/auth/gmail.readonly` | Do not request in GMAIL-001. Add incrementally in the inbound synchronization pack. It is a restricted scope. |
| Send explicit consultant-authored mail | `https://www.googleapis.com/auth/gmail.send` | Request. It is a sensitive scope. |
| Mark read/unread, apply labels, archive, or otherwise change mailbox state | `https://www.googleapis.com/auth/gmail.modify` | Do not request for MVP. Add incrementally only with a shipped feature and replace redundant Gmail scopes where appropriate. It is restricted and also permits read/compose/send. |
| Permanent deletion | `https://mail.google.com/` | Never request for the planned product. |

`gmail.metadata` cannot supply bodies and therefore cannot meet the synchronization objective. `gmail.compose` is more permission than direct send requires. Account identity could also be observed through Gmail `users.getProfile`, but OIDC identity provides the stable subject needed to distinguish an account from its mutable email address.

The callback must persist the scopes actually granted, not merely those requested. GMAIL-001 connection readiness requires identity and send scopes; the later inbound-sync capability separately requires read scope. Partial consent results in `action-required` with a precise explanation, not a nominally connected account that fails later.

### Verification and Workspace organizations

`gmail.readonly` is a restricted scope. A public external app needs Google's OAuth verification for requested sensitive/restricted scopes. Because FranGroove will transmit or store restricted Gmail data on its servers, plan for Google's restricted-scope security assessment in addition to consent-screen/domain/policy verification. This work is a release dependency, not a last-week deployment task.

An app configured as Internal can be limited to users in one Google Workspace organization and may have different verification exposure, but that is not a valid assumption for a multi-customer FranGroove SaaS. Workspace administrators can restrict third-party apps/scopes, enforce session-control policies that invalidate refresh credentials, or block Pub/Sub IAM sharing. Surface these as administrator/action-required states. Do not use domain-wide delegation for the consultant-owned MVP.

## Connected account and authorization model

One membership may own many accounts. One provider identity may be connected only once per FranGroove organization unless a future explicit shared-account policy changes that rule.

`ConnectedEmailAccount` should include:

- internal ID and public ID;
- `organization_id` and `owner_membership_id` (same-organization composite foreign key);
- provider enum (`google`; later `microsoft`);
- immutable provider account ID (`sub` for Google), normalized current email, display name, optional hosted domain;
- status: `pending`, `connected`, `action-required`, `sync-error`, `revoked`, or `disconnected`;
- granted scopes and provider capability flags;
- token metadata only: expiry, credential version, encryption key version, last refresh time (never plaintext token values);
- opaque sync cursor, cursor acquisition time, initial-sync boundary/configuration, last attempted/successful sync, and last reconciliation;
- subscription/watch provider ID if any, expiration, last renewal attempt/success, and last notification time;
- sanitized error code/category, first/last occurrence, retry time, and correlation ID (never tokens, message bodies, or raw provider errors that may contain sensitive data);
- connected, created, updated, revoked, and disconnected timestamps.

Authorization is the intersection of four checks:

```text
authenticated user -> active organization membership -> owns connected account
                                                    -> may access candidate
canonical communication -> same organization + same connected account + allowed candidate association
```

Ordinary connected-account rows and messages may be queried through user-scoped Supabase clients under owner-only mailbox policies. Candidate RLS alone is insufficient: a manager who may view a consultant's candidate does not thereby gain access to the consultant's mailbox or message body. Owner/admin roles likewise receive no implicit mailbox access. A future manager visibility feature requires explicit policy, auditable consent/scope, redaction rules, and separate body/metadata permissions.

System webhook and scheduled-sync code may use service-role access only after authenticating the provider event and resolving an exact active account. The operation must remain account-scoped and auditable. Never accept organization, membership, account, candidate, or cursor authority from an unverified webhook payload.

## Token security

Use Postgres for the account lifecycle and an isolated credential table for encrypted token envelopes. Use application-level envelope encryption:

1. Generate a unique data-encryption key per credential version and encrypt access/refresh tokens with an authenticated cipher such as AES-256-GCM, using account/provider/version as authenticated context.
2. Wrap that data key with a managed KMS key outside the database. Store ciphertext, nonce, authentication tag, wrapped key, algorithm, and key version—not plaintext or the KMS key—in Postgres.
3. Give the runtime identity only KMS unwrap permission and only in server/background environments that perform provider calls. Keep OAuth client secrets and KMS configuration in the deployment secret manager.
4. Make the credential table inaccessible to `anon` and `authenticated`; expose no normal PostgREST select/RPC that returns token material. A narrowly scoped server module marked `server-only` is the sole decrypting boundary.

This is preferred over storing raw tokens in Supabase Vault or a generic secret manager entry per user. Per-account secret-manager objects can work, but complicate transactional lifecycle, indexing, backup/restore, and high-volume refresh. Database ciphertext provides transactional linkage while KMS keeps the decrypting authority outside a database dump. Supabase Vault may be reevaluated if its operational key custody and access boundary meet the same requirements, but it must not result in credentials readable through ordinary SQL roles.

Additional controls:

- never serialize tokens into Server Component props, Client Components, action return values, cookies, demo overlays, analytics, traces, errors, or logs;
- redact authorization headers, OAuth query codes, raw token responses, MIME/body data, and provider error bodies in observability;
- prefer short-lived access tokens; update encrypted access token and expiry atomically after refresh, and retain the old refresh token when Google omits a replacement;
- serialize refreshes per account to avoid token races; optimistic credential versioning prevents stale writers;
- rotate the KMS key by rewrapping data keys and record key version; rotate individual data keys on reconnect or suspected compromise;
- on `invalid_grant`, revoked authorization, Workspace session-policy failure, or repeated 401 after one refresh, stop provider calls, mark `action-required`/`revoked`, stop the watch where possible, and ask the owner to reconnect;
- on disconnect, attempt Google's revocation endpoint, call Gmail `stop` best-effort, destroy token ciphertext/data keys, mark the account disconnected, and retain canonical communications according to the product retention policy. Do not silently delete business records.

## OAuth route/action design

Conceptual server endpoints:

1. `POST /api/integrations/google/connect`: require authenticated workspace context, create an expiring one-time OAuth transaction, generate PKCE/state, and redirect to Google.
2. `GET /api/integrations/google/callback`: require the same authenticated user/session; consume and validate state and PKCE; handle `error=access_denied`; exchange the code server-to-server; validate ID-token issuer, audience, expiry, nonce if used, and stable subject; inspect granted scopes; fetch/confirm Gmail profile; then upsert the account and encrypted credentials transactionally.
3. Queue initial sync and watch establishment after the account commit. Redirect to a settings result page with a non-sensitive result code. Do not perform a potentially long mailbox sync inside the callback request.
4. `POST /api/integrations/email/accounts/{publicId}/reconnect`: owner-only, starts a fresh OAuth transaction and preserves canonical account identity/history when the provider subject matches.
5. `POST /api/integrations/email/accounts/{publicId}/disconnect`: owner-only, revokes/stops best-effort, destroys credentials, and changes lifecycle state.

Reject expired/reused/mismatched state, changed user or membership, callback host mismatch, duplicate provider identity owned by another membership, and returned provider subject mismatch. A duplicate owned by the same membership becomes an idempotent reconnect after explicit confirmation; it must not create a second cursor or watch. If the user selects a different Google account during reconnect, present an account-mismatch error and require a new "connect another account" flow.

## Initial synchronization

Do not import a lifetime mailbox. For Gmail MVP:

- establish a consistent starting point by recording the mailbox profile/history ID around the initial-sync operation;
- search a rolling 90-day window in bounded pages, with a hard ceiling of 2,000 message IDs inspected per connection attempt;
- use exact normalized candidate email addresses for candidates currently assigned to the account owner, plus provider thread IDs already associated with that account;
- fetch full messages only for search results that meet those coarse criteria; normalize and rerun authoritative matching before persistence;
- import the complete messages in an accepted thread only within the 90-day window and only when every persisted candidate association remains explainable;
- exclude spam/trash by default and do not download attachment bytes in MVP;
- checkpoint pages and make all upserts idempotent by `(connected_account_id, provider_message_id)`;
- after the bounded scan, process history from the recorded starting cursor to close the race, then set the durable cursor to the newest completely processed history ID.

If the cap is reached, mark the sync `partial` and tell the owner; do not silently broaden the window. A future owner-initiated backfill can select a date range or candidate.

### Candidate matching

Use ranked, recorded evidence—not fuzzy names:

1. Existing mapping of `(connected_account_id, provider_thread_id)` to exactly one candidate: authoritative unless the message participants demonstrate a conflict requiring review.
2. Internet `In-Reply-To`/`References` or provider thread association to an existing FranGroove-originated canonical message: authoritative.
3. Exact, case-insensitive normalized mailbox participant address matching exactly one candidate visible to and assigned to the account owner: acceptable, with evidence `exact-candidate-email`.

Ignore the connected account's own address and known send-as aliases when matching. Do not infer identity from display name, subject, signature, or content. If zero candidates match, keep the message out of candidate communications. If multiple candidates share the address or different evidence points to different candidates, create an owner-only, metadata-minimized review item; do not attach the message automatically. Persist match method, matched address/reference, matcher version, timestamp, and whether the association was automatic or human-confirmed. Reassignment does not transfer mailbox ownership or automatically reveal the historical body to a new assignee; that needs a deliberate communication-sharing policy.

## Canonical communication model

Retain the existing internal message ID, candidate association, direction, identities/recipients, subject, business references, idempotency intent, link relationship, and provider-neutral view-model concept. Evolve the model before production:

- add `organization_id`, `connected_email_account_id`, owner membership/provenance, provider enum, provider message ID, and provider thread/conversation ID;
- distinguish the internal canonical thread ID from the provider thread ID;
- store Internet `Message-ID`, `In-Reply-To`, and ordered `References` separately from provider IDs;
- allow candidate association to be nullable until safely matched, with match evidence/status in a separate association/review record;
- represent `from`, `reply-to`, `to`, `cc`, and `bcc` without requiring names; normalize addresses for matching while preserving display values;
- store both sanitized text and sanitized HTML when available, plus body availability/truncation and original MIME metadata. Render sanitized HTML only; never inject provider HTML directly;
- distinguish provider internal date, header sent date, received/imported time, canonical created time, last synchronized time, and deletion/tombstone time;
- add attachment metadata (provider attachment ID, filename, MIME type, size, inline/content ID, disposition, retrieval status) without downloading bytes for MVP;
- record source (`gmail-sync`, `gmail-send`, `demo`, later `microsoft-sync`), ingestion operation ID, normalization version, and provider raw-payload retention decision;
- replace mandatory `sendIdempotencyKey` with nullable outbound send-operation linkage for inbound messages;
- replace ambiguous `externallyDelivered` with environment/source presentation plus factual send state.

Do not persist full raw Gmail API JSON indefinitely. Retain the minimum canonical fields and, only when operationally necessary, an encrypted short-lived raw MIME/debug object under a documented retention policy.

### Delivery and evidence semantics

`messages.send` success means Gmail accepted the send request and returned a message resource; it does not prove recipient delivery or open. Production delivery attempts should use states such as `pending`, `submitting`, `provider-accepted`, `failed-retryable`, `failed-terminal`, and `unknown-reconcile`. Bounce/complaint evidence may arrive as mailbox messages and is not guaranteed structured Gmail delivery telemetry.

Split evidence into:

- provider facts: outbound accepted/sent, inbound received, provider thread activity/reply, labels/state if requested later, and observed bounce-like system messages with an explicit confidence/source;
- FranGroove tracking: tracked-link redirects/clicks, optional future tracking-pixel loads, unsubscribes collected by FranGroove, and scoring derived from those facts.

Gmail does not tell FranGroove that a recipient opened a message. Never translate Gmail read/unread labels into recipient opens. Existing demo opens remain clearly demo tracking facts. Production UI and intelligence should say `Reply received`, `Link clicked`, or `No tracked engagement`; it must not imply "not opened" when tracking is disabled or unavailable. Open tracking, if ever added, is probabilistic and should be labeled accordingly.

## Outbound send and reply

The consultant remains in control:

```text
authenticated consultant drafts -> explicit Send -> authorize candidate + owned account
-> create durable send operation/idempotency key -> build RFC-compliant MIME
-> Gmail adapter messages.send -> persist provider IDs + canonical message/attempt
-> canonical repository feeds Unified Communications
```

No playbook or intelligence service may call send automatically. They may recommend or prefill a draft, but only the consultant's explicit send action submits it.

Build MIME server-side, including From/send-as validation, To/Cc/Bcc, Subject, Date, generated Internet `Message-ID`, correct charset and line endings, and multipart/alternative text+HTML when HTML is supported. Base64url-encode the complete MIME in Gmail's `Message.raw`. Validate size and recipient limits before submission.

For replies, use the same connected account, set Gmail `threadId`, preserve a matching subject, and set RFC-compliant `In-Reply-To` and `References` from the target canonical message. Gmail requires all three conditions for reliable placement in an existing thread. Record the returned Gmail message ID and thread ID.

A transport timeout after submission is ambiguous. Mark the attempt `unknown-reconcile`, search/reconcile by the generated Internet `Message-ID` or a private correlation header where supported, and only retry once non-acceptance is established. Exponential backoff with jitter applies to 429/5xx responses and honors retry guidance; authorization and validation failures are terminal/action-required, not blind retries.

## Inbound history synchronization

Push is a wake-up signal, not the email event:

```text
authenticated Pub/Sub notification -> resolve account by normalized email/provider
-> coalesce/enqueue account sync -> lock one cursor processor per account
-> Gmail history.list from durable cursor -> fetch changed messages
-> normalize -> match candidate -> idempotent canonical upsert
-> emit canonical communication evidence -> commit newest fully processed cursor
```

Notifications can be duplicated, delayed, dropped, or arrive out of order. Acknowledge quickly after durable enqueue/coalescing, not after doing Gmail work in the webhook. Compare notification history IDs only as opaque decimal identifiers supported by the Gmail API; never advance the durable cursor merely because a notification contains a newer value. Follow `nextPageToken` until the history range is complete, fetch current message state as needed, and advance cursor in the same transaction/checkpoint as successful canonical writes.

If `history.list` returns 404 because the cursor is outside Gmail's available history range, run bounded reconciliation using the same 90-day/candidate/thread policy rather than a lifetime full import, then install a fresh cursor. Also run periodic reconciliation when no notification has arrived within an expected interval.

Serialize sync per account with a lease, make message/event writes idempotent, cap concurrency per Gmail user, and use exponential backoff with jitter for retryable errors. Respect Gmail's per-project and per-user quota units, fetch metadata before bodies where useful, batch/coalesce notifications, and monitor 401/403/404/429/5xx separately.

## Gmail watch and Cloud Pub/Sub

External Google Cloud setup required outside FranGroove:

- enable Gmail API and Cloud Pub/Sub in the same Google Cloud project used for the watch request;
- create a topic whose project ID exactly matches the project executing `users.watch`;
- grant `gmail-api-push@system.gserviceaccount.com` publish permission on the topic (Workspace domain-restricted sharing may require an exception);
- create a push subscription to the public HTTPS FranGroove webhook;
- enable authenticated push with a dedicated service account and configure its OIDC audience;
- grant the Pub/Sub service agent the required token-creation permission and configure dead-letter/retry/retention/monitoring policies.

The webhook validates the Google-signed JWT signature and expiry plus exact audience, issuer, expected push service-account email, and `email_verified`; validates the expected subscription resource; bounds the request body; decodes the base64url payload; and maps `emailAddress` to exactly one active connected account. A secret URL token may be additional defense but is not a substitute for OIDC verification.

After initial synchronization, call `users.watch`, persist its returned `historyId` and expiration, and process the immediate notification idempotently. Gmail requires renewal at least every seven days and recommends daily renewal. Schedule daily renewals with jitter, alert before expiration, and retain the prior cursor across renewal. On disconnect, call `users.stop` best-effort. If renewal fails, retain canonical data, mark watch health degraded, retry appropriately, and use scheduled history polling/reconciliation until recovered.

## Product integration

### Unified Communications and Candidate 360

Both demo and production repositories return the same canonical query/read models. `/crm/communications` receives no Gmail resources and needs no Gmail-specific module. Candidate 360 obtains associated messages through the same `CommunicationRepository`. Provider badges/account selectors may be added to neutral view models, but provider logic stays server-side.

Production composition is explicit, for example `COMMUNICATION_MODE=demo|google` (or a provider-neutral `COMMUNICATION_MODE=demo|connected` with enabled providers). It must be compatible with `PERSISTENCE_MODE`:

- local/E2E: `PERSISTENCE_MODE=demo`, `COMMUNICATION_MODE=demo`, existing deterministic repository;
- production: `PERSISTENCE_MODE=supabase`, `COMMUNICATION_MODE=connected`, Supabase canonical repository and configured adapters;
- invalid combinations fail at startup/composition. Provider/database errors fail visibly and never select demo fixtures.

Existing E2E tests remain on the deterministic adapter with no Google credentials or network. Contract tests run against both repository adapters. Gmail adapter tests use recorded/redacted fixtures or an HTTP fake; a small opt-in integration suite uses a dedicated test account and is excluded from default E2E.

### Playbook, Mission Control, and tasks

Introduce a canonical `CommunicationEvidence` projection containing evidence kind, subject/message/thread reference, occurred time, source, confidence, tracking availability, and candidate-match provenance. Playbook, Mission Control, meeting briefs, and task recommendations consume this projection rather than `EmailEngagementEvent` or Gmail payloads.

Reply/thread activity is strong provider evidence. Tracked clicks are FranGroove facts. Opens are absent unless independently tracked and must carry availability/confidence. Cadence logic should use outbound provider-accepted timestamps and inbound reply timestamps, not Gmail read state. Recommendations may create consultant-controlled tasks or drafts; they never send.

## Microsoft 365 compatibility

The boundary deliberately shares only proven concepts: delegated connected account, provider account identity and scopes, encrypted refresh credentials, canonical message/recipients/MIME headers, provider message and conversation IDs, opaque incremental cursor, renewable subscription, webhook-triggered fetch, idempotent normalization, and provider error/capability mapping.

Microsoft Graph later maps Gmail history to per-folder delta links and Gmail watch to Graph change-notification subscriptions/lifecycle events. Graph `conversationId` is not assumed identical to Gmail `threadId`; Graph delta links are opaque URLs rather than numeric history IDs; subscription lifetimes/security differ. Therefore cursor and subscription metadata stay provider-owned, while messages and evidence remain canonical. This pack does not design Microsoft OAuth or permissions.

## Proposed persistence impact

No migrations are part of this architecture pack.

### Gmail MVP

| Table | Purpose and principal relationships |
| --- | --- |
| `connected_email_accounts` | Belongs to organization and owner membership; provider identity, email/display metadata, lifecycle, granted scopes/capabilities, sanitized health, timestamps. Unique `(organization_id, provider, provider_account_id)`. |
| `connected_email_credentials` | One or versioned one-to-many per account; encrypted token envelopes and expiry/key metadata. No `anon`/`authenticated` grants; service boundary only. |
| `email_sync_states` | One active state per account/provider stream; opaque cursor, initial boundary/cap, lease/checkpoint, sync/reconciliation times and sanitized errors. |
| `email_provider_subscriptions` | Account watch/subscription identity, topic/config version, expiration, renewal and notification health. No token material. |
| `email_messages` | Canonical message; organization/account, nullable candidate, canonical/provider thread IDs, provider/Internet IDs, direction, headers/body boundary, timestamps, state/provenance. Unique provider message per account and outbound idempotency operation. |
| `email_recipients` | Normalized one-to-many `from`/`reply-to`/`to`/`cc`/`bcc`, preserving display values and order. Warranted because matching and multi-recipient queries are security/business operations. |
| `email_delivery_attempts` | Durable outbound attempt lifecycle, provider response IDs, sanitized error/retry state, and ambiguous-send reconciliation. |
| `email_attachments` | Metadata only for MVP; belongs to message/account/org, with provider attachment locator and no downloaded bytes. |
| `communication_evidence` | Canonical provider/tracking facts with provenance and deduplication key; replaces misleading mixed semantics over time. |
| `email_candidate_match_reviews` | Owner-only minimized unmatched/ambiguous evidence and resolution audit; may be implemented as status/evidence columns plus a review table. |

Every communication child carries or enforces organization/account consistency through composite foreign keys. Message RLS requires owner mailbox access in addition to any candidate rule. Background writes use narrowly scoped, audited service operations.

### Future enhancements

- downloaded attachment objects, malware scanning, retention/deletion workflows;
- explicit mailbox sharing/delegation and separate body-versus-metadata policy;
- tracked-link/open infrastructure and consent/privacy controls;
- user-selected backfill jobs, aliases/send-as identities, draft synchronization;
- provider-neutral conversation table if cross-channel conversation requirements become concrete;
- Microsoft account/provider tables reuse the same roots while retaining Graph-specific cursor/subscription metadata.

## IFPG demonstration recommendation

Keep the primary scripted IFPG story on deterministic demo communications. It protects timing, candidate narrative, privacy, and the existing E2E contract from conference Wi-Fi, session expiry, consent prompts, mailbox noise, and provider availability.

Maintain a separate dedicated Google Workspace demo account with synthetic contacts and no real customer data. If connectivity and watch health pass a pre-demo check, show one short optional proof: connected-account status and one explicit send/reply round trip. Never reconnect OAuth live as part of the main script. Have screenshots or a short recording as fallback, and reset/revoke the demo account after the event according to an operations checklist.

## Implementation packs

Each pack must keep explicit demo composition and leave the application buildable.

1. **GMAIL-001 — Send-only account foundation and OAuth.** Add account/credential and OAuth-transaction schemas with owner-only authorization; server-only encrypted credential boundary; connect/callback/reconnect/disconnect routes; minimal provider-neutral connection contracts; settings UI and fake-provider tests. Request identity plus `gmail.send`; no mailbox read or sync yet.
2. **GMAIL-002 — Explicit outbound send and reply.** Add the minimum canonical outbound message/recipient/delivery-attempt persistence, account selection, durable send operations, RFC MIME builder, Gmail send/reply adapter, threading headers, ambiguous-send reconciliation, retry policy, and fake/integration tests. No automated playbook send.
3. **GMAIL-003 — Canonical inbound persistence and bounded initial sync.** Add attachment metadata, candidate-match and evidence persistence; request `gmail.readonly` incrementally; add Gmail normalization, 90-day/cap initial sync, exact matching and review states, and repository contract/security tests.
4. **GMAIL-004 — Inbound history, Pub/Sub, and watch lifecycle.** Authenticated webhook, durable enqueue/coalescing, history processor, account leases, daily watch renewal, cursor-404 bounded reconciliation, polling fallback, quotas/health/operations documentation, and replay/idempotency tests.
5. **GMAIL-005 — Production read-model integration.** Replace direct demo construction with explicit composition; feed Unified Communications and Candidate 360 from canonical repositories; introduce provenance-aware evidence for Playbook, Mission Control, meeting briefs, and tasks; preserve provider-independent E2E and prohibit production demo fallback.

The account/credential foundation precedes send. GMAIL-002 adds only the canonical persistence required for durable outbound idempotency and provider identifiers. Restricted read access is delayed until GMAIL-003, when the product can immediately use it. Push follows initial sync so it can reuse a proven cursor processor.

## Operational acceptance gates

Before public Gmail rollout:

- OAuth consent/brand/scopes are verified and the restricted-scope security assessment is complete where required;
- production redirect URIs, Cloud project, topic, authenticated subscription, IAM, daily watch renewal, dead-letter handling, and alerts are configured;
- token redaction and envelope-key rotation are tested; credential tables are inaccessible to browser roles;
- negative tenancy tests prove another consultant, manager, owner, and admin cannot read mailbox/account/body data without an explicit mailbox policy;
- history replay, duplicate/out-of-order push, 404 reconciliation, refresh races, `invalid_grant`, quotas, ambiguous sends, disconnect, and revoked access are tested;
- retention, export, deletion, privacy policy, and incident response cover canonical mail content and credential compromise.

## Sources consulted

Primary Google documentation, reviewed 2026-08-24:

- [OAuth 2.0 for web server applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OAuth 2.0 overview and refresh-token expiration](https://developers.google.com/identity/protocols/oauth2)
- [Gmail server-side authorization](https://developers.google.com/workspace/gmail/api/auth/web-server)
- [Gmail API scopes and verification classes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Google Workspace API user data and developer policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)
- [Create and send Gmail messages](https://developers.google.com/workspace/gmail/api/guides/sending)
- [Gmail thread requirements](https://developers.google.com/workspace/gmail/api/guides/threads)
- [Synchronize Gmail clients](https://developers.google.com/workspace/gmail/api/guides/sync)
- [Configure Gmail push notifications](https://developers.google.com/workspace/gmail/api/guides/push)
- [Gmail `users.watch` reference](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch)
- [Gmail API usage limits](https://developers.google.com/workspace/gmail/api/reference/quota)
- [Gmail API error handling](https://developers.google.com/workspace/gmail/api/guides/handle-errors)
- [Authenticate Cloud Pub/Sub push requests](https://cloud.google.com/pubsub/docs/authenticate-push-subscriptions)

Compatibility references, not a Microsoft implementation design:

- [Microsoft Graph message delta query](https://learn.microsoft.com/en-us/graph/delta-query-messages)
- [Microsoft Graph change-notification lifecycle events](https://learn.microsoft.com/en-us/graph/change-notifications-lifecycle-events)
- [Microsoft Graph message resource retrieval and MIME](https://learn.microsoft.com/en-us/graph/api/message-get?view=graph-rest-1.0)
