# Calendar, meetings, and reminder architecture

FranGroove keeps three explicit aggregates. A `ConsultantTask` is work to perform, a `ConsultantCalendarEvent` is reserved time, and a `ConsultantReminder` is an in-product prompt referencing a stable task, event, or candidate ID. Transitions never cascade between aggregates. Post-meeting task creation remains a recommendation until the consultant invokes `TaskService`.

## Meeting lifecycle and provenance

Events move independently through `scheduled`, `completed`, `cancelled`, and `no-show`. Material lifecycle changes produce candidate activity; note edits do not. `source` records consultant, system, Discovery, Brand Presentation, Referral, Google Calendar, or Microsoft 365 provenance. Candidate linkage is optional and never embeds candidate data in the event.

`MeetingBriefService` is a read-model assembler. It reads canonical candidate intelligence, task state, and email engagement and produces a snapshot, changes, open questions, objectives, and suggested questions. It does not score brands, change readiness, advance lifecycle, or invent candidate facts.

## Time and persistence

All stored timestamps are ISO instants. `ConsultantTime` is the single consultant-local formatting and date-grouping boundary; the demo uses `America/New_York`. A durable implementation should source this IANA timezone from the consultant profile. Formatting occurs before Client Component hydration.

The demo repository merges deterministic seeds with the process-local overlay. Repository interfaces are the replacement seam for durable database adapters.

## External calendar adapters

Future Google Calendar and Microsoft 365 adapters map provider records into the canonical event. Adapter metadata should retain provider event ID, calendar/account ID, etag/version, recurrence identity, deleted state, meeting URL, and last-synced timestamp. Sync policy must define inbound/outbound direction, webhook replay and idempotency, conflict resolution using versions and explicit ownership, recurring-instance exceptions, deletions, and timezone changes. Provider objects must not become the domain model.

## Video meeting intelligence

Future Zoom, Google Meet, and Microsoft Teams adapters may ingest recordings and transcripts into attributable evidence. Derived summaries, sentiment, objections, buying signals, commitments, Discovery evidence, and draft notes must identify source segments and confidence and remain reviewable. Transcript intelligence may propose changes but must never silently mutate canonical Candidate Intelligence.
