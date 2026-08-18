import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";

export default async function ReferralQueuePage({ searchParams }: PageProps<"/crm/referrals">) {
  const view = (await searchParams).view;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime().load("referral", view === "completed" || view === "all" ? view : "active")} />;
}
