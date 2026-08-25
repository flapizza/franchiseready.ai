import { NextResponse } from "next/server";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { ConferenceAssessmentAnalysisService } from "@/feature/assessment-engine/conference/ConferenceAssessmentAnalysisService";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";
import { conferenceQuestions, concernExclusive } from "@/feature/assessment-engine/conference/questions";
import type { ConferenceAnswers, ConferenceIntake, StoredConferenceAssessmentRecord } from "@/feature/assessment-engine/conference/types";

export async function POST() {
  if(process.env.PLAYWRIGHT_TEST_MODE!=="true"||!isConferenceDemoAccessEnabled())return new NextResponse("Not found",{status:404});
  const intake:ConferenceIntake={firstName:"Legacy",lastName:"Candidate",email:"legacy.candidate@example.test",mobilePhone:"555-0107",streetAddress:"7 Test Way",city:"Orlando",stateProvince:"FL",postalCode:"32801",country:"United States",occupationTitle:"Operations Leader",ownedBusinessBefore:"no",exploredFranchiseBefore:"yes",preferredContactMethod:"email",bestContactTime:"morning"};
  const answers:ConferenceAnswers={};
  for(const question of conferenceQuestions)if(question.kind!=="context"&&!question.primaryOf)answers[question.id]=[question.options?.[0]??""];
  answers.q2=[answers.q1[0]];answers.q21=[answers.q20[0]];answers["q36-geography"]=["Need to remain near my current location"];answers["q36-stakeholders"]=["Decision is primarily mine"];answers["q36-stage"]=["Actively researching franchises"];answers.concerns=[concernExclusive];
  const legacyAnalysis=structuredClone(new ConferenceAssessmentAnalysisService().analyze(intake,answers)) as unknown as Record<string,unknown>;
  delete legacyAnalysis.consultantBrief;delete legacyAnalysis.evidenceDetails;delete legacyAnalysis.analysisVersion;delete legacyAnalysis.instrumentVersion;
  const ownershipProfile=legacyAnalysis.ownershipProfile as Record<string,unknown>;delete ownershipProfile.interpretation;
  const record:StoredConferenceAssessmentRecord={id:"legacy-assessment-v1",candidateId:"legacy-candidate-v1",status:"analyzed",intake,answers,startedAt:"2026-01-15T14:00:00.000Z",completedAt:"2026-01-15T14:12:00.000Z",durationSeconds:720,analysis:legacyAnalysis};
  conferenceAssessmentStore.save(record);
  return NextResponse.json({candidateResultUrl:`/assessment/start/results/${record.id}`,consultantResultUrl:`/crm/candidates/conference/${record.candidateId}`});
}
