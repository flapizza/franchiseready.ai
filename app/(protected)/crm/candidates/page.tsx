import { CandidateCRMPage } from "@/feature/crm/components/CandidateCRMPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { connection } from "next/server";

export default async function CandidatesPage() {
  await connection();
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") return null;
  const state = "runtimes" in resolution.composition ? await resolution.composition.runtimes.createCandidateCRM().load() : await resolution.composition.dependencies.candidateCRM.load();
  return <CandidateCRMPage state={state} />;
}
