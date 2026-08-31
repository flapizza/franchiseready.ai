import "server-only";

import type { WorkspaceCapability } from "@/feature/identity/models/WorkspaceIdentity";
import type { WorkspaceCompositionResolution } from "./resolveWorkspaceComposition";
import type { WorkspaceSession } from "./WorkspaceComposition";

export class WorkspaceAccessError extends Error {}

export function requireWorkspace(resolution: WorkspaceCompositionResolution): WorkspaceSession {
  if (resolution.status !== "resolved") throw new WorkspaceAccessError(`A resolved workspace is required (${resolution.status}).`);
  return resolution.session;
}

export function requireCapability(session: WorkspaceSession, capability: WorkspaceCapability): void {
  if (!session.capabilities.includes(capability)) throw new WorkspaceAccessError(`Workspace capability is required: ${capability}.`);
}
