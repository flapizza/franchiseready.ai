import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";

export default async function BrandStrategyQueuePage({ searchParams }: PageProps<"/crm/strategy">) {
  const view = (await searchParams).view;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime().load("strategy", view === "completed" || view === "all" ? view : "active")} />;
}
