import type {
  MembershipRole,
  WorkspaceCapability,
} from "@/feature/identity/models/WorkspaceIdentity";
import type { WorkspaceFeatureAvailability } from "@/feature/platform/composition/FeatureAvailability";

export interface WorkspacePresentation {
  kind: "demo" | "production";
  workspace: {
    name: string;
    organizationPublicId: string | null;
  };
  identity: {
    displayName: string;
    greetingName: string;
    email: string | null;
    title: string;
    initials: string;
  };
  role: MembershipRole;
  capabilities: readonly WorkspaceCapability[];
  features: WorkspaceFeatureAvailability;
  temporaryDataIndicator: {
    label: "Demo Workspace — temporary data";
    detail: string;
  } | null;
}
