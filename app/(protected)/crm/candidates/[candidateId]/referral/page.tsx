import { ReferralStudioPage } from "@/feature/referral-package/components/ReferralStudioPage";
import { ReferralStudioRuntime } from "@/feature/referral-package/runtime/ReferralStudioRuntime";

export default async function CandidateReferralRoute({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  return <ReferralStudioPage state={await new ReferralStudioRuntime().load(candidateId)} />;
}
