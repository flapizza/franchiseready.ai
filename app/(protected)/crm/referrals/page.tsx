import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";

export default async function ReferralQueuePage() {
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime().load("referral")} />;
}
