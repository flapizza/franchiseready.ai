import { MissionControlPage } from "@/feature/mission-control/components/MissionControlPage";
import { MissionControlRuntime } from "@/feature/mission-control/runtime/MissionControlRuntime";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const runtime =
    new MissionControlRuntime();

  const state =
    await runtime.build();
  const latestConferenceAssessment = conferenceAssessmentStore.getAll()[0];

  return (
    <>
      {latestConferenceAssessment && <div className="mx-4 mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:mx-6"><p className="text-sm font-semibold text-blue-950">New Candidate Intelligence Available</p><p className="mt-1 text-sm text-blue-900">{latestConferenceAssessment.intake.preferredName || latestConferenceAssessment.intake.firstName} {latestConferenceAssessment.intake.lastName} · Assessment completed just now</p><a className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white" href={`/crm/candidates/conference/${latestConferenceAssessment.candidateId}`}>Open Candidate Intelligence</a></div>}
      <MissionControlPage state={state} />
    </>
  );
}
