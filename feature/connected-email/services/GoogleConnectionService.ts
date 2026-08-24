import "server-only";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ConnectedEmailAccountRepository } from "../repositories/ConnectedEmailAccountRepository";
import { ConnectedEmailCredentialService } from "./ConnectedEmailCredentialService";
import { GoogleConnectionProvider } from "../providers/google/GoogleConnectionProvider";
import type { LooseSupabaseClient } from "../repositories/supabase-query";


export class GoogleConnectionService {
  constructor(
    private readonly provider = new GoogleConnectionProvider(),
    private readonly credentials = new ConnectedEmailCredentialService(),
    private readonly accounts = new ConnectedEmailAccountRepository(),
  ) {}

  async complete(context: AuthenticatedWorkspaceContext, input: { code: string; codeVerifier: string }) {
    const tokenSet = await this.provider.exchangeAuthorizationCode(input);
    return this.credentials.connect(context, tokenSet);
  }

  async disconnect(context: AuthenticatedWorkspaceContext, publicId: string): Promise<void> {
    const account = await this.accounts.getOwn(context, publicId);
    if (!account || account.provider !== "google") throw new Error("Connected Google account was not found.");
    const tokens = await this.credentials.readTokens(account.id);
    if (tokens) {
      try { await this.provider.revoke(tokens.refreshToken || tokens.accessToken); } catch { /* Local invalidation remains authoritative. */ }
    }
    await this.credentials.destroy(account.id);
    const client = createAdminSupabaseClient() as unknown as LooseSupabaseClient;
    const { error } = await client.from("connected_email_accounts").update({ status: "disconnected", disconnected_at: new Date().toISOString() })
      .eq("id", account.id).eq("organization_id", context.organization.id).eq("owner_membership_id", context.membership.id);
    if (error) throw new Error("Google account could not be disconnected.");
  }
}
