import { ReferralStudioPage } from "@/feature/referral-package/components/ReferralStudioPage";
import { ReferralStudioRuntime } from "@/feature/referral-package/runtime/ReferralStudioRuntime";

export default async function CandidateReferralRoute({ params, searchParams }: PageProps<"/crm/candidates/[candidateId]/referral">) {
  const { candidateId } = await params;
  const referralId = (await searchParams).referralId;
  return <ReferralStudioPage state={await new ReferralStudioRuntime().load(candidateId, typeof referralId === "string" ? referralId : undefined)} />;
}
