import type { DomainEvent } from "../events/DomainEvent";

export type EventHandler<
  T extends DomainEvent = DomainEvent,
> = (event: T) => void;