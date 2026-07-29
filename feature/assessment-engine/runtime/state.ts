import { RuntimeLifecycle } from "./contracts";

/**
 * Defines the valid lifecycle transitions for the runtime.
 */
export const RuntimeStateTransitions: Readonly<
  Record<RuntimeLifecycle, readonly RuntimeLifecycle[]>
> = {
  [RuntimeLifecycle.Created]: [
    RuntimeLifecycle.Ready,
  ],

  [RuntimeLifecycle.Ready]: [
    RuntimeLifecycle.InProgress,
  ],

  [RuntimeLifecycle.InProgress]: [
    RuntimeLifecycle.Completed,
  ],

  [RuntimeLifecycle.Completed]: [
    RuntimeLifecycle.Finalized,
  ],

  [RuntimeLifecycle.Finalized]: [],
} as const;

/**
 * Returns true if a lifecycle transition is allowed.
 */
export function canTransition(
  from: RuntimeLifecycle,
  to: RuntimeLifecycle,
): boolean {
  return RuntimeStateTransitions[from].includes(to);
}