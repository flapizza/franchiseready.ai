import { BrandLibraryWorkspace } from "@/feature/brand-library/components/BrandLibraryWorkspace";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function BrandsPage() {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || !("runtimes" in resolution.composition)) {
    return <WorkspaceFeatureUnavailable title="Brand Intelligence" detail="Brand Intelligence persistence is not enabled for this workspace yet." />;
  }
  const profiles = await resolution.composition.runtimes.createBrandIntelligence().getAll();
  return <BrandLibraryWorkspace profiles={profiles} />;
}
