import { notFound } from "next/navigation";
import Link from "next/link";
import { BrandProfileWorkspace } from "@/feature/brand-library/components/BrandProfileWorkspace";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function BrandPage({ params, searchParams }: PageProps<"/crm/brands/[brandId]">) {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") {
    return <WorkspaceFeatureUnavailable title="Brand Intelligence" detail="Select an active workspace to open Brand Intelligence." />;
  }
  const runtime = "runtimes" in resolution.composition
    ? resolution.composition.runtimes.createBrandIntelligence()
    : resolution.composition.dependencies.brandIntelligence;
  const profile = await runtime.getById((await params).brandId);
  if (!profile) notFound();
  const candidateId = (await searchParams).candidate;
  const candidate = typeof candidateId === "string" && !("runtimes" in resolution.composition) ? await resolution.composition.dependencies.candidates.getById(candidateId) : null;
  return <>{candidate && <nav aria-label="Candidate context" className="mb-5 flex flex-wrap gap-4 text-sm font-bold text-blue-700"><Link className="py-2" href={`/crm/candidates/${candidate.id}/strategy`}>Return to {candidate.firstName}&apos;s Brand Referral Engine</Link><Link className="py-2" href={`/crm/candidates/${candidate.id}/referral?brand=${encodeURIComponent(profile.id)}`}>Prepare handoff preview</Link><Link className="py-2" href={`/crm/candidates/${candidate.id}`}>Candidate 360</Link></nav>}<BrandProfileWorkspace profile={profile} /></>;
}
