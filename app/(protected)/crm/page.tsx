import { MissionControlPage } from "@/feature/mission-control/components/MissionControlPage";
import { MissionControlRuntime } from "@/feature/mission-control/runtime/MissionControlRuntime";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const runtime =
    new MissionControlRuntime();

  const state =
    await runtime.build();
  const conferenceAssessments = conferenceAssessmentStore.getAll();

  return (
    <>
      {conferenceAssessments.length > 0 && <section aria-label="New candidate intelligence" className="mx-4 mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:mx-6"><p className="text-sm font-semibold text-blue-950">New Candidate Intelligence Available</p><div className="mt-2 flex flex-wrap gap-3">{conferenceAssessments.slice(0,3).map((record,index)=><div key={record.candidateId} className="flex min-w-64 flex-1 items-center justify-between gap-3 rounded-lg bg-white p-3"><p className="text-sm text-blue-950"><span className="font-semibold">{record.intake.preferredName || record.intake.firstName} {record.intake.lastName}</span><br/><span className="text-xs">Assessment completed {index===0?"just now":"recently"}</span></p><a className="inline-flex min-h-10 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white" href={`/crm/candidates/conference/${record.candidateId}`}>Open Candidate Intelligence</a></div>)}</div></section>}
      <MissionControlPage state={state} />
    </>
  );
}
