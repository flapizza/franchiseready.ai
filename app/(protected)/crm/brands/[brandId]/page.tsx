import { notFound } from "next/navigation";
import { BrandProfileWorkspace } from "@/feature/brand-library/components/BrandProfileWorkspace";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function BrandPage({ params }: PageProps<"/crm/brands/[brandId]">) {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || !("runtimes" in resolution.composition)) {
    return <WorkspaceFeatureUnavailable title="Brand Intelligence" detail="Brand Intelligence persistence is not enabled for this workspace yet." />;
  }
  const profile = await resolution.composition.runtimes.createBrandIntelligence().getById((await params).brandId);
  if (!profile) notFound();
  return <BrandProfileWorkspace profile={profile} />;
}
