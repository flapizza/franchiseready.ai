"use server";
import { revalidatePath } from "next/cache";
import { ConferenceAssessmentAnalysisService } from "../conference/ConferenceAssessmentAnalysisService";
import { validateConferenceSubmission } from "../conference/validation";
import type { AssessmentProgress } from "./types";
import { createPublicAssessmentRepository } from "./repository-factory";
import { hashAssessmentToken } from "./token";

export async function saveProductionAssessment(token:string,progress:AssessmentProgress){
  try{const repository=await createPublicAssessmentRepository();const session=await repository.saveProgress(hashAssessmentToken(token),progress);return {ok:true as const,lastSavedAt:session.lastSavedAt};}
  catch{return {ok:false as const,error:"We could not save your progress. Your answers remain on this screen; please try again before continuing."};}
}
export async function completeProductionAssessment(token:string,progress:AssessmentProgress){
  const errors=validateConferenceSubmission(progress.intake,progress.answers,progress.consent);if(errors.length)return {ok:false as const,errors};
  try{const analysis=new ConferenceAssessmentAnalysisService().analyze(progress.intake,progress.answers);const repository=await createPublicAssessmentRepository();const session=await repository.submit(hashAssessmentToken(token),progress,analysis);revalidatePath(`/assessment/${token}`);return {ok:true as const,id:session.publicId};}
  catch{return {ok:false as const,errors:["We could not securely submit your assessment. Your answers remain on this screen; please try again."]};}
}
