import "server-only";

import type { WorkspacePresentation } from "@/feature/layout/models/WorkspacePresentation";

/** Serializable shell data. It contains no repository or server capability. */
export type DemoWorkspacePresentation = WorkspacePresentation & {
  kind: "demo";
  temporaryDataIndicator: NonNullable<WorkspacePresentation["temporaryDataIndicator"]>;
};
