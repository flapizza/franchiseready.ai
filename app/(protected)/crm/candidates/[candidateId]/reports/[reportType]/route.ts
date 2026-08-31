import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { AssessmentReportService } from "@/feature/assessment-reports/services/AssessmentReportService";
import { renderAssessmentReportPdf, safeReportFilename } from "@/feature/assessment-reports/services/PdfRenderer";

export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string;reportType:string}>}){
  const {candidateId,reportType}=await params;if(reportType!=="candidate"&&reportType!=="consultant")return new Response("Report unavailable",{status:404});
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved"||"runtimes" in resolution.composition)return new Response("Report unavailable",{status:404});
  const candidate=await resolution.composition.dependencies.candidates.getById(candidateId);const session=await resolution.composition.dependencies.assessments.getForCandidate(candidateId);
  if(!candidate||!session?.analysis||session.status!=="analyzed"||!session.completedAt)return new Response("Report unavailable",{status:404});
  const candidateName=`${candidate.firstName} ${candidate.lastName}`.trim();const service=new AssessmentReportService();const source={analysis:session.analysis,completedAt:session.completedAt,candidateName,instrumentVersion:session.instrumentVersion};
  const report=reportType==="candidate"?service.buildCandidateReport(source):service.buildConsultantReport(source);
  return new Response(renderAssessmentReportPdf(report),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${safeReportFilename(candidateName,report.reportType)}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
