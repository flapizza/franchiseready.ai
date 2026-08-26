import { notFound } from "next/navigation";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";
import { AssessmentReportService } from "@/feature/assessment-reports/services/AssessmentReportService";
import { renderAssessmentReportPdf, safeReportFilename } from "@/feature/assessment-reports/services/PdfRenderer";

export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string}>}){
  if(!isConferenceDemoAccessEnabled())notFound();const {candidateId}=await params;const record=conferenceAssessmentStore.getByCandidateId(candidateId);if(!record)notFound();
  const candidateName=`${record.intake.preferredName||record.intake.firstName} ${record.intake.lastName}`.trim();const report=new AssessmentReportService().buildConsultantReport({analysis:record.analysis,completedAt:record.completedAt,candidateName,instrumentVersion:record.instrumentVersion});
  return new Response(renderAssessmentReportPdf(report),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${safeReportFilename(candidateName,report.reportType)}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
