import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { LooseSupabaseClient } from "./supabase-query";

export type OAuthTransaction = { id: string; state_hash: string; pkce_verifier_hash: string; organization_id: string; owner_membership_id: string; user_id: string; provider: "google"; return_path: string; expires_at: string };

export class OAuthTransactionRepository {
  async create(context: AuthenticatedWorkspaceContext, input: { stateHash: string; verifierHash: string; returnPath: string; expiresAt: string }): Promise<void> {
    const client = await createServerSupabaseClient() as unknown as LooseSupabaseClient;
    const { error } = await client.from("email_oauth_transactions").insert({ state_hash: input.stateHash, pkce_verifier_hash: input.verifierHash,
      organization_id: context.organization.id, owner_membership_id: context.membership.id, user_id: context.user.id,
      provider: "google", return_path: input.returnPath, expires_at: input.expiresAt });
    if (error) throw new Error("Google connection could not be started.");
  }

  async consume(context: AuthenticatedWorkspaceContext, stateHash: string): Promise<OAuthTransaction | null> {
    const client = await createServerSupabaseClient() as unknown as LooseSupabaseClient;
    const { data, error } = await client.from("email_oauth_transactions").delete().eq("state_hash", stateHash)
      .eq("organization_id", context.organization.id).eq("owner_membership_id", context.membership.id).eq("user_id", context.user.id)
      .eq("provider", "google").select("*").maybeSingle();
    if (error) throw new Error("Google connection state could not be validated.");
    return data as OAuthTransaction | null;
  }
}
