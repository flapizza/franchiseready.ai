# Email communications and engagement

The Communications feature owns candidate-related email messages, transport delivery results, tracked links, and recipient engagement events. Candidate ownership remains explicit on every message and event. Transport providers never own the CRM relationship.

## Domain and provider boundaries

`EmailMessage` records content, sender/recipients, candidate, optional thread and referral/brand context, tracking choices, and a stable idempotency key. `EmailDelivery` records transport attempts independently with `draft`, `queued`, `sending`, `sent`, `delivered`, or `failed`; opens and clicks are never delivery statuses. `EmailEngagementEvent` is append-only for opens, clicks, and replies and preserves provider event IDs for duplicate-webhook rejection. Repeated genuine events use distinct IDs and remain valid. `EmailLink` preserves the canonical destination rather than a rewritten tracking URL.

`EmailDeliveryService` is provider-neutral. `DemoEmailDeliveryService` records deterministic process-local delivery and explicitly marks `externallyDelivered: false`. Future Google Workspace and Microsoft 365 adapters will authorize the consultant's real sender identity via OAuth, then translate provider-specific message, delivery, webhook, and thread identifiers into these contracts. No provider credentials or connected-account claims exist in this pack.

The process-local overlay stores mutable demo messages/events with the existing CRM demo data and resets them through `/crm/test-reset`. Seeded histories demonstrate delivered/no-engagement, repeated opens plus clicks, and reply behavior. The authenticated, demo/test-only `/crm/test-email-engagement` endpoint simulates events and failures; production returns 404. Message lookup always requires the matching candidate. Send idempotency maps one request key to one canonical message. Failed messages retain their content and retry updates the same record.

## Interpretation and UI

Candidate 360 is the communication hub: compose uses the canonical consultant identity, history is newest-first, and message details derive first/last/count values outside JSX. The activity timeline aggregates repeated opens instead of hiding raw events or flooding the timeline. Engagement levels are deterministic and explainable: replies and clicks outweigh opens; a lone open is only a light signal. Email Engagement is behavioral evidence for momentum, Mission Control, and a consultant-controlled Next Best Action. It never changes AI Brand Match, Candidate Readiness, or pipeline lifecycle.

Open tracking is imperfect because privacy proxies, image blocking, caching, and provider behavior can create or suppress events. Tracking is configurable per message, and future settings should include connected account, authorized/default sender, signature, default open/link tracking, limits, templates, notification preferences, retention, and opt-out behavior. Legal review must address tracking pixels, link rewriting, disclosure/consent, privacy regimes, retention, and unsubscribe requirements; this architecture makes no legal conclusion.

Replies currently have a model/thread association and seeded evidence, not mailbox synchronization. A future drafting adapter can consume candidate lifecycle, recent evidence, and a communication goal; deterministic templates are never presented as live AI output.

Referral delivery and assessment invitations remain unchanged. Their future provider adapters should converge on Communications delivery/events while preserving referral or invitation IDs as related context. Longer term, the same candidate-owned history can feed a Unified Inbox spanning email, SMS, referrals, franchisor messages, and inbound conversations without forcing email-specific open/link concepts into generic channels. Stored events also preserve future analytics for delivery/open/click/reply rates, response timing, lifecycle-stage engagement, and pre-award behavior; no analytics dashboard is included now.
