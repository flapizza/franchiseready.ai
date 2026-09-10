import {referralContext} from "@/feature/referral-package/services/PersistedReferral";
import {buildReferralPacket} from "@/feature/referral-package/services/ReferralPacket";
import {renderAssessmentReportPdf} from "@/feature/assessment-reports/services/PdfRenderer";
export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string}>}){
 const {candidateId}=await params,c=await referralContext(candidateId);
 if(!c?.record||!c.brand||c.consideration?.state!=="selected")return new Response("Packet unavailable",{status:404});
 const report=buildReferralPacket(c);
 return new Response(renderAssessmentReportPdf(report,[`Prepared: ${report.generatedAt.slice(0,10)}`,`Consultant: ${c.consultant.name}`,`Readiness: ${c.readiness.band}`,"Preparation only. Review before sharing. Nothing transmitted."]),{headers:{"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=FranGroove-Candidate-Referral-Profile.pdf","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
