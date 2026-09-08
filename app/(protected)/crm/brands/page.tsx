import { BrandLibraryWorkspace } from "@/feature/brand-library/components/BrandLibraryWorkspace";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function BrandsPage() {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") {
    return <WorkspaceFeatureUnavailable title="Brand Intelligence" detail="Select an active workspace to open Brand Intelligence." />;
  }
  const runtime = "runtimes" in resolution.composition
    ? resolution.composition.runtimes.createBrandIntelligence()
    : resolution.composition.dependencies.brandIntelligence;
  const profiles = await runtime.getAll();
  return <BrandLibraryWorkspace profiles={profiles} />;
}
