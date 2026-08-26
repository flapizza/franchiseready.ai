import { AssessmentReportService } from "@/feature/assessment-reports/services/AssessmentReportService";
import { renderAssessmentReportPdf, safeReportFilename } from "@/feature/assessment-reports/services/PdfRenderer";
import { createPublicAssessmentRepository } from "@/feature/assessment-engine/production/repository-factory";
import { hashAssessmentToken } from "@/feature/assessment-engine/production/token";

export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  try {
    const session=await(await createPublicAssessmentRepository()).loadByTokenHash(hashAssessmentToken(token));
    if(!session?.analysis||session.status!=="analyzed"||!session.completedAt)return new Response("Report unavailable",{status:404});
    const report=new AssessmentReportService().buildCandidateReport({analysis:session.analysis,completedAt:session.completedAt,instrumentVersion:session.instrumentVersion});
    return new Response(renderAssessmentReportPdf(report),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${safeReportFilename(undefined,report.reportType)}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch { return new Response("Report unavailable",{status:404}); }
}
