import { notFound } from "next/navigation";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { EngagementPlaybookPage } from "@/feature/engagement-playbook/components/EngagementPlaybookPage";
import { CandidateEngagementPlaybookService } from "@/feature/engagement-playbook/services/CandidateEngagementPlaybookService";

export default async function PlaybookPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const composition = await createCandidateRepository();
  if (!composition || composition.mode !== "demo" || !(await composition.repository.getById(candidateId))) notFound();
  const playbook = await new CandidateEngagementPlaybookService().build(candidateId);
  if (!playbook) notFound();
  return <EngagementPlaybookPage playbook={playbook} />;
}
