-- Keep event domains human-readable while retaining a constrained dotted name.
alter table private.domain_event_outbox
  drop constraint domain_event_outbox_event_type_check,
  add constraint domain_event_outbox_event_type_check
    check (event_type ~ '^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$');
