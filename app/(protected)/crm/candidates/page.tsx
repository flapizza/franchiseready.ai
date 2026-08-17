import { CandidateCRMPage } from "@/feature/crm/components/CandidateCRMPage";
import { CandidateCRMRuntime } from "@/feature/crm/runtime/CandidateCRMRuntime";

export default async function CandidatesPage() {
  const state = await new CandidateCRMRuntime().load();
  return <CandidateCRMPage state={state} />;
}
