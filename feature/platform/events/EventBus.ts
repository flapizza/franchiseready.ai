import type { DomainEvent } from "./DomainEvent";

import type { EventHandler } from "../types/EventHandler";

export class EventBus {
  private readonly handlers =
    new Map<
      string,
      EventHandler[]
    >();

  public subscribe<
    T extends DomainEvent,
  >(
    type: T["type"],
    handler: EventHandler<T>,
  ): void {
    const handlers =
      this.handlers.get(type) ?? [];

    handlers.push(
      handler as EventHandler,
    );

    this.handlers.set(
      type,
      handlers,
    );
  }

  public publish<
    T extends DomainEvent,
  >(
    event: T,
  ): void {
    const handlers =
      this.handlers.get(
        event.type,
      ) ?? [];

    handlers.forEach((handler) =>
      handler(event),
    );
  }
}