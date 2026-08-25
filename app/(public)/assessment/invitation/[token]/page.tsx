import { ConferenceAssessmentExperience } from "@/feature/assessment-engine/conference/components/ConferenceAssessmentExperience";
import { createPublicAssessmentRepository } from "@/feature/assessment-engine/production/repository-factory";
import { hashAssessmentToken } from "@/feature/assessment-engine/production/token";

export default async function ProductionAssessmentPage({params}:{params:Promise<{token:string}>}){
  const {token}=await params; let session;
  try{session=await(await createPublicAssessmentRepository()).loadByTokenHash(hashAssessmentToken(token));}catch{return <Unavailable/>;}
  if(!session||session.revokedAt||session.status==="cancelled"||session.status==="expired")return <Unavailable expired/>;
  if(session.status==="analyzed")return <Completed token={token}/>;
  return <ConferenceAssessmentExperience productionToken={token} initialProgress={session.progress}/>;
}
function Unavailable({expired=false}:{expired?:boolean}){return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-xl rounded-2xl border bg-white p-8"><h1 className="text-3xl font-semibold">Assessment link unavailable</h1><p className="mt-4 text-slate-600">{expired?"This invitation has expired or was replaced.":"We could not securely open this assessment."} Contact your consultant for a new link.</p></section></main>}
function Completed({token}:{token:string}){return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-xl rounded-2xl border bg-white p-8"><h1 className="text-3xl font-semibold">Assessment complete</h1><p className="mt-4 text-slate-600">Your responses and Franchise Ownership Profile are safely recorded.</p><a className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white" href={`/assessment/invitation/${token}/results`}>View your profile</a></section></main>}
