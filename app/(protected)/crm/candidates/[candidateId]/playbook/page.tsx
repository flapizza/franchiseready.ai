import { notFound } from "next/navigation";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { EngagementPlaybookPage } from "@/feature/engagement-playbook/components/EngagementPlaybookPage";

export default async function PlaybookPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || !("runtimes" in resolution.composition) || !(await resolution.composition.dependencies.candidates.getById(candidateId))) notFound();
  const playbook = await resolution.composition.runtimes.createEngagementPlaybook().build(candidateId);
  if (!playbook) notFound();
  return <EngagementPlaybookPage playbook={playbook} />;
}
