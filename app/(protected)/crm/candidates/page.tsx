import { CandidateCRMPage } from "@/feature/crm/components/CandidateCRMPage";
import { CandidateCRMRuntime } from "@/feature/crm/runtime/CandidateCRMRuntime";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export default async function CandidatesPage() {
  await connection();
  const composition = await createCandidateRepository();
  if (!composition) notFound();
  const state = await new CandidateCRMRuntime(composition.repository).load();
  return <CandidateCRMPage state={state} />;
}
