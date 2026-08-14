import { EventBus } from "../events/EventBus";

import { ServiceContainer } from "./ServiceContainer";

export class PlatformRuntime {
  private readonly bus =
    new EventBus();

  private readonly services =
    new ServiceContainer();

  public events() {
    return this.bus;
  }

  public serviceContainer() {
    return this.services;
  }
}