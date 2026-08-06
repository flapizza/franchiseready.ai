import type { DiscoveryEvent } from "../models/DiscoveryEvent";

export class DiscoveryEventEngine {
  public leadership(): DiscoveryEvent {
    return {
      id: crypto.randomUUID(),

      occurredAt: new Date().toISOString(),

      type: "leadership",

      title: "Leadership Confirmed",

      description:
        "Candidate demonstrated executive leadership experience.",

      readinessDelta: 3,

      confidenceDelta: 2,
    };
  }

  public buyingSignal(): DiscoveryEvent {
    return {
      id: crypto.randomUUID(),

      occurredAt: new Date().toISOString(),

      type: "buying-signal",

      title: "Buying Signal",

      description:
        "Candidate expressed interest in moving forward.",

      readinessDelta: 2,

      confidenceDelta: 1,
    };
  }

  public risk(): DiscoveryEvent {
    return {
      id: crypto.randomUUID(),

      occurredAt: new Date().toISOString(),

      type: "risk",

      title: "Potential Risk",

      description:
        "Candidate raised a concern requiring additional discussion.",

      readinessDelta: -2,

      confidenceDelta: -1,
    };
  }
}