import type { DiscoveryEvent } from "../models/DiscoveryEvent";
import type { DiscoverySession } from "../models/DiscoverySession";

export class DiscoverySessionStore {
  private session: DiscoverySession;

  constructor(
    session: DiscoverySession,
  ) {
    this.session = session;
  }

  public getSession() {
    return this.session;
  }

  public addEvent(
    event: DiscoveryEvent,
  ) {
    this.session.readiness +=
      event.readinessDelta;

    this.session.confidence +=
      event.confidenceDelta;
  }

  public update(
    session: DiscoverySession,
  ) {
    this.session = session;
  }
}