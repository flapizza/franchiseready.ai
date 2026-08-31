import "server-only";

import { getPersistenceMode } from "@/lib/env";
import { DemoWorkspaceComposer, resolveDemoWorkspaceSession } from "./DemoWorkspaceComposition";
import { createProductionWorkspaceComposition } from "./ProductionWorkspaceComposition";
import { resolveProductionWorkspaceSession } from "./ProductionWorkspaceSessionResolver";

export async function resolveWorkspaceComposition() {
  if (getPersistenceMode() === "demo") {
    const session = await resolveDemoWorkspaceSession();
    return session ? { status: "resolved" as const, session, composition: await new DemoWorkspaceComposer().compose(session) } : { status: "unauthenticated" as const };
  }
  const resolution = await resolveProductionWorkspaceSession();
  if (resolution.status !== "resolved") return resolution;
  if (resolution.session.kind !== "production") throw new Error("Production resolution returned a non-production session.");
  return { status: "resolved" as const, session: resolution.session, composition: await createProductionWorkspaceComposition(resolution.session) };
}

export type WorkspaceCompositionResolution = Awaited<ReturnType<typeof resolveWorkspaceComposition>>;
