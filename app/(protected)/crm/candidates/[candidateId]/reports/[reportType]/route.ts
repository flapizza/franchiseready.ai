import { createAuthenticatedAssessmentRepository } from "@/feature/assessment-engine/production/repository-factory";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { AssessmentReportService } from "@/feature/assessment-reports/services/AssessmentReportService";
import { renderAssessmentReportPdf, safeReportFilename } from "@/feature/assessment-reports/services/PdfRenderer";

export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string;reportType:string}>}){
  const {candidateId,reportType}=await params;if(reportType!=="candidate"&&reportType!=="consultant")return new Response("Report unavailable",{status:404});
  const candidates=await createCandidateRepository();const assessments=await createAuthenticatedAssessmentRepository();
  if(!candidates||candidates.mode!=="supabase"||!assessments)return new Response("Report unavailable",{status:404});
  const candidate=await candidates.repository.getById(candidateId);const session=await assessments.repository.getForCandidate(candidateId);
  if(!candidate||!session?.analysis||session.status!=="analyzed"||!session.completedAt)return new Response("Report unavailable",{status:404});
  const candidateName=`${candidate.firstName} ${candidate.lastName}`.trim();const service=new AssessmentReportService();const source={analysis:session.analysis,completedAt:session.completedAt,candidateName,instrumentVersion:session.instrumentVersion};
  const report=reportType==="candidate"?service.buildCandidateReport(source):service.buildConsultantReport(source);
  return new Response(renderAssessmentReportPdf(report),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${safeReportFilename(candidateName,report.reportType)}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
