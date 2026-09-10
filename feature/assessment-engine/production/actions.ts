"use server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { TrustedAssessmentSubmission } from "./TrustedAssessmentSubmission";
import { isAssessmentProgress } from "./validation";
import type { AssessmentProgress } from "./types";
import { createPublicAssessmentRepository } from "./repository-factory";
import { hashAssessmentToken } from "./token";

export async function saveProductionAssessment(token:string,progress:AssessmentProgress){
  if(!isAssessmentProgress(progress)) return {ok:false as const,error:"Invalid assessment progress. Please review your answers."};
  try{const repository=await createPublicAssessmentRepository();const session=await repository.saveProgress(hashAssessmentToken(token),progress);return {ok:true as const,lastSavedAt:session.lastSavedAt};}
  catch{return {ok:false as const,error:"We could not save your progress. Your answers remain on this screen; please try again before continuing."};}
}
export async function completeProductionAssessment(token:string,progress:AssessmentProgress){
  // Token pages read current database state on each request. Revalidating the
  // submitting page here replaces the form before its results navigation settles.
  try{return await new TrustedAssessmentSubmission(createAdminSupabaseClient()).complete(token,progress);}
  catch{return {ok:false as const,errors:["We could not securely submit your assessment. Your answers remain on this screen; please try again."]};}
}
