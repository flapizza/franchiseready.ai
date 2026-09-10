import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { loadHistoricalAssessments } from "@/feature/assessment-reports/services/loadHistoricalAssessments";
import { historicalReport } from "@/feature/assessment-reports/services/HistoricalAssessmentDocuments";
import { renderAssessmentReportPdf } from "@/feature/assessment-reports/services/PdfRenderer";
export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string;assessmentId:string;kind:string}>}) {
  const {candidateId,assessmentId,kind}=await params;
  if(kind!=="assessment"&&kind!=="profile"&&kind!=="consultant")return new Response("Document unavailable",{status:404});
  const r=await resolveWorkspaceComposition();if(r.status!=="resolved"||"runtimes" in r.composition)return new Response("Document unavailable",{status:404});
  const record=(await loadHistoricalAssessments(r.composition,candidateId)).find(a=>a.id===assessmentId);
  if(!record)return new Response("Document unavailable",{status:404});
  return new Response(renderAssessmentReportPdf(historicalReport(record,kind)),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="FranGroove-${kind}-${record.id}.pdf"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
