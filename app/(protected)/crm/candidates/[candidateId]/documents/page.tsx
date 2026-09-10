import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { loadHistoricalAssessments } from "@/feature/assessment-reports/services/loadHistoricalAssessments";
import { historicalReport, type DocumentKind } from "@/feature/assessment-reports/services/HistoricalAssessmentDocuments";

export default async function DocumentsPage({params,searchParams}:{params:Promise<{candidateId:string}>;searchParams:Promise<{assessment?:string;kind?:string}>}) {
  const {candidateId}=await params, query=await searchParams;
  const r=await resolveWorkspaceComposition(); if(r.status!=="resolved"||"runtimes" in r.composition)notFound();
  const candidate=await r.composition.dependencies.candidates.getById(candidateId);if(!candidate)notFound();
  const records=await loadHistoricalAssessments(r.composition,candidateId);
  const selected=query.assessment?records.find(a=>a.id===query.assessment):null;
  if(query.assessment&&!selected)notFound();
  const kind:DocumentKind=query.kind==="consultant"?"consultant":query.kind==="profile"?"profile":"assessment";
  const report=selected?historicalReport(selected,kind):null;
  const base=`/crm/candidates/${candidateId}`;
  return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8"><nav className="flex flex-wrap gap-5 text-sm font-bold text-blue-700"><Link href={base}>Candidate 360</Link><Link href="/crm">Mission Control</Link><Link href={`/crm/${candidateId}/discovery`}>Discovery Copilot</Link><Link href={`${base}/strategy`}>Brand Referral Engine</Link></nav><header><h1 className="text-3xl font-black">Assessments &amp; Documents</h1><p className="mt-2 text-slate-600">{candidate.firstName} {candidate.lastName} · Historical records, preserved by submission and analysis version.</p></header>
    {records.map(a=><section key={a.id} className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Franchise Ownership Assessment</h2><p className="mt-2 text-sm">Completed {new Date(a.completedAt).toLocaleDateString("en-US")} · Analysis v{a.analysis.analysisVersion}</p><p className="mt-1 break-all text-xs text-slate-500">{a.instrumentVersion} · Submission {a.submissionId}</p><nav aria-label="Assessment documents" className="mt-4 flex flex-wrap gap-4">{([['assessment','Completed Assessment'],['profile','Candidate Profile'],['consultant','Consultant Intelligence Report']] as const).map(([k,label])=><Link key={k} className="rounded-lg border px-4 py-3 text-sm font-bold text-blue-700" href={`${base}/documents?assessment=${a.id}&kind=${k}`}>{label}</Link>)}</nav></section>)}
    {!records.length&&<p className="rounded-2xl border bg-white p-6">No completed assessment documents yet.</p>}
    {report&&selected&&<article className="space-y-6 rounded-2xl border bg-white p-5 sm:p-8"><header><p className="text-xs font-bold uppercase text-teal-700">{report.privacyClassification}</p><h2 className="mt-2 text-3xl font-black">{report.title}</h2><p className="mt-2">{report.subtitle}</p><a className="mt-4 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href={`${base}/documents/${selected.id}/${kind}`}>Download PDF</a></header>{report.sections.map((s,i)=><section key={i}><h3 className="text-lg font-bold">{s.heading}</h3>{s.paragraphs?.map((p,j)=><p key={j} className="mt-2 break-words text-sm leading-6 text-slate-600">{p}</p>)}{s.bullets&&<ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{s.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}</section>)}<p className="text-xs text-slate-500">{report.disclaimer}</p></article>}
  </main>;
}
