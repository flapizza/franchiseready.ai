export type DiscoveryEventType =
  | "leadership"
  | "financial"
  | "buying-signal"
  | "risk"
  | "family"
  | "motivation";

export interface DiscoveryEvent {
  id: string;

  occurredAt: string;

  type: DiscoveryEventType;

  title: string;

  description: string;

  readinessDelta: number;

  confidenceDelta: number;
}