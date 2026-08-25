import "server-only";
import { getPersistenceMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";
import { SupabaseAssessmentRepository } from "./SupabaseAssessmentRepository";

export async function createAuthenticatedAssessmentRepository(){
  if(getPersistenceMode()!=="supabase") throw new Error("Production assessment persistence is unavailable in demo mode.");
  const workspace=await resolveAuthenticatedWorkspaceContext(); if(!workspace)return null;
  return {repository:new SupabaseAssessmentRepository(await createServerSupabaseClient(),workspace),workspace};
}
export async function createPublicAssessmentRepository(){
  if(getPersistenceMode()!=="supabase") throw new Error("Production assessment persistence is unavailable in demo mode.");
  return new SupabaseAssessmentRepository(await createServerSupabaseClient());
}

