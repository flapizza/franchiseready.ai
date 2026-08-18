import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";

export default async function DiscoveryQueuePage({ searchParams }: PageProps<"/crm/discovery">) {
  const view = (await searchParams).view;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime().load("discovery", view === "completed" || view === "all" ? view : "active")} />;
}
