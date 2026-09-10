import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.generated";
import type { AssessmentProgress, PublicAssessmentSession } from "./types";
import { PRODUCTION_INSTRUMENT_VERSION } from "./types";

export function publicSession(value: unknown): PublicAssessmentSession | null {
 if (!value || typeof value !== "object" || Array.isArray(value)) return null;
 const row = value as Record<string, unknown>;
 return { publicId: String(row.public_id), status: row.status as PublicAssessmentSession["status"],
  lastSavedAt: row.last_saved_at as string | null, completedAt: row.completed_at as string | null,
  instrumentVersion: PRODUCTION_INSTRUMENT_VERSION, progress: row.progress_snapshot as AssessmentProgress | null,
  analysis: row.candidate_analysis as PublicAssessmentSession["analysis"] };
}
export class PublicAssessmentRepository {
 constructor(private readonly client: SupabaseClient<Database>) {}
 async loadByTokenHash(hash: string) {
  const {data,error} = await this.client.rpc("load_assessment_by_token", {presented_token_hash: hash});
  if(error) throw new Error("Assessment unavailable.");
  return publicSession(data);
 }
 async saveProgress(hash: string, progress: AssessmentProgress) {
  const {data,error} = await this.client.rpc("save_assessment_progress", {presented_token_hash: hash, progress_snapshot: progress as unknown as Json});
  const session = publicSession(data);
  if(error || !session) throw new Error("Assessment unavailable.");
  return session;
 }
}
