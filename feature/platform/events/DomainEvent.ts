import type { PlatformEventType } from "./PlatformEvents";

export interface DomainEvent {
  id: string;

  type: PlatformEventType;

  occurredAt: string;
}