import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.generated";
import { ConferenceAssessmentAnalysisService } from "../conference/ConferenceAssessmentAnalysisService";
import { submissionErrors } from "./validation";
import { publicSession } from "./PublicAssessmentRepository";
import { hashAssessmentToken } from "./token";
import type { AssessmentProgress } from "./types";

// Only the server creates this service with the administrative client. Candidate
// JSON never supplies analysis; the existing deterministic engine owns it.
export class TrustedAssessmentSubmission {
 constructor(private readonly client: SupabaseClient<Database>) {}
 async complete(token: string, input: unknown) {
  const errors = submissionErrors(input);
  if(errors.length) return {ok:false as const, errors};
  const progress = input as AssessmentProgress;
  const analysis = new ConferenceAssessmentAnalysisService().analyze(progress.intake, progress.answers);
  const {data,error} = await this.client.rpc("finalize_assessment_trusted", {
   presented_token_hash: hashAssessmentToken(token), candidate_progress: progress as unknown as Json,
   authoritative_analysis: analysis as unknown as Json,
  });
  const session = publicSession(data);
  if(error || !session) throw new Error("Assessment could not be completed.");
  return {ok:true as const,id:session.publicId};
 }
}
